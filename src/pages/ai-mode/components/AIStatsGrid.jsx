import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
} from "lucide-react";

/**
 * AIStatsGrid
 * Displays responsive KPI / statistical summary cards for ERP data.
 */
export default function AIStatsGrid({
  title = null,
  items = [], // Array<{ label, value, change, icon, accentColor, unit }>
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="my-3 space-y-2">
      {title && (
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[12px] font-bold text-[#FFFFFF] tracking-wide uppercase">
            {title}
          </h4>
          <span className="text-[11px] text-[#A1A1AA]">
            {items.length} metrics
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {items.map((stat, idx) => {
          const Icon = stat.icon || Users;
          return (
            <div
              key={idx}
              className="group relative rounded-xl border border-[#303030] bg-[#1D1D1D] p-3 transition-all duration-200 hover:border-[#FF7900]/40 hover:shadow-[0_0_15px_rgba(255,121,0,0.08)]"
            >
              {/* Subtle accent line on top */}
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-transparent via-[#FF7900]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-[#A1A1AA] truncate">
                  {stat.label}
                </span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg border border-[#303030] ${
                    stat.accentBg || "bg-[#141414]"
                  }`}
                >
                  <Icon
                    className={`h-3 w-3 ${stat.iconColor || "text-[#FFA000]"}`}
                  />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-[11px] text-[#A1A1AA] font-normal">
                    {stat.unit}
                  </span>
                )}
              </div>

              {stat.change && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <TrendingUp className="h-2.5 w-2.5" />
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

