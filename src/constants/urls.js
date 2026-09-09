/**
 * @file urls.js
 * @description Centralized API endpoint URL constants.
 *
 * All services import endpoint strings from here.
 * Changing a backend route only requires editing ONE place.
 *
 * Usage:
 *   import { API_URLS } from '../constants/urls.js';
 *   api.get(API_URLS.TEACHERS.BASE)
 */

// ─── Auth ────────────────────────────────────────────────────────────────────
export const AUTH_URLS = {
  LOGIN:   '/auth/login',
  LOGOUT:  '/auth/logout',
  SIGNUP:  '/auth/signup',
  REFRESH: '/auth/refresh',
  ME:      '/auth/me',
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const STUDENT_URLS = {
  BASE:          '/students',
  BY_ID:         (id)  => `/students/${id}`,
  ACTIVITY:      (id)  => `/students/${id}/activity`,
  BULK_DELETE:   '/students/bulk-delete',
  BULK_PROMOTE:  '/students/bulk-promote',
  BULK_IMPORT:   '/students/bulk-import',
  EXPORT_CSV:    '/students/export/csv',
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const TEACHER_URLS = {
  BASE:           '/teachers',
  BY_ID:          (id)  => `/teachers/${id}`,
  ACTIVITY:       (id)  => `/teachers/${id}/activity`,
  BULK_DELETE:    '/teachers/bulk-delete',
  EXPORT_CSV:     '/teachers/export/csv',
  RESET_PASSWORD: (id)  => `/teachers/${id}/reset-password`,
};

// ─── Finance / Fees ───────────────────────────────────────────────────────────
export const FEE_URLS = {
  BASE:      '/finance/fees',
  BY_ID:     (id)  => `/finance/fees/${id}`,
  ACTIVITY:  (id)  => `/finance/fees/${id}/activity`,
  COLLECT:   '/finance/fees/collect',
  EXPORT:    '/finance/fees/export',
};

export const EXPENSE_URLS = {
  BASE:      '/finance/expenses',
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const INVENTORY_URLS = {
  BASE:         '/inventory',
  BY_ID:        (id)  => `/inventory/${id}`,
  ACTIVITY:     (id)  => `/inventory/${id}/activity`,
  ALERTS:       '/inventory/alerts',
  VENDORS:      '/inventory/vendors',
  STOCK_ADJUST: '/inventory/stock-adjust',
};

// ─── Exams ────────────────────────────────────────────────────────────────────
export const EXAM_URLS = {
  BASE:      '/exams',
  BY_ID:     (id)  => `/exams/${id}`,
  ACTIVITY:  (id)  => `/exams/${id}/activity`,
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const ATTENDANCE_URLS = {
  BASE:  '/attendance',
  STATS: '/attendance/stats',
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const AUDIT_LOG_URLS = {
  BASE: '/audit-logs',
};

// ─── ERP (Classes, Sections, Dashboard, Settings) ─────────────────────────────
export const ERP_URLS = {
  CLASSES:   '/erp/classes',
  SECTIONS:  '/erp/sections',
  SUBJECTS:  '/erp/subjects',
  SETTINGS:  '/erp/settings',
  DASHBOARD: '/dashboard',
};

// ─── Online Classes ───────────────────────────────────────────────────────────
export const ONLINE_CLASS_URLS = {
  BASE:      '/online-classes',
  BY_ID:     (id) => `/online-classes/${id}`,
  ACTIVITY:  (id) => `/online-classes/${id}/activity`,
  JOIN:      (id) => `/online-classes/${id}/join`,
};

// ─── Homework ─────────────────────────────────────────────────────────────────
export const HOMEWORK_URLS = {
  BASE:      '/homework',
  BY_ID:     (id) => `/homework/${id}`,
  ACTIVITY:  (id) => `/homework/${id}/activity`,
  SUBMIT:    (id) => `/homework/${id}/submit`,
  GRADE:     (id, submId) => `/homework/${id}/grade/${submId}`,
};

// ─── Aggregated export ────────────────────────────────────────────────────────
export const API_URLS = {
  AUTH:          AUTH_URLS,
  STUDENTS:      STUDENT_URLS,
  TEACHERS:      TEACHER_URLS,
  FEES:          FEE_URLS,
  EXPENSES:      EXPENSE_URLS,
  INVENTORY:     INVENTORY_URLS,
  EXAMS:         EXAM_URLS,
  ATTENDANCE:    ATTENDANCE_URLS,
  AUDIT_LOGS:    AUDIT_LOG_URLS,
  ERP:           ERP_URLS,
  ONLINE_CLASSES: ONLINE_CLASS_URLS,
  HOMEWORK:      HOMEWORK_URLS,
};

export default API_URLS;
