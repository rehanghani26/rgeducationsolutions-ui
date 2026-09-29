// Timetable Utilities, Predefined Templates, and Timing Validation Helpers

export const SLOT_TYPES = [
  {
    value: "class",
    label: "Class",
    icon: "📚",
    badgeBg: "bg-indigo-100 dark:bg-indigo-950/70",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
    barColor: "bg-indigo-500",
    category: "academic",
  },
  {
    value: "prayer",
    label: "Prayer",
    icon: "🙏",
    badgeBg: "bg-amber-100 dark:bg-amber-950/70",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    barColor: "bg-amber-500",
    category: "activity",
  },
  {
    value: "assembly",
    label: "Assembly",
    icon: "🏛️",
    badgeBg: "bg-yellow-100 dark:bg-yellow-950/70",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    barColor: "bg-yellow-500",
    category: "activity",
  },
  {
    value: "break",
    label: "Break",
    icon: "☕",
    badgeBg: "bg-rose-100 dark:bg-rose-950/70",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    barColor: "bg-rose-400",
    category: "break",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: "🍱",
    badgeBg: "bg-orange-100 dark:bg-orange-950/70",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    barColor: "bg-orange-500",
    category: "break",
  },
  {
    value: "recess",
    label: "Recess",
    icon: "🥪",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    barColor: "bg-emerald-500",
    category: "break",
  },
  {
    value: "sports",
    label: "Sports",
    icon: "⚽",
    badgeBg: "bg-teal-100 dark:bg-teal-950/70",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    barColor: "bg-teal-500",
    category: "activity",
  },
  {
    value: "activity",
    label: "Activity",
    icon: "🎨",
    badgeBg: "bg-purple-100 dark:bg-purple-950/70",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    barColor: "bg-purple-500",
    category: "activity",
  },
  {
    value: "exam",
    label: "Exam",
    icon: "📝",
    badgeBg: "bg-red-100 dark:bg-red-950/70",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    barColor: "bg-red-500",
    category: "activity",
  },
  {
    value: "custom",
    label: "Custom",
    icon: "⚡",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-200",
    border: "border-slate-300 dark:border-slate-700",
    barColor: "bg-slate-500",
    category: "activity",
  },
];

export const getSlotTypeMeta = (type) => {
  return SLOT_TYPES.find((t) => t.value === type) || SLOT_TYPES[SLOT_TYPES.length - 1];
};

export const WEEK_DAYS = [
  { id: "monday", label: "Monday", short: "Mon" },
  { id: "tuesday", label: "Tuesday", short: "Tue" },
  { id: "wednesday", label: "Wednesday", short: "Wed" },
  { id: "thursday", label: "Thursday", short: "Thu" },
  { id: "friday", label: "Friday", short: "Fri" },
  { id: "saturday", label: "Saturday", short: "Sat" },
];

export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

