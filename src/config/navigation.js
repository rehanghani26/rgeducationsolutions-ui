/**
 * @file navigation.js
 * @description Sidebar navigation structure configuration.
 *
 * Route paths come from ROUTES constants (no raw strings).
 * Role names come from the ROLES constants (no raw strings).
 * Sections are grouped by functional area.
 */

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Settings as SettingsIcon,
  Warehouse,
  CalendarCheck,
  Clock,
  FileText,
  Award,
  Briefcase,
  Palmtree,
  Library,
  Bus,
  Building2,
  BadgeCheck,
  Bell,
  BarChart3,
  Shield,
  Video,
  NotebookPen,
  UserCog,
} from 'lucide-react';

import { ROUTES }                                   from '../routes/routes.js';
import { ROLES, ADMIN_ROLES, FINANCE_ROLES, INVENTORY_ROLES } from '../constants/roles.js';

// ─── All Roles (for shared items) ─────────────────────────────────────────────
const ALL_STAFF = [
  ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL,
  ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD,
  ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.LIBRARIAN,
];

// ─── Navigation Sections ──────────────────────────────────────────────────────

export const NAV_SECTIONS = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    id:    'core',
    label: 'Core',
    items: [
      {
        name:       'Dashboard',
        path:       ROUTES.DASHBOARD,
        icon:       LayoutDashboard,
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'dashboard',
      },
      {
        name:       'Students',
        path:       ROUTES.STUDENTS.LIST,
        icon:       GraduationCap,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.PARENT],
        permission: 'student-management',
      },
      {
        name:       'Teachers',
        path:       ROUTES.TEACHERS.LIST,
        icon:       Users,
        roles:      [...ADMIN_ROLES, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.ACCOUNTANT],
        permission: 'teacher-management',
      },
    ],
  },

  // ── Academics ─────────────────────────────────────────────────────────────
  {
    id:    'academics',
    label: 'Academics',
    items: [
      {
        name:       'Academics',
        path:       ROUTES.ACADEMICS.BASE,
        icon:       BookOpen,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'academics',
      },
      {
        name:       'Attendance',
        path:       ROUTES.ATTENDANCE,
        icon:       CalendarCheck,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT],
        permission: 'attendance',
      },
      {
        name:       'Timetable',
        path:       ROUTES.TIMETABLE,
        icon:       Clock,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT],
        permission: 'timetable',
      },
      {
        name:       'Exams',
        path:       ROUTES.EXAMS.LIST,
        icon:       FileText,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'exam',
      },
      {
        name:       'Results',
        path:       ROUTES.RESULTS,
        icon:       Award,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'exam',
      },
      {
        name:       'Online Classes',
        path:       ROUTES.ONLINE_CLASSES,
        icon:       Video,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'online-classes',
      },
      {
        name:       'Homework',
        path:       ROUTES.HOMEWORK,
        icon:       NotebookPen,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'homework',
      },
    ],
  },

  // ── HR & Payroll ──────────────────────────────────────────────────────────
  {
    id:    'hr',
    label: 'HR & Payroll',
    items: [
      {
        name:       'Leave',
        path:       ROUTES.LEAVE,
        icon:       Palmtree,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.STUDENT],
        permission: 'leave',
      },
      {
        name:       'Payroll',
        path:       ROUTES.PAYROLL,
        icon:       Briefcase,
        roles:      FINANCE_ROLES,
        permission: 'fee',
      },
    ],
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    id:    'operations',
    label: 'Operations',
    items: [
      {
        name:       'Fees & Finance',
        path:       ROUTES.FEES.LIST,
        icon:       ClipboardList,
        roles:      FINANCE_ROLES,
        permission: 'fee',
      },
      {
        name:       'Inventory',
        path:       ROUTES.INVENTORY.LIST,
        icon:       Warehouse,
        roles:      INVENTORY_ROLES,
        permission: 'inventory',
      },
      {
        name:       'Library',
        path:       ROUTES.LIBRARY,
        icon:       Library,
        roles:      [...ADMIN_ROLES, ROLES.LIBRARIAN, ROLES.TEACHER],
        permission: 'library',
      },
      {
        name:       'Transport',
        path:       ROUTES.TRANSPORT,
        icon:       Bus,
        roles:      FINANCE_ROLES,
        permission: 'fee',
      },
      {
        name:       'Hostel',
        path:       ROUTES.HOSTEL,
        icon:       Building2,
        roles:      FINANCE_ROLES,
        permission: 'fee',
      },
      {
        name:       'Certificates',
        path:       ROUTES.CERTIFICATES,
        icon:       BadgeCheck,
        roles:      ADMIN_ROLES,
        permission: 'academics',
      },
    ],
  },

  // ── System ────────────────────────────────────────────────────────────────
  {
    id:    'system',
    label: 'System',
    items: [
      {
        name:       'Notifications',
        path:       ROUTES.NOTIFICATIONS,
        icon:       Bell,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.ACCOUNTANT],
        permission: 'communication',
      },
      {
        name:       'Reports',
        path:       ROUTES.REPORTS,
        icon:       BarChart3,
        roles:      FINANCE_ROLES,
        permission: 'reports',
      },
      {
        name:       'User Management',
        path:       ROUTES.USER_MANAGEMENT,
        icon:       UserCog,
        roles:      [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN],
        permission: 'user-management',
      },
      {
        name:       'Audit Logs',
        path:       ROUTES.AUDIT_LOGS,
        icon:       Shield,
        roles:      [ROLES.SUPER_ADMIN],
        permission: null,
      },
      {
        name:       'Settings',
        path:       ROUTES.SETTINGS,
        icon:       SettingsIcon,
        roles:      ADMIN_ROLES,
        permission: null,
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Roles that bypass module-level permission checks */
import { hasModuleAccess } from './access.jsx';

export const PRIVILEGED_ROLES = ADMIN_ROLES;

/**
 * Filter the navigation tree to only sections/items
 * the given user is allowed to see based on role & permissions.
 * @param {{ role: string, permissions?: string[] } | null} user
 * @returns {typeof NAV_SECTIONS}
 */
export const filterNavForUser = (user) => {
  if (!user) return [];
  return NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Super-admin has access to everything
        if (user.role === ROLES.SUPER_ADMIN || user.role === 'superadmin') return true;

        // User role MUST be explicitly listed in item.roles
        if (!item.roles.includes(user.role)) return false;

        // If privileged admin role, allow item
        if (PRIVILEGED_ROLES.includes(user.role)) return true;

        // For non-privileged roles, if item requires permission, check user permissions or module access
        if (item.permission) {
          return (user.permissions || []).includes(item.permission) || hasModuleAccess(user, item.permission);
        }

        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);
};

/**
 * Returns true if the given pathname matches or is under a nav item's path.
 * @param {string} pathname
 * @param {string} path
 * @returns {boolean}
 */
export const isNavActive = (pathname, path) => {
  if (path === ROUTES.DASHBOARD) return pathname === ROUTES.DASHBOARD;
  return pathname === path || pathname.startsWith(`${path}/`);
};
