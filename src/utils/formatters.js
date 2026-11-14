/**
 * @file formatters.js
 * @description Centralized formatting helpers for dates, currency, text, and numbers.
 */

import { MONTH_NAMES, SHORT_MONTH_NAMES, DAY_NAMES } from '../constants/dateTime.js';

/**
 * Formats a numeric value into standard Indian Currency (INR) representation.
 * Handles numbers, numeric strings, and falsy inputs cleanly.
 *
 * @example
 *   formatCurrency(12500) -> "₹12,500"
 *   formatCurrency(0) -> "₹0"
 *   formatCurrency(null) -> "₹0"
 *
 * @param {number|string} [val=0] - Numeric value to format.
 * @param {string} [currency='₹'] - Currency symbol prefix.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (val = 0, currency = '₹') => {
  const n = Number(val);
  if (Number.isNaN(n)) return `${currency}0`;
  return `${currency}${n.toLocaleString('en-IN')}`;
};

/**
 * Formats a numeric value using Indian number grouping without any currency symbol prefix.
 *
 * @param {number|string} [val=0]
 * @returns {string}
 */
export const formatCurrencyWithoutSymbol = (val = 0) => {
  const n = Number(val);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
};

/**
 * Checks whether an input represents a valid date.
 *
 * @param {any} value
 * @returns {boolean}
 */
export const isValidDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

/**
 * Standard date formatter. Defaults to "12 Nov 2026" in Indian English.
 *
 * @param {Date|string|number} date - Date to format.
 * @param {Intl.DateTimeFormatOptions} [options] - Intl format options.
 * @param {string} [fallback='—'] - Fallback when date is empty or invalid.
 * @returns {string} Formatted date.
 */
export const formatDate = (
  date,
  options = { day: 'numeric', month: 'short', year: 'numeric' },
  fallback = '—'
) => {
  if (!date) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date || fallback);
  return d.toLocaleDateString('en-IN', options);
};

/**
 * Formats date into long text (e.g. "12 November 2026").
 *
 * @param {Date|string|number} date
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatDateLong = (date, fallback = '—') => {
  return formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' }, fallback);
};

/**
 * Formats date into short text (e.g. "12 Nov 2026").
 *
 * @param {Date|string|number} date
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatDateShort = (date, fallback = '—') => {
  return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }, fallback);
};

/**
 * Formats date into numeric string (e.g. "12/11/2026").
 *
 * @param {Date|string|number} date
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatDateNumeric = (date, fallback = '—') => {
  return formatDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' }, fallback);
};

/**
 * Formats date and time into a readable timestamp (e.g. "12 Nov 2026, 02:45 PM").
 *
 * @param {Date|string|number} date
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatDateTime = (date, fallback = '—') => {
  if (!date) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date || fallback);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats time portion only (e.g. "02:45 PM").
 *
 * @param {Date|string|number} date
 * @param {string} [fallback='—']
 * @returns {string}
 */
export const formatTime = (date, fallback = '—') => {
  if (!date) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date || fallback);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Extracts a strict YYYY-MM-DD string safely from a date input.
 * Ideal for `<input type="date" />` and backend query parameters.
 *
 * @param {Date|string|number} value
 * @returns {string} YYYY-MM-DD or empty string.
 */
export const dateOnly = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toISOString().slice(0, 10);
};

/**
 * Returns month name for a given month index (0-11 or 1-12) or string.
 *
 * @param {number|string} month - 1-12 (or 0-11).
 * @param {boolean} [isZeroBased=false] - If true, 0 is January.
 * @returns {string}
 */
export const getMonthName = (month, isZeroBased = false) => {
  const num = Number(month);
  if (Number.isNaN(num)) return '';
  const idx = isZeroBased ? num : num - 1;
  return MONTH_NAMES[idx] || '';
};

/**
 * Returns 0-based month index (0-11) from a month name or string like "November 2026".
 *
 * @param {string} monthStr
 * @returns {number}
 */
export const getMonthIndex = (monthStr) => {
  if (!monthStr) return new Date().getMonth();
  const name = String(monthStr).trim().split(' ')[0].toLowerCase();
  const idx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === name);
  if (idx !== -1) return idx;
  const shortIdx = SHORT_MONTH_NAMES.findIndex((m) => m.toLowerCase() === name);
  return shortIdx !== -1 ? shortIdx : new Date().getMonth();
};

/**
 * Returns 1-based month number (1-12) from month name or string.
 *
 * @param {string} monthStr
 * @returns {number}
 */
export const getMonthNumber = (monthStr) => {
  return getMonthIndex(monthStr) + 1;
};

/**
 * Returns weekday name for a date object or 0-6 index.
 *
 * @param {Date|string|number} dateOrIndex
 * @returns {string}
 */
export const getDayName = (dateOrIndex) => {
  if (typeof dateOrIndex === 'number' && dateOrIndex >= 0 && dateOrIndex < 7) {
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayMap[dateOrIndex];
  }
  const d = new Date(dateOrIndex);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Formats a person's full name from an object.
 *
 * @param {Record<string, any>} [person={}]
 * @returns {string}
 */
export const formatFullName = (person = {}) => {
  if (!person) return '';
  if (person.name && String(person.name).trim()) return String(person.name).trim();
  const first = person.firstName || '';
  const last = person.lastName || '';
  return `${first} ${last}`.trim();
};

/**
 * Safely masks a bank account number, displaying only the last 4 digits.
 *
 * @param {string|number} acc
 * @returns {string} Masked string or "Not Provided"
 */
export const maskAccountNumber = (acc) => {
  if (!acc) return 'Not Provided';
  const str = String(acc).trim();
  if (str.length <= 4) return str;
  return `•••• •••• •••• ${str.slice(-4)}`;
};

/**
 * Safely parses JSON without throwing an uncaught error.
 *
 * @param {string} jsonString
 * @param {any} [fallback=null]
 * @returns {any}
 */
export const safeParseJson = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

export default {
  formatCurrency,
  formatCurrencyWithoutSymbol,
  isValidDate,
  formatDate,
  formatDateLong,
  formatDateShort,
  formatDateNumeric,
  formatDateTime,
  formatTime,
  dateOnly,
  getMonthName,
  getMonthIndex,
  getMonthNumber,
  getDayName,
  formatFullName,
  maskAccountNumber,
  safeParseJson,
};

