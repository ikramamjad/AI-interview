"use client";

import { useEffect, useState } from "react";

export default function ScrollRule() {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setWidth(`${pct}%`);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="scroll-rule" style={{ width }} />;
}
