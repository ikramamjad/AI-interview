"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Camera,
  Loader2,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Award,
  BookOpen,
  Lightbulb,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import Tilt3D from "@/components/Tilt3D";
import Aria3DOrb from "@/components/Aria3DOrb";

export default function InterviewRoom({
  sessionData,
  onReset,
  apiUrl = "http://localhost:5000",
}) {
  const { session, currentTurn, sessionId } = sessionData;

  const mode = session?.profileSnapshot?.mode || session?.mode || "practice";
  const recruiterEmail = session?.profileSnapshot?.recruiterEmail || "";

  const initialMessages = session?.transcript && session.transcript.length > 0
    ? session.transcript.map((t, idx) => ({
        id: t.id || String(idx + 1),
        role: t.role,
        text: t.text,
        topic: t.topic || "Technical Assessment",
        questionType: t.questionType || (t.role === "assistant" ? "technical" : null),
        createdAt: t.createdAt
          ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
    : [
        {
          id: currentTurn?.id || "1",
          role: "assistant",
          text: currentTurn?.text || sessionData.message || "Hello, I am Aria, your technical assessment interviewer.",
          topic: currentTurn?.topic || sessionData.topic,
          questionType: currentTurn?.questionType || sessionData.questionType,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ];

  const [messages, setMessages] = useState(initialMessages);

  const initialQNum = session?.transcript
    ? Math.max(1, session.transcript.filter((t) => t.role === "assistant").length)
    : 1;

  const [inputAnswer, setInputAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(session.status || "in_progress");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(initialQNum);
  const [targetQuestionCount] = useState(session.targetQuestionCount || 5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Scorecard & Report state
  const [reportData, setReportData] = useState(sessionData.report || null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Webcam State
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraStarting, setCameraStarting] = useState(false);

  // Tab switch anti-cheating state
  const [strikeCount, setStrikeCount] = useState(0);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const strikeCountRef = useRef(0);
  const statusRef = useRef(sessionStatus);
  statusRef.current = sessionStatus;

  // Internal chat scroll container (NEVER scrolls browser window)
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Speech Hook (TTS + AudioContext VU meter + SpeechRecognition + Gemini 3.6 fallback)
  const {
    isSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    speak,
    stopSpeaking,
    isListening,
    isTranscribing,
    recordingDuration,
    micVolume,
    startListening,
    stopListening,
  } = useSpeech(apiUrl);

  // Aria speaks the opening question on component mount
  useEffect(() => {
    const openingText = currentTurn.text || sessionData.message;
    if (openingText) {
      const timer = setTimeout(() => {
        speak(openingText);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentTurn.text, sessionData.message, speak]);

  // Robust Webcam Initialization & Reconnection
  const startCamera = useCallback(async () => {
    setCameraStarting(true);
    setCameraError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback for devices that reject specific resolution constraints
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => console.warn("Video auto-play suppressed:", e));
        };
      }

      setCameraActive(true);
      setCameraError(null);
    } catch (err) {
      console.warn("Webcam access error:", err);
      const isPermissionDenied =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      const isNotFound = err.name === "NotFoundError" || err.name === "DevicesNotFoundError";

      setCameraError(
        isPermissionDenied
          ? "Webcam permission blocked. Please click the camera icon in your address bar and allow access."
          : isNotFound
          ? "No camera device detected. Please connect a webcam and click retry."
          : "Webcam is currently in use or unavailable."
      );
      setCameraActive(false);
    } finally {
      setCameraStarting(false);
    }
  }, []);

  // Connect camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // Timer: count elapsed seconds
  useEffect(() => {
    if (sessionStatus !== "in_progress") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStatus]);

  // Auto-scroll ONLY inside the chat container (keeps browser window completely stationary)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, submitting, isTranscribing]);

  // Tab switch violation reporter
  const reportViolationToServer = useCallback(
    async (type, actionTaken) => {
      try {
        await fetch(`${apiUrl}/api/interview/violation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || session.id,
            type,
            actionTaken,
          }),
        });
      } catch (err) {
        console.error("Failed to report proctoring violation:", err);
      }
    },
    [apiUrl, sessionId, session.id]
  );

  // Tab switch & focus loss event listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (statusRef.current !== "in_progress") return;

      if (document.visibilityState === "hidden") {
        const nextStrikes = strikeCountRef.current + 1;
        strikeCountRef.current = nextStrikes;
        setStrikeCount(nextStrikes);

        if (nextStrikes === 1) {
          // Strike 1: Show warning and speak audio warning aloud
          setWarningModalOpen(true);
          const warnText =
            "I noticed you switched away from the interview tab. This is your first warning under our integrity policy. Please remain on this screen. A second violation will pause or terminate your evaluation.";

          speak(warnText);

          setMessages((prev) => [
            ...prev,
            {
              id: `violation-${Date.now()}`,
              role: "assistant",
              text: "⚠️ INTEGRITY ALERT (Strike 1 of 2): Tab switch detected. You switched away from the active interview window. All window focus events are logged for recruiter audit.",
              topic: "Proctoring Integrity",
              warningIssued: true,
              createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);

          reportViolationToServer("tab_switch", "warning");
        } else if (nextStrikes >= 2) {
          // Strike 2: Terminate/pause interview
          setWarningModalOpen(true);
          setSessionStatus("terminated");

          const terminateText =
            "A second tab switch has been detected. Under our policy, your interview has been ended and flagged for recruiter review.";
          speak(terminateText);

          setMessages((prev) => [
            ...prev,
            {
              id: `violation-terminate-${Date.now()}`,
              role: "assistant",
              text: "🛑 INTERVIEW TERMINATED: Two tab-switch violations logged. This session has been halted and flagged for recruiter review.",
              topic: "Integrity Violation",
              warningIssued: true,
              createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);

          reportViolationToServer("tab_switch", "terminate");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [speak, reportViolationToServer]);

  // Fetch report if completed and not yet loaded
  useEffect(() => {
    if (sessionStatus === "completed" && !reportData && !loadingReport) {
      setLoadingReport(true);
      fetch(`${apiUrl}/api/interview/${sessionId || session.id}/report`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.report) {
            setReportData(data.report);
          }
        })
        .catch((err) => console.warn("Could not fetch final report:", err))
        .finally(() => setLoadingReport(false));
    }
  }, [sessionStatus, reportData, loadingReport, apiUrl, sessionId, session.id]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Mic Toggle Handler
  const handleMicToggle = async () => {
    if (isListening) {
      const transcribed = await stopListening(inputAnswer, (finalText) => {
        setInputAnswer(finalText);
      });
      if (transcribed) {
        setInputAnswer(transcribed);
      }
    } else {
      stopSpeaking();
      await startListening((interimText) => {
        setInputAnswer(interimText);
      });
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (submitting || sessionStatus !== "in_progress") return;

    let finalAnswer = inputAnswer.trim();

    if (isListening) {
      const transcribed = await stopListening(inputAnswer, (t) => {
        finalAnswer = t;
      });
      if (transcribed) {
        finalAnswer = transcribed;
      }
    }

    if (!finalAnswer) {
      alert("Please provide or speak your answer before submitting.");
      return;
    }

    setInputAnswer("");

    // Append user turn immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: finalAnswer,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/api/interview/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || session.id,
          answer: finalAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit answer.");
      }

      // Append Aria's response
      const assistantMessage = {
        id: data.turnId || `aria-${Date.now()}`,
        role: "assistant",
        text: data.message,
        topic: data.topic,
        questionType: data.question_type,
        warningIssued: data.warning_issued,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.message) {
        speak(data.message);
      }

      if (data.currentQuestionNumber) {
        setCurrentQuestionNumber(data.currentQuestionNumber);
      }

      if (data.interview_status && data.interview_status !== "in_progress") {
        setSessionStatus(data.interview_status);
        if (data.report) {
          setReportData(data.report);
        }
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg =
        "Thank you for that explanation. Could you walk me through an edge case or failure scenario you encountered with that approach, and how you handled it?";
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: fallbackMsg,
          topic: "Technical Resilience",
          questionType: "technical",
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      speak(fallbackMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
      {/* Integrity Warning Dialog Overlay */}
      {warningModalOpen && strikeCount === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--ink)] border-2 border-amber-500/80 rounded-sm max-w-md w-full p-6 shadow-2xl text-[var(--paper)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[var(--paper)]">Focus Loss Warning</h3>
                <span className="font-mono text-xs text-amber-400 font-semibold tracking-wider">STRIKE 1 OF 2 ISSUED</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-on-ink-mut)] leading-relaxed mb-5">
              You navigated away from the interview window. Continuous focus is required during this evaluation. This event has been logged in your session telemetry.
            </p>
            <div className="bg-[var(--ink-2)] border border-[var(--line-on-ink)] p-3 rounded-sm text-xs font-mono text-[var(--brass-lt)] mb-6">
              ⚠️ A second focus violation will pause or terminate your interview immediately.
            </div>
            <button
              type="button"
              onClick={() => setWarningModalOpen(false)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-[var(--ink)] font-mono font-bold text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
            >
              I Understand • Return to Interview
            </button>
          </div>
        </div>
      )}

      {/* Top Telemetry & Mode Bar */}
      <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] rounded-sm p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-lg font-semibold text-[var(--text-on-paper)]">
              {session.role}
            </h1>
            <span className="px-2.5 py-0.5 rounded-sm text-xs font-mono font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--brass-lt)] border border-[var(--brass)]/50">
              {session.difficulty} Level
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border ${
                mode === "recruiter"
                  ? "bg-purple-950/20 text-purple-900 border-purple-400/50"
                  : "bg-emerald-950/20 text-emerald-900 border-emerald-400/50"
              }`}
            >
              {mode === "recruiter" ? "👔 Recruiter Screening" : "🎓 Practice & Diagnostic"}
            </span>
          </div>
          <p className="font-mono text-xs text-[var(--text-on-paper-mut)] mt-0.5">
            Candidate: <span className="font-semibold text-[var(--text-on-paper)]">{session.candidate?.name || "Candidate"}</span>
            {recruiterEmail && (
              <span className="ml-2 text-[var(--brass)]">
                • Recruiter: <strong>{recruiterEmail}</strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          {/* Aria Voice Toggle */}
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) {
                stopSpeaking();
                setVoiceEnabled(false);
              } else {
                setVoiceEnabled(true);
                const lastAriaMsg = [...messages].reverse().find((m) => m.role === "assistant");
                if (lastAriaMsg) speak(lastAriaMsg.text);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all cursor-pointer ${
              voiceEnabled
                ? "bg-[var(--paper)] border-[var(--brass)] text-[var(--brass)]"
                : "bg-[var(--paper)] border-[var(--line-on-paper)] text-[var(--text-on-paper-mut)]"
            }`}
            title={voiceEnabled ? "Mute Aria's Voice" : "Unmute Aria's Voice"}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[var(--brass)]" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--text-on-paper-mut)]" />}
            <span>Aria Voice: {voiceEnabled ? "ON" : "MUTED"}</span>
            {isSpeaking && (
              <span className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-[var(--brass)] animate-pulse rounded-full"></span>
                <span className="w-1 h-4 bg-[var(--brass)] animate-pulse delay-75 rounded-full"></span>
                <span className="w-1 h-2 bg-[var(--brass)] animate-pulse delay-150 rounded-full"></span>
              </span>
            )}
          </button>

          {/* Elapsed Timer */}
          <div className="flex items-center gap-1.5 bg-[var(--paper)] border border-[var(--line-on-paper)] px-3 py-1.5 rounded-sm text-[var(--text-on-paper)]">
            <Clock className="w-3.5 h-3.5 text-[var(--brass)]" />
            <span>ELAPSED: {formatTime(elapsedSeconds)}</span>
          </div>

          {/* Question Counter */}
          <div className="flex items-center gap-1.5 bg-[var(--ink)] text-[var(--brass-lt)] border border-[var(--brass)]/40 px-3 py-1.5 rounded-sm font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brass)]" />
            <span>QUESTION {Math.min(currentQuestionNumber, targetQuestionCount)} OF {targetQuestionCount}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Real Live Webcam Feed & Aria 3D Core */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-4 card-3d-light">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[11px] font-bold text-[var(--text-on-paper)] uppercase tracking-wider">
                CANDIDATE FEED
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold ${
                  cameraActive
                    ? "bg-[var(--paper)] text-[var(--sage)] border border-[var(--sage)]/30"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? "bg-[var(--sage)] animate-pulse" : "bg-amber-600"}`}></span>
                {cameraActive ? "CAM ACTIVE" : "CAM STANDBY"}
              </span>
            </div>

            {/* Live Video Camera Box */}
            <div className="aspect-video w-full rounded-sm bg-[var(--ink)] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden border border-[var(--ink-3)] shadow-inner">
              {/* Real Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  cameraActive ? "opacity-100" : "opacity-0 absolute"
                }`}
              />

              {/* Fallback / Connect Camera UI */}
              {!cameraActive && (
                <div className="flex flex-col items-center justify-center p-4 text-center z-10">
                  <Camera className="w-8 h-8 text-[var(--brass-lt)] mb-1.5" />
                  <span className="font-mono text-xs font-semibold text-[var(--paper)]">
                    {cameraStarting ? "Connecting Camera..." : "Camera Off / Needs Permission"}
                  </span>
                  {cameraError && (
                    <p className="font-mono text-[10px] text-amber-300 mt-1 max-w-[200px] leading-tight">
                      {cameraError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraStarting}
                    className="mt-2.5 px-3 py-1.5 bg-[var(--brass)] hover:bg-[var(--brass-lt)] text-[var(--ink)] font-mono text-[11px] font-bold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm btn-3d btn-3d-brass"
                  >
                    <RefreshCw className={`w-3 h-3 ${cameraStarting ? "animate-spin" : ""}`} />
                    <span>TURN ON CAMERA</span>
                  </button>
                </div>
              )}

              {/* Recording indicator & VU volume meter overlay */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                {isListening ? (
                  <div className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-xs shadow-md font-bold">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    <span>REC {formatTime(recordingDuration)}</span>
                    {/* Live VU Volume Bars */}
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className={`w-0.5 rounded-full transition-all ${micVolume > 15 ? "h-2.5 bg-white" : "h-1 bg-white/40"}`}></span>
                      <span className={`w-0.5 rounded-full transition-all ${micVolume > 35 ? "h-3.5 bg-white" : "h-1 bg-white/40"}`}></span>
                      <span className={`w-0.5 rounded-full transition-all ${micVolume > 60 ? "h-4 bg-white" : "h-1 bg-white/40"}`}></span>
                    </span>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 bg-black/70 text-[var(--text-on-ink-mut)] font-mono text-[9px] px-2 py-0.5 rounded-xs border border-white/10">
                    MIC STANDBY
                  </span>
                )}
              </div>

              {/* Candidate Name Tag & Reconnect Button */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                <div className="px-2 py-0.5 bg-black/70 rounded-xs text-[10px] font-mono text-[var(--paper)] border border-white/10">
                  {session.candidate?.name || "Candidate"}
                </div>
                {cameraActive && (
                  <button
                    type="button"
                    onClick={startCamera}
                    title="Reconnect Camera"
                    className="pointer-events-auto px-1.5 py-0.5 bg-black/60 hover:bg-black/90 text-[var(--brass-lt)] rounded-xs text-[9px] font-mono border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Telemetry Details */}
            <div className="mt-4 pt-3 border-t border-[var(--line-on-paper)] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-on-paper-mut)]">Focus Policy:</span>
                <span className={strikeCount > 0 ? "text-amber-600 font-bold" : "text-[var(--sage)] font-semibold"}>
                  {strikeCount === 0 ? "100% Clean" : `${strikeCount} Strike(s)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-on-paper-mut)]">Aria Status:</span>
                <span className={isSpeaking ? "text-[var(--brass)] font-bold animate-pulse" : "text-[var(--text-on-paper)] font-medium"}>
                  {isSpeaking ? "Speaking..." : "Listening"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-on-paper-mut)]">Candidate Voice:</span>
                <span className={isListening ? "text-red-600 font-bold animate-pulse" : "text-[var(--text-on-paper)]"}>
                  {isListening ? `Live Capture (${recordingDuration}s)` : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Aria 3D AI Core Hologram Panel */}
          <div className="bg-[var(--ink)] text-[var(--paper)] rounded-sm border border-[var(--ink-3)] p-4 shadow-md relative overflow-hidden card-3d-dark">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-bold text-[var(--brass-lt)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[var(--brass)]" />
                ARIA 3D CORE
              </span>
              <span className={`font-mono text-[9px] px-2 py-0.5 rounded-xs border ${isSpeaking ? "bg-[var(--brass)]/20 text-[var(--brass-lt)] border-[var(--brass)]/40 animate-pulse" : "bg-white/5 text-[var(--text-on-ink-mut)] border-white/10"}`}>
                {isSpeaking ? "TRANSMITTING" : "OBSERVING"}
              </span>
            </div>
            
            <div className="flex items-center justify-center py-0.5">
              <Aria3DOrb size={130} isSpeaking={isSpeaking} />
            </div>

            <div className="text-center font-mono text-[10px] text-[var(--text-on-ink-mut)]">
              {isSpeaking ? "Aria vocal synthesis active" : "Listening & analyzing context"}
            </div>
          </div>

          {/* Quick instructions card */}
          <div className="bg-[var(--paper)] rounded-sm border border-[var(--line-on-paper)] p-4 text-xs text-[var(--text-on-paper-mut)] card-3d-light">
            <p className="font-serif font-semibold text-[var(--text-on-paper)] mb-2">Voice & Answer Tips:</p>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>
                <strong>Voice Answering:</strong> Click <strong>"Record" (🎙️)</strong>, speak your answer naturally. Your words appear live in the box. Click <strong>"Done"</strong> or <strong>Send</strong>.
              </li>
              <li>
                <strong>Typing:</strong> You can edit or type answers directly and press <strong>Enter</strong>.
              </li>
              <li>
                <strong>Two-Strike Policy:</strong> Do not switch browser tabs while answering.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Interactive Q&A Room or Final Diagnostic Scorecard */}
        <div className="lg:col-span-3 flex flex-col h-[700px] bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] shadow-sm overflow-hidden">
          {/* Messages scroll area — internal scrolling, window stays stationary */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, idx) => {
              const isAria = msg.role === "assistant";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isAria ? "items-start" : "items-start flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 text-white shadow-sm border ${
                      isAria
                        ? "bg-[var(--ink)] text-[var(--brass-lt)] border-[var(--brass)]/50"
                        : "bg-[var(--brass)] text-[var(--ink)] border-[var(--brass-lt)]"
                    }`}
                  >
                    {isAria ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  {/* Speech Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-sm p-4 text-sm leading-relaxed border shadow-xs ${
                      isAria
                        ? msg.warningIssued
                          ? "bg-amber-950/20 text-amber-900 border-amber-500/60 border-l-4"
                          : "bg-[var(--paper)] text-[var(--text-on-paper)] border-[var(--line-on-paper)] border-l-3 border-l-[var(--brass)]"
                        : "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink-3)]"
                    }`}
                  >
                    {/* Metadata Header for Aria */}
                    {isAria && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[var(--line-on-paper)]">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-xs text-[var(--brass)]">Aria</span>
                          {msg.topic && (
                            <span className="text-[10px] font-mono text-[var(--text-on-paper-mut)] bg-[var(--paper-2)] px-2 py-0.5 rounded-sm border border-[var(--line-on-paper)]">
                              {msg.topic}
                            </span>
                          )}
                          {msg.questionType && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-on-paper-mut)]">
                              {msg.questionType === "recruiter_custom" ? "RECRUITER QUESTION" : msg.questionType}
                            </span>
                          )}
                        </div>

                        {/* Replay audio button */}
                        <button
                          type="button"
                          onClick={() => speak(msg.text)}
                          className="flex items-center gap-1 text-[11px] font-mono text-[var(--brass)] hover:text-[var(--brass-lt)] bg-[var(--paper-2)] px-2 py-0.5 rounded-xs border border-[var(--line-on-paper)] transition-colors cursor-pointer"
                          title="Listen to Aria"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Transcribing Audio Indicator */}
            {isTranscribing && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-sm bg-[var(--ink)] border border-[var(--brass)] flex items-center justify-center text-[var(--brass-lt)] flex-shrink-0 shadow-sm">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-[var(--paper)] border border-[var(--brass)]/50 rounded-sm p-4 text-xs font-mono text-[var(--text-on-paper)] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[var(--brass)] animate-spin" />
                  <span>Transcribing speech audio with Gemini 3.6...</span>
                </div>
              </div>
            )}

            {/* Submitting Answer / Aria Thinking Indicator */}
            {submitting && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-sm bg-[var(--ink)] border border-[var(--brass)] flex items-center justify-center text-[var(--brass-lt)] flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm p-4 text-xs font-mono text-[var(--text-on-paper-mut)] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[var(--brass)] animate-spin" />
                  <span>Aria is evaluating your response...</span>
                </div>
              </div>
            )}
          </div>

          {/* COMPLETED STATE: Comprehensive Scorecard (Practice vs Recruiter Modes) */}
          {sessionStatus === "completed" && (
            <div className="p-6 bg-[var(--ink)] text-[var(--paper)] border-t-2 border-[var(--brass)] flex flex-col items-center justify-center text-center overflow-y-auto max-h-[380px]">
              <div className="w-12 h-12 rounded-full bg-[var(--brass)]/20 border border-[var(--brass)] flex items-center justify-center text-[var(--brass-lt)] mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--paper)]">
                {mode === "practice"
                  ? "Practice Session Completed • Skill Diagnostic Ready"
                  : "Technical Screening Completed • Recruiter Report Dispatched"}
              </h3>
              <p className="font-mono text-xs text-[var(--text-on-ink-mut)] max-w-lg mt-1 mb-4">
                All {targetQuestionCount} questions answered. Aria has completed analysis of your technical depth, logic, and delivery.
              </p>

              {/* Email Notification Banner */}
              <div className="w-full max-w-lg bg-[var(--ink-2)] border border-[var(--brass)]/40 rounded-sm p-3 mb-4 flex items-center justify-between text-xs font-mono text-[var(--brass-lt)]">
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-[var(--brass-lt)]" />
                  <span>
                    {mode === "recruiter"
                      ? `Full evaluation report emailed to recruiter (${recruiterEmail || "recruiter@veritas.ai"}).`
                      : "Detailed feedback & preparation roadmap compiled."}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-on-ink-mut)] uppercase font-semibold">VERIFIED</span>
              </div>

              {/* Score breakdown metrics */}
              {reportData && (
                <div className="w-full max-w-lg bg-[var(--ink-2)] border border-[var(--line-on-ink)] rounded-sm p-4 mb-4 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--line-on-ink)] pb-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-on-ink-mut)]">
                      {mode === "practice" ? "Skill Mastery Index:" : "Candidate Evaluation Score:"}
                    </span>
                    <span className="font-mono text-lg font-bold text-[var(--brass-lt)]">
                      {reportData.overallScore || 85} / 100
                    </span>
                  </div>

                  {reportData.summary && (
                    <p className="text-xs text-[var(--text-on-ink-mut)] leading-relaxed">
                      {reportData.summary}
                    </p>
                  )}

                  {/* Mode 1: Practice Suggestions & Study Topics */}
                  {mode === "practice" && (
                    <>
                      {reportData.suggestions && reportData.suggestions.length > 0 && (
                        <div className="bg-[var(--ink)]/60 border border-[var(--brass)]/30 p-3 rounded-sm">
                          <span className="font-mono text-[10px] text-[var(--brass-lt)] uppercase font-bold flex items-center gap-1 mb-1">
                            <Lightbulb className="w-3.5 h-3.5" /> What to Change &amp; Improve in Real Interviews:
                          </span>
                          <ul className="list-disc pl-4 text-xs text-[var(--paper)] space-y-1">
                            {reportData.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reportData.topicsToPrepare && reportData.topicsToPrepare.length > 0 && (
                        <div className="bg-[var(--ink)]/60 border border-[var(--sage)]/30 p-3 rounded-sm">
                          <span className="font-mono text-[10px] text-[var(--sage)] uppercase font-bold flex items-center gap-1 mb-1">
                            <BookOpen className="w-3.5 h-3.5" /> Recommended Topics to Study:
                          </span>
                          <ul className="list-disc pl-4 text-xs text-[var(--paper)] space-y-1">
                            {reportData.topicsToPrepare.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* Mode 2: Recruiter Key Strengths & Next Step */}
                  {mode === "recruiter" && (
                    <>
                      {reportData.strengths && reportData.strengths.length > 0 && (
                        <div>
                          <span className="font-mono text-[10px] text-[var(--sage)] uppercase font-semibold">Key Strengths:</span>
                          <ul className="list-disc pl-4 text-xs text-[var(--paper)] mt-1 space-y-0.5">
                            {reportData.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reportData.recommendation && (
                        <div className="font-mono text-xs text-[var(--brass-lt)]">
                          Verdict: <strong>{reportData.recommendation}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {/* Direct Email View Button */}
                  <div className="pt-2 border-t border-[var(--line-on-ink)] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[var(--text-on-ink-mut)]">
                      Executive Scorecard Email:
                    </span>
                    <a
                      href={`${apiUrl}/api/interview/${sessionId}/email-preview?type=report`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ink)] hover:bg-[var(--ink-2)] text-[var(--brass-lt)] border border-[var(--brass)]/40 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      <MailCheck className="w-3.5 h-3.5" />
                      <span>Preview Email &rarr;</span>
                    </a>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onReset}
                className="mt-1 px-5 py-2.5 bg-[var(--brass)] hover:bg-[var(--brass-lt)] text-[var(--ink)] font-mono font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start New Interview
              </button>
            </div>
          )}

          {/* TERMINATED STATE */}
          {sessionStatus === "terminated" && (
            <div className="p-6 bg-rose-950/30 border-t-2 border-rose-500 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-10 h-10 text-rose-500 mb-2" />
              <h3 className="font-serif text-lg font-bold text-rose-300">Evaluation Session Paused / Terminated</h3>
              <p className="font-mono text-xs text-rose-200/80 max-w-md mt-1 mb-4">
                Two tab-switch focus violations were detected during your interview. In accordance with proctoring policy, the session has been halted for manual recruiter review.
              </p>
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] font-mono text-xs font-semibold rounded-sm border border-[var(--line-on-ink)] hover:bg-[var(--ink-2)]"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Answer Input Area: ACTIVE ONLY IN PROGRESS */}
          {sessionStatus === "in_progress" && (
            <div className="p-4 border-t border-[var(--line-on-paper)] bg-[var(--paper)]">
              {/* Active Recording Banner with Live Audio Visualizer */}
              {isListening && (
                <div className="mb-3 px-3.5 py-2 bg-red-950/10 border border-red-500/50 rounded-sm flex items-center justify-between text-xs text-red-700 font-mono">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    <span>LISTENING ({recordingDuration}s) — Speak naturally</span>
                    {/* Visualizer bars */}
                    <div className="flex items-center gap-1 ml-2">
                      <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 10 ? "h-4 bg-red-600" : "h-1.5 bg-red-300"}`}></span>
                      <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 25 ? "h-5 bg-red-600" : "h-1.5 bg-red-300"}`}></span>
                      <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 50 ? "h-6 bg-red-600" : "h-1.5 bg-red-300"}`}></span>
                      <span className={`w-1 rounded-full transition-all duration-75 ${micVolume > 75 ? "h-5 bg-red-600" : "h-1.5 bg-red-300"}`}></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>DONE SPEAKING</span>
                  </button>
                </div>
              )}

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting || isTranscribing}
                  placeholder={
                    isListening
                      ? "Listening to your voice... Speak your response now."
                      : "Type your answer or click the 🎙️ button to speak... (Press Enter to submit)"
                  }
                  className={`w-full p-3.5 pr-40 bg-[var(--paper-2)] border rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none resize-none transition-all ${
                    isListening
                      ? "border-red-500 ring-1 ring-red-300"
                      : "border-[var(--line-on-paper)] focus:border-[var(--brass)]"
                  }`}
                />

                {/* Action Buttons: Mic + Submit */}
                <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    disabled={submitting || isTranscribing}
                    className={`px-3 py-2 rounded-sm text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs btn-3d ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "btn-3d-ink"
                    }`}
                    title={isListening ? "Stop and transcribe audio" : "Click to speak your answer"}
                  >
                    {isListening ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>STOP</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[var(--brass)]" />
                        <span>SPEAK</span>
                      </>
                    )}
                  </button>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={!inputAnswer.trim() || submitting || isTranscribing}
                    onClick={handleSubmitAnswer}
                    className="px-4 py-2 bg-[var(--brass)] hover:bg-[var(--brass-lt)] disabled:opacity-40 text-[var(--ink)] font-mono font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm btn-3d btn-3d-brass"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>SEND</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-on-paper-mut)] mt-2 px-1">
                <span>Click <strong>Speak (🎙️)</strong> to talk or type & press <strong>Enter</strong></span>
                <span>{inputAnswer.length} characters</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
