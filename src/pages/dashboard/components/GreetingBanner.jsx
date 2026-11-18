import React from "react";
import { Sun, SunMedium, Sunset, MoonStar } from "lucide-react";
import { getGreeting } from "../data/dashboardData.js";

const GreetingBanner = ({ user }) => {
  const greeting = getGreeting();

  const hour = new Date().getHours();
  const GreetingIcon = (() => {
    if (hour >= 5 && hour < 12) return Sun;
    if (hour >= 12 && hour < 17) return SunMedium;
    if (hour >= 17 && hour < 21) return Sunset;
    return MoonStar;
  })();

  const displayName = user?.name || user?.username || "Rehan Ghani";

  return (
    <div className="relative w-full mb-2 sm:mb-4 overflow-hidden rounded-xl sm:rounded-2xl border border-orange-300/70 bg-gradient-to-br from-[#FFFDF9] via-[#FFF6EB] to-[#FFEDE0] px-3 py-2 sm:px-4 sm:py-3 shadow-xs dark:border-orange-500/25 dark:from-[#1F1C18] dark:via-[#171513] dark:to-[#100F0E] dark:shadow-md dark:shadow-black/40 transition-all duration-300">
      {/* ── Top Highlight Glow Line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent opacity-90" />

      {/* ── Ambient Radial Atmosphere Orbs ── */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-3xl dark:from-orange-500/20 dark:to-transparent" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-tr from-amber-400/15 to-rose-500/5 blur-2xl dark:from-amber-600/15 dark:to-transparent" />

      {/* ── Full Width Content: Only Greeting Message & Name ── */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0 w-full">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <GreetingIcon size={15} className="text-orange-500 animate-pulse shrink-0" />
            {greeting.text},
          </span>

          <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-stone-900 dark:text-white leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-orange-400 dark:via-amber-300 dark:to-orange-400">
              {displayName}!
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default GreetingBanner;
