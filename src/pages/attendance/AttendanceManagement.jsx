import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Edit3,
  Eye,
  GraduationCap,
  LayoutGrid,
  Plus,
  RotateCcw,
  Search,
  SquarePen,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useAcademicSession } from "../../context/AcademicSessionContext.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SelectInput } from "../../components/ui/FormControls.jsx";
import {
  getAttendanceById,
  getAttendanceRecords,
  getAttendanceStats,
  getAttendanceStatus,
  getMyAttendance,
} from "../../services";
import {
  CLASS_OPTIONS,
  MONTH_OPTIONS_WITH_ALL as MONTH_OPTIONS,
  ROLES,
  SECTION_OPTIONS,
  YEAR_OPTIONS_WITH_ALL as YEAR_OPTIONS,
} from "../../constants";
import {
  getUserFromStorage,
  getUserRole,
  hasModuleAccess,
} from "../../config/access.jsx";
import {
  attendanceDateKeyOf,
  initialsOf,
  rateTone,
} from "./components/attendanceHelpers.js";
import TakeAttendanceForm from "./components/TakeAttendanceForm.jsx";
import AttendanceDetailView from "./components/AttendanceDetailView.jsx";
import StudentAttendanceHistoryModal from "./components/StudentAttendanceHistoryModal.jsx";
import PersonalAttendanceView from "./components/PersonalAttendanceView.jsx";

