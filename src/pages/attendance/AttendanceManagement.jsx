import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-toastify";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatsCard from "../../components/ui/StatsCard.jsx";
import {
  getAttendanceRecords,
  getAttendanceById,
  getStudentAttendance,
  getAttendanceStats,
  createAttendance,
  getMyAttendance,
  getStudents,
} from "../../services";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../../constants/academicOptions.js";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";
import {
  Eye,
  Calendar,
  User,
  Users,
  Plus,
  ArrowLeft,
  GraduationCap,
  Save,
  Search,
  Filter,
  FileText,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

const AttendanceManagement = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser ||
    getUserFromStorage() || { name: "Albus Dumbledore", role: "super-admin" };
  const userRole = getUserRole(user);

  const isStudent = userRole === ROLES.STUDENT;
  const isTeacherRole = [
    ROLES.TEACHER,
    ROLES.HEAD_TEACHER,
    ROLES.HOD,
    ROLES.COORDINATOR,
    "tg",
  ].includes(userRole);
  const isAdminRole = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    ROLES.PRINCIPAL,
  ].includes(userRole);

  // Active Main Navigation Tab: "student" | "teacher"
  const [activeMainTab, setActiveMainTab] = useState("student");
  const [viewMode, setViewMode] = useState("list"); // "list" | "take_attendance" | "view_record"

  const [page, setPage] = useState(1);
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");

  // Individual Student History Modal State
  const [inspectStudentHistory, setInspectStudentHistory] = useState(null);

  // Filters for Student Personal View
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [studentDateFilter, setStudentDateFilter] = useState("");

  // Take Attendance State
  const [attendeeType, setAttendeeType] = useState("student");
  const [attDate, setAttDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attClass, setAttClass] = useState("");
  const [attSection, setAttSection] = useState("");
  const [attDepartment, setAttDepartment] = useState("");
  const [attTakenBy, setAttTakenBy] = useState(user?.name || "");
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // My Attendance Personal State
  const [myAttData, setMyAttData] = useState({ summary: {}, logs: [] });

  // Fetch Attendance Records
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      const filterType = activeMainTab === "teacher" ? "teacher" : "student";
      try {
        const [recRes, statsRes, myRes] = await Promise.all([
          getAttendanceRecords({
            page,
            limit: 20,
            type: filterType,
            date,
          }).catch(() => null),
          getAttendanceStats({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          }).catch(() => null),
          getMyAttendance().catch(() => null),
        ]);
        if (recRes?.records?.length > 0) {
          setRecords(recRes.records);
          if (recRes.pagination) setPagination(recRes.pagination);
        } else if (recRes?.data?.records?.length > 0) {
          setRecords(recRes.data.records);
          if (recRes.data.pagination) setPagination(recRes.data.pagination);
        } else {
          setRecords(
            mockAttendanceRecords.filter(
              (r) => !filterType || r.type === filterType
            )
          );
        }
        if (statsRes?.stats || statsRes?.data?.stats) {
          setStats(statsRes?.stats || statsRes?.data?.stats);
        }
        if (myRes?.summary || myRes?.data?.summary) {
          setMyAttData({
            summary: myRes?.summary || myRes?.data?.summary,
            logs: myRes?.logs || myRes?.data?.logs || [],
          });
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [page, activeMainTab, date]);

  // Filter student personal logs
  const filteredMyLogs = myAttData.logs.filter((log) => {
    const matchesStatus =
      studentStatusFilter === "all" ||
      log.status.toLowerCase() === studentStatusFilter.toLowerCase();
    const matchesDate =
      !studentDateFilter || log.date.includes(studentDateFilter);
    return matchesStatus && matchesDate;
  });

  // Filter records locally for Admin/Teacher
  const filteredRecords = records.filter((r) => {
    const matchesDate = !date || (r.date && r.date.includes(date));
    const targetType = activeMainTab === "teacher" ? "teacher" : "student";
    const matchesType = !r.type || r.type.toLowerCase() === targetType;
    return matchesDate && matchesType;
  });

  const [detailLoading, setDetailLoading] = useState(false);

  const handleOpenRecordDetail = async (record) => {
    setSelectedRecord(record);
    setStudentSearch("");
    setViewMode("view_record");

    const recordId = record._id || record.id;
    if (recordId && !String(recordId).startsWith("att-")) {
      setDetailLoading(true);
      try {
        const res = await getAttendanceById(recordId);
        const fetchedRecord = res?.record || res?.data?.record || res;
        if (fetchedRecord && (fetchedRecord._id || fetchedRecord.id)) {
          setSelectedRecord(fetchedRecord);
        }
      } catch (err) {
        console.error("Error fetching attendance by ID:", err);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  // Extract roster list from selected record
  const recordRosterLogs = (() => {
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
        `Student #${idx + 1}`;
      const roll =
        item.rollNo ||
        item.roll ||
        item.studentId ||
        item.memberId?._id ||
        item.memberId ||
        (idx + 1);
      let statusStr = item.status || "Present";
      if (String(statusStr).toLowerCase() === "present") statusStr = "Present";
      else if (String(statusStr).toLowerCase() === "absent") statusStr = "Absent";
      else if (String(statusStr).toLowerCase() === "late") statusStr = "Late";
      else if (String(statusStr).toLowerCase() === "half-day") statusStr = "Half Day";

      return {
        id: item.studentId || item.id || item._id || item.memberId || idx,
        name,
        roll,
        classSection:
          item.classSection ||
          (selectedRecord.className && selectedRecord.sectionName
            ? `${selectedRecord.className} - ${selectedRecord.sectionName}`
            : selectedRecord.classSection || ""),
        status: statusStr,
        remarks: item.remarks || "",
        time: item.time || "08:00 AM",
      };
    });
  })();

  const detailStudentLogs = recordRosterLogs.filter(
    (s) =>
      !studentSearch ||
      (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.roll && String(s.roll).toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // ── Load students for selected class + section from API ──────────────────
  const loadRosterStudents = useCallback(async (className, sectionName) => {
    if (!className || !sectionName) {
      toast.warning("Please select both Class and Section first.");
      return;
    }
    setRosterLoading(true);
    setRoster([]);
    try {
      const res = await getStudents({
        class: className,
        section: sectionName,
        limit: 200,
      });
      const students = res?.students || res?.data?.students || [];
      if (students.length === 0) {
        toast.info(`No students found for ${className} - ${sectionName}`);
      } else {
        toast.success(
          `Loaded ${students.length} students for ${className} - ${sectionName}`
        );
      }
      setRoster(
        students.map((s) => ({
          id: s._id || s.id,
          roll: s.rollNumber || s.admissionNumber || s._id,
          name:
            `${s.firstName || ""} ${s.lastName || ""}`.trim() ||
            s.name ||
            "Unknown",
          classSection: `${s.class || className} - ${s.section || sectionName}`,
          status: "Present",
          remarks: "",
        }))
      );
    } catch (err) {
      toast.error("Failed to load students. Check your connection.");
      setRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  const handleAttendeeTypeChange = (newType) => {
    setAttendeeType(newType);
    setRoster([]);
    setAttClass("");
    setAttSection("");
    setAttDepartment("");
  };

  const handleMarkAllStatus = (targetStatus) => {
    setRoster((prev) =>
      prev.map((item) => ({ ...item, status: targetStatus }))
    );
  };

  const handleStatusChange = (id, newStatus) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleRemarksChange = (id, text) => {
    setRoster((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remarks: text } : item))
    );
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (roster.length === 0) {
      toast.warning("Please load students before saving attendance.");
      return;
    }
    setSubmitting(true);

    const presentCount = roster.filter((r) => r.status === "Present").length;
    const absentCount = roster.filter((r) => r.status === "Absent").length;
    const lateCount = roster.filter((r) => r.status === "Late").length;

    // Build payload matching exact requested JSON structure:
    const payload = {
      date: attDate,
      type: attendeeType,
      classId: attClass || "CLASS_ID",
      sectionId: attSection || "SECTION_ID",
      className: attendeeType === "student" ? attClass : "Teaching Staff",
      sectionName: attendeeType === "student" ? attSection : attDepartment,
      classSection:
        attendeeType === "student"
          ? `${attClass} - ${attSection}`
          : `Staff - ${attDepartment}`,
      takenBy: {
        userId: user?.id || user?._id || "USER_ID",
        name: user?.name || user?.username || attTakenBy || "shadab md",
      },
      total: roster.length,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      // Exact requested 'students' array structure:
      students: roster.map((item) => ({
        studentId: item.id,
        name: item.name,
        rollNo: item.roll || "",
        status: (item.status || "present").toLowerCase(),
        remarks: item.remarks || "",
      })),
    };

    try {
      const res = await createAttendance(payload);
      // Add newly saved record to top of the list
      const savedRecord = res?.data?.attendance || res?.data || payload;
      setRecords((prev) => [
        {
          ...payload,
          id: savedRecord._id || savedRecord.id || `att-${Date.now()}`,
          ...savedRecord,
        },
        ...prev,
      ]);
      setRoster([]);
      setAttClass("");
      setAttSection("");
      setViewMode("list");
    } catch (err) {
      // Even on error, keep the user on the form so they can retry
      console.error("Save attendance error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) =>
        row.date ? format(new Date(row.date), "MMM d, yyyy") : "—",
    },
    {
      key: "classSection",
      label: "Class / Department",
      render: (row) => (
        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
          {row.classSection ||
            `${row.className || "Grade 10"} - ${row.sectionName || "Section A"}`}
        </span>
      ),
    },
    {
      key: "takenBy",
      label: "Taken By",
      render: (row) => {
        const nameStr =
          typeof row.takenBy === "object" && row.takenBy !== null
            ? row.takenBy.name || row.takenBy.username
            : row.takenBy;
        return (
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            <User size={13} className="text-slate-400" />
            <span>{nameStr || "shadab md"}</span>
          </div>
        );
      },
    },
    {
      key: "total",
      label: "Total Members",
      render: (row) => (
        <span className="font-bold text-slate-700 dark:text-slate-300">
          {row.total || (row.records || []).length || 34}
        </span>
      ),
    },
    {
      key: "present",
      label: "Present",
      render: (row) => {
        const count =
          row.present != null
            ? row.present
            : (row.records || []).filter((r) => r.status === "present").length;
        return (
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            {count}
          </span>
        );
      },
    },
    {
      key: "absent",
      label: "Absent",
      render: (row) => {
        const count =
          row.absent != null
            ? row.absent
            : (row.records || []).filter((r) => r.status === "absent").length;
        return (
          <span className="font-extrabold text-rose-600 dark:text-rose-400">
            {count}
          </span>
        );
      },
    },
    {
      key: "action",
      label: "Details",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenRecordDetail(row);
          }}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors"
        >
          <Eye size={13} /> View Attendance Roster
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 text-slate-800 dark:text-slate-100 font-sans">
      <PageHeader
        title="Attendance Management"
        subtitle={
          isStudent
            ? "Track and review your personal daily attendance record list."
            : "Monitor student and teacher & staff daily attendance."
        }
        actions={
          viewMode === "list" && !isStudent ? (
            <button
              onClick={() => setViewMode("take_attendance")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus size={15} /> Take Attendance
            </button>
          ) : viewMode !== "list" ? (
            <button
              onClick={() => {
                setViewMode("list");
                setSelectedRecord(null);
              }}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <ArrowLeft size={15} /> Back to Attendance List
            </button>
          ) : null
        }
      />

      {/* ── TOP TWO MAIN TABS (STUDENT vs TEACHER & STAFF) ────────────────── */}
      {viewMode === "list" && !isStudent && (
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-fit shadow-xs">
          <button
            onClick={() => setActiveMainTab("student")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              activeMainTab === "student"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap size={16} /> Student Attendance
          </button>

          {!isStudent && (
            <button
              onClick={() => setActiveMainTab("teacher")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeMainTab === "teacher"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              <Users size={16} /> Teacher & Staff Attendance
            </button>
          )}
        </div>
      )}

      {/* ── 1. STUDENT LOGGED IN PERSONAL VIEW ("MY ATTENDANCE LIST") ─────── */}
      {isStudent ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={24} />{" "}
                  Student Personal Attendance List
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Logged in as{" "}
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {user?.name || "Student"}
                  </span>{" "}
                  · Section Class 10-A (STD-0001)
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs">
                <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Academic Year 2025-2026
                </span>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 p-3.5 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                  Attendance Rate
                </p>
                <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-1">
                  {myAttData.summary.percentage}
                </p>
              </div>
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-3.5 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  Present
                </p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {myAttData.summary.presentCount || 5} Days
                </p>
              </div>
              <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 p-3.5 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                  Absent
                </p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">
                  {myAttData.summary.absentCount || 1} Days
                </p>
              </div>
              <div className="bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/40 p-3.5 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase">
                  Half Day
                </p>
                <p className="text-xl font-black text-cyan-700 dark:text-cyan-400 mt-1">
                  {myAttData.summary.halfDayCount || 2} Days
                </p>
              </div>
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-3.5 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                  Late
                </p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
                  {myAttData.summary.lateCount || 1} Days
                </p>
              </div>
            </div>

            {/* Filters Bar for Day-wise Student Attendance List */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Filter size={13} /> Filter Status:
                </span>
                {["all", "present", "absent", "half day", "late"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStudentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      studentStatusFilter === st
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {st === "all" ? "All Records" : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <input
                  type="date"
                  value={studentDateFilter}
                  onChange={(e) => setStudentDateFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Day-wise Attendance History List Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date & Day</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredMyLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-slate-400 dark:text-slate-500 font-semibold"
                      >
                        No attendance records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {log.date}{" "}
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            ({log.dayName || "School Day"})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                              log.status === "Present"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : log.status === "Absent"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                  : log.status === "Half Day"
                                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"
                                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                          {log.remarks || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : isTeacherRole && activeMainTab === "teacher" ? (
        /* ── 2. TEACHER LOGGED IN MY ATTENDANCE VIEW ───────────────────────── */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Users className="text-purple-600 dark:text-purple-400" size={24} /> Faculty Personal
              Attendance & Check-In Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Logged in as Faculty Member{" "}
              <span className="text-purple-600 dark:text-purple-400 font-bold">{user?.name}</span>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 p-4 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                  Faculty Presence
                </p>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                  98.0%
                </p>
              </div>
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-4 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  Check-In Today
                </p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  07:42 AM
                </p>
              </div>
              <div className="bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/40 p-4 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase">
                  Leave Balance
                </p>
                <p className="text-2xl font-black text-cyan-700 dark:text-cyan-400 mt-1">
                  12 Days
                </p>
              </div>
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-4 rounded-xl text-center shadow-xs">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                  Approved Leaves
                </p>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                  2 Days
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {myAttData.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.date}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.arrivalTime !== "—" ? log.arrivalTime : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        04:30 PM
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : viewMode === "view_record" && selectedRecord ? (
        /* ── 3. FULL PAGE RECORD DETAIL REPORT ─────────────────────────────── */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Class / Department
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {selectedRecord.classSection ||
                  `${selectedRecord.className || "Grade 10"} - ${selectedRecord.sectionName || "Section A"}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                Taken by:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {typeof selectedRecord.takenBy === "object" && selectedRecord.takenBy !== null
                    ? selectedRecord.takenBy?.name || selectedRecord.takenBy?.username || "shadab md"
                    : (typeof selectedRecord.takenBy === "string" && selectedRecord.takenBy.length === 24 && !selectedRecord.takenBy.includes(" ")
                        ? (user?.name || "shadab md")
                        : selectedRecord.takenBy) || "shadab md"}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl capitalize ${
                  selectedRecord.type === "teacher"
                    ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                    : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                }`}
              >
                {selectedRecord.type || "student"} Attendance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-xs">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Total Members
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {selectedRecord.total || 34}
              </p>
            </div>
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-4 rounded-2xl text-center shadow-xs">
              <p className="text-[10px] font-bold text-emerald-800/80 dark:text-emerald-300 uppercase">
                Present
              </p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {selectedRecord.present ?? 32}
              </p>
            </div>
            <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 p-4 rounded-2xl text-center shadow-xs">
              <p className="text-[10px] font-bold text-rose-800/80 dark:text-rose-300 uppercase">
                Absent
              </p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                {selectedRecord.absent ?? 1}
              </p>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 p-4 rounded-2xl text-center shadow-xs">
              <p className="text-[10px] font-bold text-amber-800/80 dark:text-amber-300 uppercase">
                Late
              </p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                {selectedRecord.late ?? 1}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Full Member Attendance Roster
              </h4>
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-2.5 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Roll / ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Arrival Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions / History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {detailStudentLogs.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {s.roll}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {s.time || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                            s.status === "Present"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : s.status === "Absent"
                                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setInspectStudentHistory(s)}
                          className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-all"
                        >
                          <FileText size={12} /> View Student Log List
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : viewMode === "take_attendance" ? (
        /* ── 4. TAKE ATTENDANCE FORM VIEW ──────────────────────────────────── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                {attendeeType === "student" ? (
                  <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={22} />
                ) : (
                  <Users className="text-purple-600 dark:text-purple-400" size={22} />
                )}
                Take{" "}
                {attendeeType === "student" ? "Student" : "Teacher & Staff"}{" "}
                Attendance
              </h3>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleAttendeeTypeChange("student")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                  attendeeType === "student"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap size={14} /> Student
              </button>
              <button
                type="button"
                onClick={() => handleAttendeeTypeChange("teacher")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                  attendeeType === "teacher"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users size={14} /> Teacher & Staff
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAttendance} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  required
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {attendeeType === "student" ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                      Class Level
                    </label>
                    <select
                      value={attClass}
                      onChange={(e) => {
                        setAttClass(e.target.value);
                        setRoster([]); // clear roster when class changes
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Class --</option>
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls.id || cls.name} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                      Section
                    </label>
                    <select
                      value={attSection}
                      onChange={(e) => {
                        setAttSection(e.target.value);
                        setRoster([]); // clear roster when section changes
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Section --</option>
                      {SECTION_OPTIONS.map((sec) => (
                        <option key={sec.id || sec.name} value={sec.name}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                    Department
                  </label>
                  <select
                    value={attDepartment}
                    onChange={(e) => setAttDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select Department --</option>
                    <option>Sciences</option>
                    <option>Mathematics</option>
                    <option>Languages</option>
                    <option>Arts</option>
                    <option>Commerce</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] mb-1">
                  Taken By
                </label>
                <input
                  type="text"
                  required
                  value={attTakenBy}
                  onChange={(e) => setAttTakenBy(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* ── Load Students Button ── */}
            {attendeeType === "student" && (
              <div className="flex items-center justify-between gap-4 bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {roster.length > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ {roster.length} students loaded for{" "}
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        {attClass} – {attSection}
                      </span>
                    </span>
                  ) : (
                    <span>
                      Select class &amp; section above, then click{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400">Load Students</strong>{" "}
                      to fetch the roster.
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!attClass || !attSection || rosterLoading}
                  onClick={() => loadRosterStudents(attClass, attSection)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm"
                >
                  {rosterLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {rosterLoading ? "Loading Students..." : "Load Students"}
                </button>
              </div>
            )}

            {/* ── Quick Mark + Live Counts ── */}
            {roster.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Quick Mark All:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMarkAllStatus("Present")}
                    className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold transition-colors"
                  >
                    ✓ Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAllStatus("Absent")}
                    className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-bold transition-colors"
                  >
                    ✕ Mark All Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAllStatus("Late")}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-bold transition-colors"
                  >
                    ⏰ Mark All Late
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                    Present:{" "}
                    {roster.filter((r) => r.status === "Present").length}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                    Absent: {roster.filter((r) => r.status === "Absent").length}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    Late: {roster.filter((r) => r.status === "Late").length}
                  </span>
                </div>
              </div>
            )}

            {/* ── Roster Table ── */}
            {rosterLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
                <span className="text-sm font-semibold">
                  Loading students for {attClass} – {attSection}...
                </span>
              </div>
            ) : roster.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <GraduationCap size={36} className="text-slate-400 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No students loaded yet</p>
                <p className="text-xs text-slate-500">
                  {attClass && attSection
                    ? `Click "Load Students" to fetch ${attClass} – ${attSection} roster`
                    : "Select a class and section, then click Load Students"}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Roll / ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {roster.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 dark:text-slate-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {item.roll}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-3 px-4">
                          <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(item.id, "Present")
                              }
                              className={`px-3 py-1 rounded-md transition-all ${item.status === "Present" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"}`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(item.id, "Absent")
                              }
                              className={`px-3 py-1 rounded-md transition-all ${item.status === "Absent" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-rose-600"}`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(item.id, "Late")
                              }
                              className={`px-3 py-1 rounded-md transition-all ${item.status === "Late" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-amber-600"}`}
                            >
                              L
                            </button>
                          </div>
                          <span
                            className={`ml-2 text-[10px] font-bold ${
                              item.status === "Present"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : item.status === "Absent"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional notes..."
                            value={item.remarks}
                            onChange={(e) =>
                              handleRemarksChange(item.id, e.target.value)
                            }
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Save size={15} /> Save & Submit Record
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── 5. MAIN LIST VIEW FOR ADMIN & TEACHERS ───────────────────────── */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title={`${activeMainTab === "teacher" ? "Faculty" : "Student"} Present`}
              value={stats?.present ?? "—"}
              className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-slate-900 shadow-xs"
            />
            <StatsCard
              title="Absent (Month)"
              value={stats?.absent ?? "—"}
              className="border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/50 to-white dark:from-slate-900 dark:to-slate-900 shadow-xs"
            />
            <StatsCard
              title="Late (Month)"
              value={stats?.late ?? "—"}
              className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-900 shadow-xs"
            />
            <StatsCard
              title="Attendance %"
              value={
                stats?.percentage != null ? `${stats.percentage}%` : "96.4%"
              }
              className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-900 shadow-xs"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <SearchFilters
              search={date}
              onSearchChange={setDate}
              placeholder="Filter by date (YYYY-MM-DD)..."
              onClear={() => {
                setDate("");
                setType("");
                setPage(1);
              }}
            />

            <DataTable
              columns={columns}
              data={filteredRecords}
              loading={loading}
              pagination={pagination}
              onPageChange={setPage}
              onRowClick={(row) => handleOpenRecordDetail(row)}
            />
          </div>
        </>
      )}

      {/* ── INSPECT STUDENT ATTENDANCE HISTORY MODAL ───────────────────────── */}
      {inspectStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black border border-indigo-100 dark:border-indigo-900/50">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {inspectStudentHistory.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Roll: {inspectStudentHistory.roll} ·{" "}
                    {inspectStudentHistory.classSection || "Class 10-A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectStudentHistory(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stats for this Student */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 rounded-xl">
                <span className="text-[10px] text-indigo-800/80 dark:text-indigo-300 font-bold uppercase block">
                  Attendance Rate
                </span>
                <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                  96.0%
                </span>
              </div>
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl">
                <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300 font-bold uppercase block">
                  Days Present
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  48 Days
                </span>
              </div>
              <div className="p-3 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 rounded-xl">
                <span className="text-[10px] text-rose-800/80 dark:text-rose-300 font-bold uppercase block">
                  Days Absent
                </span>
                <span className="text-lg font-black text-rose-700 dark:text-rose-400">2 Days</span>
              </div>
            </div>

            {/* History Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs max-h-64 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Attendance Status</th>
                    <th className="py-2.5 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myAttData.logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {l.date}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.status === "Present"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : l.status === "Absent"
                                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                : l.status === "Half Day"
                                  ? "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 italic">
                        {l.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectStudentHistory(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                Close Student Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
