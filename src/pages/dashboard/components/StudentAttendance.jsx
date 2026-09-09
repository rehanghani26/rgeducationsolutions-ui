import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import api from "../../../services/api.js";
import { getUserFromStorage } from "../../../config/access.jsx";

const StudentAttendance = ({ studentId: propStudentId }) => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || {};
  const currentStudentId = propStudentId || user._id || user.id || user.studentId;

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Fetch dynamic attendance log from backend API
      const res = await api.get("/attendance/my-attendance");
      if (res.data?.success) {
        setSummary(res.data.summary || null);
        setLogs(res.data.logs || []);
      } else if (currentStudentId) {
        const fallbackRes = await api.get(`/attendance/student/${currentStudentId}`);
        if (fallbackRes.data?.success) {
          setSummary(fallbackRes.data.summary || null);
          setLogs(fallbackRes.data.logs || []);
        }
      }
    } catch (err) {
      console.error("Attendance API fetch error:", err);
      setLogs([]);
      setSummary({
        totalDays: 0,
        presentCount: 0,
        absentCount: 0,
        halfDayCount: 0,
        lateCount: 0,
        percentage: "N/A",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentStudentId]);

  // Today's Date String in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check if today's attendance has been recorded
  const todayLog = logs.find(
    (l) => l.date === todayStr || new Date(l.date).toDateString() === new Date().toDateString()
  );
  const isTodayTaken = Boolean(todayLog);

  // Computed summary metrics
  const totalDays = summary?.totalDays ?? logs.length;
  const presentCount = summary?.presentCount ?? logs.filter((l) => (l.status || "").toLowerCase() === "present").length;
  const absentCount = summary?.absentCount ?? logs.filter((l) => (l.status || "").toLowerCase() === "absent").length;
  const lateCount = summary?.lateCount ?? logs.filter((l) => (l.status || "").toLowerCase() === "late").length;
  const halfDayCount = summary?.halfDayCount ?? logs.filter((l) => (l.status || "").toLowerCase() === "half day").length;
  const percentage = summary?.percentage ?? (totalDays ? `${Math.round(((presentCount + halfDayCount * 0.5) / totalDays) * 100)}%` : "N/A");

  // Filtering logs
  const filteredLogs = logs.filter((log) => {
    // Search date
    if (searchDate && !log.date.includes(searchDate) && !log.dayName?.toLowerCase().includes(searchDate.toLowerCase())) {
      return false;
    }
    // Status filter
    if (selectedStatus !== "all" && (log.status || "").toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    // Month filter
    if (selectedMonth !== "all") {
      const logMonth = new Date(log.date).getMonth() + 1;
      if (parseInt(selectedMonth, 10) !== logMonth) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* ─── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#111827] dark:shadow-xl md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarCheck className="text-indigo-400" size={26} />
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              My Student Day-Wise Attendance
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Personal Record
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time daily attendance tracking log for{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">{user?.name || user?.username || "Student"}</span>.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 self-start rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Record</span>
        </button>
      </div>

      {/* ─── TODAY'S ATTENDANCE STATUS WIDGET ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800/80 dark:bg-[#111827]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Today's Date:
              </span>
              <span className="text-xs font-bold text-indigo-400">{todayDateFormatted}</span>
            </div>

            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Today's Attendance Status:</h3>
              {isTodayTaken ? (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    (todayLog.status || "").toLowerCase() === "present"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : (todayLog.status || "").toLowerCase() === "absent"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <CheckCircle2 size={14} /> TAKEN — {todayLog.status}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <AlertTriangle size={14} className="text-amber-400" /> N/A (Not Taken Yet)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {isTodayTaken
                ? `Attendance logged at ${todayLog.checkIn || "07:45 AM"} · Remarks: ${todayLog.remarks || "Full Day"}`
                : "Your class teacher has not taken attendance for today yet. Status will update dynamically once recorded."}
            </p>
          </div>

          {/* Today's Status Large Badge */}
          <div className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 md:w-auto">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                isTodayTaken && (todayLog.status || "").toLowerCase() === "present"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isTodayTaken && (todayLog.status || "").toLowerCase() === "absent"
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isTodayTaken ? (todayLog.status === "Present" ? "✓" : "✗") : "—"}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Today's Entry</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {isTodayTaken ? todayLog.status : "N/A"}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                {isTodayTaken ? `In: ${todayLog.checkIn || "07:45 AM"}` : "Pending Teacher Log"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SUMMARY STATS CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#111827]">
          <span className="text-[11px] font-semibold text-slate-400">Total Tracked Days</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalDays} Days</h3>
          <span className="text-[10px] text-indigo-400 font-bold">Academic Session</span>
        </div>

        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#111827]">
          <span className="text-[11px] font-semibold text-slate-400">Days Present</span>
          <h3 className="text-2xl font-black text-emerald-400">{presentCount} Days</h3>
          <span className="text-[10px] text-emerald-400 font-bold">Full Attendance</span>
        </div>

        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#111827]">
          <span className="text-[11px] font-semibold text-slate-400">Days Absent</span>
          <h3 className="text-2xl font-black text-rose-400">{absentCount} Days</h3>
          <span className="text-[10px] text-rose-400 font-bold">Unexcused / Leave</span>
        </div>

        <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#111827]">
          <span className="text-[11px] font-semibold text-slate-400">Late / Half Day</span>
          <h3 className="text-2xl font-black text-amber-400">{lateCount + halfDayCount} Days</h3>
          <span className="text-[10px] text-amber-400 font-bold">Late Arrival</span>
        </div>

        <div className="col-span-2 space-y-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#111827] sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400">Attendance Percentage</span>
          <h3 className="text-2xl font-black text-indigo-400">{percentage}</h3>
          <span className="text-[10px] text-emerald-400 font-bold">Good Standing Badge</span>
        </div>
      </div>

      {/* ─── FILTERS & DAY-WISE ATTENDANCE TABLE ───────────────────────────── */}
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#111827]">
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Day-Wise Attendance History</h3>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              {filteredLogs.length} Records
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search date or day..."
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 sm:w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half day">Half Day</option>
            </select>

            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Months</option>
              <option value="5">May 2026</option>
              <option value="4">April 2026</option>
              <option value="3">March 2026</option>
            </select>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Day of Week</th>
                <th className="py-3.5 px-4">Attendance Status</th>
                <th className="py-3.5 px-4">Check-In / Out</th>
                <th className="py-3.5 px-4">Remarks / Note</th>
                <th className="py-3.5 px-4">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    Loading day-wise attendance records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No attendance records match your selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const statusLower = (log.status || "").toLowerCase();
                  return (
                    <tr
                      key={log.id || log._id || idx}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {log.date}
                        {log.date === todayStr && (
                          <span className="ml-2 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Today
                          </span>
                        )}
                      </td>

                      {/* Day Name */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {log.dayName || new Date(log.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black capitalize border ${
                            statusLower === "present"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : statusLower === "absent"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : statusLower === "late"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          }`}
                        >
                          {statusLower === "present" && <CheckCircle2 size={12} />}
                          {statusLower === "absent" && <XCircle size={12} />}
                          {statusLower === "late" && <Clock size={12} />}
                          <span>{log.status}</span>
                        </span>
                      </td>

                      {/* Check-In / Out */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {log.checkIn && log.checkOut ? `${log.checkIn} - ${log.checkOut}` : log.checkIn || "—"}
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {log.remarks || "Full Day"}
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {log.className || user?.className || "Class 10-A"}
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

export default StudentAttendance;
