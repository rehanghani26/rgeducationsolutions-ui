// MasterPeriodSettings — Premium Modern UI with single API fetch
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus, Trash2, Save, Clock, GraduationCap,
  CalendarDays, BookOpen, CheckCircle,
  RefreshCw, Layers, Flag, MapPin, Sparkles,
  ArrowRight, ShieldCheck, Info
} from "lucide-react";
import api from "../../services/api.js";

// ─── Period type config ────────────────────────────────────────────────────────
const PERIOD_TYPES = [
  { value: "prayer",     label: "Prayer",    icon: "🙏", color: "from-amber-500 to-yellow-500",  bg: "bg-amber-50 dark:bg-amber-950/30",   text: "text-amber-700 dark:text-amber-300",   border: "border-amber-200 dark:border-amber-800/50"   },
  { value: "class",      label: "Class",     icon: "📚", color: "from-indigo-500 to-blue-600",   bg: "bg-indigo-50 dark:bg-indigo-950/30",  text: "text-indigo-700 dark:text-indigo-300",  border: "border-indigo-200 dark:border-indigo-800/50"  },
  { value: "pt",         label: "PT / Sports",icon:"🏃", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/50" },
  { value: "lunch",      label: "Lunch",     icon: "🍱", color: "from-orange-500 to-amber-600", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800/50"  },
  { value: "dance",      label: "Dance",     icon: "💃", color: "from-pink-500 to-rose-600",     bg: "bg-pink-50 dark:bg-pink-950/30",      text: "text-pink-700 dark:text-pink-300",      border: "border-pink-200 dark:border-pink-800/50"      },
  { value: "activities", label: "Activity",  icon: "🎨", color: "from-purple-500 to-violet-600",bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800/50"  },
  { value: "singing",    label: "Music",     icon: "🎵", color: "from-cyan-500 to-blue-600",     bg: "bg-cyan-50 dark:bg-cyan-950/30",      text: "text-cyan-700 dark:text-cyan-300",      border: "border-cyan-200 dark:border-cyan-800/50"      },
  { value: "recess",     label: "Recess",    icon: "☕", color: "from-teal-500 to-emerald-600",  bg: "bg-teal-50 dark:bg-teal-950/30",      text: "text-teal-700 dark:text-teal-300",      border: "border-teal-200 dark:border-teal-800/50"      },
  { value: "leave",      label: "Leave",     icon: "🚌", color: "from-rose-500 to-red-600",      bg: "bg-rose-50 dark:bg-rose-950/30",      text: "text-rose-700 dark:text-rose-300",      border: "border-rose-200 dark:border-rose-800/50"      },
  { value: "custom",     label: "Custom",    icon: "⚡", color: "from-slate-600 to-slate-700",   bg: "bg-slate-100 dark:bg-slate-800",      text: "text-slate-700 dark:text-slate-200",    border: "border-slate-300 dark:border-slate-700"      },
];

const getPeriodMeta = (type) =>
  PERIOD_TYPES.find((p) => p.value === type) || PERIOD_TYPES[9];

const formatDuration = (start, end) => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return "";
  return mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ""}` : `${mins}m`;
};

const emptyPeriod = (startTime = "") => ({
  _id: `p-${Date.now()}-${Math.random()}`,
  type: "class",
  customLabel: "",
  startTime,
  endTime: "",
});

// ─── Default templates ────────────────────────────────────────────────────────
const mk = (type, start, end) => ({ _id: `tmpl-${Math.random()}`, type, customLabel: "", startTime: start, endTime: end });

const DEFAULT_SCHEDULES = {
  regular: {
    name: "Regular Day Schedule",
    schoolStartTime: "07:00",
    schoolEndTime: "14:00",
    periods: [
      mk("prayer",     "07:00", "07:30"),
      mk("class",      "07:31", "08:30"),
      mk("class",      "08:30", "09:30"),
      mk("class",      "09:30", "10:30"),
      mk("lunch",      "10:30", "11:30"),
      mk("class",      "11:30", "12:30"),
      mk("class",      "12:30", "13:30"),
      mk("activities", "13:30", "14:00"),
    ],
  },
  exam: {
    name: "Exam Day Schedule",
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    periods: [
      mk("prayer", "08:00", "08:15"),
      mk("class",  "08:15", "10:15"),
      mk("recess", "10:15", "10:30"),
      mk("class",  "10:30", "12:30"),
      mk("lunch",  "12:30", "13:00"),
      mk("class",  "13:00", "15:00"),
    ],
  },
};

// ─── Period Timeline Card Component ──────────────────────────────────────────
const PeriodCard = ({ period, index, isLast, onChange, onRemove, schoolStart, schoolEnd }) => {
  const meta = getPeriodMeta(period.type);
  const duration = formatDuration(period.startTime, period.endTime);

  return (
    <div className="flex gap-3 group relative">
      {/* ── Timeline track & Node badge ──────────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-slate-900/10 group-hover:scale-105 transition-all duration-200 ring-4 ring-white dark:ring-slate-900 z-10`}>
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-[36px] bg-slate-200 dark:bg-slate-800 my-1 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-900/50 transition-colors" />
        )}
      </div>

      {/* ── Card Content ─────────────────────────────────────────── */}
      <div className="flex-1 mb-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-4 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Top header strip */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{meta.icon}</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {period.type === "custom" && period.customLabel ? period.customLabel : meta.label}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
              Slot #{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {duration && (
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                ⏱️ {duration}
              </span>
            )}
            <button
              onClick={onRemove}
              className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors"
              title="Delete Period"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Period type selector pills */}
        <div className="mb-3.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
            Select Category / Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_TYPES.map((pt) => {
              const active = period.type === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => onChange("type", pt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
                    ${active
                      ? `bg-gradient-to-r ${pt.color} text-white border-transparent shadow-sm scale-[1.02]`
                      : `${pt.bg} ${pt.text} ${pt.border} hover:opacity-90`
                    }`}
                >
                  <span className="text-xs">{pt.icon}</span>
                  {pt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Label field */}
        {period.type === "custom" && (
          <div className="mb-3.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Custom Name / Title
            </label>
            <input
              type="text"
              value={period.customLabel}
              placeholder="e.g. Assembly / Library Hour"
              onChange={(e) => onChange("customLabel", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        )}

        {/* Start & End Time Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Start Time</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">Min: {schoolStart || "--:--"}</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={period.startTime}
                min={schoolStart || undefined}
                max={period.endTime || schoolEnd || undefined}
                onChange={(e) => onChange("startTime", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>End Time</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">Max: {schoolEnd || "--:--"}</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={period.endTime}
                min={period.startTime || schoolStart || undefined}
                max={schoolEnd || undefined}
                onChange={(e) => onChange("endTime", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Days config ─────────────────────────────────────────────────────────────
const DAYS_LIST = [
  { id: "monday",    label: "Monday",    short: "Mon" },
  { id: "tuesday",   label: "Tuesday",   short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday",  label: "Thursday",  short: "Thu" },
  { id: "friday",    label: "Friday",    short: "Fri" },
  { id: "saturday",  label: "Saturday",  short: "Sat" },
];

// ─── Schedule Builder Component ───────────────────────────────────────────────
const ScheduleBuilder = ({ scheduleType, savedData }) => {
  const def = DEFAULT_SCHEDULES[scheduleType];
  const seed = savedData || null;

  const [scheduleId, setScheduleId]   = useState(seed?._id || seed?.id || null);
  const [name, setName]               = useState(seed?.name || def.name);
  const [schoolStart, setSchoolStart] = useState(seed?.schoolStartTime || def.schoolStartTime);
  const [schoolEnd, setSchoolEnd]     = useState(seed?.schoolEndTime   || def.schoolEndTime);
  const [selectedDays, setSelectedDays] = useState(
    () => seed?.days && seed.days.length > 0
      ? seed.days
      : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  );
  const [periods, setPeriods]         = useState(() =>
    seed?.periods?.length
      ? seed.periods.map((p) => ({ ...p, _id: p._id || `p-${Math.random()}` }))
      : def.periods.map((p) => ({ ...p, _id: `p-${Date.now()}-${Math.random()}` }))
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const selectAllDays = () => setSelectedDays(DAYS_LIST.map((d) => d.id));
  const clearDays = () => setSelectedDays([]);

  const addPeriod = () => {
    const lastEnd = periods[periods.length - 1]?.endTime || schoolStart;
    setPeriods((prev) => [...prev, emptyPeriod(lastEnd)]);
  };

  const clearAllPeriods = () => {
    if (window.confirm("Are you sure you want to delete all period slots from this schedule?")) {
      setPeriods([]);
      toast.info("All periods cleared. Click Save to persist.");
    }
  };

  const updatePeriod = (idx, field, val) =>
    setPeriods((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));

  const removePeriod = (idx) =>
    setPeriods((prev) => prev.filter((_, i) => i !== idx));

  // The ONLY API call — triggered by user clicking Save Schedule
  const handleSave = async () => {
    if (!schoolStart || !schoolEnd) {
      toast.error("Please set school start and end time first.");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day for this schedule.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        scheduleType,
        name,
        schoolStartTime: schoolStart,
        schoolEndTime: schoolEnd,
        days: selectedDays,
        periods,
      };

      const res = scheduleId
        ? await api.put(`/periods/${scheduleId}`, payload)
        : await api.post("/periods", payload);

      if (!scheduleId && res.data?.schedule) {
        setScheduleId(res.data.schedule._id || res.data.schedule.id);
      }

      if (res.data?.success) {
        toast.success("Master period schedule saved successfully!");
        const saved = res.data.schedule?.periods || [];
        if (saved.length) {
          setPeriods(saved.map((p) => ({ ...p, _id: p._id || `p-${Math.random()}` })));
        }
      } else {
        toast.error(res.data?.message || "Failed to save schedule");
      }
    } catch (err) {
      console.error("Save schedule error:", err);
      toast.error(err.response?.data?.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const totalDuration = () => {
    if (!schoolStart || !schoolEnd) return "--";
    const [sh, sm] = schoolStart.split(":").map(Number);
    const [eh, em] = schoolEnd.split(":").map(Number);
    const m = (eh * 60 + em) - (sh * 60 + sm);
    return m > 0 ? `${Math.floor(m / 60)}h ${m % 60}m` : "--";
  };

  return (
    <div className="space-y-6">

      {/* Control Panel: School Hours & Days Selection */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">School Timing & Active Days</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set start/end hours and choose applicable days of the week</p>
            </div>
          </div>

          <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <ShieldCheck size={14} /> Total Day: {totalDuration()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Schedule Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="e.g. Regular Day Schedule"
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              School Opening Time
            </label>
            <input
              type="time"
              value={schoolStart}
              onChange={(e) => setSchoolStart(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              School Closing Time
            </label>
            <input
              type="time"
              value={schoolEnd}
              onChange={(e) => setSchoolEnd(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Days of the Week Selection */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Applicable Days ({selectedDays.length} / 6 selected)
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllDays}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={clearDays}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {DAYS_LIST.map((day) => {
              const active = selectedDays.includes(day.id);
              return (
                <label
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all duration-150 ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => {}} // handled by label onClick
                    className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 hidden"
                  />
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                    active ? "bg-white text-indigo-600" : "border border-slate-300 dark:border-slate-600"
                  }`}>
                    {active ? "✓" : ""}
                  </span>
                  <span>{day.short}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Quick statistics row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Layers size={13} className="text-indigo-500" /> Total Slots: <span className="font-extrabold text-slate-900 dark:text-white">{periods.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <BookOpen size={13} className="text-blue-500" /> Academic Classes: <span className="font-extrabold text-slate-900 dark:text-white">{periods.filter(p => p.type === 'class').length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Clock size={13} className="text-amber-500" /> Breaks & Recess: <span className="font-extrabold text-slate-900 dark:text-white">{periods.filter(p => ['lunch','recess'].includes(p.type)).length}</span>
          </div>
        </div>
      </div>

      {/* Period Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily Period Sequence</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure time slots from school opening to closing</p>
          </div>

          <div className="flex items-center gap-2">
            {periods.length > 0 && (
              <button
                type="button"
                onClick={clearAllPeriods}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all"
              >
                <Trash2 size={14} /> Clear All Periods
              </button>
            )}
            <button
              type="button"
              onClick={addPeriod}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={15} /> Add Next Period
            </button>
          </div>
        </div>

        {/* Timeline track container */}
        <div className="pl-1 pt-2">
          {/* Start Banner Node */}
          {schoolStart && (
            <div className="flex gap-3 items-center mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0">
                <Flag size={16} />
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">School Opens</span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{schoolStart}</span>
              </div>
            </div>
          )}

          {periods.length === 0 && (
            <div className="ml-12 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-500">No periods defined in this schedule.</p>
              <p className="text-xs text-slate-400">Click "Add Next Period" above to create slots.</p>
            </div>
          )}

          {/* Cards List */}
          {periods.map((period, idx) => (
            <PeriodCard
              key={period._id}
              period={period}
              index={idx}
              isLast={idx === periods.length - 1}
              schoolStart={schoolStart}
              schoolEnd={schoolEnd}
              onChange={(field, val) => updatePeriod(idx, field, val)}
              onRemove={() => removePeriod(idx)}
            />
          ))}

          {/* End Banner Node */}
          {schoolEnd && periods.length > 0 && (
            <div className="flex gap-3 items-center mt-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">School Closes</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{schoolEnd}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving Schedule..." : "Save Master Schedule"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component — Single API fetch, Tab container ─────────────────────────
const MasterPeriodSettings = () => {
  const [activeTab, setActiveTab]     = useState("regular");
  const [allData, setAllData]         = useState({ regular: null, exam: null });
  const [loading, setLoading]         = useState(true);

  // Single fetch on mount — loads both schedules at once, no re-fetch on tab switch
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/periods");
        const list = res.data?.schedules || [];
        const map = { regular: null, exam: null };
        list.forEach((s) => { if (s.scheduleType) map[s.scheduleType] = s; });
        setAllData(map);
      } catch {
        /* silently use defaults */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tabs = [
    { id: "regular", label: "Regular Day Schedule", icon: CalendarDays, desc: "Standard daily classes, assembly, lunch & recess", color: "from-indigo-600 to-blue-600" },
    { id: "exam",    label: "Exam Day Schedule",    icon: GraduationCap, desc: "Examination exam slots, gaps & revision slots", color: "from-purple-600 to-violet-600" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-400/20">
              Timetable ERP Module
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Master Period Timetable</h2>
          <p className="text-xs text-slate-300/80">
            Define period breakdown, duration metrics, and slot categories for regular and exam schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-indigo-300">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Segmented Schedule Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                active
                  ? `bg-gradient-to-br ${tab.color} text-white border-transparent shadow-lg shadow-indigo-500/15 scale-[1.01]`
                  : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              }`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-extrabold ${active ? "text-white" : "text-slate-900 dark:text-white"}`}>
                    {tab.label}
                  </p>
                  {active && <CheckCircle size={16} className="text-white flex-shrink-0" />}
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${active ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Builder content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700">
          <RefreshCw size={20} className="animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading schedule data...</span>
        </div>
      ) : (
        <ScheduleBuilder key={activeTab} scheduleType={activeTab} savedData={allData[activeTab]} />
      )}
    </div>
  );
};

export default MasterPeriodSettings;
