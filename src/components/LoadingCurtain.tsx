import React, { useEffect, useState } from "react";
import { CityLogo, MiminekoMascot } from "./CityLogo";

/**
 * Brief sky-blue welcome curtain inspired by city-the-animation.com's
 * loading screen (--color-blue #1395ea + Mimineko + slide-out right).
 */
export const LoadingCurtain: React.FC = () => {
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("gone");
      return;
    }
    const t1 = window.setTimeout(() => setPhase("out"), 520);
    const t2 = window.setTimeout(() => setPhase("gone"), 1150);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`city-loading-curtain ${phase === "out" ? "load-out" : ""}`}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -top-12 -left-4">
          <MiminekoMascot className="w-16 h-16 drop-shadow-[0_3px_0_rgba(20,20,25,0.28)]" />
        </div>
        <div className="bg-white/95 px-7 py-5 rounded-3xl city-ink-card">
          <CityLogo subtitle="SOCIAL MAP" />
        </div>
      </div>
    </div>
  );
};
