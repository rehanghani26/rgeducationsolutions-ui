import React, { useState } from "react";
import { Calendar, Filter, GraduationCap, Users } from "lucide-react";
import { rateTone, statusConfig } from "./attendanceHelpers.js";

const PersonalAttendanceView = ({ isStudent, user, sessionName, myAttData }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const summary = myAttData?.summary || {};
  const logs = myAttData?.logs || [];
  const pctNum = parseInt(String(summary.percentage || "0"), 10) || 0;
  const tone = rateTone(pctNum);

  const filteredLogs = logs.filter((log) => {
    const matchesStatus =
      statusFilter === "all" ||
      String(log.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || String(log.date || "").includes(dateFilter);
    return matchesStatus && matchesDate;
  });

  const placementLabel = isStudent
    ? [
        user?.className || user?.class,
        user?.sectionName || user?.section,
        user?.admissionNumber ? `(${user.admissionNumber})` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : [user?.designation, user?.department, user?.employeeId ? `(${user.employeeId})` : ""]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {isStudent ? (
                <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={20} />
              ) : (
                <Users className="text-purple-600 dark:text-purple-400" size={20} />
              )}
              {isStudent ? "My Attendance Record" : "Faculty & Staff Personal Attendance"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Signed in as{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {user?.name || user?.username || "User"}
              </span>
              {placementLabel ? ` · ${placementLabel}` : ""}
            </p>
          </div>

          {sessionName ? (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs">
              <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Session {sessionName}
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 tabular-nums">
          <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
              Attendance Rate
            </p>
            <p className={`text-xl font-black mt-1 ${summary.percentage ? tone.textClass : "text-slate-500"}`}>
              {summary.percentage || "0%"}
            </p>
            <div className="w-full h-1 rounded-full bg-indigo-100 dark:bg-slate-800 mt-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${tone.barClass}`} style={{ width: `${pctNum}%` }} />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              Tracked Days
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {summary.totalDays ?? 0}
            </p>
          </div>
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
              Present
            </p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {summary.presentCount ?? 0}
            </p>
          </div>
          <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
              Absent
            </p>
            <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {summary.absentCount ?? 0}
            </p>
          </div>
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
              Late / Half Day
            </p>
            <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {(summary.lateCount ?? 0) + (summary.halfDayCount ?? 0)}
            </p>
          </div>
          <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 p-3.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
              On Leave
            </p>
            <p className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
              {summary.leaveCount ?? 0}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={13} /> Status:
            </span>
            {["all", "present", "absent", "late", "half day", "leave"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {st === "all" ? "All" : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {dateFilter ? (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date &amp; Day</th>
                <th className="py-3 px-4">Class / Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded At</th>
                <th className="py-3 px-4">Marked By</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const cfg = statusConfig(log.status);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {log.date}{" "}
                        {log.dayName ? (
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            ({log.dayName})
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {log.className || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded border text-[10px] font-extrabold uppercase ${cfg.badgeClass}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {log.checkIn || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {log.markedBy || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                        {log.remarks || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonalAttendanceView;