export const minutesToTime = (mins) => {
  if (mins === undefined || mins === null || isNaN(mins)) return "00:00";
  const safeMins = Math.max(0, mins);
  const h = Math.floor(safeMins / 60) % 24;
  const m = safeMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatDurationString = (mins) => {
  if (!mins || mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const calcSlotDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.max(0, end - start);
};

// ─── 5 Standard Predefined Selectable Timetable Templates ─────────────────────────
export const TIMETABLE_TEMPLATES = [
  {
    id: "tpl-regular-day",
    name: "Regular Day Schedule",
    scheduleType: "regular",
    tagline: "Standard full-day institutional schedule (7 Hours)",
    badge: "Default / Popular",
    schoolStartTime: "07:00",
    schoolEndTime: "14:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    slots: [
      { name: "Morning Assembly & Prayer", type: "prayer", startTime: "07:00", endTime: "07:30" },
      { name: "Period 1", type: "class", startTime: "07:30", endTime: "08:30" },
      { name: "Period 2", type: "class", startTime: "08:30", endTime: "09:30" },
      { name: "Period 3", type: "class", startTime: "09:30", endTime: "10:30" },
      { name: "Lunch Break", type: "lunch", startTime: "10:30", endTime: "11:30" },
      { name: "Period 4", type: "class", startTime: "11:30", endTime: "12:30" },
      { name: "Period 5", type: "class", startTime: "12:30", endTime: "13:30" },
      { name: "Club / Activity Session", type: "activity", startTime: "13:30", endTime: "14:00" },
    ],
  },
  {
    id: "tpl-short-day",
    name: "Short Day Schedule",
    scheduleType: "regular",
    tagline: "Condensed 5-hour academic schedule with recess",
    badge: "5 Hours",
    schoolStartTime: "08:00",
    schoolEndTime: "13:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    slots: [
      { name: "Morning Prayer", type: "prayer", startTime: "08:00", endTime: "08:30" },
      { name: "Period 1", type: "class", startTime: "08:30", endTime: "09:30" },
      { name: "Period 2", type: "class", startTime: "09:30", endTime: "10:30" },
      { name: "Recess Break", type: "recess", startTime: "10:30", endTime: "11:00" },
      { name: "Period 3", type: "class", startTime: "11:00", endTime: "12:00" },
      { name: "Period 4", type: "class", startTime: "12:00", endTime: "13:00" },
    ],
  },
  {
    id: "tpl-summer-schedule",
    name: "Summer Schedule",
    scheduleType: "regular",
    tagline: "Early morning start to avoid midday heat (6 Hours)",
    badge: "Summer / Early",
    schoolStartTime: "06:30",
    schoolEndTime: "12:30",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    slots: [
      { name: "Morning Assembly", type: "assembly", startTime: "06:30", endTime: "07:00" },
      { name: "Period 1", type: "class", startTime: "07:00", endTime: "08:00" },
      { name: "Period 2", type: "class", startTime: "08:00", endTime: "09:00" },
      { name: "Hydration & Recess", type: "recess", startTime: "09:00", endTime: "09:30" },
      { name: "Period 3", type: "class", startTime: "09:30", endTime: "10:30" },
      { name: "Period 4", type: "class", startTime: "10:30", endTime: "11:30" },
      { name: "Period 5", type: "class", startTime: "11:30", endTime: "12:30" },
    ],
  },
  {
    id: "tpl-half-day",
    name: "Half Day Schedule",
    scheduleType: "regular",
    tagline: "Weekend or test day compressed routine (3.5 Hours)",
    badge: "Half Day",
    schoolStartTime: "08:00",
    schoolEndTime: "11:30",
    days: ["saturday"],
    slots: [
      { name: "Morning Prayer", type: "prayer", startTime: "08:00", endTime: "08:30" },
      { name: "Period 1", type: "class", startTime: "08:30", endTime: "09:30" },
      { name: "Quick Recess", type: "recess", startTime: "09:30", endTime: "09:45" },
      { name: "Period 2", type: "class", startTime: "09:45", endTime: "10:45" },
      { name: "Period 3", type: "class", startTime: "10:45", endTime: "11:30" },
    ],
  },
  {
    id: "tpl-activity-sports-day",
    name: "Activity / Sports Day Schedule",
    scheduleType: "regular",
    tagline: "Dedicated sports drills, athletic coaching, and club sessions (6 Hours)",
    badge: "Sports & Activity",
    schoolStartTime: "08:00",
    schoolEndTime: "14:00",
    days: ["saturday"],
    slots: [
      { name: "Morning Assembly", type: "assembly", startTime: "08:00", endTime: "08:30" },
      { name: "Morning Academic Session", type: "class", startTime: "08:30", endTime: "10:00" },
      { name: "Fruit Recess", type: "recess", startTime: "10:00", endTime: "10:30" },
      { name: "Athletic & Sports Drills", type: "sports", startTime: "10:30", endTime: "12:00" },
      { name: "Lunch Break", type: "lunch", startTime: "12:00", endTime: "12:45" },
      { name: "Co-Curricular / Club Activities", type: "activity", startTime: "12:45", endTime: "14:00" },
    ],
  },
];

