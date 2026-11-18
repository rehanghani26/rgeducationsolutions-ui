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
    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
      onClick ? "cursor-pointer select-none" : ""
    } ${
      active
        ? "border-orange-500 bg-orange-50/60 shadow-xs dark:border-orange-500/80 dark:bg-[#281B14]"
        : "border-[#EFE8DD] bg-white hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-xs dark:border-[#2E2C2A] dark:bg-[#1C1B1A] dark:hover:border-orange-500/40"
    }`}
  >
    {/* Mobile compact layout */}
    <div className="flex sm:hidden flex-col p-2.5 gap-1">
      <div className="flex items-center justify-between gap-1 min-w-0">
        <span className="truncate text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 leading-none">
          {label}
        </span>
        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon size={12} />
        </div>
      </div>
      <h3 className="text-sm font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight truncate">
        {value}
      </h3>
      {sub && (
        <div className="flex items-center gap-0.5 text-[8.5px] font-semibold leading-none">
          {trend === "up" && <TrendingUp size={9} className="text-emerald-500 flex-shrink-0" />}
          {trend === "down" && <TrendingDown size={9} className="text-rose-500 flex-shrink-0" />}
          <span className={`truncate ${subColor}`}>{sub}</span>
          <div className="flex items-end gap-px ml-auto shrink-0">
            <span className="w-px h-1.5 rounded-xs bg-orange-500/40" />
            <span className="w-px h-2 rounded-xs bg-orange-500/60" />
            <span className="w-px h-2.5 rounded-xs bg-orange-500/80" />
            <span className="w-px h-3 rounded-xs bg-orange-500" />
          </div>
        </div>
      )}
    </div>

    {/* Desktop layout */}
    <div className="hidden sm:block p-3 px-3.5">
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </span>
        {badge ? (
          <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-tight ${badgeColor}`}>
            {badge}
          </span>
        ) : onClick ? (
          <ArrowUpRight size={12} className="text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
        ) : null}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-1.5 min-w-0">
        <h3 className="truncate text-xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          {value}
        </h3>
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconBg} ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1 min-w-0">
        {sub && (
          <div className="min-w-0 flex-1 flex items-center gap-1 text-[11px] font-semibold leading-tight">
            {trend === "up" && <TrendingUp size={11} className="text-emerald-500 flex-shrink-0" />}
            {trend === "down" && <TrendingDown size={11} className="text-rose-500 flex-shrink-0" />}
            <span className={`truncate ${subColor}`}>{sub}</span>
          </div>
        )}
        <div className="flex items-end gap-0.5 ml-auto shrink-0">
          <span className="w-1 h-2 rounded-xs bg-orange-500/40" />
          <span className="w-1 h-2.5 rounded-xs bg-orange-500/60" />
          <span className="w-1 h-3 rounded-xs bg-orange-500/80" />
          <span className="w-1 h-3.5 rounded-xs bg-orange-500" />
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
