/**
 * @file routes.js
 * @description Centralized frontend route path constants.
 *
 * All route paths are defined here as plain strings or helper functions.
 */

export const ROUTES = {
  // ── Auth ────────────────────────────────────────────────────────────────
  LOGIN:  '/login',
  SIGNUP: '/signup',

  // ── Dashboard ────────────────────────────────────────────────────────────
  DASHBOARD: '/',

  // ── Students ─────────────────────────────────────────────────────────────
  STUDENTS: {
    LIST:         '/students',
    CREATE:       '/students/new',
    DETAIL_PARAM: '/students/:studentId',
    EDIT_PARAM:   '/students/:studentId/edit',
    detail: (id = ':studentId') => `/students/${id}`,
    edit:   (id = ':studentId') => `/students/${id}/edit`,
  },

  // ── Teachers ─────────────────────────────────────────────────────────────
  TEACHERS: {
    LIST:         '/teachers',
    CREATE:       '/teachers/new',
    DETAIL_PARAM: '/teachers/:teacherId',
    EDIT_PARAM:   '/teachers/:teacherId/edit',
    detail: (id = ':teacherId') => `/teachers/${id}`,
    edit:   (id = ':teacherId') => `/teachers/${id}/edit`,
  },

  // ── Fees & Finance ───────────────────────────────────────────────────────
  FEES: {
    LIST:         '/fees',
    CREATE:       '/fees/new',
    DETAIL_PARAM: '/fees/:id',
    EDIT_PARAM:   '/fees/:id/edit',
    detail: (id = ':id') => `/fees/${id}`,
    edit:   (id = ':id') => `/fees/${id}/edit`,
  },

  // ── Inventory ────────────────────────────────────────────────────────────
  INVENTORY: {
    LIST:         '/inventory',
    CREATE:       '/inventory/new',
    DETAIL_PARAM: '/inventory/:id',
    EDIT_PARAM:   '/inventory/:id/edit',
    detail: (id = ':id') => `/inventory/${id}`,
    edit:   (id = ':id') => `/inventory/${id}/edit`,
  },

  // ── Academics ────────────────────────────────────────────────────────────
  ACADEMICS: {
    BASE:         '/academics',
    OVERVIEW:     '/academics',
    CLASSES:      '/academics/classes',
    CLASS_PARAM:  '/academics/classes/:classId',
    SECTIONS:     '/academics/sections',
    SUBJECTS:     '/academics/subjects',
    SYLLABUS:     '/academics/syllabus',
    classDetail: (id = ':classId') => `/academics/classes/${id}`,
  },
  SYLLABUS: '/academics/syllabus',

  // ── Attendance ───────────────────────────────────────────────────────────
  ATTENDANCE: '/attendance',

  // ── Exams ────────────────────────────────────────────────────────────────
  EXAMS: {
    LIST:         '/exams',
    DETAIL_PARAM: '/exams/:id',
    detail: (id = ':id') => `/exams/${id}`,
  },

  // ── Module Routes (Direct String Paths) ──────────────────────────────────
  TIMETABLE:     '/timetable',
  RESULTS:       '/results',
  LEAVE:         '/leave',
  PAYROLL:       '/payroll',
  LIBRARY:       '/library',
  TRANSPORT:     '/transport',
  HOSTEL:        '/hostel',
  CERTIFICATES:  '/certificates',
  NOTIFICATIONS: '/notifications',
  REPORTS:       '/reports',

  // ── System ───────────────────────────────────────────────────────────────
  AUDIT_LOGS: '/audit-logs',
  SETTINGS:   '/settings',
  USER_MANAGEMENT: '/user-management',
  USERS:           '/user-management',
  USER_DETAIL:     '/user-management/:id',
  userDetail: (id = ':id') => `/user-management/${id}`,

  // ── Learning Modules ─────────────────────────────────────────────────────
  ONLINE_CLASSES: '/online-classes',
  HOMEWORK:       '/homework',

  // ── AI Hub ───────────────────────────────────────────────────────────────
  AI_MODE:        '/ai-mode',
};

export default ROUTES;
