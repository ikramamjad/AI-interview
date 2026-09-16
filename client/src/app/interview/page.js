"use client";

import { useState, useEffect } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ProfileReview from "@/components/ProfileReview";
import InterviewRoom from "@/components/InterviewRoom";
import RecruiterSetup from "@/components/RecruiterSetup";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Briefcase } from "lucide-react";

export default function InterviewPage() {
  // Mode: "practice" | "recruiter"
  const [mode, setMode] = useState("practice");

  // Step for practice mode: 'upload' | 'review' | 'interview'
  const [step, setStep] = useState("upload");
  const [parsedData, setParsedData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [startingInterview, setStartingInterview] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [sessionLoading, setSessionLoading] = useState(false);

  // Check if ?mode=recruiter or ?session=<id> in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "recruiter") {
        setMode("recruiter");
      }

      const sessionId = params.get("session");
      if (sessionId) {
        setSessionLoading(true);
        fetch(`${apiUrl}/api/interview/${sessionId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && data.session) {
              const sess = data.session;
              const lastTurn =
                sess.transcript && sess.transcript.length > 0
                  ? sess.transcript[sess.transcript.length - 1]
                  : { text: "Hello, I am Aria, your technical assessment interviewer." };

              setSessionData({
                sessionId: sess.id,
                session: sess,
                currentTurn: {
                  id: lastTurn.id || "1",
                  text: lastTurn.text,
                  topic: lastTurn.topic || "Technical Assessment",
                  questionType: lastTurn.questionType || "resume",
                },
                message: lastTurn.text,
                report: sess.report,
              });
              setStep("interview");
            } else {
              setError(data?.error || "Interview session link not found or expired.");
            }
          })
          .catch((err) => {
            setError("Failed to load interview session: " + err.message);
          })
          .finally(() => {
            setSessionLoading(false);
          });
      }
    }
  }, [apiUrl]);

  const handleResumeParsed = (data) => {
    if (user && data.profile) {
      if (!data.profile.name || data.profile.name === "Candidate") {
        data.profile.name = user.name;
      }
    }
    setParsedData(data);
    setStep("review");
  };

  // Start interview (used by both Practice ProfileReview and RecruiterSetup)
  const handleStartInterview = async (config) => {
    setStartingInterview(true);
    setError("");

    try {
      const payload = {
        candidateId: user ? user.id : config.candidateId,
        candidateName: config.candidateName,
        candidateEmail: config.candidateEmail,
        candidateProfile: config.candidateProfile,
        role: config.role,
        difficulty: config.difficulty,
        targetQuestionCount: config.targetQuestionCount,
        mode: config.mode || mode,
        recruiterName: config.recruiterName,
        recruiterEmail: config.recruiterEmail,
        customQuestions: config.customQuestions,
        recruiterInstructions: config.recruiterInstructions,
        sendInviteEmail: config.sendInviteEmail !== false,
      };

      const res = await fetch(`${apiUrl}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start interview session.");
      }

      // If recruiter requested link-only generation
      if (config.generateLinkOnly) {
        return data;
      }

      setSessionData(data);
      setStep("interview");
      return data;
    } catch (err) {
      console.error("Error starting interview:", err);
      setError(err.message || "Could not start interview.");
      throw err;
    } finally {
      setStartingInterview(false);
    }
  };

  // Explicit launcher from link generation card
  const handleLaunchSession = (data) => {
    setSessionData(data);
    setStep("interview");
  };

  const handleReset = () => {
    setStep("upload");
    setParsedData(null);
    setSessionData(null);
    setError("");
  };

  return (
    <main className="pt-32 pb-24 px-4 flex-1 flex flex-col justify-center" style={{ background: "var(--paper)" }}>
      {/* Mode Switcher Tabs (Visible before interview room starts) */}
      {step !== "interview" && (
        <div className="max-w-md mx-auto mb-8 w-full">
          <div className="flex bg-[var(--paper-2)] p-1.5 rounded-sm border border-[var(--line-on-paper)] shadow-xs">
            <button
              type="button"
              onClick={() => {
                setMode("practice");
                handleReset();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xs font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "practice"
                  ? "bg-[var(--ink)] text-[var(--brass-lt)] shadow-md"
                  : "text-[var(--text-on-paper-mut)] hover:text-[var(--text-on-paper)]"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Candidate Practice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("recruiter");
                handleReset();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xs font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "recruiter"
                  ? "bg-[var(--ink)] text-[var(--brass-lt)] shadow-md"
                  : "text-[var(--text-on-paper-mut)] hover:text-[var(--text-on-paper)]"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Recruiter Setup</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto mb-6 px-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm text-xs font-mono">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Loading direct link session */}
      {sessionLoading && (
        <div className="max-w-md mx-auto text-center py-20">
          <div className="inline-block p-4 rounded-full bg-[var(--paper-2)] border border-[var(--brass)]/40 mb-4 animate-pulse">
            <span className="font-serif text-2xl font-bold text-[var(--brass)]">Aria</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-on-paper)]">
            Loading Interview Session...
          </p>
        </div>
      )}

      {/* MODE 1: CANDIDATE PRACTICE MODE */}
      {!sessionLoading && mode === "practice" && step === "upload" && (
        <ResumeUpload onParsed={handleResumeParsed} apiUrl={apiUrl} />
      )}

      {!sessionLoading && mode === "practice" && step === "review" && parsedData && (
        <ProfileReview
          parsedData={parsedData}
          onBack={() => setStep("upload")}
          onStartInterview={(cfg) => handleStartInterview({ ...cfg, mode: "practice" })}
          loading={startingInterview}
        />
      )}

      {/* MODE 2: RECRUITER SETUP MODE */}
      {!sessionLoading && mode === "recruiter" && step !== "interview" && (
        <RecruiterSetup
          onStartInterview={handleStartInterview}
          onLaunchSession={handleLaunchSession}
          loading={startingInterview}
          apiUrl={apiUrl}
        />
      )}

      {/* ACTIVE INTERVIEW ROOM (Used for both modes) */}
      {!sessionLoading && step === "interview" && sessionData && (
        <InterviewRoom
          sessionData={sessionData}
          onReset={handleReset}
          apiUrl={apiUrl}
        />
      )}
    </main>
  );
}
