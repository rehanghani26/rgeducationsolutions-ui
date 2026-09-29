import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, User, MapPin, Save, RefreshCw, Clock, Layers, Sparkles,
  CheckCircle2, Trash2, Download, Grid, List, Calendar, X, Plus, Lock,
  Filter, UserCheck, BookMarked, Eye, ExternalLink, HelpCircle, Edit3,
  CalendarDays, ArrowLeft, ArrowRight, CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import { getSyllabusByClass } from "../../services/syllabusService.js";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../../constants/academicOptions.js";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { useSelector } from "react-redux";
import DataTable from "../../components/ui/DataTable.jsx";

// ─── Period type display metadata ────────────────────────────────────────────
const PERIOD_META = {
  prayer:     { label: "Prayer",      icon: "🙏", bg: "bg-amber-50 dark:bg-amber-950/30",     text: "text-amber-700 dark:text-amber-300",     border: "border-amber-200 dark:border-amber-800/50" },
  class:      { label: "Class",       icon: "📚", bg: "bg-indigo-50 dark:bg-indigo-950/30",   text: "text-indigo-700 dark:text-indigo-300",   border: "border-indigo-200 dark:border-indigo-800/50" },
  pt:         { label: "PT / Sports", icon: "🏃", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/50" },
  lunch:      { label: "Lunch",       icon: "🍱", bg: "bg-orange-50 dark:bg-orange-950/30",   text: "text-orange-700 dark:text-orange-300",   border: "border-orange-200 dark:border-orange-800/50" },
  dance:      { label: "Dance",       icon: "💃", bg: "bg-pink-50 dark:bg-pink-950/30",       text: "text-pink-700 dark:text-pink-300",       border: "border-pink-200 dark:border-pink-800/50" },
  activities: { label: "Activity",    icon: "🎨", bg: "bg-purple-50 dark:bg-purple-950/30",   text: "text-purple-700 dark:text-purple-300",   border: "border-purple-200 dark:border-purple-800/50" },
  singing:    { label: "Music",       icon: "🎵", bg: "bg-cyan-50 dark:bg-cyan-950/30",       text: "text-cyan-700 dark:text-cyan-300",       border: "border-cyan-200 dark:border-cyan-800/50" },
  recess:     { label: "Recess",      icon: "☕", bg: "bg-teal-50 dark:bg-teal-950/30",       text: "text-teal-700 dark:text-teal-300",       border: "border-teal-200 dark:border-teal-800/50" },
  leave:      { label: "Departure",   icon: "🚌", bg: "bg-rose-50 dark:bg-rose-950/30",       text: "text-rose-700 dark:text-rose-300",       border: "border-rose-200 dark:border-rose-800/50" },
  custom:     { label: "Custom",      icon: "⚡", bg: "bg-slate-100 dark:bg-slate-800",       text: "text-slate-700 dark:text-slate-200",     border: "border-slate-300 dark:border-slate-700" },
};
const getMeta = (type) => PERIOD_META[type] || PERIOD_META.custom;

const DEFAULT_DAYS = [
  { id: "monday",    label: "Monday",    short: "Mon" },
  { id: "tuesday",   label: "Tuesday",   short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday",  label: "Thursday",  short: "Thu" },
  { id: "friday",    label: "Friday",    short: "Fri" },
  { id: "saturday",  label: "Saturday",  short: "Sat" },
];

const DEFAULT_SUBJECTS = [
  "Mathematics", "English Literature", "Science / Physics", "Chemistry",
  "Biology", "Social Studies / History", "Computer Science",
  "Hindi / Regional", "Physical Education", "Art & Craft",
];

const getCurrentDayId = () => {
  const names = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const name = names[new Date().getDay()];
  return name === "sunday" ? "monday" : name;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ClassTimetableSettings = () => {
  const navigate    = useNavigate();
  const authUser    = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(() => authUser || getUserFromStorage() || {}, [authUser]);
  const userRole    = useMemo(
    () => (currentUser?.role || getUserRole(currentUser) || "").toLowerCase(),
    [currentUser]
  );
  const canEdit = ["super-admin", "school-admin", "admin", "principal", "director"].includes(userRole);

  // ─── Selector state ──────────────────────────────────────────────────────
  const [selectedClass,   setSelectedClass]   = useState("Class 10");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [viewMode,        setViewMode]        = useState("weekly");
  const [selectedDay,     setSelectedDay]     = useState(getCurrentDayId);

  // ─── Edit vs View-Only mode ──────────────────────────────────────────────
  const [isEditMode,      setIsEditMode]      = useState(false);

  const classSectionKey = `${selectedClass} - ${selectedSection}`;

  // ─── Syllabus & Prescribed Books state ──────────────────────────────────
  const [syllabusData,      setSyllabusData]      = useState(null);
  const [syllabusSubjects,  setSyllabusSubjects]  = useState([]);
  const [syllabusLoading,   setSyllabusLoading]   = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

  // ─── Data state ──────────────────────────────────────────────────────────
  const [masterSchedule,    setMasterSchedule]    = useState(null);
  const [loadingSchedule,   setLoadingSchedule]   = useState(true);
  const [teachersList,      setTeachersList]      = useState([]);
  const [allSchoolSubjects, setAllSchoolSubjects] = useState(DEFAULT_SUBJECTS);
  const [allocations,       setAllocations]       = useState({});
  const [saving,            setSaving]            = useState(false);
  const [isDirty,           setIsDirty]           = useState(false);

  // ─── Modal state ─────────────────────────────────────────────────────────
  const [editSlotModal,         setEditSlotModal]         = useState({ isOpen: false, day: "monday", periodIndex: 0, period: null });
  const [slotForm,              setSlotForm]              = useState({ subject: "", teacherId: "", teacherName: "", roomNo: "", bookName: "", subjectCode: "", applyToAllDays: true });
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("");

  // ─── Main Tab & Timetables Directory State ───────────────────────────────
  const [activeMainTab,         setActiveMainTab]         = useState("directory"); // "directory" | "builder"
  const [allTimetables,         setAllTimetables]         = useState([]);
  const [loadingAllTimetables,  setLoadingAllTimetables]  = useState(true);

  // ─── Fetch All Timetables Directory ──────────────────────────────────────
  const fetchAllTimetables = async () => {
    setLoadingAllTimetables(true);
    try {
      const res = await api.get("/periods/timetable?scheduleType=regular");
      const list = res.data?.timetables || [];
      setAllTimetables(list);
    } catch (err) {
      console.error("Failed to load class timetables list:", err);
    } finally {
      setLoadingAllTimetables(false);
    }
  };

  useEffect(() => {
    fetchAllTimetables();
  }, []);

  // ─── Initial master schedule & options fetch ─────────────────────────────
  useEffect(() => {
    const fetchMaster = async () => {
      setLoadingSchedule(true);
      try {
        const res = await api.get("/periods?type=regular");
        const schedules = res.data?.schedules || [];
        setMasterSchedule(schedules.find((s) => s.scheduleType === "regular") || schedules[0] || null);
      } catch {
        setMasterSchedule(null);
      } finally {
        setLoadingSchedule(false);
      }
    };

    const fetchOptions = async () => {
      try {
        const tRes = await api.get("/teachers?limit=500");
        setTeachersList(tRes.data?.teachers || []);
      } catch { /* silent */ }
      try {
        const sRes = await api.get("/erp/subjects");
        const names = (sRes.data?.subjects || []).map((s) => s.name);
        if (names.length > 0) {
          setAllSchoolSubjects(Array.from(new Set([...names, ...DEFAULT_SUBJECTS])));
        }
      } catch { /* silent */ }
    };

    fetchMaster();
    fetchOptions();
  }, []);

  // ─── Load Syllabus & Prescribed Books whenever selectedClass changes ─────
  useEffect(() => {
    let isMounted = true;
    const loadClassSyllabus = async () => {
      if (!selectedClass) return;
      setSyllabusLoading(true);
      try {
        const clsObj = CLASS_OPTIONS.find(
          (c) => c.name === selectedClass || c.value === selectedClass || c.id === selectedClass
        );
        const queryId = clsObj?.id || selectedClass;
        const data = await getSyllabusByClass(queryId);
        if (!isMounted) return;

        if (data && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setSyllabusData(data);
          setSyllabusSubjects(data.subjects);
        } else {
          // Fallback attempt with selectedClass name directly
          const fallbackData = await getSyllabusByClass(selectedClass);
          if (!isMounted) return;
          if (fallbackData && Array.isArray(fallbackData.subjects) && fallbackData.subjects.length > 0) {
            setSyllabusData(fallbackData);
            setSyllabusSubjects(fallbackData.subjects);
          } else {
            setSyllabusData(null);
            setSyllabusSubjects([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load class syllabus:", err);
          setSyllabusData(null);
          setSyllabusSubjects([]);
        }
      } finally {
        if (isMounted) setSyllabusLoading(false);
      }
    };

    loadClassSyllabus();
    return () => {
      isMounted = false;
    };
  }, [selectedClass]);

  // ─── Derive other school subjects ─────────────────────────────────────────
  const otherSubjects = useMemo(() => {
    const sylNames = new Set(
      syllabusSubjects.map((s) => (s.subjectName || "").trim().toLowerCase())
    );
    return allSchoolSubjects.filter(
      (name) => name && !sylNames.has(name.trim().toLowerCase())
    );
  }, [syllabusSubjects, allSchoolSubjects]);

  const getBookForSubject = (subName) => {
    if (!subName) return "";
    const found = syllabusSubjects.find(
      (s) => (s.subjectName || "").trim().toLowerCase() === subName.trim().toLowerCase()
    );
    return found?.bookName || "";
  };

  const getCodeForSubject = (subName) => {
    if (!subName) return "";
    const found = syllabusSubjects.find(
      (s) => (s.subjectName || "").trim().toLowerCase() === subName.trim().toLowerCase()
    );
    return found?.subjectCode || "";
  };

  // ─── Day-Specific Periods Helper ─────────────────────────────────────────
  // Handles Mon-Fri standard schedule vs Saturday Half-Day / Day custom schedules
  const getPeriodsForDay = (dayId) => {
    const custom = masterSchedule?.daySchedules?.[dayId];
    if (custom && custom.enabled !== false && Array.isArray(custom.periods) && custom.periods.length > 0) {
      return custom.periods;
    }
    return masterSchedule?.periods || [];
  };

  const getDayInfo = (dayId) => {
    const custom = masterSchedule?.daySchedules?.[dayId];
    if (custom && custom.enabled !== false && Array.isArray(custom.periods) && custom.periods.length > 0) {
      return {
        isCustom: true,
        isHalfDay: Boolean(custom.isHalfDay),
        name: custom.name || `${dayId.charAt(0).toUpperCase() + dayId.slice(1)} Schedule`,
        startTime: custom.schoolStartTime || masterSchedule?.schoolStartTime,
        endTime: custom.schoolEndTime || masterSchedule?.schoolEndTime,
        periodsCount: custom.periods.length,
      };
    }
    return {
      isCustom: false,
      isHalfDay: false,
      name: "Standard Schedule",
      startTime: masterSchedule?.schoolStartTime,
      endTime: masterSchedule?.schoolEndTime,
      periodsCount: (masterSchedule?.periods || []).length,
    };
  };

  const activeDays = useMemo(() => {
    if (!masterSchedule?.days?.length) return DEFAULT_DAYS;
    return DEFAULT_DAYS.filter((d) => masterSchedule.days.includes(d.id));
  }, [masterSchedule]);

  const maxPeriodsCount = useMemo(() => {
    if (!masterSchedule) return 0;
    const counts = activeDays.map((d) => getPeriodsForDay(d.id).length);
    return counts.length > 0 ? Math.max(...counts, 0) : 0;
  }, [masterSchedule, activeDays]);

  const todayDayId = useMemo(() => getCurrentDayId(), []);

  // ─── Fetch timetable when class+section changes ───────────────────────────
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(`/periods/timetable?classSection=${encodeURIComponent(classSectionKey)}&scheduleType=regular`);
        const tt = res.data?.timetable;
        if (tt && Array.isArray(tt.allocations)) {
          const map = {};
          tt.allocations.forEach((item) => {
            map[`${item.day}_${item.periodOrder - 1}`] = {
              subject: item.subject || "",
              teacherId: item.teacherId || "",
              teacherName: item.teacherName || "",
              roomNo: item.roomNo || "",
              bookName: item.bookName || "",
              subjectCode: item.subjectCode || "",
            };
          });
          setAllocations(map);
        } else {
          setAllocations({});
        }
        setIsDirty(false);
        setIsEditMode(false);
      } catch {
        setAllocations({});
        setIsEditMode(false);
      }
    };
    fetchTimetable();
  }, [classSectionKey]);

  const hasAllocations = useMemo(() => {
    return Object.values(allocations).some(
      (a) => a && typeof a.subject === "string" && a.subject.trim().length > 0
    );
  }, [allocations]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleCellChange = (day, pIdx, field, val) => {
    setAllocations((prev) => {
      const existing = prev[`${day}_${pIdx}`] || {};
      if (field === "subject") {
        const matched = syllabusSubjects.find(
          (s) => (s.subjectName || "").trim().toLowerCase() === val.trim().toLowerCase()
        );
        return {
          ...prev,
          [`${day}_${pIdx}`]: {
            ...existing,
            subject: val,
            bookName: matched?.bookName || "",
            subjectCode: matched?.subjectCode || "",
          },
        };
      }
      return {
        ...prev,
        [`${day}_${pIdx}`]: { ...existing, [field]: val },
      };
    });
    setIsDirty(true);
  };

  const handleCellTeacherChange = (day, pIdx, teacherId) => {
    const tObj = teachersList.find((t) => String(t._id || t.id) === String(teacherId));
    setAllocations((prev) => ({
      ...prev,
      [`${day}_${pIdx}`]: { ...prev[`${day}_${pIdx}`], teacherId, teacherName: tObj ? tObj.name : "" },
    }));
    setIsDirty(true);
  };

  const handleCopyRowAcrossWeek = (pIdx) => {
    const monAlloc = allocations[`monday_${pIdx}`];
    if (!monAlloc?.subject) { toast.info("Set Monday subject first."); return; }
    setAllocations((prev) => {
      const next = { ...prev };
      activeDays.forEach((d) => {
        const dPeriods = getPeriodsForDay(d.id);
        if (d.id !== "monday" && pIdx < dPeriods.length) {
          next[`${d.id}_${pIdx}`] = { ...monAlloc };
        }
      });
      return next;
    });
    setIsDirty(true);
    toast.success(`Slot #${pIdx + 1} copied across all active days!`);
  };

  const handleCopyMondayToAll = () => {
    if (!masterSchedule) return;
    const monPeriods = getPeriodsForDay("monday");
    setAllocations((prev) => {
      const next = { ...prev };
      monPeriods.forEach((_, idx) => {
        const mon = prev[`monday_${idx}`];
        if (mon) {
          activeDays.forEach((d) => {
            const dPeriods = getPeriodsForDay(d.id);
            if (d.id !== "monday" && idx < dPeriods.length) {
              next[`${d.id}_${idx}`] = { ...mon };
            }
          });
        }
      });
      return next;
    });
    setIsDirty(true);
    toast.success("Monday schedule copied to all days (matching each day's slot count)!");
  };

  const handleOpenSlotModal = (day, periodIndex, period) => {
    const existing = allocations[`${day}_${periodIndex}`] || {};
    setEditSlotModal({ isOpen: true, day, periodIndex, period });
    setSlotForm({
      subject: existing.subject || "",
      teacherId: existing.teacherId || "",
      teacherName: existing.teacherName || "",
      roomNo: existing.roomNo || "",
      bookName: existing.bookName || getBookForSubject(existing.subject) || "",
      subjectCode: existing.subjectCode || getCodeForSubject(existing.subject) || "",
      applyToAllDays: true,
    });
  };

  const handleSaveSlotForm = () => {
    const { day, periodIndex } = editSlotModal;
    let teacherName = slotForm.teacherName;
    if (slotForm.teacherId) {
      const t = teachersList.find((t) => String(t._id || t.id) === String(slotForm.teacherId));
      if (t) teacherName = t.name;
    }
    const matched = syllabusSubjects.find(
      (s) => (s.subjectName || "").trim().toLowerCase() === (slotForm.subject || "").trim().toLowerCase()
    );
    const data = {
      ...slotForm,
      teacherName,
      bookName: slotForm.bookName || matched?.bookName || "",
      subjectCode: slotForm.subjectCode || matched?.subjectCode || "",
    };
    if (slotForm.applyToAllDays) {
      setAllocations((prev) => {
        const next = { ...prev };
        activeDays.forEach((d) => {
          const dPeriods = getPeriodsForDay(d.id);
          if (periodIndex < dPeriods.length) {
            next[`${d.id}_${periodIndex}`] = data;
          }
        });
        return next;
      });
      toast.success(`Slot #${periodIndex + 1} applied to all days!`);
    } else {
      setAllocations((prev) => ({ ...prev, [`${day}_${periodIndex}`]: data }));
      toast.success("Assignment updated.");
    }
    setIsDirty(true);
    setEditSlotModal({ isOpen: false, day: "monday", periodIndex: 0, period: null });
  };

  const handleClearSlot = () => {
    const { day, periodIndex } = editSlotModal;
    setAllocations((prev) => { const next = { ...prev }; delete next[`${day}_${periodIndex}`]; return next; });
    setIsDirty(true);
    setEditSlotModal({ isOpen: false, day: "monday", periodIndex: 0, period: null });
    toast.info("Slot cleared.");
  };

  const handleSave = async () => {
    if (!masterSchedule?.periods?.length) {
      toast.error("Configure Master Period & Timetable first.");
      return;
    }
    setSaving(true);
    try {
      const allocationsArray = [];
      activeDays.forEach((dayObj) => {
        const dayPeriods = getPeriodsForDay(dayObj.id);
        dayPeriods.forEach((period, idx) => {
          const alloc = allocations[`${dayObj.id}_${idx}`];
          const matchedSyl = syllabusSubjects.find(
            (s) => (s.subjectName || "").trim().toLowerCase() === (alloc?.subject || "").trim().toLowerCase()
          );
          allocationsArray.push({
            day: dayObj.id,
            periodOrder: idx + 1,
            periodId: period._id || `p-${dayObj.id}-${idx}`,
            periodType: period.type || "class",
            customLabel: period.customLabel || "",
            startTime: period.startTime || "",
            endTime: period.endTime || "",
            subject: alloc?.subject || "",
            teacherId: alloc?.teacherId || "",
            teacherName: alloc?.teacherName || "",
            roomNo: alloc?.roomNo || "",
            bookName: alloc?.bookName || matchedSyl?.bookName || "",
            subjectCode: alloc?.subjectCode || matchedSyl?.subjectCode || "",
          });
        });
      });
      const payload = {
        classSectionKey,
        classId: CLASS_OPTIONS.find((c) => c.name === selectedClass)?.id || "",
        sectionId: SECTION_OPTIONS.find((s) => s.name === selectedSection)?.id || "",
        className: selectedClass,
        sectionName: selectedSection,
        scheduleType: "regular",
        allocations: allocationsArray,
      };
      const res = await api.post("/periods/timetable", payload);
      if (res.data?.success) {
        toast.success(`Timetable for ${classSectionKey} saved!`);
        setIsDirty(false);
        setIsEditMode(false); // Return to View-Only mode after saving!
        fetchAllTimetables(); // Sync directory table
      } else {
        toast.error(res.data?.message || "Failed to save.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving timetable.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete entire timetable for ${classSectionKey}?`)) return;
    try {
      const res = await api.delete(`/periods/timetable/${encodeURIComponent(classSectionKey)}`);
      if (res.data?.success) {
        toast.success(`Timetable deleted.`);
        setAllocations({});
        setIsDirty(false);
        setIsEditMode(false);
        fetchAllTimetables(); // Sync directory table
      } else {
        toast.error(res.data?.message || "Failed to delete.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    }
  };

  const handleExportCSV = () => {
    if (!masterSchedule) return;
    let csv = `Timetable for ${classSectionKey}\n\nPeriod Slot,` + activeDays.map((d) => d.label).join(",") + "\n";
    for (let pIdx = 0; pIdx < maxPeriodsCount; pIdx++) {
      let line = `"Slot #${pIdx + 1}"`;
      activeDays.forEach((d) => {
        const dPeriods = getPeriodsForDay(d.id);
        const period = dPeriods[pIdx];
        if (!period) {
          line += `,"[ Day Ended / Dismissed ]"`;
        } else if (period.type !== "class") {
          line += `,"[ ${period.customLabel || getMeta(period.type).label} (${period.startTime}-${period.endTime}) ]"`;
        } else {
          const alloc = allocations[`${d.id}_${pIdx}`];
          if (alloc?.subject) {
            const bk = alloc.bookName || getBookForSubject(alloc.subject);
            line += `,"${alloc.subject}${bk ? ` [Book: ${bk}]` : ""} (${alloc.teacherName || "No Teacher"})"`;
          } else {
            line += `,"Free Period (${period.startTime}-${period.endTime})"`;
          }
        }
      });
      csv += line + "\n";
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `${classSectionKey.replace(/\s+/g, "_")}_Timetable.csv`;
    a.click();
    toast.success("Exported as CSV!");
  };

  // ─── Directory Row Actions ────────────────────────────────────────────────
  const handleViewTimetable = (row) => {
    const cName = row.className || (row.classSectionKey ? row.classSectionKey.split(" - ")[0] : "Class 10");
    const sName = row.sectionName || (row.classSectionKey ? row.classSectionKey.split(" - ")[1] : "Section A");
    setSelectedClass(cName);
    setSelectedSection(sName);
    setIsEditMode(false);
    setActiveMainTab("builder");
  };

  const handleEditTimetable = (row) => {
    const cName = row.className || (row.classSectionKey ? row.classSectionKey.split(" - ")[0] : "Class 10");
    const sName = row.sectionName || (row.classSectionKey ? row.classSectionKey.split(" - ")[1] : "Section A");
    setSelectedClass(cName);
    setSelectedSection(sName);
    setIsEditMode(true);
    setActiveMainTab("builder");
  };

  const handleDeleteTimetableRow = async (row) => {
    const key = row.classSectionKey || `${row.className} - ${row.sectionName}` || row._id;
    if (!window.confirm(`Are you sure you want to delete the timetable for ${key}?`)) return;
    try {
      const res = await api.delete(`/periods/timetable/${encodeURIComponent(key)}`);
      if (res.data?.success) {
        toast.success(`Timetable for ${key} deleted.`);
        fetchAllTimetables();
        if (classSectionKey === key) {
          setAllocations({});
          setIsDirty(false);
          setIsEditMode(false);
        }
      } else {
        toast.error(res.data?.message || "Failed to delete.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete timetable.");
    }
  };

  // ─── Timetable Directory Columns for Global DataTable ────────────────────
  const timetableColumns = useMemo(() => [
    {
      key: "classSectionKey",
      label: "Class & Section",
      sortable: true,
      render: (val, row) => {
        const cName = row.className || (row.classSectionKey ? row.classSectionKey.split(" - ")[0] : "Class");
        const sName = row.sectionName || (row.classSectionKey ? row.classSectionKey.split(" - ")[1] : "");
        const numBadge = cName.replace(/[^0-9]/g, "") || cName.substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/80 dark:to-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center font-black text-indigo-700 dark:text-indigo-300 text-sm shadow-xs shrink-0">
              {numBadge}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {cName}
                </span>
                {sName && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {sName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                {row.classSectionKey || `${cName} - ${sName}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "allocationsCount",
      label: "Slots Configured",
      sortable: true,
      render: (_, row) => {
        const allocs = Array.isArray(row.allocations) ? row.allocations : [];
        const filledSlots = allocs.filter((a) => a && typeof a.subject === "string" && a.subject.trim().length > 0);
        const count = filledSlots.length;
        const totalClassPeriods = activeDays.reduce((acc, d) => {
          return acc + getPeriodsForDay(d.id).filter((p) => p.type === "class").length;
        }, 0) || 40;
        const percent = Math.min(100, Math.round((count / (totalClassPeriods || 1)) * 100));

        const isComplete = count >= totalClassPeriods && totalClassPeriods > 0;
        const isPartial = count > 0;

        return (
          <div className="space-y-1.5 min-w-[150px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-800 dark:text-slate-200">
                {count} <span className="font-normal text-slate-400">/ {totalClassPeriods} slots</span>
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                  isComplete
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : isPartial
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isComplete ? "Complete" : isPartial ? `${percent}%` : "Draft"}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? "bg-emerald-500" : isPartial ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "subjects",
      label: "Prescribed Subjects",
      render: (_, row) => {
        const allocs = Array.isArray(row.allocations) ? row.allocations : [];
        const uniqueSubjects = Array.from(
          new Set(allocs.map((a) => a?.subject?.trim()).filter(Boolean))
        );

        if (uniqueSubjects.length === 0) {
          return <span className="text-slate-400 italic text-[11px]">No subjects assigned</span>;
        }

        const display = uniqueSubjects.slice(0, 3);
        const remaining = uniqueSubjects.length - display.length;

        return (
          <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
            {display.map((sub, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[130px]"
                title={sub}
              >
                {sub}
              </span>
            ))}
            {remaining > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                +{remaining} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "teachers",
      label: "Faculty",
      render: (_, row) => {
        const allocs = Array.isArray(row.allocations) ? row.allocations : [];
        const uniqueTeachers = Array.from(
          new Set(allocs.map((a) => a?.teacherName?.trim()).filter(Boolean))
        );

        if (uniqueTeachers.length === 0) {
          return <span className="text-slate-400 italic text-[11px]">None assigned</span>;
        }

        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <UserCheck size={14} className="text-emerald-500 shrink-0" />
            <span>
              {uniqueTeachers.length} {uniqueTeachers.length === 1 ? "Faculty" : "Teachers"}
            </span>
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Last Modified",
      sortable: true,
      render: (val, row) => {
        const dateVal = row.updatedAt || row.createdAt;
        if (!dateVal) return <span className="text-slate-400">—</span>;
        const d = new Date(dateVal);
        return (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <span className="font-semibold block text-slate-700 dark:text-slate-300">
              {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-[10px] text-slate-400">
              {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTimetable(row);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
              title="View Timetable in Read-Only Mode"
            >
              <Eye size={13} />
              <span>View</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTimetable(row);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                title="Edit Timetable Assignments"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTimetableRow(row);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="Delete Timetable"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [activeDays, canEdit, masterSchedule]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Main Tab Navigation Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMainTab("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMainTab === "directory"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <CalendarDays size={15} />
            <span>All Created Timetables</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeMainTab === "directory"
                  ? "bg-white/20 text-white"
                  : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
              }`}
            >
              {allTimetables.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("builder")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMainTab === "builder"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Grid size={15} />
            <span>Timetable Builder & Weekly Matrix</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeMainTab === "builder"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {classSectionKey}
            </span>
          </button>
        </div>

        {/* Tab Shortcut Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeMainTab === "directory" ? (
            canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(true);
                  setActiveMainTab("builder");
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-xs text-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Build New Timetable</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setActiveMainTab("directory")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Directory</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB 1: ALL CREATED TIMETABLES DIRECTORY (DATA TABLE) ─────────── */}
      {activeMainTab === "directory" && (
        <DataTable
          title="All Created Class Timetables"
          subtitle="Institutional directory of class schedules generated from Master Period. Click View or Edit to open any timetable."
          badge={`${allTimetables.length} Timetables`}
          icon={CalendarDays}
          columns={timetableColumns}
          data={allTimetables}
          loading={loadingAllTimetables}
          searchable={true}
          searchPlaceholder="Search timetables by class, section, teacher, or subject..."
          pagination={true}
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
          headerActions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAllTimetables}
                disabled={loadingAllTimetables}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Refresh Timetables List"
              >
                <RefreshCw size={13} className={loadingAllTimetables ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(true);
                    setActiveMainTab("builder");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Build Timetable</span>
                </button>
              )}
            </div>
          }
          emptyTitle="No Class Timetables Created Yet"
          emptyDescription="No class timetables have been built yet. Click the button below to select a class and section to start building."
          emptyAction={
            canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(true);
                  setActiveMainTab("builder");
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition cursor-pointer"
              >
                <Plus size={15} /> Build First Timetable
              </button>
            ) : null
          }
          onRowClick={(row) => handleViewTimetable(row)}
        />
      )}

      {/* ─── TAB 2: TIMETABLE BUILDER & WEEKLY MATRIX ──────────────────────── */}
      {activeMainTab === "builder" && (
        <div className="space-y-6">

      {/* ── Master Period Info Banner ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white rounded-2xl p-5 shadow-md border border-indigo-500/20 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/25">
              Based on Master Period
            </span>
            {masterSchedule && (
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={13} /> {masterSchedule.name}
              </span>
            )}
            {masterSchedule?.daySchedules?.saturday?.enabled && (
              <span className="px-2 py-0.5 rounded-md bg-amber-300 text-amber-950 text-[10px] font-black uppercase">
                Saturday Half-Day Active
              </span>
            )}
            {!masterSchedule && !loadingSchedule && (
              <span className="text-xs font-semibold text-amber-300">
                ⚠ No master period configured yet — set it up in "Master Period & Timetable" first
              </span>
            )}
          </div>
          <h3 className="text-base font-black flex items-center gap-2">
            <Clock size={18} className="text-indigo-200" />
            {loadingSchedule ? "Loading..." : masterSchedule
              ? `${masterSchedule.schoolStartTime} – ${masterSchedule.schoolEndTime}`
              : "Not configured"}
          </h3>
          <p className="text-xs text-indigo-200/80">
            Prayer, Lunch, Recess and Activity periods are universal — each day follows its exact master slots (including Saturday Half-Day).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/15 backdrop-blur px-3.5 py-2 rounded-xl border border-white/20 text-xs flex items-center gap-2 font-medium">
            <Layers size={14} className="text-indigo-200" /> Max Slots:
            <span className="font-extrabold text-white">{maxPeriodsCount}</span>
          </div>
          <div className="bg-white/15 backdrop-blur px-3.5 py-2 rounded-xl border border-white/20 text-xs flex items-center gap-2 font-medium">
            <UserCheck size={14} className="text-emerald-200" /> Teachers:
            <span className="font-extrabold text-white">{teachersList.length}</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        {/* Class + Section picker & Syllabus Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-indigo-500" />
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setIsDirty(false); setIsEditMode(false); }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {CLASS_OPTIONS.filter((c) => !c.isPassout).map((cls) => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Section:</label>
          <select
            value={selectedSection}
            onChange={(e) => { setSelectedSection(e.target.value); setIsDirty(false); setIsEditMode(false); }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {SECTION_OPTIONS.map((sec) => (
              <option key={sec.id} value={sec.name}>{sec.name}</option>
            ))}
          </select>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            📋 {classSectionKey}
          </span>

          {/* ── Class Syllabus & Prescribed Books Pill Button ── */}
          <button
            type="button"
            onClick={() => setShowSyllabusModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-sm transition-all cursor-pointer"
            title={`Click to view prescribed syllabus books for ${selectedClass}`}
          >
            <BookOpen size={13} className="text-amber-600 dark:text-amber-400" />
            <span>
              {syllabusLoading
                ? "Loading syllabus..."
                : `${selectedClass}: ${syllabusSubjects.length} Prescribed Books`}
            </span>
            <span className="text-[10px] bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded-full font-mono font-extrabold">
              {syllabusData?.isDefaultTemplate ? "Standard" : "Custom"}
            </span>
          </button>
        </div>

        {/* View switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: "weekly",  icon: <Grid size={14} />,      label: "Weekly Matrix" },
            { id: "daily",   icon: <List size={14} />,      label: "Daily View" },
            { id: "teacher", icon: <User size={14} />,      label: "Teacher" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === v.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Actions: View Mode vs Edit Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && isEditMode && viewMode !== "teacher" && (
            <button
              onClick={handleCopyMondayToAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Sparkles size={13} className="text-indigo-500" /> Copy Mon → All Days
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          {canEdit && hasAllocations && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}

          {/* Edit / View Mode Buttons */}
          {canEdit ? (
            !isEditMode ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2 rounded-xl shadow-md text-xs transition cursor-pointer"
              >
                <Edit3 size={14} /> {hasAllocations ? "Edit Timetable" : "Create Timetable"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setIsDirty(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 text-white font-extrabold px-5 py-2 rounded-xl shadow-md transition-all text-xs cursor-pointer ${
                    isDirty
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 animate-pulse"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
                  }`}
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : isDirty ? "Save (Unsaved)" : "Save Timetable"}
                </button>
              </div>
            )
          ) : (
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-200 flex items-center gap-1.5">
              <Lock size={13} className="text-indigo-500" /> Read-Only
            </span>
          )}
        </div>
      </div>

      {/* Day tabs (daily view only) */}
      {viewMode === "daily" && (
        <div className="flex flex-wrap items-center gap-2">
          {activeDays.map((day) => {
            const isToday = day.id === todayDayId;
            const isSel   = selectedDay === day.id;
            const dInfo   = getDayInfo(day.id);
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{day.label}</span>
                {dInfo.isCustom && (
                  <span className={`text-[9px] px-1.5 rounded-full font-black uppercase ${isSel ? "bg-amber-300 text-amber-950" : "bg-amber-100 text-amber-800"}`}>
                    {dInfo.isHalfDay ? "Half Day" : "Custom"}
                  </span>
                )}
                {isToday && (
                  <span className={`text-[9px] px-1.5 rounded-full font-black uppercase ${isSel ? "bg-white/30 text-white" : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"}`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      {loadingSchedule ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading master period structure...</p>
        </div>
      ) : !masterSchedule?.periods?.length ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-200">
            <Clock size={28} />
          </div>
          <div className="text-center max-w-sm space-y-1.5">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No Master Period Configured</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Go to <strong>Settings → Master Period & Timetable</strong> to configure the daily period structure first, then return here to assign subjects and teachers per class.
            </p>
          </div>
        </div>
      ) : !hasAllocations && !isEditMode && canEdit ? (
        // ── UNCONFIGURED / NOT CONFIGURED YET STATE ──
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800/60 shadow-inner">
            <Calendar size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200">
              Not Configured Yet
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No Timetable Configured for {classSectionKey}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This class section does not have an active timetable schedule yet. Start building it using the <strong>{masterSchedule?.name || "Master Period"}</strong> structure.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs transition cursor-pointer"
          >
            <Plus size={15} /> Build / Configure Timetable for {classSectionKey}
          </button>
        </div>
      ) : (
        <>
          {/* ─── VIEW 1: Weekly Matrix ─────────────────────────────────────── */}
          {viewMode === "weekly" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase border border-indigo-200 dark:border-indigo-900/50">
                      {isEditMode ? "Edit Mode Active" : "View-Only Mode"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">• {classSectionKey}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                    {isEditMode ? "Assign Subjects & Teachers for the Week" : "Weekly Timetable Schedule"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Subjects loaded from <strong>{selectedClass} Syllabus & Books</strong>. Saturday and custom days follow their specific slot counts automatically.
                  </p>
                </div>

                {!isEditMode && canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 size={13} /> Edit Timetable
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                      <th className="p-3 text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[130px]">Slot #</th>
                      {activeDays.map((d) => {
                        const dInfo = getDayInfo(d.id);
                        return (
                          <th key={d.id} className="p-3 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center min-w-[175px]">
                            <div className="flex flex-col items-center">
                              <span className="flex items-center gap-1">
                                {d.label}
                                {d.id === todayDayId && (
                                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-black uppercase border border-emerald-300">Today</span>
                                )}
                              </span>
                              {dInfo.isCustom && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                                  {dInfo.isHalfDay ? "Half Day" : "Custom"} ({dInfo.periodsCount}p)
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Array.from({ length: maxPeriodsCount }).map((_, pIdx) => {
                      return (
                        <tr key={pIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          {/* Slot Info Header */}
                          <td className="p-3 border-r border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 align-top">
                            <div className="space-y-1">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">Slot #{pIdx + 1}</span>
                              {canEdit && isEditMode && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyRowAcrossWeek(pIdx)}
                                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 pt-0.5"
                                  title="Copy Monday's subject & teacher to all active days for this slot"
                                >
                                  <Sparkles size={10} /> Copy Mon → Week
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Day Columns */}
                          {activeDays.map((d) => {
                            const dPeriods = getPeriodsForDay(d.id);
                            const period = dPeriods[pIdx];

                            if (!period) {
                              const dInfo = getDayInfo(d.id);
                              return (
                                <td key={d.id} className="p-3 border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 text-center align-middle bg-slate-100/50 dark:bg-slate-800/20">
                                  <span className="text-[10px] text-slate-400 font-semibold italic flex items-center justify-center gap-1">
                                    <span>🏁</span> Day Ended ({dInfo.endTime})
                                  </span>
                                </td>
                              );
                            }

                            const meta = getMeta(period.type);
                            const isClass = period.type === "class";
                            const alloc = allocations[`${d.id}_${pIdx}`] || {};
                            const bookDisplay = alloc.bookName || getBookForSubject(alloc.subject);

                            if (!isClass) {
                              return (
                                <td key={d.id} className="p-3 border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 text-center align-middle bg-slate-50/30 dark:bg-slate-800/10">
                                  <div className="text-xl">{meta.icon}</div>
                                  <span className={`text-[11px] font-bold ${meta.text}`}>
                                    {period.customLabel || meta.label}
                                  </span>
                                  <p className="text-[9px] font-mono text-slate-400 mt-0.5">{period.startTime} – {period.endTime}</p>
                                </td>
                              );
                            }

                            const cellEditable = canEdit && isEditMode;

                            return (
                              <td key={d.id} className="p-2 border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 align-top">
                                {!cellEditable ? (
                                  // ── VIEW-ONLY CELL ──
                                  <div className="p-2.5 rounded-xl border border-indigo-200/80 dark:border-slate-800 bg-indigo-50/40 dark:bg-slate-800/30 space-y-1">
                                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-indigo-100 dark:border-slate-800 pb-0.5 mb-1">
                                      <span>{period.startTime} – {period.endTime}</span>
                                      <span className="font-extrabold uppercase text-indigo-500">#{pIdx + 1}</span>
                                    </div>
                                    {alloc.subject ? (
                                      <>
                                        <div className="flex items-center gap-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                                          <BookOpen size={11} /> <span className="truncate">{alloc.subject}</span>
                                        </div>
                                        {bookDisplay && (
                                          <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate" title={`Prescribed Book: ${bookDisplay}`}>
                                            <span className="text-[9px]">📖</span>
                                            <span className="truncate">{bookDisplay}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                                          <User size={10} className="text-emerald-600" /> <span className="truncate">{alloc.teacherName || "No Teacher"}</span>
                                        </div>
                                        {alloc.roomNo && <div className="text-[10px] text-slate-400 font-mono">{alloc.roomNo}</div>}
                                      </>
                                    ) : (
                                      <div className="py-2 text-center"><span className="text-[10px] text-slate-400 italic">Free Period</span></div>
                                    )}
                                  </div>
                                ) : (
                                  // ── EDIT CELL ──
                                  <div className="space-y-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/30 transition-all">
                                    <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                                      <span>{period.startTime} – {period.endTime}</span>
                                      <span className="font-bold text-indigo-500">#{pIdx + 1}</span>
                                    </div>
                                    <select
                                      value={alloc.subject || ""}
                                      onChange={(e) => handleCellChange(d.id, pIdx, "subject", e.target.value)}
                                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                      <option value="">-- Subject --</option>
                                      {syllabusSubjects.length > 0 && (
                                        <optgroup label={`📚 ${selectedClass} Syllabus & Books (${syllabusSubjects.length})`}>
                                          {syllabusSubjects.map((sub, i) => (
                                            <option key={`syl-${i}`} value={sub.subjectName}>
                                              {sub.subjectName} {sub.bookName ? `— 📖 ${sub.bookName}` : ""}
                                            </option>
                                          ))}
                                        </optgroup>
                                      )}
                                      {otherSubjects.length > 0 && (
                                        <optgroup label="📋 Other School Subjects">
                                          {otherSubjects.map((sub, i) => (
                                            <option key={`oth-${i}`} value={sub}>{sub}</option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </select>

                                    {bookDisplay && (
                                      <div
                                        className="text-[9px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 flex items-center gap-1 truncate shadow-xs"
                                        title={`Prescribed Textbook for ${alloc.subject}: ${bookDisplay}`}
                                      >
                                        <span className="text-[8px]">📖</span>
                                        <span className="truncate font-semibold">{bookDisplay}</span>
                                      </div>
                                    )}

                                    <select
                                      value={alloc.teacherId || ""}
                                      onChange={(e) => handleCellTeacherChange(d.id, pIdx, e.target.value)}
                                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2 py-1 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                      <option value="">-- Teacher --</option>
                                      {teachersList.map((t) => (
                                        <option key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.employeeId || "EMP"})</option>
                                      ))}
                                    </select>

                                    <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
                                      <span className="font-mono flex items-center gap-0.5">
                                        <MapPin size={9} /> {alloc.roomNo || "Room —"}
                                      </span>
                                      <button onClick={() => handleOpenSlotModal(d.id, pIdx, period)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">More ✎</button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── VIEW 2: Daily Cards ──────────────────────────────────────── */}
          {viewMode === "daily" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={15} className="text-indigo-500" />
                    {activeDays.find((d) => d.id === selectedDay)?.label} — {classSectionKey}
                    {selectedDay === todayDayId && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-300">Today</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getDayInfo(selectedDay).isCustom
                      ? `${getDayInfo(selectedDay).isHalfDay ? "Half Day Schedule" : getDayInfo(selectedDay).name} (${getDayInfo(selectedDay).startTime} – ${getDayInfo(selectedDay).endTime}) • ${getDayInfo(selectedDay).periodsCount} slots`
                      : `Standard Schedule (${masterSchedule.schoolStartTime} – ${masterSchedule.schoolEndTime}) • ${getPeriodsForDay(selectedDay).length} slots`}
                  </p>
                </div>

                {!isEditMode && canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                  >
                    <Edit3 size={13} /> Edit Timetable
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getPeriodsForDay(selectedDay).map((period, idx) => {
                  const meta    = getMeta(period.type);
                  const alloc   = allocations[`${selectedDay}_${idx}`] || {};
                  const isClass = period.type === "class";
                  const bookDisplay = alloc.bookName || getBookForSubject(alloc.subject);

                  return (
                    <div
                      key={idx}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                        isClass ? "border-slate-200 dark:border-slate-800 hover:shadow-md" : `${meta.border} bg-slate-50/50 dark:bg-slate-900/50`
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.bg} ${meta.text} ${meta.border}`}>
                              {period.customLabel || meta.label}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Slot #{idx + 1}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 flex items-center gap-1">
                            <Clock size={12} className="text-indigo-600" /> {period.startTime} – {period.endTime}
                          </span>
                        </div>

                        {isClass ? (
                          alloc.subject ? (
                            <div className="space-y-2">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen size={16} className="text-indigo-600" /> {alloc.subject}
                              </h4>
                              {bookDisplay && (
                                <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1.5">
                                  <span>📖</span>
                                  <span className="truncate font-semibold">{bookDisplay}</span>
                                </p>
                              )}
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                <User size={13} className="text-emerald-600" />
                                {alloc.teacherName ? <span className="font-semibold text-slate-700 dark:text-slate-200">{alloc.teacherName}</span> : <span className="text-amber-600 italic">No Teacher Assigned</span>}
                              </p>
                              <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                                  <MapPin size={12} className="text-rose-500" /> {alloc.roomNo || "Default Room"}
                                </span>
                                <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">Assigned</span>
                              </div>
                            </div>
                          ) : (
                            <div className="py-5 text-center space-y-2">
                              <p className="text-xs font-semibold text-slate-400 italic">No subject assigned yet.</p>
                              {canEdit && (
                                <button
                                  onClick={() => handleOpenSlotModal(selectedDay, idx, period)}
                                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-200 hover:scale-[1.02] transition-all cursor-pointer"
                                >
                                  <Plus size={14} /> Assign Subject & Teacher
                                </button>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="py-5 text-center space-y-1.5">
                            <span className="text-2xl block">{meta.icon}</span>
                            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{period.customLabel || `${meta.label}`}</p>
                            <p className="text-[11px] text-slate-500 font-medium italic">Universal slot</p>
                          </div>
                        )}
                      </div>

                      {isClass && canEdit && (
                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() => handleOpenSlotModal(selectedDay, idx, period)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            {alloc.subject ? "✎ Edit" : "+ Assign"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── VIEW 3: Teacher Schedule Inspector ───────────────────────── */}
          {viewMode === "teacher" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Teacher Workload Inspector</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View all periods assigned to a teacher in {classSectionKey}</p>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-indigo-500" />
                  <select
                    value={selectedTeacherFilter}
                    onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[240px]"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachersList.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} ({t.employeeId || "EMP"}) {t.designation ? `- ${t.designation}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedTeacherFilter ? (
                <div className="py-16 text-center space-y-2 text-slate-400">
                  <UserCheck size={32} className="mx-auto text-indigo-400 opacity-60" />
                  <p className="text-sm font-semibold">Select a teacher to view their schedule in {classSectionKey}.</p>
                </div>
              ) : (() => {
                const selObj = teachersList.find((t) => String(t._id || t.id) === String(selectedTeacherFilter));
                const matches = [];
                activeDays.forEach((d) => {
                  const dPeriods = getPeriodsForDay(d.id);
                  dPeriods.forEach((period, idx) => {
                    const alloc = allocations[`${d.id}_${idx}`];
                    if (alloc && ((alloc.teacherId && String(alloc.teacherId) === String(selectedTeacherFilter)) || (selObj?.name && alloc.teacherName?.toLowerCase() === selObj.name.toLowerCase()))) {
                      matches.push({
                        day: d.label,
                        slotOrder: idx + 1,
                        timeStr: `${period.startTime} – ${period.endTime}`,
                        subject: alloc.subject,
                        bookName: alloc.bookName || getBookForSubject(alloc.subject),
                        roomNo: alloc.roomNo || "—",
                      });
                    }
                  });
                });
                return (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                        {selObj?.name?.[0] || "T"}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{selObj?.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selObj?.employeeId || "N/A"} • {selObj?.designation || "Teacher"} •{" "}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{matches.length} period(s) in {classSectionKey}</span>
                        </p>
                      </div>
                    </div>
                    {matches.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 py-8 italic">No periods assigned in {classSectionKey}.</p>
                    ) : (
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                            {["Day", "Slot # / Time", "Subject & Prescribed Book", "Room"].map((h) => (
                              <th key={h} className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {matches.map((m, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{m.day}</td>
                              <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">#{m.slotOrder} ({m.timeStr})</td>
                              <td className="p-3">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{m.subject}</div>
                                {m.bookName && (
                                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                    📖 {m.bookName}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 font-mono text-slate-500">{m.roomNo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
        </div>
      )}

      {/* ── Slot Edit Modal ──────────────────────────────────────────────── */}
      {editSlotModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 text-[10px] font-extrabold uppercase border border-indigo-200">{classSectionKey}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">{editSlotModal.day}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Assign Slot #{editSlotModal.periodIndex + 1} ({editSlotModal.period?.startTime} – {editSlotModal.period?.endTime})
                </h3>
              </div>
              <button onClick={() => setEditSlotModal({ isOpen: false, day: "monday", periodIndex: 0, period: null })} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Teacher */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">Assigned Teacher</label>
                <select
                  value={slotForm.teacherId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const obj = teachersList.find((t) => String(t._id || t.id) === String(id));
                    setSlotForm((prev) => ({ ...prev, teacherId: id, teacherName: obj ? obj.name : "" }));
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachersList.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.name} ({t.employeeId || "EMP"}) {t.designation ? `- ${t.designation}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Subject ({selectedClass} Syllabus)
                  </label>
                  {(slotForm.bookName || getBookForSubject(slotForm.subject)) && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                      📖 Prescribed Book Linked
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    value={slotForm.subject || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = syllabusSubjects.find(
                        (s) => (s.subjectName || "").trim().toLowerCase() === val.trim().toLowerCase()
                      );
                      setSlotForm((prev) => ({
                        ...prev,
                        subject: val,
                        bookName: matched?.bookName || "",
                        subjectCode: matched?.subjectCode || "",
                      }));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Subject from Class Syllabus --</option>
                    {syllabusSubjects.length > 0 && (
                      <optgroup label={`📚 ${selectedClass} Syllabus & Books (${syllabusSubjects.length})`}>
                        {syllabusSubjects.map((sub, i) => (
                          <option key={`modal-syl-${i}`} value={sub.subjectName}>
                            {sub.subjectName} {sub.bookName ? `— 📖 ${sub.bookName}` : ""} {sub.subjectCode ? `(${sub.subjectCode})` : ""}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherSubjects.length > 0 && (
                      <optgroup label="📋 Other School Subjects">
                        {otherSubjects.map((sub, i) => (
                          <option key={`modal-oth-${i}`} value={sub}>{sub}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {/* Prescribed book preview banner */}
                  {(slotForm.bookName || getBookForSubject(slotForm.subject)) && (
                    <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                        <span>📖 Prescribed Book:</span>
                        <span className="font-extrabold">{slotForm.bookName || getBookForSubject(slotForm.subject)}</span>
                      </div>
                      {(() => {
                        const matched = syllabusSubjects.find(
                          (s) => (s.subjectName || "").trim().toLowerCase() === (slotForm.subject || "").trim().toLowerCase()
                        );
                        if (!matched) return null;
                        return (
                          <div className="text-[11px] text-amber-800 dark:text-amber-300 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                            {matched.author && <span><strong>Author:</strong> {matched.author}</span>}
                            {matched.publisher && <span><strong>Publisher:</strong> {matched.publisher}</span>}
                            {matched.subjectCode && <span><strong>Code:</strong> {matched.subjectCode}</span>}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Or type custom subject (e.g. Robotics, Debate)"
                    value={slotForm.subject}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = syllabusSubjects.find(
                        (s) => (s.subjectName || "").trim().toLowerCase() === val.trim().toLowerCase()
                      );
                      setSlotForm((prev) => ({
                        ...prev,
                        subject: val,
                        bookName: matched?.bookName || "",
                        subjectCode: matched?.subjectCode || "",
                      }));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. Room 301 or Physics Lab"
                  value={slotForm.roomNo}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, roomNo: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Apply all days */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(slotForm.applyToAllDays)}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, applyToAllDays: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Auto-apply to all active school days
                  </span>
                  <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 block leading-relaxed">
                    Same teacher, subject & prescribed book will be set for Slot #{editSlotModal.periodIndex + 1} across all days that have this slot.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={handleClearSlot} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline px-2 py-1 cursor-pointer">
                <Trash2 size={14} /> Clear Slot
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditSlotModal({ isOpen: false, day: "monday", periodIndex: 0, period: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlotForm}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Apply Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Class Syllabus & Prescribed Books Modal ──────────────────────── */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedClass} — Syllabus & Prescribed Books
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      {syllabusData?.isDefaultTemplate ? "National Standard" : "Custom School Config"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    These subjects and prescribed books populate the Timetable Builder for {selectedClass}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {syllabusSubjects.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BookMarked size={32} className="mx-auto text-amber-500 opacity-60" />
                  <p className="text-sm font-semibold">No syllabus configured for {selectedClass}.</p>
                  <p className="text-xs">You can configure subjects and textbooks in Settings → Class Syllabus & Books.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {syllabusSubjects.map((sub, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <BookOpen size={13} className="text-indigo-600" />
                          {sub.subjectName}
                        </span>
                        {sub.subjectCode && (
                          <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                            {sub.subjectCode}
                          </span>
                        )}
                      </div>

                      {sub.bookName ? (
                        <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-start gap-1">
                          <span className="text-[11px] mt-0.5">📖</span>
                          <span>{sub.bookName}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No book name specified</div>
                      )}

                      {(sub.author || sub.publisher) && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {sub.author && <span>By {sub.author}</span>}
                          {sub.author && sub.publisher && <span> • </span>}
                          {sub.publisher && <span>Pub: {sub.publisher}</span>}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <span>Max: <strong className="text-slate-700 dark:text-slate-300">{sub.maxMarks || 100}</strong></span>
                        <span>Pass: <strong className="text-emerald-600 font-bold">{sub.passMarks || 35}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">
                Academic Year: <strong>{syllabusData?.academicYear || "Current"}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSyllabusModal(false);
                    navigate("/settings?tab=syllabus");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800/80 transition-all cursor-pointer"
                >
                  <ExternalLink size={13} />
                  Configure Books & Syllabus in Settings
                </button>
                <button
                  type="button"
                  onClick={() => setShowSyllabusModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTimetableSettings;
