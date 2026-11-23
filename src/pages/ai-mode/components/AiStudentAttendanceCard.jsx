import React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Calendar,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentAttendanceCard({
  student = {},
  month = "Current Month",
  stats = { totalWorkingDays: 25, present: 22, absent: 2, late: 1, percentage: 92 },
  streak = 9,
  records = [],
  onAskAiPrompt,
}) {
  const percentage = stats.percentage || 90;

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Attendance Log & Monthly Calendar
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"}) • {month}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              {streak} Days Streak!
            </div>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              percentage >= 85
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {percentage}% Overall Rate
          </span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 border-b ${border.default} divide-x divide-y sm:divide-y-0 divide-stone-100 dark:divide-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40`}>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400">Working Days</span>
          <p className={`text-base font-black ${text.primary}`}>{stats.totalWorkingDays}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-500">Present Days</span>
          <p className="text-base font-black text-emerald-500">{stats.present}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-400">Absences</span>
          <p className="text-base font-black text-rose-400">{stats.absent}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400">Late Arrivals</span>
          <p className="text-base font-black text-amber-400">{stats.late}</p>
        </div>
      </div>

      {/* Daily Records List */}
      {records.length > 0 && (
        <div className="p-4 space-y-2">
          <h4 className={`text-xs font-bold ${text.muted} uppercase tracking-wider mb-2`}>
            Recent Day-by-Day Activity
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {records.map((r, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-xl border ${border.default} p-2.5 ${bg.surface}`}
              >
                <div className="flex items-center gap-2">
                  {r.status === "present" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  {r.status === "absent" && (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  {r.status === "late" && (
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className={`text-xs font-bold ${text.primary}`}>
                      {r.date} ({r.day})
                    </span>
                    <p className={`text-[10px] ${text.muted}`}>{r.remarks}</p>
                  </div>
                </div>
                <span
                  className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    r.status === "present"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : r.status === "absent"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
