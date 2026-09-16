"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Building, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register, oauthLogin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        await register({
          name,
          email,
          password,
          role,
          organizationName: role === "recruiter" ? orgName : undefined,
        });
      } else {
        await login({ email, password, role });
      }
    } catch (err) {
      setError(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const demoEmail = email || `user.${Date.now().toString(36)}@gmail.com`;
      const demoName = name || "Google User";
      await oauthLogin({
        provider: "google",
        email: demoEmail,
        name: demoName,
        avatarUrl: "https://lh3.googleusercontent.com/a/default-user",
        role,
      });
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const demoEmail = email || `dev.${Date.now().toString(36)}@github.com`;
      const demoName = name || "GitHub Developer";
      await oauthLogin({
        provider: "github",
        email: demoEmail,
        name: demoName,
        avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
        role,
      });
    } catch (err) {
      setError(err.message || "GitHub sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10121B]/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#1A1E30] text-[#EDE8DA] rounded-lg shadow-2xl border border-[rgba(237,232,218,0.14)] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-[#9A957F] hover:text-[#EDE8DA] rounded-full hover:bg-[#10121B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-8 pb-4 px-6 sm:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#B08D3E] text-[#D9BC7A] bg-[#10121B] mb-3">
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#B08D3E" strokeWidth="1.2" />
              <path d="M12 13L20 27L28 13" stroke="#D9BC7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#EDE8DA]">
            {authMode === "signup" ? "Create Your Account" : "Sign In to Veritas"}
          </h2>
          <p className="font-mono text-xs text-[#9A957F] mt-1">
            {authMode === "signup"
              ? "Join Veritas AI to interview or evaluate candidates"
              : "Access your interview sessions and scorecards"}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#10121B] p-1 rounded border border-[rgba(237,232,218,0.1)] mt-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded transition-all ${
                authMode === "login"
                  ? "bg-[#B08D3E] text-[#10121B] font-semibold"
                  : "text-[#9A957F] hover:text-[#EDE8DA]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded transition-all ${
                authMode === "signup"
                  ? "bg-[#B08D3E] text-[#10121B] font-semibold"
                  : "text-[#9A957F] hover:text-[#EDE8DA]"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 pb-8 space-y-4">
          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-[rgba(237,232,218,0.14)] hover:border-[#B08D3E] bg-[#10121B] text-[#EDE8DA] text-xs font-medium rounded transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z" />
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={handleGithubAuth}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-[rgba(237,232,218,0.14)] hover:border-[#B08D3E] bg-[#10121B] text-[#EDE8DA] text-xs font-medium rounded transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[rgba(237,232,218,0.1)] w-full"></div>
            <span className="bg-[#1A1E30] px-2 text-[10px] font-mono uppercase text-[#9A957F]">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-1">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  role === "candidate"
                    ? "border-[#B08D3E] bg-[#B08D3E]/15 text-[#D9BC7A] font-semibold"
                    : "border-[rgba(237,232,218,0.14)] text-[#9A957F] hover:border-[#B08D3E]/40"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  role === "recruiter"
                    ? "border-[#B08D3E] bg-[#B08D3E]/15 text-[#D9BC7A] font-semibold"
                    : "border-[rgba(237,232,218,0.14)] text-[#9A957F] hover:border-[#B08D3E]/40"
                }`}
              >
                Recruiter
              </button>
            </div>

            {/* Name (Sign Up only) */}
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-mono text-[#9A957F] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9A957F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full pl-9 pr-3 py-2 bg-[#10121B] border border-[rgba(237,232,218,0.14)] rounded text-xs text-[#EDE8DA] focus:border-[#B08D3E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Organization Name (Recruiter Sign Up) */}
            {authMode === "signup" && role === "recruiter" && (
              <div>
                <label className="block text-xs font-mono text-[#9A957F] mb-1">Company / Organization</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#9A957F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Apex Systems"
                    className="w-full pl-9 pr-3 py-2 bg-[#10121B] border border-[rgba(237,232,218,0.14)] rounded text-xs text-[#EDE8DA] focus:border-[#B08D3E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-mono text-[#9A957F] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A957F] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#10121B] border border-[rgba(237,232,218,0.14)] rounded text-xs text-[#EDE8DA] focus:border-[#B08D3E] focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-[#9A957F] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A957F] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#10121B] border border-[rgba(237,232,218,0.14)] rounded text-xs text-[#EDE8DA] focus:border-[#B08D3E] focus:outline-none"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 btn btn-brass flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#10121B]" />
              ) : (
                <>
                  <span>{authMode === "signup" ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
