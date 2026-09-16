"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, openAuthModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 30);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer upon route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="wrap navrow">
        {/* Brand */}
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

        {/* Desktop Navigation Links */}
        <nav className="site-links" aria-label="Main Navigation">
          <Link
            href="/"
            className={pathname === "/" ? "active" : ""}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href={isHome ? "#aria" : "/about"}
            className={pathname === "/about" ? "active" : ""}
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            Meet Aria
          </Link>
          <Link
            href={isHome ? "#how" : "/features"}
            className={pathname === "/features" ? "active" : ""}
            aria-current={pathname === "/features" ? "page" : undefined}
          >
            How it works
          </Link>
          <Link
            href={isHome ? "#trust" : "/features#anti-cheating"}
            className=""
          >
            Integrity
          </Link>
          <Link
            href="/pricing"
            className={pathname === "/pricing" ? "active" : ""}
            aria-current={pathname === "/pricing" ? "page" : undefined}
          >
            Pricing
          </Link>
          <Link
            href="/faq"
            className={pathname === "/faq" ? "active" : ""}
            aria-current={pathname === "/faq" ? "page" : undefined}
          >
            FAQ
          </Link>
        </nav>

        {/* Desktop Auth / CTA actions */}
        <div className="navactions">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1A1E30] border border-[#B08D3E] text-[#D9BC7A] flex items-center justify-center font-serif text-xs font-semibold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-medium text-[#EDE8DA] leading-tight">{user.name}</p>
                  <p className="font-mono text-[10px] text-[#9A957F] capitalize">{user.role || "Candidate"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-2 text-[#9A957F] hover:text-[#EDE8DA] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="signin-btn min-h-[44px] px-2 flex items-center"
            >
              Sign in
            </button>
          )}

          <Link href="/interview" className="btn btn-brass btn-sm min-h-[40px]">
            Start an interview
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 text-[#EDE8DA] hover:text-[#D9BC7A] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-[#10121B] border-t border-[rgba(237,232,218,0.14)] px-6 py-5 shadow-2xl transition-all"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/about" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              Meet Aria
            </Link>
            <Link
              href="/features"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/features" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              How it works &amp; Integrity
            </Link>
            <Link
              href="/recruiters"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/recruiters" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              For Hiring Teams
            </Link>
            <Link
              href="/pricing"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/pricing" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className={`py-3 text-sm font-medium border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center ${
                pathname === "/faq" ? "text-[#D9BC7A] font-semibold" : "text-[#9A957F]"
              }`}
            >
              FAQ &amp; Knowledge Base
            </Link>
            <Link
              href="/privacy"
              className="py-3 text-sm font-medium text-[#9A957F] border-b border-[rgba(237,232,218,0.08)] min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="py-3 text-sm font-medium text-[#9A957F] min-h-[44px] flex items-center"
            >
              Terms of Service
            </Link>

            <div className="pt-4 flex flex-col gap-2">
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="btn btn-outline-ink w-full min-h-[44px] justify-center"
                >
                  Sign in
                </button>
              )}
              <Link
                href="/interview"
                className="btn btn-brass w-full min-h-[44px] justify-center"
              >
                Start an interview
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
