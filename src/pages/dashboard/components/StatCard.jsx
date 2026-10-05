import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  subColor = "text-emerald-600 dark:text-emerald-400",
  iconBg = "bg-orange-500/15 dark:bg-orange-500/20",
  iconColor = "text-orange-600 dark:text-orange-400",
  badge,
  badgeColor = "bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20",
  trend, // "up" | "down"
  active = false,
  onClick,
  progress,
  chartBars,
}) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
      onClick ? "cursor-pointer select-none" : ""
    } ${
      active
        ? "border-orange-500 bg-orange-50/60 shadow-md shadow-orange-500/15 dark:border-orange-500/80 dark:bg-[#281B14]"
        : "border-[#EFE8DD] bg-white hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/5 dark:border-[#2E2C2A] dark:bg-[#1C1B1A] dark:hover:border-orange-500/40"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
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
          className="text-stone-400 opacity-0 transition-opacity group-hover:opacity-100"
        />
      ) : null}
    </div>

    <div className="mt-2.5 flex items-baseline justify-between gap-2">
      <h3 className="truncate text-2xl sm:text-[26px] font-black tracking-tight text-stone-900 dark:text-stone-100">
        {value}
      </h3>
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconColor}`}
      >
        <Icon size={18} />
      </div>
    </div>

    <div className="mt-2 flex items-center justify-between gap-1.5">
      {sub && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          {trend === "up" && <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" />}
          {trend === "down" && <TrendingDown size={12} className="text-rose-500 flex-shrink-0" />}
          <span className={`truncate ${subColor}`}>{sub}</span>
        </div>
      )}

      {/* Mini bar chart indicator (From Mockup) */}
      <div className="flex items-end gap-0.5 ml-auto">
        <span className="w-1 h-2 rounded-xs bg-orange-500/40" />
        <span className="w-1 h-3 rounded-xs bg-orange-500/60" />
        <span className="w-1 h-4 rounded-xs bg-orange-500/80" />
        <span className="w-1 h-5 rounded-xs bg-orange-500" />
      </div>
    </div>

    {progress !== undefined && (
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    )}
  </div>
);

export default StatCard;
