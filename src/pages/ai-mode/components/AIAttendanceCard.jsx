import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Palmtree,
  Timer,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import { ROUTES } from "../../../routes/routes.js";

export default function AIAttendanceCard({
  date = new Date().toLocaleDateString("en-CA"),
  type = "student",
  summary = {},
  absentStudents = [],
  lateStudents = [],
  halfDayStudents = [],
  leaveStudents = [],
  pendingSections = [],
  takenSections = [],
  onAskAiPrompt,
}) {
  const navigate = useNavigate();

  const listGroups = useMemo(
    () =>
      [
        { key: "absent", label: "Absent", items: absentStudents, tone: "rose" },
        { key: "late", label: "Late", items: lateStudents, tone: "amber" },
        { key: "halfDay", label: "Half Day", items: halfDayStudents, tone: "teal" },
        { key: "leave", label: "On Leave", items: leaveStudents, tone: "purple" },
      ].filter((g) => g.items.length > 0),
    [absentStudents, lateStudents, halfDayStudents, leaveStudents]
  );

  const [selectedGroup, setSelectedGroup] = useState("absent");
  const activeGroup =
    listGroups.find((g) => g.key === selectedGroup) || listGroups[0] || null;

  const total = Number(summary.totalStudents || 0);
  const present = Number(summary.present || 0);
  const absent = Number(summary.absent || 0);
  const late = Number(summary.late || 0);
  const halfDay = Number(summary.halfDay || 0);
  const leave = Number(summary.leave || 0);
  const effectiveDenom = Math.max(1, total - leave);
  const rateStr =
    summary.attendanceRate ||
    (total > 0
      ? `${Math.min(100, Math.round(((present + halfDay * 0.5) / effectiveDenom) * 100))}%`
      : "0%");
  const rateNum = parseInt(rateStr, 10) || 0;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-md tabular-nums">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303030] bg-[#191919] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#FFA000]" />
          <span className="text-[12.5px] font-bold text-[#FFFFFF]">
            {type === "teacher" ? "Staff Attendance Overview" : "Attendance Overview"}
          </span>
          {date ? (
            <span className="text-[11px] text-[#A1A1AA] font-mono">({date})</span>
          ) : null}
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
            rateNum >= 85
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : rateNum >= 70
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400"
          }`}
        >
          {rateStr} Turnout
        </span>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3">
        <div className="rounded-xl border border-[#303030] bg-[#141414] p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#A1A1AA]">Total</span>
            <Users className="h-3.5 w-3.5 text-[#FFA000]" />
          </div>
          <span className="text-lg font-bold text-[#FFFFFF]">{total}</span>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-emerald-300">Present</span>
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-emerald-400">{present}</span>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-rose-300">Absent</span>
            <UserX className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-lg font-bold text-rose-400">{absent}</span>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-amber-300">Late / HD</span>
            <Timer className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-bold text-amber-400">{late + halfDay}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-purple-300">On Leave</span>
            <Palmtree className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <span className="text-lg font-bold text-purple-400">{leave}</span>
        </div>
      </div>

      {/* Distribution Progress Bar */}
      {total > 0 ? (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-[10.5px] text-[#A1A1AA] mb-1.5 font-medium">
            <span>Daily Distribution</span>
            <span>{rateStr} Effective Turnout</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414] flex border border-[#303030]">
            <div className="h-full bg-emerald-500" style={{ width: `${(present / total) * 100}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${(late / total) * 100}%` }} />
            <div className="h-full bg-teal-500" style={{ width: `${(halfDay / total) * 100}%` }} />
            <div className="h-full bg-purple-500" style={{ width: `${(leave / total) * 100}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${(absent / total) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#A1A1AA]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present ({present})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Late ({late})</span>
            {halfDay > 0 ? <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500" /> Half Day ({halfDay})</span> : null}
            {leave > 0 ? <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Leave ({leave})</span> : null}
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Absent ({absent})</span>
          </div>
        </div>
      ) : null}

      {/* Section Completion Overview when present */}
      {takenSections.length > 0 || pendingSections.length > 0 ? (
        <div className="border-t border-[#303030] bg-[#171717] px-4 py-2.5 flex flex-wrap items-center gap-1.5 text-[10.5px]">
          {takenSections.map((s) => (
            <span
              key={s.key || s.classSection}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 font-semibold"
            >
              <CheckCircle2 className="h-3 w-3" /> {s.classSection} ({s.present}/{s.total})
            </span>
          ))}
          {pendingSections.map((s) => (
            <button
              key={s.key || s.classSection}
              type="button"
              onClick={() =>
                onAskAiPrompt?.(
                  `Mark attendance for ${s.classSection} on ${date} (preview approved leaves first)`
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-amber-300 font-semibold hover:bg-amber-500/20 cursor-pointer"
            >
              <Clock className="h-3 w-3" /> {s.classSection} (Pending)
            </button>
          ))}
        </div>
      ) : null}

      {/* Member Exception Lists (Absent / Late / Half Day / Leave) */}
      {activeGroup ? (
        <div className="border-t border-[#303030] bg-[#171717] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              {listGroups.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setSelectedGroup(g.key)}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border transition-colors cursor-pointer ${
                    activeGroup.key === g.key
                      ? "bg-[#FF7900] text-white border-[#FF7900]"
                      : "bg-[#141414] text-[#A1A1AA] border-[#303030] hover:text-white"
                  }`}
                >
                  {g.label} ({g.items.length})
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto scrollbar-thin rounded-lg border border-[#303030] bg-[#141414]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#1C1C1C] text-[#A1A1AA] border-b border-[#303030]">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Name</th>
                  <th className="px-3 py-1.5 font-semibold">Class / Dept</th>
                  <th className="px-3 py-1.5 font-semibold">Status</th>
                  <th className="px-3 py-1.5 font-semibold text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {activeGroup.items.map((st, idx) => {
                  const sid = st.studentId || st.id;
                  const profilePath = sid
                    ? type === "teacher"
                      ? ROUTES.TEACHERS.detail(sid)
                      : ROUTES.STUDENTS.detail(sid)
                    : "";
                  return (
                    <tr key={sid || idx} className="hover:bg-[#202020] transition-colors">
                      <td className="px-3 py-1.5 text-[#FFFFFF] font-medium">
                        {st.name || st.studentName || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-[#A1A1AA]">
                        {st.className || st.classSection || "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[9.5px] font-semibold text-[#D4D4D8]">
                          {st.status || activeGroup.label}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {profilePath ? (
                          <button
                            type="button"
                            onClick={() => navigate(profilePath)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FFA000] hover:underline cursor-pointer"
                          >
                            <UserRound className="h-3 w-3" /> Profile <ArrowUpRight className="h-2.5 w-2.5" />
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
