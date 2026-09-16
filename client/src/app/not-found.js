"use client";

import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="pt-36 pb-24 px-4 flex-1 flex flex-col items-center justify-center text-center"
      style={{ background: "var(--paper)" }}
    >
      <div className="max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full border border-[var(--brass)] bg-[var(--ink)] flex items-center justify-center mx-auto text-[var(--brass-lt)] shadow-md">
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" role="img" aria-label="Veritas Seal">
            <circle cx="20" cy="20" r="19" stroke="#B08D3E" strokeWidth="1.2" />
            <path d="M12 13L20 27L28 13" stroke="#D9BC7A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="kicker justify-center">
          <span className="dot"></span>
          ERROR 404 · RECORD MISSING
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[var(--text-on-paper)] tracking-tight">
          Page or Session Not Found
        </h1>

        <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
          The requested record, campaign invitation, or page does not exist or may have been archived. Please check the URL or navigate back to the home portal.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-outline-paper btn-sm flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link href="/interview" className="btn btn-brass btn-sm flex items-center gap-2">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start an Interview</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
