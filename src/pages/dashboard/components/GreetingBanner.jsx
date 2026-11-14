import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Sun,
  SunMedium,
  Sunset,
  MoonStar,
  GraduationCap,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { getGreeting } from "../data/dashboardData.js";
import { useSchoolBranding } from "../../../context/SchoolBrandingContext.jsx";
import { THEME_MODES, useTheme } from "../../../theme/ThemeContext.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";
import { formatDate } from "../../../utils";

const GreetingBanner = ({ user }) => {
  const greeting = getGreeting();
  const { theme } = useTheme();
  const { schoolLogo, schoolName } = useSchoolBranding();
  const [liveTime, setLiveTime] = useState("");
  const [liveSeconds, setLiveSeconds] = useState("");

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
      setLiveSeconds(
        now.toLocaleTimeString("en-US", {
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayDate = formatDate(new Date(), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const GreetingIcon = (() => {
    if (hour >= 5 && hour < 12) return Sun;
    if (hour >= 12 && hour < 17) return SunMedium;
    if (hour >= 17 && hour < 21) return Sunset;
    return MoonStar;
  })();

  const displayName = user?.name || user?.username || "Rehan Ghani";
  const roleName = (user?.role || "super-admin")
    .replace(/[-_]/g, " ")
    .toUpperCase();

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-orange-300/70 bg-gradient-to-br from-[#FFFDF9] via-[#FFF6EB] to-[#FFEDE0] p-5 sm:p-6 shadow-md shadow-orange-500/5 dark:border-orange-500/25 dark:from-[#1F1C18] dark:via-[#171513] dark:to-[#100F0E] dark:shadow-xl dark:shadow-black/50 transition-all duration-300">
      {/* ── Top Highlight Glow Line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent opacity-90" />

      {/* ── Ambient Radial Atmosphere Orbs ── */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-3xl dark:from-orange-500/20 dark:to-transparent" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-60 w-60 rounded-full bg-gradient-to-tr from-amber-400/15 to-rose-500/5 blur-2xl dark:from-amber-600/15 dark:to-transparent" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 h-44 w-96 rounded-full bg-orange-400/5 blur-3xl dark:bg-orange-500/5" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* ── Left Side: School Crest + Greeting + User Bio ── */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Logo container with verified pulse dot */}
          <div className="relative flex-shrink-0 group">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-orange-500/30 bg-white/95 p-2 shadow-lg shadow-orange-500/10 dark:border-stone-700/80 dark:bg-[#1C1A18]/95 dark:shadow-black/40 transition-transform duration-300 group-hover:scale-105">
              <img
                src={schoolLogo || rgLogo}
                alt={schoolName || "School Crest"}
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
            {/* Live active beacon */}
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center"
              title="Campus Server Online"
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E1D1C]" />
            </span>
          </div>

          {/* Greeting Typography & Context Tags */}
          <div className="flex min-w-0 flex-col space-y-1">
            {/* Salutation row */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                <GreetingIcon size={14} className="text-orange-500 animate-pulse" />
                {greeting.text},
              </span>
            </div>

            {/* User Name & Role Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-orange-400 dark:via-amber-300 dark:to-orange-400">
                  {displayName}!
                </span>
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 shadow-2xs">
                <ShieldCheck size={13} className="text-orange-500" />
                {roleName}
              </span>
            </div>

            {/* School Campus & Academic Year Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-300 pt-0.5">
              <span className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[240px] sm:max-w-none">
                {schoolName || "Becon International School"}
              </span>

              <span className="text-stone-300 dark:text-stone-700">•</span>

              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Campus
              </span>

              <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">
                •
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 font-medium text-stone-500 dark:text-stone-400">
                <GraduationCap size={13} className="text-orange-500/80" />
                Session 2026-27
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Side: Live Date & Clock Widget Hub ── */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto flex-shrink-0">
          <div className="flex items-center gap-3.5 rounded-2xl border border-orange-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md dark:border-stone-800 dark:bg-[#181615]/90 transition-all hover:border-orange-400/50">
            {/* Clock & Calendar icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-xs">
              <Calendar size={18} />
            </div>

            <div className="flex flex-col">
              {/* Live Digital Clock */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-mono font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  {liveTime || "06:46 PM"}
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Formatted Date */}
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                {todayDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingBanner;
