import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Download,
  Plus,
  Filter,
  Edit3,
  Save,
  RefreshCw,
  Layers,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Search,
  Grid,
  List,
  Printer,
  Trash2,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import api from "../../services/api.js";
import { CLASS_OPTIONS } from "../../constants/academicOptions.js";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";

// Category meta definitions matching Master Period settings
const PERIOD_META = {
  prayer: {
    label: "Prayer",
    icon: "🙏",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  class: {
    label: "Class",
    icon: "📚",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/50",
  },
  pt: {
    label: "PT / Sports",
    icon: "🏃",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  lunch: {
    label: "Lunch",
    icon: "🍱",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800/50",
  },
  dance: {
    label: "Dance",
    icon: "💃",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800/50",
  },
  activities: {
    label: "Activity",
    icon: "🎨",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/50",
  },
  singing: {
    label: "Music",
    icon: "🎵",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/50",
  },
  recess: {
    label: "Recess",
    icon: "☕",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800/50",
  },
  leave: {
    label: "Leave",
    icon: "🚌",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/50",
  },
  custom: {
    label: "Custom",
    icon: "⚡",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-700",
  },
};

const getMeta = (type) => PERIOD_META[type] || PERIOD_META.custom;

const DEFAULT_DAYS = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
];

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English Literature",
  "Science / Physics",
  "Chemistry",
  "Biology",
  "Social Studies / History",
  "Computer Science",
  "Hindi / Regional",
  "Physical Education",
  "Art & Craft",
];

const getCurrentDayId = () => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = dayNames[new Date().getDay()];
  return todayName === "sunday" ? "monday" : todayName;
};

