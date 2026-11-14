/**
 * @file commonOptions.js
 * @description Centralized dropdown options and status constants for demographic, finance, and system operations.
 */

// ─── Demographics ─────────────────────────────────────────────────────────────

export const GENDER_STRINGS = ['Male', 'Female', 'Other'];

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const BLOOD_GROUP_STRINGS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_GROUP_OPTIONS = BLOOD_GROUP_STRINGS.map((bg) => ({
  value: bg,
  label: bg,
}));

export const RELIGION_OPTIONS = [
  { value: 'Islam', label: 'Islam' },
  { value: 'Hinduism', label: 'Hinduism' },
  { value: 'Christianity', label: 'Christianity' },
  { value: 'Sikhism', label: 'Sikhism' },
  { value: 'Buddhism', label: 'Buddhism' },
  { value: 'Jainism', label: 'Jainism' },
  { value: 'Other', label: 'Other' },
];

export const SOCIAL_CATEGORY_OPTIONS = [
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'EWS', label: 'EWS' },
  { value: 'Minority', label: 'Minority' },
];

// ─── Status Options ───────────────────────────────────────────────────────────

export const COMMON_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  LEAVE: 'leave',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'present', label: 'Present', code: 'P', color: 'emerald' },
  { value: 'absent', label: 'Absent', code: 'A', color: 'rose' },
  { value: 'late', label: 'Late', code: 'L', color: 'amber' },
  { value: 'half_day', label: 'Half Day', code: 'HD', color: 'indigo' },
  { value: 'leave', label: 'Leave', code: 'LV', color: 'sky' },
];

export const FEE_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid',
};

export const FEE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'unpaid', label: 'Unpaid' },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'UPI / Digital Transfer',
  'Demand Draft',
  'Online',
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'UPI', label: 'UPI / Digital Payment' },
  { value: 'Online', label: 'Online Gateway' },
  { value: 'Credit / On Account', label: 'Credit / On Account' },
];

// ─── Leave Constants ──────────────────────────────────────────────────────────

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const LEAVE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const LEAVE_TYPE_OPTIONS = [
  { value: 'Medical Leave', label: 'Medical Leave' },
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Emergency Leave', label: 'Emergency Leave' },
  { value: 'Family / Personal Event', label: 'Family / Personal Event' },
  { value: 'Academic Duty / Olympiad', label: 'Academic Duty / Olympiad' },
  { value: 'Maternity / Paternity', label: 'Maternity / Paternity' },
  { value: 'Other', label: 'Other' },
];

// ─── Pagination Defaults ──────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGINATION_LIMIT_OPTIONS = [10, 20, 50, 100];

export default {
  GENDER_STRINGS,
  GENDER_OPTIONS,
  BLOOD_GROUP_STRINGS,
  BLOOD_GROUP_OPTIONS,
  RELIGION_OPTIONS,
  SOCIAL_CATEGORY_OPTIONS,
  COMMON_STATUS_OPTIONS,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_OPTIONS,
  FEE_STATUS,
  FEE_STATUS_OPTIONS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_OPTIONS,
  LEAVE_STATUS,
  LEAVE_STATUS_OPTIONS,
  LEAVE_TYPE_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PAGINATION_LIMIT_OPTIONS,
};

