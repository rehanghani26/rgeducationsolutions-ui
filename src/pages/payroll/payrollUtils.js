/**
 * @file payrollUtils.js
 * @description Centralized constants, formatting helpers, and calculations for the Payroll & Staff Compensation module.
 * Re-exports common utilities from central constants and formatters for modular reuse.
 */

import {
  MONTH_NAMES as CENTRAL_MONTH_NAMES,
  YEAR_OPTIONS as CENTRAL_YEAR_OPTIONS,
  PAYMENT_METHODS as CENTRAL_PAYMENT_METHODS,
  STAFF_ROLES,
} from '../../constants';
import {
  formatCurrency as centralFormatCurrency,
  formatDate as centralFormatDate,
  getMonthIndex as centralGetMonthIndex,
  maskAccountNumber as centralMaskAccountNumber,
} from '../../utils';

export const MONTH_NAMES = CENTRAL_MONTH_NAMES;
export const YEAR_OPTIONS = CENTRAL_YEAR_OPTIONS;
export const PAYMENT_METHODS = CENTRAL_PAYMENT_METHODS;
export const ALL_STAFF_ROLES = STAFF_ROLES;

export const formatCurrency = centralFormatCurrency;
export const formatDate = centralFormatDate;
export const getMonthIndex = centralGetMonthIndex;
export const maskAccountNumber = centralMaskAccountNumber;

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
  return false;
};

export default {
  MONTH_NAMES,
  YEAR_OPTIONS,
  PAYMENT_METHODS,
  ALL_STAFF_ROLES,
  formatCurrency,
  formatDate,
  getMonthIndex,
  maskAccountNumber,
  safeNumber,
  calculateNetPay,
  isStaffSalarySetup,
};
