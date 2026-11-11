/**
 * @file payrollUtils.js
 * @description Centralized constants, formatting helpers, and calculations for the Payroll & Staff Compensation module.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'UPI / Digital Transfer',
  'Demand Draft',
];

export const ALL_STAFF_ROLES = [
  'teacher',
  'head-teacher',
  'hod',
  'coordinator',
  'accountant',
  'librarian',
  'peon',
  'staff',
  'support',
];

/**
 * Formats a numeric value into standard Indian Currency (INR).
 * Example: 13000 -> "₹13,000"
 *
 * @param {number|string} val - Number or string amount.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
};

/**
 * Safely parses any value into a non-negative number.
 *
 * @param {any} val - Input value.
 * @param {number} [fallback=0] - Fallback default.
 * @returns {number}
 */
export const safeNumber = (val, fallback = 0) => {
  const num = Number(val);
  return isNaN(num) ? fallback : Math.max(0, num);
};

/**
 * Calculates net payable salary based on base pay, additions, and deductions.
 *
 * @param {number|string} basePay - Gross or base payable.
 * @param {number|string} bonus - Additional allowance / bonus.
 * @param {number|string} deduction - LOP or penalty deduction.
 * @returns {number}
 */
export const calculateNetPay = (basePay, bonus = 0, deduction = 0) => {
  const b = safeNumber(basePay);
  const add = safeNumber(bonus);
  const ded = safeNumber(deduction);
  return Math.max(0, b + add - ded);
};

/**
 * Formats a date string or timestamp into readable British/Indian format (DD MMM YYYY).
 *
 * @param {string|Date} date - Date value.
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Returns month index (0-11) from month name or full month string.
 *
 * @param {string} monthStr - e.g. "November" or "November 2026"
 * @returns {number}
 */
export const getMonthIndex = (monthStr) => {
  if (!monthStr) return new Date().getMonth();
  const name = String(monthStr).trim().split(' ')[0];
  const idx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === name.toLowerCase()
  );
  return idx !== -1 ? idx : new Date().getMonth();
};

/**
 * Safely masks a bank account number, displaying only the last 4 digits.
 *
 * @param {string|number} acc - Account number string or digits.
 * @returns {string} Masked string or "Not Provided"
 */
export const maskAccountNumber = (acc) => {
  if (!acc) return 'Not Provided';
  const str = String(acc).trim();
  if (str.length <= 4) return str;
  return `•••• •••• •••• ${str.slice(-4)}`;
};

/**
 * Determines whether a staff member has a configured salary structure.
 *
 * @param {object} staff - Staff member object.
 * @returns {boolean} True if salary is configured with positive pay.
 */
export const isStaffSalarySetup = (staff) => {
  if (!staff) return false;
  if (staff.isSalaryConfigured !== undefined) return Boolean(staff.isSalaryConfigured);
  const struct = staff.salaryStructure;
  if (!struct) return false;
  if (struct.isConfigured !== undefined) return Boolean(struct.isConfigured);
  if (struct._id && (Number(struct.basicPay) > 0 || Number(struct.netPay) > 0 || Number(struct.grossPay) > 0)) {
    return true;
  }
  return Number(struct.basicPay) > 0 || Number(struct.netPay) > 0;
};

export default {
  MONTH_NAMES,
  YEAR_OPTIONS,
  PAYMENT_METHODS,
  ALL_STAFF_ROLES,
  formatCurrency,
  safeNumber,
  calculateNetPay,
  formatDate,
  getMonthIndex,
  maskAccountNumber,
  isStaffSalarySetup,
};
