import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function AIAttendanceCard({
  date = new Date().toISOString().split("T")[0],
  summary = {},
  absentStudents = [],
  records = [],
  onAskAiPrompt,
}) {
  const [activeTab, setActiveTab] = useState("absent"); // "absent" | "all"

  const total = Number(summary.totalStudents || 0);
  const present = Number(summary.present || 0);
  const absent = Number(summary.absent || 0);
  const late = Number(summary.late || 0);
  const rateStr =
    summary.attendanceRate ||
    (total > 0 ? `${Math.round((present / total) * 100)}%` : "0%");
  const rateNum = parseInt(rateStr, 10) || 0;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#303030] bg-[#1D1D1D] shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#303030] bg-[#191919] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#FFA000]" />
          <span className="text-[12.5px] font-bold text-[#FFFFFF]">
            Attendance Overview
          </span>
          <span className="text-[11px] text-[#A1A1AA] font-mono">({date})</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
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

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3">
        {/* Total */}
        <div className="rounded-xl border border-[#303030] bg-[#141414] p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-[#A1A1AA]">Total Enrolled</span>
            <Users className="h-3.5 w-3.5 text-[#FFA000]" />
          </div>
          <span className="text-xl font-bold text-[#FFFFFF]">{total}</span>
        </div>

        {/* Present */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-emerald-300">Present</span>
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-emerald-400">{present}</span>
        </div>

        {/* Absent */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-rose-300">Absent</span>
            <UserX className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-xl font-bold text-rose-400">{absent}</span>
        </div>

        {/* Late */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-amber-300">Late</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-amber-400">{late}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10.5px] text-[#A1A1AA] mb-1.5 font-medium">
          <span>Turnout Progress</span>
          <span>{rateStr} Present</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#141414] flex border border-[#303030]">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${total ? (present / total) * 100 : 0}%` }}
            title={`Present: ${present}`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${total ? (late / total) * 100 : 0}%` }}
            title={`Late: ${late}`}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${total ? (absent / total) * 100 : 0}%` }}
            title={`Absent: ${absent}`}
          />
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-[#A1A1AA]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present (
            {present})
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Late ({late}
            )
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent (
            {absent})
          </span>
        </div>
      </div>

      {/* Absent Students List / Table */}
      {absentStudents && absentStudents.length > 0 && (
        <div className="border-t border-[#303030] bg-[#171717] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Absent Students ({absentStudents.length})</span>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto scrollbar-thin rounded-lg border border-[#303030] bg-[#141414]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#1C1C1C] text-[#A1A1AA] border-b border-[#303030]">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Student Name</th>
                  <th className="px-3 py-1.5 font-semibold">Class</th>
                  <th className="px-3 py-1.5 font-semibold text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {absentStudents.map((st, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#202020] transition-colors"
                  >
                    <td className="px-3 py-1.5 text-[#FFFFFF] font-medium">
                      {st.name || st.studentName || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-[#A1A1AA]">
                      {st.className || st.class || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span className="inline-flex rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[9.5px] font-semibold text-rose-400">
                        Absent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