const AttendanceManagement = () => {
  const { classOptions, schoolClasses, active, readOnly } = useAcademicSession();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || {};
  const userRole = getUserRole(user);

  const isStudent = userRole === ROLES.STUDENT;
  const isTeacherRole = [
    ROLES.TEACHER,
    ROLES.HEAD_TEACHER,
    ROLES.HOD,
    ROLES.COORDINATOR,
    "tg",
    ROLES.ACCOUNTANT,
    ROLES.LIBRARIAN,
    ROLES.PEON,
    "counselor",
    "councellor",
    "staff",
    "support",
  ].includes(userRole);
  const canManageAttendance = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    ROLES.PRINCIPAL,
    ROLES.TEACHER,
    ROLES.HEAD_TEACHER,
    "superadmin",
    "admin",
  ].includes(userRole);
  const canViewStudentProfile = hasModuleAccess(user, "students");
  const canViewTeacherProfile = hasModuleAccess(user, "teachers");

  const [activeMainTab, setActiveMainTab] = useState(
    [ROLES.PEON, ROLES.LIBRARIAN, ROLES.ACCOUNTANT, "staff", "support"].includes(userRole)
      ? "teacher"
      : "student"
  );
  const [viewMode, setViewMode] = useState("list"); // "list" | "take_attendance" | "view_record"
  const [takeTarget, setTakeTarget] = useState(null);

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayPresent: 0,
    todayAbsent: 0,
    notTaken: "0 Pending",
    notTakenClasses: 0,
    overallAttendance: "0%",
    percentage: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [inspectStudentHistory, setInspectStudentHistory] = useState(null);
  const [myAttData, setMyAttData] = useState({ summary: {}, logs: [] });

  // Tracker date & view filter for daily completion overview
  const [trackerDate, setTrackerDate] = useState("");
  const [trackerFilter, setTrackerFilter] = useState("all"); // "all" | "pending" | "taken"
  const [trackerExpanded, setTrackerExpanded] = useState(true);
  const [dailyOverview, setDailyOverview] = useState({
    type: "student",
    date: "",
    today: "",
    classSections: [],
    departments: [],
  });

  // Filters
  const [dateFilterMode, setDateFilterMode] = useState("all"); // "all" | "day" | "range"
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFilterOptions, setAvailableFilterOptions] = useState({
    months: [],
    classes: [],
    sections: [],
  });

  // Fetch attendance records, stats, daily overview, and personal logs
  useEffect(() => {
    let activeReq = true;
    const fetchAttendanceData = async () => {
      setLoading(true);
      const filterType = activeMainTab === "teacher" ? "teacher" : "student";
      const params = {
        page,
        limit: 25,
        type: filterType,
        date: dateFilterMode === "day" && date ? date : undefined,
        startDate: dateFilterMode === "range" && startDate ? startDate : undefined,
        endDate: dateFilterMode === "range" && endDate ? endDate : undefined,
        month: selectedMonth !== "all" ? selectedMonth : undefined,
        year: selectedYear !== "all" ? selectedYear : undefined,
        class: selectedClass !== "all" ? selectedClass : undefined,
        section: selectedSection !== "all" ? selectedSection : undefined,
        search: searchQuery || undefined,
      };

      try {
        const shouldFetchList = !isStudent && !(isTeacherRole && activeMainTab === "teacher");
        const shouldFetchPersonal = isStudent || (isTeacherRole && activeMainTab === "teacher");

        const [recRes, statsRes, statusRes, myRes] = await Promise.all([
          shouldFetchList ? getAttendanceRecords(params).catch(() => null) : Promise.resolve(null),
          shouldFetchList ? getAttendanceStats(params).catch(() => null) : Promise.resolve(null),
          shouldFetchList
            ? getAttendanceStatus({
                type: filterType,
                ...(trackerDate ? { date: trackerDate } : {}),
              }).catch(() => null)
            : Promise.resolve(null),
          shouldFetchPersonal ? getMyAttendance().catch(() => null) : Promise.resolve(null),
        ]);

        if (!activeReq) return;

        if (recRes) {
          const recList = recRes.records || recRes.data?.records || [];
          setRecords(recList);
          const pag = recRes.pagination || recRes.data?.pagination;
          if (pag) setPagination(pag);
          const filtersMeta = recRes.availableFilters || recRes.data?.availableFilters;
          if (filtersMeta) {
            setAvailableFilterOptions((prev) => ({
              months: filtersMeta.months?.length ? filtersMeta.months : prev.months,
              classes: filtersMeta.classes?.length ? filtersMeta.classes : prev.classes,
              sections: filtersMeta.sections?.length ? filtersMeta.sections : prev.sections,
            }));
          }
        }

        const st = statsRes?.stats || statsRes?.data?.stats;
        if (st) setStats(st);

        if (statusRes) {
          const ov = statusRes.data && !statusRes.classSections ? statusRes.data : statusRes;
          setDailyOverview({
            type: ov?.type || filterType,
            date: ov?.date || "",
            today: ov?.today || "",
            classSections: ov?.classSections || [],
            departments: ov?.departments || [],
          });
          if (!trackerDate && ov?.date) setTrackerDate(ov.date);
        }

        if (myRes?.summary || myRes?.data?.summary) {
          setMyAttData({
            summary: myRes?.summary || myRes?.data?.summary || {},
            logs: myRes?.logs || myRes?.data?.logs || [],
          });
        }
      } finally {
        if (activeReq) setLoading(false);
      }
    };

    fetchAttendanceData();
    return () => {
      activeReq = false;
    };
  }, [
    page,
    activeMainTab,
    dateFilterMode,
    date,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    selectedClass,
    selectedSection,
    searchQuery,
    trackerDate,
    refreshTick,
    isStudent,
    isTeacherRole,
  ]);

  const effectiveClassOptions = useMemo(() => {
    if (Array.isArray(classOptions) && classOptions.length > 0) {
      return classOptions;
    }
    const overviewClasses = [];
    const seen = new Set();
    (dailyOverview.classSections || []).forEach((cs) => {
      if (cs.className && !seen.has(cs.className)) {
        seen.add(cs.className);
        overviewClasses.push({
          id: cs.classId || cs.className,
          name: cs.className,
        });
      }
    });
    if (overviewClasses.length > 0) {
      return overviewClasses;
    }
    return CLASS_OPTIONS.filter((c) => !c.isPassout);
  }, [classOptions, dailyOverview.classSections]);

  const availableClasses = useMemo(() => {
    if (schoolClasses.classRange && classOptions.length > 0) {
      return classOptions.map((grade) => grade.name);
    }
    return availableFilterOptions.classes || [];
  }, [schoolClasses.classRange, classOptions, availableFilterOptions.classes]);

  const availableSections = useMemo(() => {
    const fromOverview = (dailyOverview.classSections || []).map((cs) => cs.sectionName);
    const fromApi = availableFilterOptions.sections || [];
    const fromConstants = SECTION_OPTIONS.map((s) => s.name);
    return Array.from(new Set([...fromOverview, ...fromApi, ...fromConstants].filter(Boolean))).sort();
  }, [dailyOverview.classSections, availableFilterOptions.sections]);

  const handleClearFilters = () => {
    setDateFilterMode("all");
    setDate("");
    setStartDate("");
    setEndDate("");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSelectedClass("all");
    setSelectedSection("all");
    setSearchQuery("");
    setPage(1);
  };

  const activeFiltersCount =
    (dateFilterMode === "day" && date ? 1 : 0) +
    (dateFilterMode === "range" && (startDate || endDate) ? 1 : 0) +
    (selectedMonth !== "all" ? 1 : 0) +
    (selectedYear !== "all" ? 1 : 0) +
    (selectedClass !== "all" ? 1 : 0) +
    (selectedSection !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const handleOpenRecordDetail = useCallback(async (recordOrId) => {
    const recordId =
      typeof recordOrId === "string" ? recordOrId : recordOrId?._id || recordOrId?.id;
    if (typeof recordOrId === "object" && recordOrId !== null) {
      setSelectedRecord(recordOrId);
    } else {
      setSelectedRecord(null);
    }
    setViewMode("view_record");

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
  }, []);

  const handleEditRecord = useCallback(async (record) => {
    const recordId = record?._id || record?.id;
    let targetRecord = record;
    if (recordId && !record?.students?.length && !String(recordId).startsWith("att-")) {
      try {
        const res = await getAttendanceById(recordId);
        const fetched = res?.record || res?.data?.record;
        if (fetched) targetRecord = fetched;
      } catch {
        // fallback to existing record object
      }
    }
    setTakeTarget({ editRecord: targetRecord });
    setViewMode("take_attendance");
  }, []);

  const handleStartNewAttendance = useCallback(
    (preset = null) => {
      setTakeTarget(
        preset || {
          type: activeMainTab === "teacher" ? "teacher" : "student",
          date: trackerDate || dailyOverview.today || new Date().toLocaleDateString("en-CA"),
        }
      );
      setViewMode("take_attendance");
    },
    [activeMainTab, trackerDate, dailyOverview.today]
  );

  const handleAttendanceSaved = useCallback((savedRecord, isEdit) => {
    setRefreshTick((t) => t + 1);
    if (isEdit && savedRecord) {
      setSelectedRecord(savedRecord);
      setViewMode("view_record");
    } else {
      setTakeTarget(null);
      setViewMode("list");
    }
  }, []);

  const todayKey = dailyOverview.today || new Date().toLocaleDateString("en-CA");

  const columns = [
    {
      key: "date",
      label: "Attendance Date",
      showOnMobile: true,
      render: (row) => {
        const dk = attendanceDateKeyOf(row);
        const takenDate = row.attendanceTakenDate || row.createdAt;
        const takenKey =
          takenDate && !isNaN(new Date(takenDate).getTime())
            ? new Date(takenDate).toLocaleDateString("en-CA")
            : "";
        const isToday = dk && dk === todayKey;
        const isPast = dk && takenKey && dk !== takenKey;

        return (
          <div className="space-y-0.5 tabular-nums">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 flex-wrap">
              <Calendar size={13} className="text-indigo-500 shrink-0" />
              <span>
                {dk ? format(new Date(`${dk}T00:00:00`), "MMM d, yyyy") : "—"}
              </span>
              {isToday ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                  Today
                </span>
              ) : isPast ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25 whitespace-nowrap">
                  Backdated
                </span>
              ) : null}
            </div>
            {takenDate && !isNaN(new Date(takenDate).getTime()) ? (
              <div className="md:hidden flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Clock size={10} className="shrink-0" />
                <span>Recorded {format(new Date(takenDate), "h:mm a")}</span>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "takenDate",
      label: "Recorded At",
      hideOnMobile: true,
      render: (row) => {
        const takenDate = row.attendanceTakenDate || row.createdAt || row.date;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap tabular-nums">
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>
              {takenDate && !isNaN(new Date(takenDate).getTime())
                ? format(new Date(takenDate), "MMM d · h:mm a")
                : "—"}
            </span>
          </div>
        );
      },
    },
    {
      key: "classSection",
      label: activeMainTab === "teacher" ? "Department" : "Class & Section",
      showOnMobile: true,
      render: (row) => {
        const label =
          row.classSection ||
          [row.className, row.sectionName].filter(Boolean).join(" - ") ||
          "—";
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/50 text-xs font-extrabold whitespace-nowrap">
            {label}
          </span>
        );
      },
    },
    {
      key: "takenBy",
      label: "Taken By",
      sortable: false,
      hideOnMobile: true,
      render: (row) => {
        const nameStr =
          typeof row.takenBy === "object" && row.takenBy !== null
            ? row.takenBy.name || row.takenBy.username
            : row.takenBy;
        const display = nameStr || "Staff";
        return (
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              {initialsOf(display)}
            </span>
            <span className="truncate max-w-[120px]">{display}</span>
          </div>
        );
      },
    },
    {
      key: "summary",
      label: "Breakdown",
      sortable: false,
      hideOnMobile: true,
      render: (row) => {
        const list = row.students || row.records || row.attendance || [];
        const total = row.total ?? list.length;
        const present =
          row.present != null
            ? row.present
            : list.filter((r) => String(r.status || "").toLowerCase() === "present").length;
        const absent =
          row.absent != null
            ? row.absent
            : list.filter((r) => String(r.status || "").toLowerCase() === "absent").length;
        const late = row.late ?? 0;
        const halfDay = row.halfDay ?? 0;
        const leave = row.leave ?? row.leaveCount ?? 0;
        return (
          <div className="flex items-center gap-1.5 flex-wrap tabular-nums">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-extrabold">
              {total} total
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20 text-[11px] font-bold">
              {present} P
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                absent > 0
                  ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/20"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              {absent} A
            </span>
            {late > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20 text-[11px] font-bold">
                {late} L
              </span>
            ) : null}
            {halfDay > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-500/20 text-[11px] font-bold">
                {halfDay} HD
              </span>
            ) : null}
            {leave > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-500/20 text-[11px] font-bold">
                {leave} LV
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "rate",
      label: "Rate",
      sortable: false,
      hideOnMobile: true,
      render: (row) => {
        const list = row.students || row.records || row.attendance || [];
        const total = row.total ?? list.length;
        const present =
          row.present != null
            ? row.present
            : list.filter((r) => String(r.status || "").toLowerCase() === "present").length;
        const halfDay = row.halfDay ?? 0;
        const pct =
          total > 0 ? Math.min(100, Math.round(((present + halfDay * 0.5) / total) * 100)) : 0;
        const tone = rateTone(pct);
        return (
          <div className="w-20 space-y-1 tabular-nums">
            <div className="flex items-center justify-between text-[11px] font-extrabold">
              <span className={tone.textClass}>{pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${tone.barClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "action",
      label: "Actions",
      sortable: false,
      hideOnMobile: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRecordDetail(row);
            }}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/80 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors cursor-pointer"
          >
            <Eye size={13} /> View
          </button>
          {canManageAttendance && !readOnly ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEditRecord(row);
              }}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 size={12} /> Edit
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const overviewMatchesTab =
    !dailyOverview.type || dailyOverview.type === activeMainTab;
  const studentOverviewSections = useMemo(
    () => (overviewMatchesTab && activeMainTab === "student" ? dailyOverview.classSections || [] : []),
    [overviewMatchesTab, activeMainTab, dailyOverview.classSections]
  );
  const teacherOverviewDepts = useMemo(
    () => (overviewMatchesTab && activeMainTab === "teacher" ? dailyOverview.departments || [] : []),
    [overviewMatchesTab, activeMainTab, dailyOverview.departments]
  );

  const pendingSections = studentOverviewSections.filter((c) => !c.taken);
  const takenSections = studentOverviewSections.filter((c) => c.taken);
  const trackerCompletionPct =
    studentOverviewSections.length > 0
      ? Math.round((takenSections.length / studentOverviewSections.length) * 100)
      : 0;

  const groupedTrackerClasses = useMemo(() => {
    const filtered = studentOverviewSections.filter((cs) => {
      if (trackerFilter === "pending") return !cs.taken;
      if (trackerFilter === "taken") return Boolean(cs.taken);
      return true;
    });
    const byClass = new Map();
    filtered.forEach((cs) => {
      const key = cs.className || "Other";
      if (!byClass.has(key)) {
        byClass.set(key, { className: key, sections: [] });
      }
      byClass.get(key).sections.push(cs);
    });
    return Array.from(byClass.values());
  }, [studentOverviewSections, trackerFilter]);

  const totalUnitsForKpi = stats?.totalClasses ?? studentOverviewSections.length;
  const markedUnitsForKpi = stats?.todayMarkedClasses ?? takenSections.length;
  const kpiCoveragePct =
    totalUnitsForKpi > 0
      ? Math.min(100, Math.round((markedUnitsForKpi / totalUnitsForKpi) * 100))
      : 0;
  const overallRatePct = Number(
    stats?.percentage ??
      (typeof stats?.overallAttendance === "string"
        ? parseInt(stats.overallAttendance, 10) || 0
        : 0)
  );
  const overallTone = rateTone(overallRatePct);

  return (
    <div className="space-y-5 pb-10 text-slate-800 dark:text-slate-100 font-sans">
      <PageHeader
        title="Attendance Management"
        subtitle={
          isStudent
            ? "Track and review your personal daily attendance record."
            : active?.sessionName
              ? `Daily attendance tracking and completion status · Session ${active.sessionName}`
              : "Monitor student and teacher & staff daily attendance."
        }
        actions={
          viewMode === "list" && !isStudent && canManageAttendance && !readOnly ? (
            <button
              type="button"
              onClick={() => handleStartNewAttendance()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Plus size={16} /> Take Attendance
            </button>
          ) : viewMode !== "list" ? (
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                setSelectedRecord(null);
                setTakeTarget(null);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft size={15} /> Back to Attendance List
            </button>
          ) : null
        }
      />

      {viewMode === "list" && !isStudent ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="grid grid-cols-2 sm:inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => {
                setActiveMainTab("student");
                setTrackerFilter("all");
                setPage(1);
              }}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all text-center cursor-pointer ${
                activeMainTab === "student"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800"
              }`}
            >
              <GraduationCap size={15} className="shrink-0" />
              <span className="truncate">Student Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab("teacher");
                setTrackerFilter("all");
                setPage(1);
              }}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all text-center cursor-pointer ${
                activeMainTab === "teacher"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800"
              }`}
            >
              <Users size={15} className="shrink-0" />
              <span className="truncate">
                Teacher &amp; Staff <span className="hidden sm:inline">Attendance</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {active?.sessionName ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                <Calendar size={13} className="text-indigo-500" />
                Session {active.sessionName}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300 shadow-xs tabular-nums">
              <Clock size={13} className="text-emerald-500" />
              Today:{" "}
              {/^\d{4}-\d{2}-\d{2}$/.test(todayKey)
                ? format(new Date(`${todayKey}T00:00:00`), "EEE, MMM d, yyyy")
                : format(new Date(), "EEE, MMM d, yyyy")}
            </span>
          </div>
        </div>
      ) : null}

      {isStudent ? (
        <PersonalAttendanceView
          isStudent
          user={user}
          sessionName={active?.sessionName}
          myAttData={myAttData}
        />
      ) : isTeacherRole && activeMainTab === "teacher" ? (
        <PersonalAttendanceView
          isStudent={false}
          user={user}
          sessionName={active?.sessionName}
          myAttData={myAttData}
        />
      ) : viewMode === "view_record" && selectedRecord ? (
        <AttendanceDetailView
          selectedRecord={selectedRecord}
          detailLoading={detailLoading}
          canEdit={canManageAttendance && !readOnly}
          canViewProfile={
            (selectedRecord.type || "").toLowerCase() === "teacher"
              ? canViewTeacherProfile
              : canViewStudentProfile
          }
          onEditRecord={handleEditRecord}
          onInspectStudent={(student) => setInspectStudentHistory(student)}
        />
      ) : viewMode === "take_attendance" ? (
        <TakeAttendanceForm
          user={user}
          classOptions={effectiveClassOptions}
          activeSession={active}
          readOnly={readOnly}
          initialTarget={takeTarget}
          onCancel={() => {
            setTakeTarget(null);
            setViewMode("list");
          }}
          onSaved={handleAttendanceSaved}
          onViewExisting={(existing) => handleOpenRecordDetail(existing)}
        />
      ) : (
        <>
          {/* 5 Compact KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 tabular-nums">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    {activeMainTab === "teacher" ? "Total Faculty" : "Total Students"}
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {stats?.totalStudents ?? 0}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Users size={15} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {totalUnitsForKpi} {activeMainTab === "teacher" ? "departments" : "class sections"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Present Today
                  </p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {stats?.todayPresent ?? 0}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {(stats?.todayLate ?? 0) + (stats?.todayHalfDay ?? 0) > 0
                  ? `${stats?.todayLate ?? 0} late · ${stats?.todayHalfDay ?? 0} half-day`
                  : markedUnitsForKpi > 0
                    ? `${markedUnitsForKpi} sheet${markedUnitsForKpi === 1 ? "" : "s"} marked today`
                    : "No sheets marked today"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Absent Today
                  </p>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    {stats?.todayAbsent ?? 0}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0">
                  <X size={15} className="text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {(stats?.todayLeave ?? 0) > 0
                  ? `${stats.todayLeave} on approved leave`
                  : "0 on approved leave"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    {activeMainTab === "teacher" ? "Pending Depts" : "Pending Sections"}
                  </p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    {stats?.notTaken ?? "0 Pending"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      kpiCoveragePct === 100 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${kpiCoveragePct}%` }}
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {markedUnitsForKpi}/{totalUnitsForKpi} marked ({kpiCoveragePct}%)
                </p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    Overall Rate
                  </p>
                  <p className={`text-xl font-black mt-0.5 ${overallTone.textClass}`}>
                    {stats?.overallAttendance || `${overallRatePct}%`}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={15} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${overallTone.barClass}`}
                    style={{ width: `${overallRatePct}%` }}
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  From {stats?.recordsCount ?? 0} sheet{stats?.recordsCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Daily Completion Tracker */}
          {activeMainTab === "student" && studentOverviewSections.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    Daily Class &amp; Section Tracker
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border tabular-nums shrink-0 ${
                      trackerCompletionPct === 100
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50"
                    }`}
                  >
                    {takenSections.length}/{studentOverviewSections.length} · {trackerCompletionPct}%
                  </span>
                  <div className="hidden md:block w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        trackerCompletionPct === 100 ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${trackerCompletionPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    {[
                      { id: "all", label: `All (${studentOverviewSections.length})`, icon: LayoutGrid },
                      { id: "pending", label: `Pending (${pendingSections.length})`, icon: Clock },
                      { id: "taken", label: `Marked (${takenSections.length})`, icon: CheckCircle2 },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTrackerFilter(tab.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer tabular-nums ${
                            trackerFilter === tab.id
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <TabIcon size={11} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="date"
                    max={dailyOverview.today || undefined}
                    value={trackerDate || dailyOverview.date || ""}
                    onChange={(e) => setTrackerDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {trackerDate && trackerDate !== todayKey ? (
                    <button
                      type="button"
                      onClick={() => setTrackerDate(todayKey)}
                      className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer"
                    >
                      Today
                    </button>
                  ) : null}

                  <button
                    type="button"
                    aria-label={trackerExpanded ? "Collapse tracker" : "Expand tracker"}
                    onClick={() => setTrackerExpanded((v) => !v)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {trackerExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span className="hidden sm:inline">{trackerExpanded ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              {trackerExpanded ? (
                groupedTrackerClasses.length === 0 ? (
                  <div className="py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    {trackerFilter === "pending"
                      ? "All class sections have completed attendance for this date."
                      : "No class sections have recorded attendance for this date yet."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {groupedTrackerClasses.map((grp) => {
                      const doneCount = grp.sections.filter((s) => s.taken).length;
                      const allDone = doneCount === grp.sections.length;
                      return (
                        <div
                          key={grp.className}
                          className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-xl p-2 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-1.5 px-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
                              <BookOpen size={12} className="text-indigo-500 shrink-0" />
                              <span className="truncate">{grp.className}</span>
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border tabular-nums shrink-0 ${
                                allDone
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                  : doneCount > 0
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20"
                                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {doneCount}/{grp.sections.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {grp.sections.map((cs) => {
                              const shortSection = String(cs.sectionName || "").replace(
                                /^Section\s+/i,
                                "Sec "
                              );
                              return (
                                <button
                                  key={cs.key}
                                  type="button"
                                  title={
                                    cs.taken
                                      ? `${cs.classSection}: ${cs.present}/${cs.total} present — Click to view`
                                      : `${cs.classSection}: ${cs.studentCount} students — Click to mark`
                                  }
                                  onClick={() => {
                                    if (cs.taken && cs.attendanceId) {
                                      handleOpenRecordDetail(cs.attendanceId);
                                    } else if (canManageAttendance && !readOnly) {
                                      handleStartNewAttendance({
                                        type: "student",
                                        date: trackerDate || dailyOverview.date || todayKey,
                                        className: cs.className,
                                        sectionName: cs.sectionName,
                                      });
                                    }
                                  }}
                                  className={`group flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer tabular-nums min-w-0 ${
                                    cs.taken
                                      ? "bg-white dark:bg-slate-900 border-emerald-200/90 dark:border-emerald-800/50 hover:border-emerald-400"
                                      : "bg-white dark:bg-slate-900/90 border-amber-200/80 dark:border-amber-800/40 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"
                                  }`}
                                >
                                  <span className="flex items-center gap-1 min-w-0">
                                    {cs.taken ? (
                                      <CheckCircle2
                                        size={12}
                                        className="text-emerald-600 dark:text-emerald-400 shrink-0"
                                      />
                                    ) : (
                                      <Clock
                                        size={12}
                                        className="text-amber-500 dark:text-amber-400 shrink-0"
                                      />
                                    )}
                                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                      {shortSection}
                                    </span>
                                  </span>

                                  {cs.taken ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                                      <span>
                                        {cs.present}/{cs.total}
                                      </span>
                                      <Eye
                                        size={11}
                                        className="hidden sm:inline opacity-60 group-hover:opacity-100"
                                      />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                      <span className="inline-flex items-center gap-0.5">
                                        <Users size={10} />
                                        {cs.studentCount}
                                      </span>
                                      <SquarePen
                                        size={11}
                                        className="text-amber-600 group-hover:text-indigo-600 transition-colors"
                                      />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : null}
            </div>
          ) : activeMainTab === "teacher" && teacherOverviewDepts.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/70 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    Daily Department Attendance Tracker
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="date"
                    max={dailyOverview.today || undefined}
                    value={trackerDate || dailyOverview.date || ""}
                    onChange={(e) => setTrackerDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 tabular-nums">
                {teacherOverviewDepts.map((dept) => (
                  <button
                    key={dept.department}
                    type="button"
                    onClick={() => {
                      if (dept.taken && dept.attendanceId) {
                        handleOpenRecordDetail(dept.attendanceId);
                      } else if (canManageAttendance && !readOnly) {
                        handleStartNewAttendance({
                          type: "teacher",
                          date: trackerDate || dailyOverview.date || todayKey,
                          department: dept.department,
                        });
                      }
                    }}
                    className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      dept.taken
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400"
                        : "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate">
                        {dept.department}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <Users size={10} /> {dept.staffCount} staff
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                        dept.taken
                          ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                      }`}
                    >
                      {dept.taken ? (
                        <>
                          <CheckCircle2 size={11} /> Marked
                        </>
                      ) : (
                        <>
                          <SquarePen size={11} /> Mark
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Records Table + Balanced Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by class, section, department, or taken by..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterMode("all");
                      setDate("");
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      dateFilterMode === "all"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterMode("day");
                      setStartDate("");
                      setEndDate("");
                      if (!date) setDate(todayKey);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      dateFilterMode === "day"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Specific Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterMode("range");
                      setDate("");
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      dateFilterMode === "range"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {dateFilterMode !== "all" ? (
                <div className="flex flex-wrap items-end gap-3 p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 text-xs">
                  {dateFilterMode === "day" ? (
                    <div className="w-full sm:w-56">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Selected Day
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setPage(1);
                        }}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-full sm:w-48">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setPage(1);
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="w-full sm:w-48">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setPage(1);
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              <div
                className={`grid gap-3 text-xs ${
                  activeMainTab === "student"
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-2 max-w-lg"
                }`}
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Month
                  </label>
                  <SelectInput
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Year
                  </label>
                  <SelectInput
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                {activeMainTab === "student" ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Class
                      </label>
                      <SelectInput
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedSection("all");
                          setPage(1);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="all">All Classes</option>
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Section
                      </label>
                      <SelectInput
                        value={selectedSection}
                        onChange={(e) => {
                          setSelectedSection(e.target.value);
                          setPage(1);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="all">All Sections</option>
                        {availableSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                  {pagination?.total ?? records.length} Record
                  {(pagination?.total ?? records.length) !== 1 ? "s" : ""} Found
                </span>

                {selectedClass !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedClass("all")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold cursor-pointer"
                  >
                    Class: {selectedClass} <X size={11} />
                  </button>
                ) : null}
                {selectedSection !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedSection("all")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold cursor-pointer"
                  >
                    Section: {selectedSection} <X size={11} />
                  </button>
                ) : null}
                {selectedMonth !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedMonth("all")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold cursor-pointer"
                  >
                    Month: {selectedMonth} <X size={11} />
                  </button>
                ) : null}
              </div>

              {activeFiltersCount > 0 ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters ({activeFiltersCount})</span>
                </button>
              ) : null}
            </div>

            <DataTable
              columns={columns}
              data={records}
              loading={loading}
              pagination={pagination}
              onPageChange={setPage}
              onRowClick={(row) => handleOpenRecordDetail(row)}
              mobileColumns={["date", "classSection"]}
              emptyTitle="No attendance records match"
              emptyDescription="Try clearing filters or start a new register using Take Attendance above."
            />
          </div>
        </>
      )}

      <StudentAttendanceHistoryModal
        member={inspectStudentHistory}
        canViewProfile={
          inspectStudentHistory?.memberType === "teacher"
            ? canViewTeacherProfile
            : canViewStudentProfile
        }
        onClose={() => setInspectStudentHistory(null)}
      />
    </div>
  );
};

export default AttendanceManagement;
