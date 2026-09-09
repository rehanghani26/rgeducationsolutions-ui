import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  subColor = "text-emerald-500 dark:text-emerald-400",
  iconBg = "bg-indigo-600/10 dark:bg-indigo-600/20",
  iconColor = "text-indigo-600 dark:text-indigo-400",
  badge,
  badgeColor = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
  trend, // "up" | "down"
  active = false,
  onClick,
  progress,
}) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
      onClick ? "cursor-pointer select-none" : ""
    } ${
      active
        ? "border-indigo-500 bg-indigo-50/40 shadow-md shadow-indigo-500/10 dark:border-indigo-500/80 dark:bg-[#131b2e] dark:shadow-indigo-500/5"
        : "border-slate-200/90 bg-white hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md hover:shadow-slate-200/50 dark:border-slate-800/80 dark:bg-[#0f172a] dark:hover:border-slate-700 dark:hover:shadow-indigo-500/5"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {badge ? (
        <span
          className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-tight ${badgeColor}`}
        >
          {badge}
        </span>
      ) : onClick ? (
        <ArrowUpRight
          size={13}
          className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
        />
      ) : null}
    </div>

    <div className="mt-2.5 flex items-baseline justify-between gap-2">
      <h3 className="truncate text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white">
        {value}
      </h3>
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconColor}`}
      >
        <Icon size={18} />
      </div>
    </div>

    {sub && (
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
        {trend === "up" && <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" />}
        {trend === "down" && <TrendingDown size={12} className="text-rose-500 flex-shrink-0" />}
        <span className={`truncate ${subColor}`}>{sub}</span>
      </div>
    )}

    {progress !== undefined && (
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    )}
  </div>
);

export default StatCard;
