"use client";

import { useState, useRef } from "react";
import { UploadCloud, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function ResumeUpload({ onParsed, apiUrl = "http://localhost:5000" }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setError("");
    setLoading(true);
    setStatusMessage(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatusMessage("Extracting text and analyzing structured profile with Gemini...");
      const res = await fetch(`${apiUrl}/api/resume/parse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse resume.");
      }

      setStatusMessage("Resume successfully parsed!");
      onParsed(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while uploading/parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 w-full">
      {/* Intro header */}
      <div className="text-center mb-8">
        <div className="kicker justify-center mb-3">
          <span className="dot"></span>
          AI-POWERED TECHNICAL SCREENING
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-on-paper)] tracking-tight">
          Upload Your Resume to Start Your Interview
        </h1>
        <p className="mt-3 text-[var(--text-on-paper-mut)] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Our AI interviewer, <span className="font-serif font-semibold text-[var(--text-on-paper)]">Aria</span>, personalizes questions based on your real experience, skills, and target role.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 sm:p-8">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-8 sm:p-14 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[var(--brass)] bg-[var(--paper)]"
              : "border-[var(--line-on-paper)] hover:border-[var(--brass)] bg-[var(--paper)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileInput}
            className="hidden"
            disabled={loading}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full border border-[var(--brass)] bg-[var(--ink)] flex items-center justify-center text-[var(--brass-lt)]">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="font-serif text-base font-semibold text-[var(--text-on-paper)]">
                {loading ? statusMessage : "Click to upload or drag & drop"}
              </p>
              <p className="font-mono text-xs text-[var(--text-on-paper-mut)] mt-1">
                Supports PDF or DOCX (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
