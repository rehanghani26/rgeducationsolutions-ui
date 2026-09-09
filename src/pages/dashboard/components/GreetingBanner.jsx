import React from "react";
import { Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { getGreeting } from "../data/dashboardData.js";
import { useSchoolBranding } from "../../../context/SchoolBrandingContext.jsx";
import { THEME_MODES, useTheme } from "../../../theme/ThemeContext.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

const GreetingBanner = ({ user }) => {
  const greeting = getGreeting();
  const { theme } = useTheme();
  const { schoolLogo, schoolName } = useSchoolBranding();

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const roleName = (user?.role || "user").replace("-", " ").toUpperCase();

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md transition-all sm:px-5 sm:py-3 dark:border-slate-800/90 dark:bg-[#0f172a]/95 dark:shadow-lg dark:shadow-indigo-950/20">
      {/* Subtle background ambient sheen */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: School Branding + Personal Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
            <img
              src={schoolLogo || rgLogo}
              alt={schoolName || "School Logo"}
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{greeting.icon}</span>
              <h1 className="truncate text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {greeting.text},{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {user?.name || user?.username || "User"}!
                </span>
              </h1>
              <span className="rounded-md border border-indigo-200/80 bg-indigo-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300">
                {roleName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-none">
                {schoolName || "RG EduCore"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Campus
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Date Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200">
            <Calendar size={13} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>{todayDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingBanner;
