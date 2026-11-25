import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Calendar, Loader2, UserRound } from "lucide-react";
import Modal from "../../../components/ui/Modal.jsx";
import { ROUTES } from "../../../routes/routes.js";
import { getStudentAttendance } from "../../../services";
import { initialsOf, rateTone, statusConfig } from "./attendanceHelpers.js";

const StudentAttendanceHistoryModal = ({ member, canViewProfile = true, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: null, logs: [] });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!member?.id) return;
    let active = true;
    setLoading(true);
    setStatusFilter("all");
    getStudentAttendance(member.id)
      .then((res) => {
        if (!active) return;
        const payload = res?.data && !res?.logs ? res.data : res;
        setData({
          summary: payload?.summary || {
            totalDays: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            halfDayCount: 0,
            leaveCount: 0,
            percentage: "0%",
          },
          logs: payload?.logs || [],
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [member?.id]);

  const summary = data.summary || {
    totalDays: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    leaveCount: 0,
    percentage: "0%",
  };
  const pctNum = parseInt(String(summary.percentage || "0"), 10) || 0;
  const tone = rateTone(pctNum);

  const filteredLogs = data.logs.filter(
    (l) => statusFilter === "all" || String(l.status || "").toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <Modal
      open={Boolean(member)}
      onClose={onClose}
      size="lg"
      title={
        member ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-sm border border-indigo-200 dark:border-indigo-900/50 shrink-0">
              {initialsOf(member.name)}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                {member.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                ID / Roll: {member.roll || "—"}
                {member.classSection ? ` · ${member.classSection}` : ""}
              </p>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2.5 text-slate-500 text-xs font-semibold">
            <Loader2 size={18} className="animate-spin text-indigo-500" />
            <span>Loading attendance history...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs tabular-nums">
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 rounded-xl">
                <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300 font-bold uppercase block">
                  Rate
                </span>
                <span className={`text-lg font-black ${tone.textClass}`}>
                  {summary.percentage || "0%"}
                </span>
                <div className="w-full h-1 rounded-full bg-indigo-100 dark:bg-slate-800 mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${tone.barClass}`} style={{ width: `${pctNum}%` }} />
                </div>
              </div>
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl">
                <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300 font-bold uppercase block">
                  Present
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  {summary.presentCount ?? 0}
                </span>
              </div>
              <div className="p-3 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-xl">
                <span className="text-[10px] text-rose-800/80 dark:text-rose-300 font-bold uppercase block">
                  Absent
                </span>
                <span className="text-lg font-black text-rose-700 dark:text-rose-400">
                  {summary.absentCount ?? 0}
                </span>
              </div>
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-xl">
                <span className="text-[10px] text-amber-800/80 dark:text-amber-300 font-bold uppercase block">
                  Late / HD
                </span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-400">
                  {(summary.lateCount ?? 0) + (summary.halfDayCount ?? 0)}
                </span>
              </div>
              <div className="p-3 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-purple-800/80 dark:text-purple-300 font-bold uppercase block">
                  Leave
                </span>
                <span className="text-lg font-black text-purple-700 dark:text-purple-400">
                  {summary.leaveCount ?? 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
              {["all", "Present", "Absent", "Late", "Half Day", "Leave"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {st === "all" ? `All (${data.logs.length})` : st}
                </button>
              ))}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs max-h-64 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Class / Section</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                        <Calendar size={20} className="mx-auto mb-1 opacity-50" />
                        No attendance history found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((l) => {
                      const cfg = statusConfig(l.status);
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {l.date}
                            {l.dayName ? (
                              <span className="ml-1.5 text-[10px] font-normal text-slate-400">({l.dayName})</span>
                            ) : null}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            {l.classSection || l.className || "—"}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${cfg.badgeClass}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 italic">
                            {l.remarks || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          {canViewProfile &&
          (member?.profilePath || member?.profileId || member?.id) ? (
            <button
              type="button"
              onClick={() => {
                const targetPath =
                  member.profilePath ||
                  (member.memberType === "teacher"
                    ? ROUTES.TEACHERS.detail(member.profileId || member.id)
                    : ROUTES.STUDENTS.detail(member.profileId || member.id));
                onClose?.();
                navigate(targetPath);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-indigo-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <UserRound size={13} /> Open Profile <ArrowUpRight size={12} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentAttendanceHistoryModal;
