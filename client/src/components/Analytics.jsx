"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Respect user's Do Not Track preference
    if (typeof window !== "undefined" && window.navigator?.doNotTrack === "1") {
      return;
    }

    // Lightweight anonymous page view telemetry
    if (process.env.NODE_ENV === "development") {
      console.log(`[Veritas Telemetry] Pageview: ${pathname} at ${new Date().toISOString()}`);
    }
  }, [pathname]);

  return null;
}
