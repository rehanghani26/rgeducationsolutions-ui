import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Save,
  Clock,
  GraduationCap,
  CalendarDays,
  BookOpen,
  CheckCircle,
  RefreshCw,
  Layers,
  Flag,
  MapPin,
  Sparkles,
  ShieldCheck,
  Coffee,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Check,
  Edit3,
  X,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Eye,
  Info,
  Copy,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import api from "../../services/api.js";
import { TIMETABLE_TEMPLATES } from "../timetable/timetableUtils.js";

// Period types configuration
const PERIOD_TYPES = [
  {
    value: "prayer",
    label: "Prayer / Assembly",
    icon: "🙏",
    color: "from-amber-500 to-yellow-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/60",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    value: "class",
    label: "Class Period",
    icon: "📚",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/60",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  {
    value: "recess",
    label: "Recess / Break",
    icon: "☕",
    color: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800/60",
    badgeBg: "bg-teal-100 dark:bg-teal-900/50",
  },
  {
    value: "lunch",
    label: "Lunch Break",
    icon: "🍱",
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800/60",
    badgeBg: "bg-orange-100 dark:bg-orange-900/50",
  },
  {
    value: "pt",
    label: "PT / Sports",
    icon: "🏃",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    value: "activities",
    label: "Activity / Club",
    icon: "🎨",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/60",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
  },
  {
    value: "singing",
    label: "Music",
    icon: "🎵",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/60",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  {
    value: "leave",
    label: "Departure / Dispersal",
    icon: "🚌",
    color: "from-rose-500 to-red-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/60",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50",
  },
  {
    value: "custom",
    label: "Custom",
    icon: "⚡",
    color: "from-slate-600 to-slate-700",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-800 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-700",
    badgeBg: "bg-slate-200 dark:bg-slate-700",
  },
];

const getPeriodMeta = (type) =>
  PERIOD_TYPES.find((p) => p.value === type) || PERIOD_TYPES[PERIOD_TYPES.length - 1];

