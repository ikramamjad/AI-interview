"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * High-Performance Voice & Audio Hook:
 * 1. Web Speech API SpeechSynthesis with Chrome/Edge autoplay unlock & natural voices
 * 2. Real-time Web Speech Recognition with interim results & auto-restart
 * 3. AudioContext AnalyserNode for live soundwave / volume visualizer (VU meter)
 * 4. High-Fidelity MediaRecorder audio capture with Gemini 3.6 multimodal fallback
 */
export function useSpeech(apiUrl = "http://localhost:5000") {
  // TTS State (AI Speaking)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  // STT State (Candidate Speaking)
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micVolume, setMicVolume] = useState(0); // 0 to 100

  // Audio capture refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const isListeningRef = useRef(false);
  const interimTextRef = useRef("");

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak function with Chrome/Edge resume and sentence pacing
  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !voiceEnabled || !text) {
        return;
      }

      try {
        window.speechSynthesis.cancel(); // Stop any pending utterances
        window.speechSynthesis.resume(); // Fix browser paused state

        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const chosenVoice =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Aria") ||
                v.name.includes("Jenny") ||
                v.name.includes("Natural") ||
                v.name.includes("Google US English") ||
                v.name.includes("Samantha") ||
                v.name.includes("Zira"))
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];

        const utterance = new SpeechSynthesisUtterance(text);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.03;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [voiceEnabled, availableVoices]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Live Microphone Audio Level Monitoring (AnalyserNode)
  const setupAudioAnalyser = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(normalized);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Audio analyser setup error:", e);
    }
  };

  const cleanupAudioAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setMicVolume(0);
  };

  // Start Voice Recording with Dual-Engine (WebSpeech + MediaRecorder)
  const startListening = useCallback(
    async (onInterimCallback) => {
      stopSpeaking();
      interimTextRef.current = "";

      try {
        // High-fidelity microphone constraints with echo cancellation & noise suppression
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
          },
        });

        audioStreamRef.current = stream;
        setupAudioAnalyser(stream);

        // 1. Setup MediaRecorder for high-fidelity audio capture
        audioChunksRef.current = [];
        let mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
        }

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(250); // Record in 250ms chunks
        mediaRecorderRef.current = recorder;

        // 2. Setup Web Speech Recognition for instant live typing feedback
        const SpeechRecognition =
          typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
              let finalTranscript = "";
              let interimTranscript = "";

              for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + " ";
                } else {
                  interimTranscript += transcript;
                }
              }

              const combined = (finalTranscript + interimTranscript).trim();
              if (combined) {
                interimTextRef.current = combined;
                if (onInterimCallback) {
                  onInterimCallback(combined);
                }
              }
            };

            recognition.onerror = (e) => {
              console.log("WebSpeech non-fatal error (MediaRecorder will transcribe):", e.error);
            };

            recognition.onend = () => {
              // Auto-restart if candidate is still actively speaking
              if (isListeningRef.current && recognitionRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) {
            console.log("Browser SpeechRecognition unavailable, relying on Gemini high-fidelity STT.");
          }
        }

        // Start timer
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        isListeningRef.current = true;
        setIsListening(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        alert("Microphone access is required to speak. Please verify your browser allows microphone permissions.");
      }
    },
    [stopSpeaking]
  );

  // Stop Voice Recording and produce high-accuracy transcription
  const stopListening = useCallback(
    async (currentText = "", onFinalCallback) => {
      isListeningRef.current = false;
      setIsListening(false);
      cleanupAudioAnalyser();

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      // Stop recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      // Stop stream tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }

      const webSpeechText = (interimTextRef.current || currentText || "").trim();

      // If Web Speech already captured substantial answer (>= 6 words), use it immediately
      const words = webSpeechText.split(/\s+/).filter(Boolean);
      if (words.length >= 6) {
        if (onFinalCallback) onFinalCallback(webSpeechText);
        return webSpeechText;
      }

      // High-accuracy fallback: Send recorded audio buffer to Gemini 3.6 multimodal transcription
      setIsTranscribing(true);
      try {
        await new Promise((r) => setTimeout(r, 300)); // wait for last chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (audioBlob.size > 2000) {
          console.log(`Sending recorded audio (${audioBlob.size} bytes) to Gemini 3.6 transcription...`);
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const res = await fetch(`${apiUrl}/api/interview/transcribe`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.success && data.text && data.text.trim()) {
            const transcribedText = data.text.trim();
            console.log("Gemini 3.6 transcription output:", transcribedText);
            if (onFinalCallback) {
              onFinalCallback(transcribedText);
            }
            return transcribedText;
          }
        }
      } catch (err) {
        console.error("Transcription service error:", err);
      } finally {
        setIsTranscribing(false);
      }

      const fallbackText = webSpeechText || currentText.trim();
      if (onFinalCallback && fallbackText) {
        onFinalCallback(fallbackText);
      }
      return fallbackText;
    },
    [apiUrl]
  );

  return {
    // TTS
    isSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    speak,
    stopSpeaking,
    // STT & Audio
    isListening,
    isTranscribing,
    recordingDuration,
    micVolume,
    startListening,
    stopListening,
  };
}
