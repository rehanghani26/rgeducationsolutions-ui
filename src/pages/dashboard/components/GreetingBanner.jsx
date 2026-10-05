import React, { useState, useEffect } from "react";
import { Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { getGreeting } from "../data/dashboardData.js";
import { useSchoolBranding } from "../../../context/SchoolBrandingContext.jsx";
import { THEME_MODES, useTheme } from "../../../theme/ThemeContext.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

const GreetingBanner = ({ user }) => {
  const greeting = getGreeting();
  const { theme } = useTheme();
  const { schoolLogo, schoolName } = useSchoolBranding();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayName = user?.name || user?.username || "Rehan Ghani";
  const roleName = (user?.role || "super-admin").replace(/[-_]/g, " ").toUpperCase();

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-[#FDBA74]/50 bg-gradient-to-r from-[#FFF5EB] via-[#FFECD6] to-[#FFE2C2] p-5 shadow-sm dark:border-[#EA580C]/25 dark:from-[#26170D] dark:via-[#201814] dark:to-[#181615] dark:shadow-md transition-all">
      {/* Decorative campus ambient background waves and foliage */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-amber-400/20 blur-2xl" />

      {/* Subtle autumn leaves illustration decorative overlay */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 opacity-30 dark:opacity-15 hidden sm:block">
        <svg viewBox="0 0 100 200" fill="none" className="h-full w-full">
          <path
            d="M10 20 C 40 40, 20 80, 50 100 C 80 120, 30 160, 60 190"
            stroke="#F97316"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="25" cy="50" r="14" fill="#FDBA74" fillOpacity="0.4" />
          <circle cx="45" cy="130" r="18" fill="#F97316" fillOpacity="0.3" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Branding & Greeting */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-200/80 bg-white/95 p-1.5 shadow-xs dark:border-stone-700/80 dark:bg-stone-800/90">
            <img
              src={schoolLogo || rgLogo}
              alt={schoolName || "Iqra Public School"}
              style={
                !schoolLogo && theme === THEME_MODES.DARK
                  ? { mixBlendMode: "screen" }
                  : undefined
              }
              className="h-full w-full object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== rgLogo) {
                  e.currentTarget.src = rgLogo;
                }
              }}
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              {greeting.text},
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="truncate text-xl sm:text-2xl font-black tracking-tight text-[#EA580C] dark:text-[#FB923C]">
                {displayName}!
              </h1>
              <span className="rounded-lg border border-orange-300/80 bg-white/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-700 shadow-2xs dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300">
                {roleName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
              <span className="font-bold text-stone-800 dark:text-stone-200 truncate">
                {schoolName || "Iqra Public School"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Campus
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Date & Time Card */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-[#EFE8DD] bg-white/95 px-4 py-2.5 shadow-sm dark:border-[#2E2C2A] dark:bg-[#1E1D1C]/95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                {todayDate}
              </span>
              <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500">
                {liveTime || "04:24 PM"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingBanner;