const formatDuration = (start, end) => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return "";
  return mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ""}`
    : `${mins}m`;
};

const calculateMinutes = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : 0;
};

const createEmptyPeriod = (startTime = "") => ({
  _id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type: "class",
  customLabel: "",
  startTime,
  endTime: "",
});

const ALL_DAYS = [
  { id: "monday",    label: "Monday",    short: "Mon", defaultHalf: false },
  { id: "tuesday",   label: "Tuesday",   short: "Tue", defaultHalf: false },
  { id: "wednesday", label: "Wednesday", short: "Wed", defaultHalf: false },
  { id: "thursday",  label: "Thursday",  short: "Thu", defaultHalf: false },
  { id: "friday",    label: "Friday",    short: "Fri", defaultHalf: false },
  { id: "saturday",  label: "Saturday",  short: "Sat", defaultHalf: true },
];

const STANDARD_FULL_DAY_SLOTS = [
  { type: "prayer", customLabel: "Morning Assembly & Prayer", startTime: "07:00", endTime: "07:30" },
  { type: "class", customLabel: "Period 1", startTime: "07:30", endTime: "08:30" },
  { type: "class", customLabel: "Period 2", startTime: "08:30", endTime: "09:30" },
  { type: "class", customLabel: "Period 3", startTime: "09:30", endTime: "10:30" },
  { type: "lunch", customLabel: "Lunch Break", startTime: "10:30", endTime: "11:30" },
  { type: "class", customLabel: "Period 4", startTime: "11:30", endTime: "12:30" },
  { type: "class", customLabel: "Period 5", startTime: "12:30", endTime: "13:30" },
  { type: "leave", customLabel: "Departure / Club", startTime: "13:30", endTime: "14:00" },
];

const SATURDAY_HALF_DAY_SLOTS = [
  { type: "prayer", customLabel: "Morning Prayer", startTime: "08:00", endTime: "08:20" },
  { type: "class", customLabel: "Period 1", startTime: "08:20", endTime: "09:05" },
  { type: "class", customLabel: "Period 2", startTime: "09:05", endTime: "09:50" },
  { type: "recess", customLabel: "Fruit Recess", startTime: "09:50", endTime: "10:15" },
  { type: "class", customLabel: "Period 3", startTime: "10:15", endTime: "11:00" },
  { type: "class", customLabel: "Period 4", startTime: "11:00", endTime: "11:45" },
  { type: "leave", customLabel: "School Dispersal", startTime: "11:45", endTime: "12:00" },
];

const FRIDAY_SHORT_DAY_SLOTS = [
  { type: "prayer", customLabel: "Morning Assembly & Prayer", startTime: "07:00", endTime: "07:30" },
  { type: "class", customLabel: "Period 1", startTime: "07:30", endTime: "08:25" },
  { type: "class", customLabel: "Period 2", startTime: "08:25", endTime: "09:20" },
  { type: "recess", customLabel: "Short Recess", startTime: "09:20", endTime: "09:45" },
  { type: "class", customLabel: "Period 3", startTime: "09:45", endTime: "10:40" },
  { type: "class", customLabel: "Period 4", startTime: "10:40", endTime: "11:35" },
  { type: "class", customLabel: "Period 5", startTime: "11:35", endTime: "12:30" },
  { type: "leave", customLabel: "Friday Dispersal & Prayer", startTime: "12:30", endTime: "13:00" },
];

// ─── Visual Connected Day Timeline Bar ───────────────────────────────────────
const DayTimelineVisualizer = ({ periods = [], schoolStart = "07:00", schoolEnd = "14:00" }) => {
  const totalMins = calculateMinutes(schoolStart, schoolEnd);
  if (!periods.length || totalMins <= 0) return null;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Sunrise size={14} /> Open: {schoolStart}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          Campus Timeline ({Math.floor(totalMins / 60)}h {totalMins % 60 > 0 ? `${totalMins % 60}m` : ""})
        </span>
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <Sunset size={14} /> Close: {schoolEnd}
        </span>
      </div>

      {/* Connected Timeline Bar */}
      <div className="w-full h-9 rounded-xl overflow-hidden flex bg-slate-200 dark:bg-slate-800 p-0.5 gap-0.5 shadow-inner">
        {periods.map((p, idx) => {
          const slotMins = calculateMinutes(p.startTime, p.endTime);
          const pct = Math.max(6, (slotMins / totalMins) * 100);
          const meta = getPeriodMeta(p.type);
          return (
            <div
              key={p._id || idx}
              style={{ width: `${pct}%` }}
              title={`${p.customLabel || meta.label} • ${p.startTime} - ${p.endTime} (${slotMins} mins)`}
              className={`h-full rounded-lg bg-gradient-to-r ${meta.color} flex items-center justify-center text-white text-[10px] font-bold px-1 overflow-hidden transition-all hover:brightness-110 cursor-pointer shadow-xs`}
            >
              <span className="truncate flex items-center gap-1">
                <span className="text-[11px]">{meta.icon}</span>
                <span className="hidden sm:inline text-[9px]">{p.customLabel || meta.label}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Schedule Sequence Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-[11px]">
        <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase">Sequence:</span>
        {periods.map((p, idx) => {
          const meta = getPeriodMeta(p.type);
          return (
            <span
              key={idx}
              className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-semibold ${meta.bg} ${meta.text} ${meta.border}`}
            >
              <span>{meta.icon}</span>
              <span>{p.customLabel || meta.label}</span>
              <span className="font-mono text-[10px] opacity-75 font-bold">
                {p.startTime}–{p.endTime}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─── Single Period Slot Row (Edit Mode) ──────────────────────────────────────