// ─── Schedule Statistics Calculator ─────────────────────────────────────────────
export const calculateScheduleStats = (schoolStartTime, schoolEndTime, slots = []) => {
  const schoolStartMins = timeToMinutes(schoolStartTime);
  const schoolEndMins = timeToMinutes(schoolEndTime);
  const totalDurationMins = Math.max(0, schoolEndMins - schoolStartMins);

  let classSlots = 0;
  let classDurationMins = 0;

  let breaksSlots = 0;
  let breakDurationMins = 0;

  let otherSlots = 0;
  let otherDurationMins = 0;

  slots.forEach((s) => {
    const dur = calcSlotDuration(s.startTime, s.endTime);
    const type = s.type || "class";

    if (type === "class") {
      classSlots += 1;
      classDurationMins += dur;
    } else if (["break", "lunch", "recess"].includes(type)) {
      breaksSlots += 1;
      breakDurationMins += dur;
    } else {
      otherSlots += 1;
      otherDurationMins += dur;
    }
  });

  const totalSlotsDurationMins = classDurationMins + breakDurationMins + otherDurationMins;

  return {
    totalDurationMins,
    totalDurationFormatted: formatDurationString(totalDurationMins),
    totalSlots: slots.length,
    classSlots,
    classDurationFormatted: formatDurationString(classDurationMins),
    breaksSlots,
    breakDurationFormatted: formatDurationString(breakDurationMins),
    otherSlots,
    otherDurationFormatted: formatDurationString(otherDurationMins),
    totalSlotsDurationMins,
    gapMins: Math.max(0, totalDurationMins - totalSlotsDurationMins),
  };
};

// ─── Timing & Overlap Validator ─────────────────────────────────────────────────
export const validateSchedule = (schoolStartTime, schoolEndTime, slots = []) => {
  const errors = [];
  const slotErrors = {}; // mapping slot index to error message

  // 1. Closing time must be after opening time
  const schoolStartMins = timeToMinutes(schoolStartTime);
  const schoolEndMins = timeToMinutes(schoolEndTime);

  if (!schoolStartTime || !schoolEndTime) {
    errors.push("Both school opening time and closing time are required.");
  } else if (schoolEndMins <= schoolStartMins) {
    errors.push(`School closing time (${schoolEndTime}) must be strictly after opening time (${schoolStartTime}).`);
  }

  // 2. Validate individual slots
  slots.forEach((slot, index) => {
    const slotStartMins = timeToMinutes(slot.startTime);
    const slotEndMins = timeToMinutes(slot.endTime);
    const slotLabel = slot.name?.trim() || `Slot #${index + 1}`;

    if (!slot.startTime || !slot.endTime) {
      const msg = `${slotLabel}: Start time and End time must be set.`;
      errors.push(msg);
      slotErrors[index] = msg;
      return;
    }

    // End time after start time
    if (slotEndMins <= slotStartMins) {
      const msg = `${slotLabel}: End time (${slot.endTime}) must be after start time (${slot.startTime}).`;
      errors.push(msg);
      slotErrors[index] = msg;
      return;
    }

    // Slots stay within school hours
    if (slotStartMins < schoolStartMins) {
      const msg = `${slotLabel}: Starts at ${slot.startTime}, which is before school opening time (${schoolStartTime}).`;
      errors.push(msg);
      slotErrors[index] = msg;
      return;
    }

    if (slotEndMins > schoolEndMins) {
      const msg = `${slotLabel}: Ends at ${slot.endTime}, which exceeds school closing time (${schoolEndTime}).`;
      errors.push(msg);
      slotErrors[index] = msg;
      return;
    }
  });

  // 3. Overlap check across slots (Gaps ARE allowed)
  for (let i = 0; i < slots.length; i++) {
    const start_i = timeToMinutes(slots[i].startTime);
    const end_i = timeToMinutes(slots[i].endTime);
    const name_i = slots[i].name?.trim() || `Slot #${i + 1}`;

    if (end_i <= start_i) continue; // already caught

    for (let j = i + 1; j < slots.length; j++) {
      const start_j = timeToMinutes(slots[j].startTime);
      const end_j = timeToMinutes(slots[j].endTime);
      const name_j = slots[j].name?.trim() || `Slot #${j + 1}`;

      if (end_j <= start_j) continue;

      // Overlap condition: start of one is strictly less than end of another when sorted
      if (Math.max(start_i, start_j) < Math.min(end_i, end_j)) {
        const msg = `Conflict: "${name_i}" (${slots[i].startTime} - ${slots[i].endTime}) overlaps with "${name_j}" (${slots[j].startTime} - ${slots[j].endTime}).`;
        errors.push(msg);
        slotErrors[i] = msg;
        slotErrors[j] = msg;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    slotErrors,
  };
};
