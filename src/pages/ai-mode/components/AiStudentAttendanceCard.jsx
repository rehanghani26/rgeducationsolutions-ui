import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Palmtree,
  Timer,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { bg, border, text, shadow } from "@/theme/color";
import { ROUTES } from "../../../routes/routes.js";

export default function AiStudentAttendanceCard({
  student = {},
  month = "All Recorded Days",
  stats = { totalWorkingDays: 0, present: 0, absent: 0, late: 0, halfDay: 0, leave: 0, percentage: 0 },
  streak = 0,
  records = [],
}) {
  const navigate = useNavigate();
  const percentage = Number(stats?.percentage ?? 0);
  const studentId = student?.id || student?._id || "";

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md} tabular-nums`}
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
              Attendance Log &amp; Summary
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student?.name || "Student"}
              {student?.class ? ` · ${student.class}` : ""}
              {student?.section ? ` (${student.section})` : ""} · {month}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {streak > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              {streak} Day Streak
            </div>
          ) : null}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
              percentage >= 85
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : percentage >= 65
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {percentage}% Rate
          </span>
          {studentId ? (
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENTS.detail(studentId))}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/15 cursor-pointer"
            >
              <UserRound className="h-3 w-3" /> Profile <ArrowUpRight className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-5 border-b ${border.default} divide-x divide-y sm:divide-y-0 divide-stone-100 dark:divide-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40`}
      >
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400">Recorded Days</span>
          <p className={`text-base font-black ${text.primary}`}>{stats?.totalWorkingDays ?? 0}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-500">Present</span>
          <p className="text-base font-black text-emerald-500">{stats?.present ?? 0}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-400">Absent</span>
          <p className="text-base font-black text-rose-400">{stats?.absent ?? 0}</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400">Late / HD</span>
          <p className="text-base font-black text-amber-400">
            {(stats?.late ?? 0) + (stats?.halfDay ?? 0)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-purple-400">Leave</span>
          <p className="text-base font-black text-purple-400">{stats?.leave ?? 0}</p>
        </div>
      </div>

      {/* Daily Records List */}
      {records.length > 0 ? (
        <div className="p-4 space-y-2">
          <h4 className={`text-xs font-bold ${text.muted} uppercase tracking-wider mb-2`}>
            Recent Day-by-Day Activity
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {records.map((r, idx) => {
              const st = String(r.status || "present").toLowerCase();
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl border ${border.default} p-2.5 ${bg.surface}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {st === "present" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : st === "absent" ? (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    ) : st === "late" ? (
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : st === "half day" ? (
                      <Timer className="h-4 w-4 text-teal-400 shrink-0" />
                    ) : (
                      <Palmtree className="h-4 w-4 text-purple-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className={`text-xs font-bold ${text.primary}`}>
                        {r.date} {r.day ? `(${r.day})` : ""}
                      </span>
                      {r.remarks ? (
                        <p className={`text-[10px] ${text.muted} truncate`}>{r.remarks}</p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      st === "present"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : st === "absent"
                        ? "bg-rose-500/10 text-rose-400"
                        : st === "late"
                        ? "bg-amber-500/10 text-amber-400"
                        : st === "half day"
                        ? "bg-teal-500/10 text-teal-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-stone-400">
          No recorded attendance entries found for this period.
        </div>
      )}
    </div>
  );
}
