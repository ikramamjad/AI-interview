"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("veritas_cookie_consent");
      if (!consent) {
        setIsVisible(true);
      }
    } catch (e) {
      // localStorage may be disabled
    }
  }, []);

  const handleConsent = (level) => {
    try {
      localStorage.setItem("veritas_cookie_consent", level);
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded bg-[#10121B] text-[#EDE8DA] border border-[rgba(237,232,218,0.18)] shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded border border-[#B08D3E] text-[#D9BC7A] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-semibold text-[#EDE8DA]">
              Cookie &amp; Privacy Choices
            </h4>
            <button
              type="button"
              onClick={() => handleConsent("essential")}
              aria-label="Dismiss cookie notice"
              className="text-[#9A957F] hover:text-[#EDE8DA] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#9A957F] leading-relaxed">
            We use essential local tokens to preserve your interview session. We respect Do Not Track signals and never sell candidate profiles. Learn more in our{" "}
            <Link href="/privacy" className="text-[#D9BC7A] underline hover:text-[#EDE8DA]">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => handleConsent("all")}
              className="btn btn-brass btn-sm text-xs py-1.5 px-3 min-h-[36px]"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => handleConsent("essential")}
              className="btn btn-outline-ink btn-sm text-xs py-1.5 px-3 min-h-[36px]"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
