import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import ScrollRule from "@/components/ScrollRule";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://veritasai.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Veritas AI — Interviews with Aria",
    template: "%s | Veritas AI",
  },
  description:
    "Aria conducts live technical interviews by voice, grounding every question in your real projects with honest, appealable proctoring.",
  keywords: [
    "AI technical interview",
    "Aria AI",
    "engineering interviews",
    "AI proctoring",
    "mock technical interview",
    "automated candidate screening",
  ],
  authors: [{ name: "Veritas AI Team" }],
  creator: "Veritas AI",
  publisher: "Veritas AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Veritas AI",
    title: "Veritas AI — Interviews with Aria",
    description:
      "Aria conducts live technical interviews by voice, grounding every question in your real projects with honest, appealable proctoring.",
    images: [
      {
        url: `${siteUrl}/icon.svg`,
        width: 800,
        height: 800,
        alt: "Veritas AI Official Seal and Interview System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veritas AI — Interviews with Aria",
    description:
      "Aria conducts live technical interviews by voice, grounding every question in your real projects with honest proctoring.",
    images: [`${siteUrl}/icon.svg`],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ScrollRule />
        <Analytics />
        <AuthProvider>
          <Navbar />
          <AuthModal />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
