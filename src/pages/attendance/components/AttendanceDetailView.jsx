import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Download,
  Edit3,
  FileText,
  Loader2,
  Search,
  User,
  UserRound,
} from "lucide-react";
import { ROUTES } from "../../../routes/routes.js";
import {
  attendanceDateKeyOf,
  downloadRosterCsv,
  initialsOf,
  normalizeStatusLabel,
  rateTone,
  statusConfig,
  summarizeRoster,
} from "./attendanceHelpers.js";

const AttendanceDetailView = ({
  selectedRecord,
  detailLoading,
  canEdit,
  canViewProfile = true,
  onEditRecord,
  onInspectStudent,
}) => {
  const navigate = useNavigate();
  const [studentSearch, setStudentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const memberType =
    (selectedRecord?.type || "").toLowerCase() === "teacher" ? "teacher" : "student";

  const rosterLogs = useMemo(() => {
    if (!selectedRecord) return [];
    const rawList =
      selectedRecord.students ||
      selectedRecord.records ||
      selectedRecord.attendance ||
      [];
    return rawList.map((item, idx) => {
      const name =
        item.name ||
        item.memberId?.name ||
        (typeof item.memberId === "object"
          ? `${item.memberId.firstName || ""} ${item.memberId.lastName || ""}`.trim()
          : "") ||
        `Member #${idx + 1}`;
      const roll =
        item.rollNo ??
        item.roll ??
        item.memberId?.rollNumber ??
        item.memberId?.employeeId ??
        idx + 1;
      const rawProfileId =
        item.studentId ||
        (typeof item.memberId === "object"
          ? item.memberId?._id || item.memberId?.id
          : item.memberId) ||
        item.id ||
        "";
      const profileId = rawProfileId ? String(rawProfileId).trim() : "";
      const profilePath = profileId
        ? memberType === "teacher"
          ? ROUTES.TEACHERS.detail(profileId)
          : ROUTES.STUDENTS.detail(profileId)
        : "";
      return {
        id: profileId || item._id || idx,
        profileId,
        memberType,
        profilePath,
        name,
        roll,
        classSection:
          item.classSection ||
          selectedRecord.classSection ||
          [selectedRecord.className, selectedRecord.sectionName].filter(Boolean).join(" - "),
        status: normalizeStatusLabel(item.status),
        remarks: item.remarks || "",
      };
    });
  }, [selectedRecord, memberType]);

  const counts = useMemo(() => {
    const computed = summarizeRoster(rosterLogs);
    return {
      total: selectedRecord?.total ?? computed.total,
      present: selectedRecord?.present ?? computed.present,
      absent: selectedRecord?.absent ?? computed.absent,
      late: selectedRecord?.late ?? computed.late,
      halfDay: selectedRecord?.halfDay ?? computed.halfDay,
      leave: selectedRecord?.leave ?? selectedRecord?.leaveCount ?? computed.leave,
      percentage: computed.percentage,
    };
  }, [selectedRecord, rosterLogs]);
  const tone = rateTone(counts.percentage);

  const filteredLogs = useMemo(
    () =>
      rosterLogs.filter((s) => {
        const matchesSearch =
          !studentSearch ||
          String(s.name || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
          String(s.roll || "").toLowerCase().includes(studentSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [rosterLogs, studentSearch, statusFilter]
  );

  if (!selectedRecord) return null;

  const dateKey = attendanceDateKeyOf(selectedRecord);
  const takenDate = selectedRecord.attendanceTakenDate || selectedRecord.createdAt;
  const takenByName =
    typeof selectedRecord.takenBy === "object" && selectedRecord.takenBy !== null
      ? selectedRecord.takenBy?.name || selectedRecord.takenBy?.username || "Staff"
      : selectedRecord.takenBy || "Staff";
  const headingTitle =
    selectedRecord.classSection ||
    [selectedRecord.className, selectedRecord.sectionName].filter(Boolean).join(" - ") ||
    "Attendance Record";

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Class / Department
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
            <span>{headingTitle}</span>
            {detailLoading ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : null}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <User size={14} className="text-indigo-600 dark:text-indigo-400" />
            Taken by: <strong className="text-slate-900 dark:text-white">{takenByName}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 px-3 py-1.5 rounded-xl font-bold text-indigo-700 dark:text-indigo-300">
              <Calendar size={13} />
              <span>
                Attendance Date:{" "}
                {dateKey
                  ? format(new Date(`${dateKey}T00:00:00`), "EEEE, MMM d, yyyy")
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold">
              <Clock size={13} className="text-slate-400" />
              <span>
                Recorded On:{" "}
                {takenDate && !isNaN(new Date(takenDate).getTime())
                  ? format(new Date(takenDate), "MMM d, yyyy, h:mm a")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-xl capitalize border ${
              selectedRecord.type === "teacher"
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
            }`}
          >
            {selectedRecord.type || "student"} Attendance
          </span>
          <button
            type="button"
            onClick={() =>
              downloadRosterCsv({
                filename: `attendance-${headingTitle.replace(/\s+/g, "-").toLowerCase()}-${dateKey || "sheet"}.csv`,
                title: headingTitle,
                dateKey,
                rows: rosterLogs,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download size={13} /> Export CSV
          </button>
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEditRecord(selectedRecord)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Edit3 size={13} /> Edit Attendance
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 tabular-nums">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl text-center shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{counts.total}</p>
        </div>
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-emerald-800/80 dark:text-emerald-300 uppercase">Present</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{counts.present}</p>
        </div>
        <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-rose-800/80 dark:text-rose-300 uppercase">Absent</p>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{counts.absent}</p>
        </div>
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-amber-800/80 dark:text-amber-300 uppercase">Late</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{counts.late}</p>
        </div>
        <div className="bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/40 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-teal-800/80 dark:text-teal-300 uppercase">Half Day</p>
          <p className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-0.5">{counts.halfDay}</p>
        </div>
        <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 p-3.5 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-purple-800/80 dark:text-purple-300 uppercase">On Leave</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-0.5">{counts.leave}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white mr-1">
              Member Attendance Roster
            </h4>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border mr-2 tabular-nums ${tone.pillClass}`}>
              {counts.percentage}%
            </span>
            {["all", "Present", "Absent", "Late", "Half Day", "Leave"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {st === "all" ? `All (${rosterLogs.length})` : st}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or roll/ID..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll / ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No members match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((s, idx) => {
                  const cfg = statusConfig(s.status);
                  const allowProfile = Boolean(canViewProfile && s.profilePath);
                  return (
                    <tr key={s.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-semibold tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{s.roll}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            {initialsOf(s.name)}
                          </span>
                          {allowProfile ? (
                            <button
                              type="button"
                              onClick={() => navigate(s.profilePath)}
                              title={`Open ${s.name}'s profile`}
                              className="font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                            >
                              {s.name}
                            </button>
                          ) : (
                            <span className="font-extrabold text-slate-900 dark:text-white">{s.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${cfg.badgeClass}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                        {s.remarks || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onInspectStudent(s)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-all cursor-pointer"
                          >
                            <FileText size={12} /> View History
                          </button>
                          {allowProfile ? (
                            <button
                              type="button"
                              onClick={() => navigate(s.profilePath)}
                              title={memberType === "teacher" ? "Open Staff Profile" : "Open Student Profile"}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                            >
                              <UserRound size={12} /> Profile <ArrowUpRight size={11} className="opacity-70" />
                            </button>
                          ) : null}
                        </div>
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

export default AttendanceDetailView;
