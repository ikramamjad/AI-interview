"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="editorial-footer" role="contentinfo" aria-label="Site Footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <Link href="/" className="brand" aria-label="Aria Homepage">
              <svg className="seal" viewBox="0 0 40 40" fill="none" role="img" aria-label="Aria Official Seal">
                <circle cx="20" cy="20" r="19" fill="#10121B" stroke="#B08D3E" strokeWidth="1.2" />
                <circle cx="20" cy="20" r="14.5" fill="none" stroke="#B08D3E" strokeWidth="0.6" opacity="0.6" />
                <path
                  d="M12 13L20 27L28 13"
                  stroke="#D9BC7A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="brandtext">
                <span className="name">Aria</span>
              </span>
            </Link>
            <p>
              Personalized technical interviews conducted by Aria, backed by real-time proctoring and human review to keep the process fair.
            </p>
            <span className="foot-badge" aria-label="Verified anti-cheating monitoring active">
              <span className="d" aria-hidden="true"></span>
              Anti-cheating verified
            </span>
          </div>

          <div className="foot-col">
            <h5>Platform</h5>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">Meet Aria</Link></li>
              <li><Link href="/features">Integrity &amp; proctoring</Link></li>
              <li><Link href="/faq">FAQ &amp; Knowledge Base</Link></li>
              <li><Link href="/interview">Start an interview</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Solutions</h5>
            <ul>
              <li><Link href="/recruiters">For hiring teams</Link></li>
              <li><Link href="/pricing">Pricing &amp; plans</Link></li>
              <li><Link href="/features#anti-cheating">Cheating prevention</Link></li>
              <li><Link href="/features#voice">Voice dictation</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Trust &amp; privacy</h5>
            <ul>
              <li><Link href="/privacy">Candidate consent policy</Link></li>
              <li><Link href="/privacy">Data retention (90 days)</Link></li>
              <li><Link href="/terms">Human appeal guarantee</Link></li>
              <li><Link href="/privacy">Biometric minimization</Link></li>
              <li><Link href="/terms">Terms of service</Link></li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 Veritas AI Platform. All rights reserved.</span>
          <span>Built with Next.js, Google Gemini, and Prisma Postgres.</span>
        </div>
      </div>
    </footer>
  );
}
