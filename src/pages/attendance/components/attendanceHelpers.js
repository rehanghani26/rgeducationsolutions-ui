export const ATTENDANCE_STATUS_CHOICES = [
  { value: "Present", apiValue: "present", short: "P", activeClass: "bg-emerald-600 text-white shadow-xs", textClass: "text-emerald-600 dark:text-emerald-400", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  { value: "Absent", apiValue: "absent", short: "A", activeClass: "bg-rose-600 text-white shadow-xs", textClass: "text-rose-600 dark:text-rose-400", badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
  { value: "Late", apiValue: "late", short: "L", activeClass: "bg-amber-600 text-white shadow-xs", textClass: "text-amber-600 dark:text-amber-400", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  { value: "Half Day", apiValue: "half day", short: "HD", activeClass: "bg-teal-600 text-white shadow-xs", textClass: "text-teal-600 dark:text-teal-400", badgeClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20" },
  { value: "Leave", apiValue: "leave", short: "LV", activeClass: "bg-purple-600 text-white shadow-xs", textClass: "text-purple-600 dark:text-purple-400", badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" },
];

export const REMARK_PRESETS = [
  "Sick / Unwell",
  "Late arrival",
  "Parent informed",
  "Family event",
  "Medical appointment",
  "Permission granted",
];

export function normalizeStatusLabel(raw) {
  const key = String(raw || "present").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (key === "present") return "Present";
  if (key === "absent") return "Absent";
  if (key === "late") return "Late";
  if (key === "half day" || key === "halfday") return "Half Day";
  if (key === "leave" || key === "on leave") return "Leave";
  return "Present";
}

export function statusConfig(status) {
  const label = normalizeStatusLabel(status);
  return ATTENDANCE_STATUS_CHOICES.find((c) => c.value === label) || ATTENDANCE_STATUS_CHOICES[0];
}

export function attendanceDateKeyOf(record) {
  if (record?.attendanceDateKey && /^\d{4}-\d{2}-\d{2}$/.test(record.attendanceDateKey)) {
    return record.attendanceDateKey;
  }
  const raw = record?.attendanceDate || record?.date;
  if (!raw) return "";
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function summarizeRoster(list = []) {
  let present = 0;
  let absent = 0;
  let late = 0;
  let halfDay = 0;
  let leave = 0;
  for (const item of list) {
    const label = normalizeStatusLabel(item.status);
    if (label === "Present") present += 1;
    else if (label === "Absent") absent += 1;
    else if (label === "Late") late += 1;
    else if (label === "Half Day") halfDay += 1;
    else if (label === "Leave") leave += 1;
  }
  const total = list.length;
  const effective = present + halfDay * 0.5;
  const percentage = total > 0 ? Math.min(100, Math.round((effective / total) * 100)) : 0;
  return { total, present, absent, late, halfDay, leave, percentage };
}

export function initialsOf(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function rateTone(percentage = 0) {
  const pct = Number(percentage) || 0;
  if (pct >= 85) {
    return {
      barClass: "bg-emerald-500",
      pillClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      textClass: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (pct >= 65) {
    return {
      barClass: "bg-amber-500",
      pillClass:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      textClass: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    barClass: "bg-rose-500",
    pillClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    textClass: "text-rose-600 dark:text-rose-400",
  };
}

export function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function downloadRosterCsv({ filename, title, dateKey, rows }) {
  const headers = ["#", "Roll / ID", "Name", "Class / Department", "Status", "Remarks"];
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((r, idx) =>
      [idx + 1, r.roll || "", r.name || "", r.classSection || title || "", normalizeStatusLabel(r.status), r.remarks || ""]
        .map(csvCell)
        .join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `attendance-${dateKey || "export"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
