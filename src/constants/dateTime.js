/**
 * @file dateTime.js
 * @description Centralized constants for calendar months, days of the week, school schedules, and academic years.
 */

// ─── Month Constants ──────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Standard 1-indexed month dropdown options (value: "1" .. "12")
 */
export const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  value: String(index + 1),
  label: name,
  name,
  short: SHORT_MONTH_NAMES[index],
  index: index + 1,
  monthIndex: index,
}));

/**
 * Month dropdown options with an "all" filter option
 */
export const MONTH_OPTIONS_WITH_ALL = [
  { value: "all", label: "All Months", short: "All", index: 0, monthIndex: -1 },
  ...MONTH_OPTIONS,
];

/**
 * Full-name month dropdown options (value: "January" .. "December")
 */
export const MONTH_NAME_OPTIONS = MONTH_NAMES.map((name, index) => ({
  value: name,
  label: name,
  name,
  short: SHORT_MONTH_NAMES[index],
  index: index + 1,
  monthIndex: index,
}));

// ─── Day of Week Constants ────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  { id: "monday",    value: "monday",    label: "Monday",    name: "Monday",    short: "Mon", index: 1 },
  { id: "tuesday",   value: "tuesday",   label: "Tuesday",   name: "Tuesday",   short: "Tue", index: 2 },
  { id: "wednesday", value: "wednesday", label: "Wednesday", name: "Wednesday", short: "Wed", index: 3 },
  { id: "thursday",  value: "thursday",  label: "Thursday",  name: "Thursday",  short: "Thu", index: 4 },
  { id: "friday",    value: "friday",    label: "Friday",    name: "Friday",    short: "Fri", index: 5 },
  { id: "saturday",  value: "saturday",  label: "Saturday",  name: "Saturday",  short: "Sat", index: 6 },
  { id: "sunday",    value: "sunday",    label: "Sunday",    name: "Sunday",    short: "Sun", index: 0 },
];

/**
 * Active school instructional days (Monday through Saturday)
 */
export const SCHOOL_DAYS = DAYS_OF_WEEK.slice(0, 6);

/**
 * Weekday list matching timetable configuration
 */
export const WEEKDAYS = SCHOOL_DAYS;

/**
 * Pure 5-day school week (Monday through Friday)
 */
export const WORKING_DAYS = DAYS_OF_WEEK.slice(0, 5);

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAY_NAMES_LOWER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SCHOOL_DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WORKING_DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const WEEKDAY_SHORT_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DAY_OPTIONS = DAY_NAMES.map((day) => ({
  value: day,
  label: day,
  id: day.toLowerCase(),
}));

// ─── Year Constants ───────────────────────────────────────────────────────────

export const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = [
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
  CURRENT_YEAR + 2,
  CURRENT_YEAR + 3,
];

/**
 * Generates an array of year dropdown options around a baseline year.
 *
 * @param {number} [yearsBefore=3] - Number of previous years to include.
 * @param {number} [yearsAfter=3] - Number of future years to include.
 * @param {number} [baseYear=CURRENT_YEAR] - Baseline year.
 * @returns {Array<{value: string, label: string, year: number}>}
 */
export const getYearOptions = (yearsBefore = 3, yearsAfter = 3, baseYear = CURRENT_YEAR) => {
  const years = [];
  for (let i = baseYear + yearsAfter; i >= baseYear - yearsBefore; i--) {
    years.push({
      value: String(i),
      label: String(i),
      year: i,
    });
  }
  return years;
};

export const YEAR_OPTIONS_WITH_ALL = [
  { value: "all", label: "All Years", year: 0 },
  ...getYearOptions(3, 1),
];

export default {
  MONTH_NAMES,
  SHORT_MONTH_NAMES,
  MONTH_OPTIONS,
  MONTH_OPTIONS_WITH_ALL,
  MONTH_NAME_OPTIONS,
  DAYS_OF_WEEK,
  SCHOOL_DAYS,
  WEEKDAYS,
  WORKING_DAYS,
  DAY_NAMES,
  DAY_NAMES_LOWER,
  SCHOOL_DAY_NAMES,
  WEEKDAY_SHORT_NAMES,
  DAY_OPTIONS,
  CURRENT_YEAR,
  YEAR_OPTIONS,
  YEAR_OPTIONS_WITH_ALL,
  getYearOptions,
};