const TimetableManagement = () => {
  // Auth User & Role Permissions
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = useMemo(
    () => authUser || getUserFromStorage() || {},
    [authUser]
  );
  const userRole = useMemo(
    () => (currentUser?.role || getUserRole(currentUser) || "").toLowerCase(),
    [currentUser]
  );

  // Edit Rights: SuperAdmin, SchoolAdmin, Admin, Principal can edit
  const canEdit = useMemo(() => {
    return ["super-admin", "school-admin", "admin", "principal"].includes(
      userRole
    );
  }, [userRole]);

  const isStudent = userRole === "student";

  // Determine Student's Enrolled Class
  const studentEnrolledClass = useMemo(() => {
    const rawCls =
      currentUser?.className ||
      currentUser?.class ||
      currentUser?.studentClass ||
      currentUser?.enrolledClass ||
      "Class 10";
    const namePart = String(rawCls).split(" - ")[0].trim();
    const match = CLASS_OPTIONS.find(
      (c) =>
        c.name.toLowerCase() === namePart.toLowerCase() ||
        c.id.toLowerCase() === namePart.toLowerCase()
    );
    return match ? match.name : namePart || "Class 10";
  }, [currentUser]);

  // Filters & State
  const [selectedClass, setSelectedClass] = useState(() =>
    isStudent ? studentEnrolledClass : "Class 10"
  );
  const [selectedDay, setSelectedDay] = useState(getCurrentDayId);
  const [scheduleType, setScheduleType] = useState("regular");
  const [viewMode, setViewMode] = useState("weekly"); // Default to Whole-Week Interactive Grid!
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("");

  // Auto-set selectedClass to studentEnrolledClass if logged in as Student
  useEffect(() => {
    if (isStudent && studentEnrolledClass) {
      setSelectedClass(studentEnrolledClass);
    }
  }, [isStudent, studentEnrolledClass]);

  // Fetched Master Period Data
  const [masterSchedule, setMasterSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Fetched Teachers & Subjects Options
  const [teachersList, setTeachersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Current Timetable Allocations (for the class/section)
  // Mapping: { [day_periodIndex]: { subject, teacherId, teacherName, roomNo } }
  const [allocations, setAllocations] = useState({});
  const [allTimetables, setAllTimetables] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Slot Editor Modal State
  const [editSlotModal, setEditSlotModal] = useState({
    isOpen: false,
    day: "monday",
    periodIndex: 0,
    period: null,
  });
  const [slotForm, setSlotForm] = useState({
    subject: "",
    teacherId: "",
    teacherName: "",
    roomNo: "",
  });

  // 1. Fetch Master Period & Teachers & Subjects on mount
  useEffect(() => {
    fetchMasterSchedule();
    fetchTeacherAndSubjectOptions();
  }, [scheduleType]);

  // 2. Fetch Timetable Allocation whenever selectedClass or scheduleType changes
  useEffect(() => {
    fetchClassTimetable();
  }, [selectedClass, scheduleType]);

  // Fetch Master Period from backend GET /api/periods
  const fetchMasterSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await api.get(`/periods?type=${scheduleType}`);
      const schedules = res.data?.schedules || [];
      const found =
        schedules.find((s) => s.scheduleType === scheduleType) || schedules[0];
      if (found) {
        setMasterSchedule(found);
      } else {
        // Fallback default structure if no master period exists yet
        setMasterSchedule({
          name: "Regular Day Schedule",
          schoolStartTime: "07:00",
          schoolEndTime: "14:00",
          days: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
          periods: [
            {
              order: 1,
              type: "prayer",
              startTime: "07:00",
              endTime: "07:30",
              customLabel: "Morning Assembly",
            },
            {
              order: 2,
              type: "class",
              startTime: "07:31",
              endTime: "08:30",
              customLabel: "",
            },
            {
              order: 3,
              type: "class",
              startTime: "08:30",
              endTime: "09:30",
              customLabel: "",
            },
            {
              order: 4,
              type: "class",
              startTime: "09:30",
              endTime: "10:30",
              customLabel: "",
            },
            {
              order: 5,
              type: "lunch",
              startTime: "10:30",
              endTime: "11:30",
              customLabel: "Lunch Break",
            },
            {
              order: 6,
              type: "class",
              startTime: "11:30",
              endTime: "12:30",
              customLabel: "",
            },
            {
              order: 7,
              type: "class",
              startTime: "12:30",
              endTime: "13:30",
              customLabel: "",
            },
            {
              order: 8,
              type: "activities",
              startTime: "13:30",
              endTime: "14:00",
              customLabel: "Club Activities",
            },
          ],
        });
      }
    } catch (err) {
      console.error("Fetch master schedule error:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Fetch Teachers & Subjects from API
  const fetchTeacherAndSubjectOptions = async () => {
    setLoadingOptions(true);
    try {
      // Fetch Teachers
      const teachersRes = await api.get("/teachers?limit=500");
      const teachersData = teachersRes.data?.teachers || [];
      setTeachersList(teachersData);

      // Fetch Subjects from ERP module
      try {
        const subRes = await api.get("/erp/subjects");
        const subjectsData = subRes.data?.subjects || [];
        const names = subjectsData.map((s) => s.name);
        setSubjectsList(
          names.length > 0
            ? Array.from(new Set([...names, ...DEFAULT_SUBJECTS]))
            : DEFAULT_SUBJECTS
        );
      } catch {
        setSubjectsList(DEFAULT_SUBJECTS);
      }
    } catch (err) {
      console.error("Fetch options error:", err);
      toast.error("Failed to load teacher list options.");
    } finally {
      setLoadingOptions(false);
    }
  };

  // Fetch Saved Timetable for Class & Section
  const fetchClassTimetable = async () => {
    try {
      const res = await api.get(
        `/periods/timetable?classSection=${encodeURIComponent(selectedClass)}&scheduleType=${scheduleType}`
      );
      const tt = res.data?.timetable;
      const all = res.data?.timetables || [];
      setAllTimetables(all);

      if (tt && Array.isArray(tt.allocations)) {
        const allocMap = {};
        tt.allocations.forEach((item) => {
          const key = `${item.day}_${item.periodOrder - 1}`;
          allocMap[key] = {
            subject: item.subject || "",
            teacherId: item.teacherId || "",
            teacherName: item.teacherName || "",
            roomNo: item.roomNo || "",
          };
        });
        setAllocations(allocMap);
      } else {
        setAllocations({});
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Fetch class timetable error:", err);
      setAllocations({});
    }
  };

  // Active Days based on Master Schedule
  const activeDays = useMemo(() => {
    if (!masterSchedule?.days?.length) return DEFAULT_DAYS;
    return DEFAULT_DAYS.filter((d) => masterSchedule.days.includes(d.id));
  }, [masterSchedule]);

  const todayDayId = useMemo(() => getCurrentDayId(), []);

  // Check if any period has been assigned for the selected day
  const hasAssignedPeriodsForSelectedDay = useMemo(() => {
    if (!masterSchedule?.periods?.length) return false;
    return masterSchedule.periods.some((p, idx) => {
      if (p.type !== "class") return false;
      const key = `${selectedDay}_${idx}`;
      return Boolean(allocations[key]?.subject);
    });
  }, [masterSchedule, selectedDay, allocations]);

  const selectedClassOption = useMemo(() => {
    const found = CLASS_OPTIONS.find(
      (cls) => cls.name === selectedClass || cls.id === selectedClass
    );
    return (
      found ||
      CLASS_OPTIONS.find((cls) => cls.name === "Class 10") ||
      CLASS_OPTIONS[0]
    );
  }, [selectedClass]);

  // Handle Opening Slot Editor Modal
  const handleOpenSlotModal = (day, periodIndex, period) => {
    const key = `${day}_${periodIndex}`;
    const existing = allocations[key] || {};

    setEditSlotModal({
      isOpen: true,
      day,
      periodIndex,
      period,
    });

    setSlotForm({
      subject: existing.subject || period.subjectName || "",
      teacherId: existing.teacherId || "",
      teacherName: existing.teacherName || period.teacherName || "",
      roomNo:
        existing.roomNo || period.roomNo || selectedClass.split(" - ")[0] || "",
      applyToAllDays: true, // Auto-checked by default!
    });
  };

  // Save Slot allocation change
  const handleSaveSlotForm = () => {
    const { day, periodIndex } = editSlotModal;
    const key = `${day}_${periodIndex}`;

    // Find teacher name if selected by ID
    let selectedTeacherName = slotForm.teacherName;
    if (slotForm.teacherId) {
      const tObj = teachersList.find(
        (t) => String(t._id || t.id) === String(slotForm.teacherId)
      );
      if (tObj) selectedTeacherName = tObj.name;
    }

    const updatedData = {
      ...slotForm,
      teacherName: selectedTeacherName,
    };

    if (slotForm.applyToAllDays) {
      setAllocations((prev) => {
        const next = { ...prev };
        activeDays.forEach((d) => {
          const k = `${d.id}_${periodIndex}`;
          next[k] = updatedData;
        });
        return next;
      });
      toast.success(
        `Period #${periodIndex + 1} assignment auto-applied to all days!`
      );
    } else {
      setAllocations((prev) => ({
        ...prev,
        [key]: updatedData,
      }));
      toast.success("Period assignment updated locally.");
    }

    setIsDirty(true);
    setEditSlotModal({
      isOpen: false,
      day: "monday",
      periodIndex: 0,
      period: null,
    });
  };

  // Bulk Copy Monday Schedule to All Active Days
  const handleCopyMondayToAllDays = () => {
    if (!masterSchedule?.periods?.length) return;
    setAllocations((prev) => {
      const next = { ...prev };
      masterSchedule.periods.forEach((_, idx) => {
        const monKey = `monday_${idx}`;
        const monAlloc = prev[monKey];
        if (monAlloc) {
          activeDays.forEach((d) => {
            if (d.id !== "monday") {
              next[`${d.id}_${idx}`] = { ...monAlloc };
            }
          });
        }
      });
      return next;
    });
    setIsDirty(true);
    toast.success(
      'Monday schedule copied across all active days! Click "Save Timetable" to persist.'
    );
  };

  // Inline Cell handlers for Whole-Week Matrix Grid
  const handleCellChange = (day, pIdx, field, val) => {
    const key = `${day}_${pIdx}`;
    setAllocations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
    setIsDirty(true);
  };

  const handleCellTeacherChange = (day, pIdx, teacherId) => {
    const key = `${day}_${pIdx}`;
    const tObj = teachersList.find(
      (t) => String(t._id || t.id) === String(teacherId)
    );
    setAllocations((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        teacherId,
        teacherName: tObj ? tObj.name : "",
      },
    }));
    setIsDirty(true);
  };

  const handleCopyRowAcrossWeek = (pIdx) => {
    const monKey = `monday_${pIdx}`;
    const monAlloc = allocations[monKey];
    if (!monAlloc || !monAlloc.subject) {
      toast.info("Please select subject and teacher on Monday first.");
      return;
    }
    setAllocations((prev) => {
      const next = { ...prev };
      activeDays.forEach((d) => {
        if (d.id !== "monday") {
          next[`${d.id}_${pIdx}`] = { ...monAlloc };
        }
      });
      return next;
    });
    setIsDirty(true);
    toast.success(`Slot #${pIdx + 1} assignment copied across all days!`);
  };

  // Clear slot allocation
  const handleClearSlot = () => {
    const { day, periodIndex } = editSlotModal;
    const key = `${day}_${periodIndex}`;

    setAllocations((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    setIsDirty(true);
    setEditSlotModal({
      isOpen: false,
      day: "monday",
      periodIndex: 0,
      period: null,
    });
    toast.info("Period allocation cleared.");
  };

  // Save Complete Class Timetable to Backend API
  const handleSaveClassTimetable = async () => {
    if (!masterSchedule?.periods?.length) return;

    setSaving(true);
    try {
      const allocationsArray = [];

      // Loop through all active days and periods defined in masterSchedule
      activeDays.forEach((dayObj) => {
        masterSchedule.periods.forEach((period, idx) => {
          const key = `${dayObj.id}_${idx}`;
          const alloc = allocations[key];

          allocationsArray.push({
            day: dayObj.id,
            periodOrder: idx + 1,
            periodId: period._id || `p-${idx}`,
            periodType: period.type || "class",
            customLabel: period.customLabel || "",
            startTime: period.startTime || "",
            endTime: period.endTime || "",
            subject: alloc?.subject || "",
            teacherId: alloc?.teacherId || "",
            teacherName: alloc?.teacherName || "",
            roomNo: alloc?.roomNo || "",
          });
        });
      });

      const payload = {
        classSectionKey: selectedClassOption?.name || selectedClass,
        classId: selectedClassOption?.id || "",
        sectionId: "",
        className: selectedClassOption?.name || selectedClass,
        sectionName: "",
        scheduleType,
        allocations: allocationsArray,
      };

      const res = await api.post("/periods/timetable", payload);
      if (res.data?.success) {
        toast.success(
          `Timetable schedule for ${selectedClass} saved successfully!`
        );
        setIsDirty(false);
        fetchClassTimetable();
      } else {
        toast.error(res.data?.message || "Failed to save timetable");
      }
    } catch (err) {
      console.error("Save timetable error:", err);
      toast.error(
        err.response?.data?.message || "Error saving timetable schedule"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Timetable for Selected Class
  const handleDeleteClassTimetable = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the entire timetable for ${selectedClass}?`
      )
    ) {
      return;
    }

    try {
      const targetId = selectedClassOption?.name || selectedClass;
      const res = await api.delete(
        `/periods/timetable/${encodeURIComponent(targetId)}`
      );
      if (res.data?.success) {
        toast.success(`Timetable for ${selectedClass} deleted successfully!`);
        setAllocations({});
        setIsDirty(false);
        fetchClassTimetable();
      } else {
        toast.error(res.data?.message || "Failed to delete class timetable");
      }
    } catch (err) {
      console.error("Delete timetable error:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete class timetable"
      );
    }
  };

  // Export timetable to CSV
  const handleExportCSV = () => {
    if (!masterSchedule?.periods?.length) return;

    let csv = `Timetable Schedule for ${selectedClass} (${scheduleType.toUpperCase()})\n\n`;
    csv +=
      `Period Slot,Time,` + activeDays.map((d) => d.label).join(",") + `\n`;

    masterSchedule.periods.forEach((period, idx) => {
      const slotLabel =
        period.type === "class"
          ? `Period #${idx + 1}`
          : period.customLabel || getMeta(period.type).label;
      const timeStr = `${period.startTime} - ${period.endTime}`;
      let line = `"${slotLabel}","${timeStr}"`;

      activeDays.forEach((d) => {
        const key = `${d.id}_${idx}`;
        const alloc = allocations[key];
        if (period.type !== "class") {
          line += `,"[ ${getMeta(period.type).label} ]"`;
        } else if (alloc && alloc.subject) {
          line += `,"${alloc.subject} (${alloc.teacherName || "No Teacher"})"`;
        } else {
          line += `,"Free Period"`;
        }
      });
      csv += line + `\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedClass.replace(/\s+/g, "_")}_Timetable.csv`;
    a.click();
    toast.success("Timetable exported as CSV!");
  };

  // Render Period Card for Daily Timeline View
  const renderTimelineSlotCard = (period, idx) => {
    const meta = getMeta(period.type);
    const key = `${selectedDay}_${idx}`;
    const alloc = allocations[key] || {};
    const isClass = period.type === "class";

    return (
      <motion.div
        key={`${selectedDay}_${idx}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`group relative bg-white dark:bg-slate-900 border ${
          isClass && alloc.subject
            ? "border-indigo-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md bg-gradient-to-b from-indigo-50/25 via-white to-white dark:from-slate-900 dark:to-slate-900"
            : isClass
              ? "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60"
        } rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between`}
      >
        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{meta.icon}</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.bg} ${meta.text} ${meta.border}`}
              >
                {period.customLabel || meta.label}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Slot #{idx + 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                <Clock
                  size={13}
                  className="text-indigo-600 dark:text-indigo-400"
                />{" "}
                {period.startTime} - {period.endTime}
              </span>
            </div>
          </div>

          {/* Card Body - Content */}
          {isClass ? (
            alloc.subject ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    {alloc.subject}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                    <User
                      size={14}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    {alloc.teacherName ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {alloc.teacherName}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 italic">
                        No Teacher Assigned
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                    <MapPin size={13} className="text-rose-500" /> Room:{" "}
                    <span className="text-slate-800 dark:text-slate-200">
                      {alloc.roomNo || "Default"}
                    </span>
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                    Assigned Period
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                  No subject or teacher assigned to this class period yet.
                </p>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenSlotModal(selectedDay, idx, period)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 hover:scale-[1.02] transition-all shadow-xs"
                  >
                    <Plus size={14} /> Assign Teacher & Subject
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="py-5 text-center space-y-1.5">
              <span className="text-2xl block">{meta.icon}</span>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {period.customLabel || `${meta.label} Break`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                All classes observe recess / activity
              </p>
            </div>
          )}
        </div>

        {/* Edit Action Button Footer */}
        {isClass && canEdit && (
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => handleOpenSlotModal(selectedDay, idx, period)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Edit3 size={13} /> {alloc.subject ? "Edit Assignment" : "Assign"}
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="Timetable & Class Schedule"
        subtitle="Manage master period timings, teacher allocations, and class schedules dynamically"
        breadcrumbs={[{ label: "Academics" }, { label: "Timetable" }]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            {canEdit && (
              <button
                type="button"
                onClick={handleSaveClassTimetable}
                disabled={saving}
                className={`flex items-center gap-2 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs ${
                  isDirty
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 animate-pulse"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/20"
                }`}
              >
                {saving ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving
                  ? "Saving..."
                  : isDirty
                    ? "Save Timetable (Unsaved Changes)"
                    : "Save Timetable"}
              </button>
            )}
          </div>
        }
      />

      {/* Master Period Live timing header info bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white rounded-2xl p-5 shadow-md shadow-indigo-600/15 dark:shadow-none border border-indigo-500/20 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 dark:bg-indigo-500/30 text-white dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-white/25 dark:border-indigo-400/20">
              Live Master Period Structure
            </span>
            <span className="text-xs text-indigo-200 dark:text-slate-400">
              •
            </span>
            <span className="text-xs font-semibold text-emerald-300 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} />{" "}
              {masterSchedule?.name || "Regular Day Schedule"}
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Clock size={20} className="text-indigo-200 dark:text-indigo-400" />
            School Timing:{" "}
            <span className="text-indigo-100 dark:text-indigo-200">
              {masterSchedule?.schoolStartTime || "07:00"} -{" "}
              {masterSchedule?.schoolEndTime || "14:00"}
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/15 dark:bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/20 dark:border-white/10 text-xs flex items-center gap-2 font-medium shadow-xs">
            <Layers
              size={15}
              className="text-indigo-200 dark:text-indigo-300"
            />{" "}
            Total Slots:{" "}
            <span className="font-extrabold text-white">
              {masterSchedule?.periods?.length || 0}
            </span>
          </div>
          <div className="bg-white/15 dark:bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/20 dark:border-white/10 text-xs flex items-center gap-2 font-medium shadow-xs">
            <BookOpen size={15} className="text-blue-200 dark:text-blue-300" />{" "}
            Class Periods:{" "}
            <span className="font-extrabold text-white">
              {masterSchedule?.periods?.filter((p) => p.type === "class")
                .length || 0}
            </span>
          </div>
          <div className="bg-white/15 dark:bg-white/10 backdrop-blur px-3.5 py-2 rounded-xl border border-white/20 dark:border-white/10 text-xs flex items-center gap-2 font-medium shadow-xs">
            <UserCheck
              size={15}
              className="text-emerald-200 dark:text-emerald-300"
            />{" "}
            Teachers Available:{" "}
            <span className="font-extrabold text-white">
              {teachersList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: View Switcher & Class & Day Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        {/* Class Selection Dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-indigo-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Select Class:
            {isStudent && (
              <Lock
                size={12}
                className="text-amber-500"
                title="Locked to your enrolled class"
              />
            )}
          </span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={isStudent}
            className={`bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
              isStudent
                ? "opacity-90 cursor-not-allowed bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}{" "}
                {isStudent && cls.name === selectedClass
                  ? " (My Enrolled Class)"
                  : ""}
              </option>
            ))}
          </select>

          {isStudent && (
            <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1 shadow-xs">
              <ShieldCheck size={12} className="text-indigo-500" /> Student View
              Only
            </span>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "timeline"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List size={14} /> Daily Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode("weekly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "weekly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid size={14} /> Weekly Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewMode("teacher")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "teacher"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User size={14} /> Teacher Workload
          </button>
        </div>

        {/* Day Selector Tabs (for Timeline View) & Bulk Copy Option */}
        {viewMode === "timeline" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {activeDays.map((day) => {
                const isToday = day.id === todayDayId;
                const isSelected = selectedDay === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDay(day.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{day.label}</span>
                    {isToday && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                          isSelected
                            ? "bg-white/30 text-white"
                            : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyMondayToAllDays}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm whitespace-nowrap"
              title="Copy all slot assignments from Monday to Tuesday, Wednesday, Thursday, Friday, and Saturday"
            >
              <Sparkles size={13} className="text-indigo-500" /> Copy Monday
              Schedule to All Days
            </button>
          </div>
        )}
      </div>

      {/* View Content Loading state */}
      {loadingSchedule ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw size={24} className="animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">
            Loading dynamic master period slots...
          </p>
        </div>
      ) : (
        <>
          {/* VIEW 1: Daily Timeline View */}
          {viewMode === "timeline" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-500" />
                  {activeDays.find((d) => d.id === selectedDay)?.label ||
                    selectedDay}{" "}
                  Schedule — {selectedClass}
                  {selectedDay === todayDayId && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-300 dark:border-emerald-800/60">
                      Today's Schedule
                    </span>
                  )}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {hasAssignedPeriodsForSelectedDay
                    ? 'Click "Assign Teacher & Subject" on any slot to configure.'
                    : "No slots configured for this day"}
                </span>
              </div>

              {hasAssignedPeriodsForSelectedDay ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {masterSchedule?.periods?.map((period, idx) =>
                    renderTimelineSlotCard(period, idx)
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-900/40 shadow-sm">
                    <Calendar size={32} />
                  </div>

                  <div className="max-w-md mx-auto space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase border border-amber-300 dark:border-amber-800/60">
                      Timetable Not Assigned
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      No Schedule Configured for{" "}
                      {activeDays.find((d) => d.id === selectedDay)?.label ||
                        selectedDay}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      No class periods or subjects have been assigned to{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {selectedClass}
                      </span>{" "}
                      for this day yet.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("weekly")}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Grid size={15} /> Assign Full-Week Schedule Now
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMondayToAllDays}
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                    >
                      <Sparkles size={14} className="text-indigo-500" /> Copy
                      Monday Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Full-Week Interactive Schedule Builder Matrix */}
          {viewMode === "weekly" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase border border-indigo-200 dark:border-indigo-900/50">
                      Full-Week Builder
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      • {selectedClass}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    Assign Whole Week Schedule at Once
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign subjects & teachers directly for all active days
                    below, then click "Save Whole Week Timetable".
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleDeleteClassTimetable}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 px-3 py-2 rounded-xl transition-all"
                      title={`Delete entire timetable for ${selectedClass}`}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleCopyMondayToAllDays}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm"
                    >
                      <Sparkles size={14} className="text-indigo-500" /> Copy
                      Mon → All Days
                    </button>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleSaveClassTimetable}
                      disabled={saving}
                      className={`flex items-center gap-2 text-white font-extrabold px-5 py-2 rounded-xl shadow-md transition-all text-xs ${
                        isDirty
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 animate-pulse"
                          : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/20"
                      }`}
                    >
                      {saving ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      {saving ? "Saving..." : "Save Timetable"}
                    </button>
                  )}
                  {!canEdit && (
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5 shadow-xs">
                      <Lock size={13} className="text-indigo-500" /> Read-Only
                      View Mode
                    </span>
                  )}
                </div>
              </div>

              {/* Matrix Table with Inline Cell Selects */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                      <th className="p-3 text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider min-w-[150px]">
                        Time & Slot
                      </th>
                      {activeDays.map((d) => (
                        <th
                          key={d.id}
                          className="p-3 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center min-w-[180px]"
                        >
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {masterSchedule?.periods?.map((period, pIdx) => {
                      const meta = getMeta(period.type);
                      const isClass = period.type === "class";

                      return (
                        <tr
                          key={pIdx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          {/* Slot label & time column */}
                          <td className="p-3 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800/60 align-top bg-slate-50/40 dark:bg-slate-900/60">
                            <div className="flex items-center gap-1.5">
                              <span>{meta.icon}</span>
                              <span className="font-extrabold text-xs">
                                {period.type === "class"
                                  ? `Slot #${pIdx + 1}`
                                  : period.customLabel || meta.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                              {period.startTime} - {period.endTime}
                            </span>
                            {isClass && canEdit && (
                              <button
                                type="button"
                                onClick={() => handleCopyRowAcrossWeek(pIdx)}
                                className="mt-2 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900/50 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all"
                                title="Copy Monday subject & teacher for this slot across all days"
                              >
                                ⚡ Fill Row Mon → All
                              </button>
                            )}
                          </td>

                          {/* Days columns - Interactive Select Cells or Read-Only Cells */}
                          {activeDays.map((d) => {
                            const key = `${d.id}_${pIdx}`;
                            const alloc = allocations[key] || {};

                            if (!isClass) {
                              return (
                                <td
                                  key={d.id}
                                  className="p-3 text-center bg-slate-50/70 dark:bg-slate-800/20 align-middle"
                                >
                                  <span
                                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${meta.bg} ${meta.text} ${meta.border}`}
                                  >
                                    {meta.icon}{" "}
                                    {period.customLabel || meta.label}
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={d.id}
                                className="p-2 border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 align-top bg-white dark:bg-slate-900"
                              >
                                {!canEdit ? (
                                  <div className="space-y-1.5 p-2.5 rounded-xl border border-indigo-200/80 dark:border-slate-800 bg-indigo-50/40 dark:bg-slate-800/30 shadow-xs">
                                    {alloc.subject ? (
                                      <>
                                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                                          <BookOpen
                                            size={13}
                                            className="text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                                          />
                                          <span className="truncate">
                                            {alloc.subject}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-400 font-semibold">
                                          <User
                                            size={12}
                                            className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                                          />
                                          <span className="truncate">
                                            {alloc.teacherName ||
                                              "No Teacher Assigned"}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-indigo-100 dark:border-slate-800/60 flex items-center justify-between">
                                          <span>
                                            Room:{" "}
                                            {alloc.roomNo || selectedClass}
                                          </span>
                                          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100/70 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded">
                                            Class
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="py-2.5 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/10">
                                        <span className="text-[10px] text-slate-400 italic block font-medium">
                                          Free Period
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/30 transition-all shadow-xs">
                                    {/* Subject Dropdown Select */}
                                    <select
                                      value={alloc.subject || ""}
                                      onChange={(e) =>
                                        handleCellChange(
                                          d.id,
                                          pIdx,
                                          "subject",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                                    >
                                      <option value="">
                                        -- Select Subject --
                                      </option>
                                      {subjectsList.map((sub, sIdx) => (
                                        <option key={sIdx} value={sub}>
                                          {sub}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Teacher Dropdown Select */}
                                    <select
                                      value={alloc.teacherId || ""}
                                      onChange={(e) =>
                                        handleCellTeacherChange(
                                          d.id,
                                          pIdx,
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2 py-1 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                                    >
                                      <option value="">
                                        -- Select Teacher --
                                      </option>
                                      {teachersList.map((t) => (
                                        <option
                                          key={t._id || t.id}
                                          value={t._id || t.id}
                                        >
                                          {t.name} ({t.employeeId || "EMP"})
                                        </option>
                                      ))}
                                    </select>

                                    {/* More details link / modal edit */}
                                    <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 dark:text-slate-400">
                                      <span className="font-mono">
                                        Room: {alloc.roomNo || selectedClass}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenSlotModal(
                                            d.id,
                                            pIdx,
                                            period
                                          )
                                        }
                                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                      >
                                        Edit
                                      </button>
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

          {/* VIEW 3: Teacher Workload Schedule */}
          {viewMode === "teacher" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Teacher Schedule & Workload Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filter periods by assigned teacher across all timetables
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <User size={16} className="text-indigo-500" />
                  <select
                    value={selectedTeacherFilter}
                    onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm min-w-[240px]"
                  >
                    <option value="">
                      -- Select Teacher to View Workload --
                    </option>
                    {teachersList.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} ({t.employeeId || "EMP"}){" "}
                        {t.designation ? `- ${t.designation}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedTeacherFilter ? (
                <div className="py-16 text-center space-y-2 text-slate-400">
                  <UserCheck
                    size={32}
                    className="mx-auto text-indigo-400 opacity-60"
                  />
                  <p className="text-sm font-semibold">
                    Please select a teacher from the dropdown above.
                  </p>
                  <p className="text-xs">
                    Shows weekly assigned classes, time slots, and room
                    locations for the teacher.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Teacher Details */}
                  {(() => {
                    const selObj = teachersList.find(
                      (t) =>
                        String(t._id || t.id) === String(selectedTeacherFilter)
                    );
                    return (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                            {selObj?.name?.[0] || "T"}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {selObj?.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Employee ID:{" "}
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                                {selObj?.employeeId || "N/A"}
                              </span>{" "}
                              • {selObj?.designation || "Teacher"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Teacher Schedule Table */}
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <th className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Day
                        </th>
                        <th className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Slot # / Time
                        </th>
                        <th className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Class & Section
                        </th>
                        <th className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Subject
                        </th>
                        <th className="p-3 font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Room No
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(() => {
                        const selObj = teachersList.find(
                          (t) =>
                            String(t._id || t.id) ===
                            String(selectedTeacherFilter)
                        );
                        const teacherName = selObj?.name || "";
                        const matches = [];

                        // Search across all fetched timetables or current allocations
                        const timetablesToSearch =
                          allTimetables.length > 0
                            ? allTimetables
                            : [
                                {
                                  classSectionKey: selectedClass,
                                  allocations: Object.entries(allocations).map(
                                    ([k, v]) => ({
                                      day: k.split("_")[0],
                                      periodOrder: Number(k.split("_")[1]) + 1,
                                      ...v,
                                    })
                                  ),
                                },
                              ];

                        timetablesToSearch.forEach((tt) => {
                          (tt.allocations || []).forEach((alloc) => {
                            if (
                              (alloc.teacherId &&
                                String(alloc.teacherId) ===
                                  String(selectedTeacherFilter)) ||
                              (teacherName &&
                                alloc.teacherName &&
                                alloc.teacherName.toLowerCase() ===
                                  teacherName.toLowerCase())
                            ) {
                              const periodObj =
                                masterSchedule?.periods?.[
                                  (alloc.periodOrder || 1) - 1
                                ];
                              matches.push({
                                day: alloc.day,
                                slotOrder: alloc.periodOrder,
                                timeStr: periodObj
                                  ? `${periodObj.startTime} - ${periodObj.endTime}`
                                  : "--:--",
                                classSection:
                                  tt.classSectionKey || selectedClass,
                                subject: alloc.subject,
                                roomNo: alloc.roomNo || "N/A",
                              });
                            }
                          });
                        });

                        if (matches.length === 0) {
                          return (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-12 text-center text-slate-400 italic"
                              >
                                No assigned classes found for this teacher in
                                saved timetables.
                              </td>
                            </tr>
                          );
                        }

                        return matches.map((m, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {m.day}
                            </td>
                            <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                              Slot #{m.slotOrder} ({m.timeStr})
                            </td>
                            <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                              {m.classSection}
                            </td>
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                              {m.subject}
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              {m.roomNo}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Slot Editor Modal / Drawer */}
      <AnimatePresence>
        {editSlotModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase border border-indigo-200 dark:border-indigo-900/50">
                      {selectedClass}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {editSlotModal.day}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    Assign Slot #{editSlotModal.periodIndex + 1} (
                    {editSlotModal.period?.startTime} -{" "}
                    {editSlotModal.period?.endTime})
                  </h3>
                </div>

                <button
                  onClick={() =>
                    setEditSlotModal({
                      isOpen: false,
                      day: "monday",
                      periodIndex: 0,
                      period: null,
                    })
                  }
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                {/* Teacher Selection Dropdown */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Select Assigned Teacher</span>
                    {loadingOptions && (
                      <span className="text-[10px] text-indigo-500 font-medium">
                        Loading teachers...
                      </span>
                    )}
                  </label>

                  <select
                    value={slotForm.teacherId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const selectedObj = teachersList.find(
                        (t) => String(t._id || t.id) === String(id)
                      );
                      setSlotForm((prev) => ({
                        ...prev,
                        teacherId: id,
                        teacherName: selectedObj ? selectedObj.name : "",
                      }));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">
                      -- Select Teacher from Registered Options --
                    </option>
                    {teachersList.map((t) => (
                      <option key={t._id || t.id} value={t._id || t.id}>
                        {t.name} ({t.employeeId || "EMP"}){" "}
                        {t.designation ? `- ${t.designation}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection / Input */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Select or Enter Subject Name
                  </label>
                  <div className="space-y-2">
                    <select
                      value={
                        subjectsList.includes(slotForm.subject)
                          ? slotForm.subject
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setSlotForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }));
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Predefined Subject --</option>
                      {subjectsList.map((sub, i) => (
                        <option key={i} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Or type custom subject title (e.g. Organic Chemistry)"
                      value={slotForm.subject}
                      onChange={(e) =>
                        setSlotForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Room Number */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Classroom / Lab Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 301 or Physics Lab"
                    value={slotForm.roomNo}
                    onChange={(e) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        roomNo: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Auto Apply to All Days Checkbox (Auto-Checked!) */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(slotForm.applyToAllDays)}
                    onChange={(e) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        applyToAllDays: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <CheckCircle2
                        size={14}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                      Auto-apply to all days of the week (Mon – Sat)
                    </span>
                    <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 block leading-relaxed">
                      Auto-checked: When you assign this slot on Monday, it
                      automatically assigns the same teacher & subject to Period
                      Slot #{editSlotModal.periodIndex + 1} across all active
                      days!
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClearSlot}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                >
                  <Trash2 size={14} /> Clear Slot
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditSlotModal({
                        isOpen: false,
                        day: "monday",
                        periodIndex: 0,
                        period: null,
                      })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSlotForm}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                  >
                    Apply Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimetableManagement;