const PeriodSlotRow = ({
  period,
  index,
  onChange,
  onRemove,
  schoolStart,
  schoolEnd,
}) => {
  const meta = getPeriodMeta(period.type);
  const duration = formatDuration(period.startTime, period.endTime);
  const isOutOfRange =
    (schoolStart && period.startTime && period.startTime < schoolStart) ||
    (schoolEnd && period.endTime && period.endTime > schoolEnd);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-150">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Index and Type Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center font-black text-xs shadow-sm`}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${meta.bg} ${meta.text} ${meta.border}`}
            >
              <span>{meta.icon}</span>
              <span>{period.customLabel || meta.label}</span>
            </span>

            {duration && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {duration}
              </span>
            )}

            {isOutOfRange && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <AlertCircle size={11} /> Outside Bell Hours ({schoolStart}–{schoolEnd})
              </span>
            )}
          </div>
        </div>

        {/* Period Type Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PERIOD_TYPES.map((t) => {
            const isSelected = period.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange("type", t.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 border cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timing Inputs and Title */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <input
            type="text"
            value={period.customLabel || ""}
            placeholder="Period label (e.g. Period 1)..."
            onChange={(e) => onChange("customLabel", e.target.value)}
            className="w-40 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />

          <div className="flex items-center gap-2">
            <div>
              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Start</span>
              <input
                type="time"
                value={period.startTime || ""}
                min={schoolStart || undefined}
                max={period.endTime || schoolEnd || undefined}
                onChange={(e) => onChange("startTime", e.target.value)}
                className="w-28 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <span className="text-slate-400 font-bold mt-3">&rarr;</span>

            <div>
              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">End</span>
              <input
                type="time"
                value={period.endTime || ""}
                min={period.startTime || schoolStart || undefined}
                max={schoolEnd || undefined}
                onChange={(e) => onChange("endTime", e.target.value)}
                className="w-28 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition mt-3 sm:mt-0 cursor-pointer"
            title="Remove period slot"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single Period Slot Card (View-Only Mode) ────────────────────────────────
const PeriodSlotView = ({ period, index }) => {
  const meta = getPeriodMeta(period.type);
  const duration = formatDuration(period.startTime, period.endTime);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 border ${meta.bg} ${meta.text} ${meta.border}`}
            >
              <span>{meta.icon}</span>
              <span>{period.customLabel || meta.label}</span>
            </span>
            {duration && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                ({duration})
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1 block">
            {period.startTime} – {period.endTime}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Slot #{index + 1}
      </span>
    </div>
  );
};

// ─── Main ScheduleBuilder Sub-Component ──────────────────────────────────────
const ScheduleBuilder = ({ scheduleType, savedData, onSaved }) => {
  const hasSaved = Boolean(savedData && savedData.periods && savedData.periods.length > 0);

  // Modes: "view" | "edit" | "unconfigured"
  const [mode, setMode] = useState(() => (hasSaved ? "view" : "unconfigured"));

  // Active selected day tab for editing/viewing (e.g. "monday", "saturday")
  const [selectedDayKey, setSelectedDayKey] = useState("monday");

  const [scheduleId, setScheduleId] = useState(savedData?._id || savedData?.id || null);
  const [name, setName] = useState(
    savedData?.name || (scheduleType === "exam" ? "Exam Day Schedule" : "Regular Day Schedule")
  );

  // Overall school opening and closing times (general reference)
  const [overallStartTime, setOverallStartTime] = useState(savedData?.schoolStartTime || "07:00");
  const [overallEndTime, setOverallEndTime] = useState(savedData?.schoolEndTime || "14:00");

  // Active operating days in the school (e.g. Monday to Saturday)
  const [operatingDays, setOperatingDays] = useState(
    () =>
      savedData?.days && savedData.days.length > 0
        ? savedData.days
        : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  );

  // ─── Day-Wise Schedules State ─────────────────────────────────────────────
  // Every day has its own entry: schoolStartTime, schoolEndTime, isHalfDay, periods
  const [daySchedules, setDaySchedules] = useState(() => {
    const initial = {};
    ALL_DAYS.forEach((d) => {
      const existing = savedData?.daySchedules?.[d.id];
      const isSat = d.id === "saturday";
      if (existing && Array.isArray(existing.periods) && existing.periods.length > 0) {
        initial[d.id] = {
          day: d.id,
          dayLabel: existing.dayLabel || d.label,
          enabled: existing.enabled !== undefined ? Boolean(existing.enabled) : true,
          schoolStartTime: existing.schoolStartTime || (isSat ? "08:00" : "07:00"),
          schoolEndTime: existing.schoolEndTime || (isSat ? "12:00" : "14:00"),
          isHalfDay: existing.isHalfDay !== undefined ? existing.isHalfDay : d.defaultHalf,
          name: existing.name || (isSat ? "Saturday Half Day" : `${d.label} Schedule`),
          periods: existing.periods.map((p) => ({ ...p, _id: p._id || `p-${Math.random()}` })),
        };
      } else {
        // Fallback to top-level savedData.periods for Mon-Fri, or Saturday half-day
        const fallbackSlots = isSat
          ? SATURDAY_HALF_DAY_SLOTS
          : (savedData?.periods && savedData.periods.length > 0 ? savedData.periods : STANDARD_FULL_DAY_SLOTS);

        initial[d.id] = {
          day: d.id,
          dayLabel: d.label,
          enabled: true,
          schoolStartTime: isSat ? "08:00" : (savedData?.schoolStartTime || "07:00"),
          schoolEndTime: isSat ? "12:00" : (savedData?.schoolEndTime || "14:00"),
          isHalfDay: isSat,
          name: isSat ? "Saturday Half Day" : `${d.label} Schedule`,
          periods: fallbackSlots.map((s, idx) => ({
            _id: `p-${d.id}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            type: s.type,
            customLabel: s.customLabel || s.name || `Period ${idx + 1}`,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        };
      }
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);

  // Synchronize when savedData updates from API
  useEffect(() => {
    if (savedData && savedData.periods && savedData.periods.length > 0) {
      setScheduleId(savedData._id || savedData.id);
      setName(savedData.name || (scheduleType === "exam" ? "Exam Day Schedule" : "Regular Day Schedule"));
      setOverallStartTime(savedData.schoolStartTime || "07:00");
      setOverallEndTime(savedData.schoolEndTime || "14:00");
      if (savedData.days && savedData.days.length > 0) setOperatingDays(savedData.days);

      const refreshed = {};
      ALL_DAYS.forEach((d) => {
        const existing = savedData?.daySchedules?.[d.id];
        const isSat = d.id === "saturday";
        if (existing && Array.isArray(existing.periods) && existing.periods.length > 0) {
          refreshed[d.id] = {
            day: d.id,
            dayLabel: existing.dayLabel || d.label,
            enabled: existing.enabled !== undefined ? Boolean(existing.enabled) : true,
            schoolStartTime: existing.schoolStartTime || (isSat ? "08:00" : "07:00"),
            schoolEndTime: existing.schoolEndTime || (isSat ? "12:00" : "14:00"),
            isHalfDay: existing.isHalfDay !== undefined ? existing.isHalfDay : d.defaultHalf,
            name: existing.name || (isSat ? "Saturday Half Day" : `${d.label} Schedule`),
            periods: existing.periods.map((p) => ({ ...p, _id: p._id || `p-${Math.random()}` })),
          };
        } else {
          const fallbackSlots = isSat ? SATURDAY_HALF_DAY_SLOTS : savedData.periods;
          refreshed[d.id] = {
            day: d.id,
            dayLabel: d.label,
            enabled: true,
            schoolStartTime: isSat ? "08:00" : (savedData.schoolStartTime || "07:00"),
            schoolEndTime: isSat ? "12:00" : (savedData.schoolEndTime || "14:00"),
            isHalfDay: isSat,
            name: isSat ? "Saturday Half Day" : `${d.label} Schedule`,
            periods: fallbackSlots.map((s, idx) => ({
              _id: `p-${d.id}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              type: s.type,
              customLabel: s.customLabel || s.name || `Period ${idx + 1}`,
              startTime: s.startTime,
              endTime: s.endTime,
            })),
          };
        }
      });
      setDaySchedules(refreshed);
      setMode("view");
    } else {
      setMode("unconfigured");
    }
  }, [savedData, scheduleType]);

  // Active day schedule object currently being viewed / edited
  const currentDaySchedule = daySchedules[selectedDayKey] || daySchedules.monday;

  // ─── Actions for Day Schedules ─────────────────────────────────────────────
  const updateDayField = (dayKey, field, val) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: val,
      },
    }));
  };

  const addPeriodToDay = (dayKey) => {
    setDaySchedules((prev) => {
      const cur = prev[dayKey] || {};
      const curPeriods = cur.periods || [];
      const lastEnd = curPeriods[curPeriods.length - 1]?.endTime || cur.schoolStartTime || "08:00";
      return {
        ...prev,
        [dayKey]: {
          ...cur,
          periods: [...curPeriods, createEmptyPeriod(lastEnd)],
        },
      };
    });
  };

  const updateDayPeriod = (dayKey, idx, field, val) => {
    setDaySchedules((prev) => {
      const cur = prev[dayKey] || {};
      const updated = (cur.periods || []).map((p, i) => (i === idx ? { ...p, [field]: val } : p));
      return {
        ...prev,
        [dayKey]: {
          ...cur,
          periods: updated,
        },
      };
    });
  };

  const removeDayPeriod = (dayKey, idx) => {
    setDaySchedules((prev) => {
      const cur = prev[dayKey] || {};
      return {
        ...prev,
        [dayKey]: {
          ...cur,
          periods: (cur.periods || []).filter((_, i) => i !== idx),
        },
      };
    });
  };

  // ─── Day Presets & Copy Handlers ──────────────────────────────────────────
  const copyCurrentDayToAll = () => {
    const source = daySchedules[selectedDayKey];
    if (!source || !source.periods?.length) return;
    setDaySchedules((prev) => {
      const next = { ...prev };
      ALL_DAYS.forEach((d) => {
        next[d.id] = {
          ...next[d.id],
          day: d.id,
          dayLabel: d.label,
          enabled: true,
          schoolStartTime: source.schoolStartTime,
          schoolEndTime: source.schoolEndTime,
          isHalfDay: source.isHalfDay,
          name: source.isHalfDay ? `${d.label} Half Day` : `${d.label} Schedule`,
          periods: source.periods.map((p) => ({ ...p, _id: `p-${d.id}-${Math.random()}` })),
        };
      });
      return next;
    });
    toast.success(`Copied ${source.dayLabel}'s schedule to all operating days (Mon–Sat)!`);
  };

  const copyCurrentDayToWeekdays = () => {
    const source = daySchedules[selectedDayKey];
    if (!source || !source.periods?.length) return;
    setDaySchedules((prev) => {
      const next = { ...prev };
      ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach((dId) => {
        const dMeta = ALL_DAYS.find((d) => d.id === dId);
        next[dId] = {
          ...next[dId],
          day: dId,
          dayLabel: dMeta?.label || dId,
          enabled: true,
          schoolStartTime: source.schoolStartTime,
          schoolEndTime: source.schoolEndTime,
          isHalfDay: false,
          name: `${dMeta?.label || dId} Regular Day`,
          periods: source.periods.map((p) => ({ ...p, _id: `p-${dId}-${Math.random()}` })),
        };
      });
      return next;
    });
    toast.success(`Copied ${source.dayLabel}'s schedule to weekdays (Mon–Fri)!`);
  };

  const loadSaturdayPreset = () => {
    setDaySchedules((prev) => ({
      ...prev,
      saturday: {
        day: "saturday",
        dayLabel: "Saturday",
        enabled: true,
        schoolStartTime: "08:00",
        schoolEndTime: "12:00",
        isHalfDay: true,
        name: "Saturday Half Day",
        periods: SATURDAY_HALF_DAY_SLOTS.map((s, idx) => ({
          _id: `p-sat-${idx}-${Math.random()}`,
          type: s.type,
          customLabel: s.customLabel,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
    }));
    setSelectedDayKey("saturday");
    toast.success("Loaded Saturday Half-Day preset (08:00 AM – 12:00 PM • 4 Classes)");
  };

  const loadFridayPreset = () => {
    setDaySchedules((prev) => ({
      ...prev,
      friday: {
        day: "friday",
        dayLabel: "Friday",
        enabled: true,
        schoolStartTime: "07:00",
        schoolEndTime: "13:00",
        isHalfDay: false,
        name: "Friday Short Session",
        periods: FRIDAY_SHORT_DAY_SLOTS.map((s, idx) => ({
          _id: `p-fri-${idx}-${Math.random()}`,
          type: s.type,
          customLabel: s.customLabel,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
    }));
    setSelectedDayKey("friday");
    toast.success("Loaded Friday Short Day preset (07:00 AM – 01:00 PM • 5 Classes)");
  };

  const loadFullDayPreset = (dayKey) => {
    const dMeta = ALL_DAYS.find((d) => d.id === dayKey);
    const dayLabel = dMeta?.label || dayKey;
    setDaySchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        day: dayKey,
        dayLabel,
        enabled: true,
        schoolStartTime: "07:00",
        schoolEndTime: "14:00",
        isHalfDay: false,
        name: `${dayLabel} Regular Schedule`,
        periods: STANDARD_FULL_DAY_SLOTS.map((s, idx) => ({
          _id: `p-${dayKey}-${idx}-${Math.random()}`,
          type: s.type,
          customLabel: s.customLabel,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
    }));
    toast.success(`Loaded Standard Full-Day (8 slots • 7:00 AM – 2:00 PM) for ${dayLabel}!`);
  };

  const toggleOperatingDay = (dayId) => {
    setOperatingDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  // ─── Save Master Schedule Handler ──────────────────────────────────────────
  const handleSave = async () => {
    if (operatingDays.length === 0) {
      toast.error("Please select at least one active operating day.");
      return;
    }

    setSaving(true);
    try {
      // Primary periods (e.g. Monday) used for general compatibility
      const primaryDaySchedule = daySchedules.monday || Object.values(daySchedules)[0];
      const primaryPeriods = primaryDaySchedule?.periods || [];

      // Ensure every operating day is saved with clean, full day-wise schema
      const daySchedulesToSave = {};
      operatingDays.forEach((dayKey) => {
        const cur = daySchedules[dayKey];
        const isSat = dayKey === "saturday";
        const dMeta = ALL_DAYS.find((d) => d.id === dayKey);
        const dayLabel = dMeta?.label || (dayKey.charAt(0).toUpperCase() + dayKey.slice(1));

        daySchedulesToSave[dayKey] = {
          day: dayKey,
          dayLabel,
          enabled: true,
          isHalfDay: cur?.isHalfDay !== undefined ? Boolean(cur.isHalfDay) : isSat,
          name: cur?.name || (cur?.isHalfDay ? `${dayLabel} Half Day` : `${dayLabel} Schedule`),
          schoolStartTime: cur?.schoolStartTime || (isSat ? "08:00" : "07:00"),
          schoolEndTime: cur?.schoolEndTime || (isSat ? "12:00" : "14:00"),
          periods: (cur?.periods || []).map((p, idx) => ({
            order: idx + 1,
            type: p.type || "class",
            customLabel: p.customLabel || `Period ${idx + 1}`,
            startTime: p.startTime,
            endTime: p.endTime,
            durationMinutes: calculateMinutes(p.startTime, p.endTime),
          })),
        };
      });

      const payload = {
        scheduleType,
        name,
        schoolStartTime: primaryDaySchedule?.schoolStartTime || overallStartTime,
        schoolEndTime: primaryDaySchedule?.schoolEndTime || overallEndTime,
        days: operatingDays,
        periods: primaryPeriods,
        daySchedules: daySchedulesToSave,
        isConfigured: true,
      };

      const res = scheduleId
        ? await api.put(`/periods/${scheduleId}`, payload)
        : await api.post("/periods", payload);

      if (res.data?.success) {
        toast.success("Master Period & Day-Wise Timetable saved successfully!");
        const saved = res.data.schedule;
        if (saved) {
          setScheduleId(saved._id || saved.id);
          if (onSaved) onSaved(saved);
        }
        setMode("view");
      } else {
        toast.error(res.data?.message || "Failed to save schedule.");
      }
    } catch (err) {
      console.error("Save schedule error:", err);
      toast.error(err.response?.data?.message || "Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER 1: UNCONFIGURED STATE ("not config yet")
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === "unconfigured") {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner border border-indigo-200 dark:border-indigo-800/60">
          <Clock size={40} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            Not Configured Yet
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            No {scheduleType === "exam" ? "Exam" : "Regular"} Master Period Configured
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Configure your institutional day-wise bell timings — including full days (Monday–Friday) and custom days (like <strong>Saturday Half-Day</strong>) — to power the timetable builder.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold px-7 py-3 rounded-2xl shadow-lg shadow-indigo-600/25 text-xs transition transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={16} /> Start Configuration / Create Master Schedule
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER 2: VIEW-ONLY MODE ("show view only mode")
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === "view") {
    const currentViewDay = daySchedules[selectedDayKey] || daySchedules.monday;
    const viewDayPeriods = currentViewDay?.periods || [];
    const totalDayMins = calculateMinutes(currentViewDay?.schoolStartTime, currentViewDay?.schoolEndTime);
    const durationFmt = totalDayMins > 0 ? `${Math.floor(totalDayMins / 60)}h ${totalDayMins % 60}m` : "--";

    return (
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle size={12} /> Active Master Period
                </span>
                <span className="text-xs font-bold text-slate-400">• {name}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <CalendarDays size={20} className="text-indigo-600" />
                Institutional Day-Wise Master Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each day maintains its own opening/closing bell timings and period sequence (Mon–Fri Full Days & Saturday Half-Day).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMode("edit")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs transition self-start sm:self-auto cursor-pointer"
            >
              <Edit3 size={14} /> Edit Master Schedule
            </button>
          </div>

          {/* Day-Wise Overview Cards Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_DAYS.map((d) => {
              const isOper = operatingDays.includes(d.id);
              const sched = daySchedules[d.id] || {};
              const isSelected = selectedDayKey === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDayKey(d.id)}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    !isOper
                      ? "opacity-50 border-dashed border-slate-200 bg-slate-50 dark:bg-slate-900"
                      : isSelected
                      ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{d.label}</span>
                      {sched.isHalfDay && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                          Half Day
                        </span>
                      )}
                    </div>
                    {isOper ? (
                      <>
                        <p className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {sched.schoolStartTime} – {sched.schoolEndTime}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(sched.periods || []).length} slots ({sched.periods?.filter((p) => p.type === "class").length || 0} classes)
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Day Off / Closed</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                    {isSelected ? "● Viewing" : "View →"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day View Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                {currentViewDay.dayLabel?.[0]}
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {currentViewDay.dayLabel} Bell Timing & Period Sequence
                  {currentViewDay.isHalfDay && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200">
                      Half Day
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  School Hours: {currentViewDay.schoolStartTime} – {currentViewDay.schoolEndTime} ({durationFmt}) • {viewDayPeriods.length} period slots
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer self-start sm:self-auto"
            >
              <Edit3 size={13} /> Edit {currentViewDay.dayLabel} Schedule
            </button>
          </div>

          {/* Visual Day Timeline Bar */}
          <DayTimelineVisualizer
            periods={viewDayPeriods}
            schoolStart={currentViewDay.schoolStartTime}
            schoolEnd={currentViewDay.schoolEndTime}
          />

          {/* Periods Timeline List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {viewDayPeriods.map((p, idx) => (
              <PeriodSlotView key={idx} period={p} index={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER 3: EDIT MODE ("show create or edit")
  // ═══════════════════════════════════════════════════════════════════════════
  const curDayPeriods = currentDaySchedule?.periods || [];
  const curDayMins = calculateMinutes(currentDaySchedule?.schoolStartTime, currentDaySchedule?.schoolEndTime);
  const curDayDurationFmt = curDayMins > 0 ? `${Math.floor(curDayMins / 60)}h ${curDayMins % 60}m` : "--";

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {hasSaved ? "Editing Master Period Schedule" : "Configuring Day-Wise Master Period"}
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Day-Wise Timetable & Bell Timing Editor
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasSaved && (
            <button
              type="button"
              onClick={() => setMode("view")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2 rounded-xl shadow-md text-xs transition cursor-pointer"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Master Schedule"}
          </button>
        </div>
      </div>

      {/* General Settings: Schedule Name & Operating Weekdays */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Schedule Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Academic Schedule"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Active Operating Weekdays
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const isActive = operatingDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleOperatingDay(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                    }`}
                  >
                    <span>{d.label}</span>
                    {isActive ? <Check size={12} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Day-Wise Tabs Navigation ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Configure Specific Day:
            </h4>
            <span className="text-xs text-slate-500 font-medium">Click any day tab to view and customize its period schedule</span>
          </div>

          {/* Day selection tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {ALL_DAYS.map((d) => {
              const isSelected = selectedDayKey === d.id;
              const sched = daySchedules[d.id] || {};
              const isOper = operatingDays.includes(d.id);

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDayKey(d.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    !isOper
                      ? "opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-900"
                      : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold">{d.label}</span>
                    {sched.isHalfDay && (
                      <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${isSelected ? "bg-amber-300 text-amber-950" : "bg-amber-100 text-amber-800"}`}>
                        Half Day
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] font-mono opacity-90">
                    {sched.schoolStartTime || "07:00"} – {sched.schoolEndTime || "14:00"}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {(sched.periods || []).length} slots
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Day Toolbar & Timing Settings ─────────────────────────── */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  {currentDaySchedule.dayLabel} Schedule Configuration
                </span>
                {currentDaySchedule.isHalfDay && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                    Half-Day Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Set opening & closing bell times for {currentDaySchedule.dayLabel}, or copy this schedule to other days.
              </p>
            </div>

            {/* Quick Presets & Copy Tools */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={copyCurrentDayToAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                title="Copy current day's times and periods to all days (Mon–Sat)"
              >
                <Copy size={13} className="text-indigo-500" /> Copy {currentDaySchedule.dayLabel} → All Days
              </button>

              <button
                type="button"
                onClick={copyCurrentDayToWeekdays}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                title="Copy current day's times and periods to Monday–Friday"
              >
                <Copy size={13} className="text-emerald-500" /> Copy to Weekdays (Mon–Fri)
              </button>

              {selectedDayKey === "saturday" ? (
                <button
                  type="button"
                  onClick={loadSaturdayPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition cursor-pointer"
                >
                  <Sparkles size={13} /> Load Half-Day Preset (8–12)
                </button>
              ) : selectedDayKey === "friday" ? (
                <button
                  type="button"
                  onClick={loadFridayPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 transition cursor-pointer"
                >
                  <Sparkles size={13} /> Load Friday Short Day (7–1)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => loadFullDayPreset(selectedDayKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Sparkles size={13} /> Load Full-Day 8-Slots
                </button>
              )}
            </div>
          </div>

          {/* Timings & Half-Day Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Sunrise size={14} className="text-amber-500" /> School Opening Bell ({currentDaySchedule.dayLabel})
              </label>
              <input
                type="time"
                value={currentDaySchedule.schoolStartTime || "07:00"}
                onChange={(e) => updateDayField(selectedDayKey, "schoolStartTime", e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Sunset size={14} className="text-rose-500" /> School Closing Bell ({currentDaySchedule.dayLabel})
              </label>
              <input
                type="time"
                value={currentDaySchedule.schoolEndTime || "14:00"}
                onChange={(e) => updateDayField(selectedDayKey, "schoolEndTime", e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Day Schedule Type
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(currentDaySchedule.isHalfDay)}
                  onChange={(e) => updateDayField(selectedDayKey, "isHalfDay", e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Mark as Half-Day Schedule
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Visual Connected Timeline for Selected Day */}
        <DayTimelineVisualizer
          periods={curDayPeriods}
          schoolStart={currentDaySchedule.schoolStartTime}
          schoolEnd={currentDaySchedule.schoolEndTime}
        />

        {/* ── Active Day Period Slots List ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                {currentDaySchedule.dayLabel} Periods ({curDayPeriods.length} slots • {curDayDurationFmt})
              </h4>
              <p className="text-xs text-slate-500">
                Configure periods in sequence for {currentDaySchedule.dayLabel}. Only class slots will need subject & teacher assignment in the timetable builder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => addPeriodToDay(selectedDayKey)}
              className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-indigo-100 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus size={14} /> Add Slot to {currentDaySchedule.dayLabel}
            </button>
          </div>

          <div className="space-y-3">
            {curDayPeriods.map((period, idx) => (
              <PeriodSlotRow
                key={period._id || idx}
                period={period}
                index={idx}
                onChange={(f, val) => updateDayPeriod(selectedDayKey, idx, f, val)}
                onRemove={() => removeDayPeriod(selectedDayKey, idx)}
                schoolStart={currentDaySchedule.schoolStartTime}
                schoolEnd={currentDaySchedule.schoolEndTime}
              />
            ))}
          </div>

          {curDayPeriods.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <AlertCircle size={32} className="mx-auto text-amber-500 opacity-60" />
              <p className="text-xs font-semibold">No period slots added for {currentDaySchedule.dayLabel}.</p>
              <button
                type="button"
                onClick={() => addPeriodToDay(selectedDayKey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
              >
                Add First Period
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        {hasSaved ? (
          <button
            type="button"
            onClick={() => setMode("view")}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel & Return to View Mode
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 text-xs transition cursor-pointer"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving Schedule..." : "Save Master Schedule"}
        </button>
      </div>
    </div>
  );
};

// ─── Top-Level MasterPeriodSettings Component ─────────────────────────────────
const MasterPeriodSettings = () => {
  const [activeTab, setActiveTab] = useState("regular");
  const [allData, setAllData] = useState({ regular: null, exam: null });
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/periods");
      const list = res.data?.schedules || [];
      const map = { regular: null, exam: null };
      list.forEach((s) => {
        if (s.scheduleType) map[s.scheduleType] = s;
      });
      setAllData(map);
    } catch {
      // Silently handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const scheduleTabs = [
    {
      id: "regular",
      label: "Regular Day Schedule",
      icon: CalendarDays,
      desc: "Day-wise institutional bell timings, periods, and Saturday Half-Day schedule.",
      color: "from-indigo-600 to-blue-600",
    },
    {
      id: "exam",
      label: "Exam Day Schedule",
      icon: GraduationCap,
      desc: "Specialized examination sessions, question paper distribution, and revision breaks.",
      color: "from-purple-600 to-violet-600",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Studio Banner Header */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/20">
              Timetable ERP Studio
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/20">
              Day-Wise Engine Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Master Period & Timetable Management
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
            Configure institutional opening/closing bell timings, full-day sequences (Monday–Friday), and <strong>custom day routines (such as Saturday Half-Day)</strong> stored day by day.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center text-indigo-300 shadow-inner">
            <Clock size={28} />
          </div>
        </div>
      </div>

      {/* Segmented Schedule Template Switcher (Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scheduleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start gap-4 p-5 rounded-3xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? `bg-gradient-to-br ${tab.color} text-white border-transparent shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400/50 scale-[1.005]`
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-extrabold ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    {tab.label}
                  </h4>
                  {isActive && <CheckCircle size={16} className="text-white shrink-0" />}
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Builder Studio Container */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw size={22} className="animate-spin text-indigo-500" />
          <span className="text-sm font-bold">Loading master timetable data...</span>
        </div>
      ) : (
        <ScheduleBuilder
          key={activeTab}
          scheduleType={activeTab}
          savedData={allData[activeTab]}
          onSaved={(saved) => {
            setAllData((prev) => ({ ...prev, [activeTab]: saved }));
          }}
        />
      )}
    </div>
  );
};

export default MasterPeriodSettings;
