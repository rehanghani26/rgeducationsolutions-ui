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
  Truck,
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
  User,
  KeyRound,
  School,
  Wallet,
} from 'lucide-react';

import { ROUTES }                                   from '../routes/routes.js';
import { ROLES, ADMIN_ROLES, FINANCE_ROLES, INVENTORY_ROLES } from '../constants/roles.js';

// ─── All Roles (for shared items) ─────────────────────────────────────────────
const ALL_STAFF = [
  ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL,
  ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD,
  ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.LIBRARIAN, ROLES.PEON,
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
        name:       'My Profile',
        path:       ROUTES.PROFILE,
        icon:       User,
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'profile',
      },
      {
        name:       'Students',
        path:       ROUTES.STUDENTS.LIST,
        icon:       GraduationCap,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.ACCOUNTANT, ROLES.PARENT, ROLES.STUDENT],
        permission: 'students',
      },
      {
        name:       'Teachers',
        path:       ROUTES.TEACHERS.LIST,
        icon:       Users,
        roles:      [...ADMIN_ROLES, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.ACCOUNTANT],
        permission: 'teachers',
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
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'attendance',
      },
      // Timetable — moved to Settings > Class Timetable Builder
      // {
      //   name:       'Timetable',
      //   path:       ROUTES.TIMETABLE,
      //   icon:       Clock,
      //   roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT],
      //   permission: 'timetable',
      // },
      {
        name:       'Exams',
        path:       ROUTES.EXAMS.LIST,
        icon:       FileText,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'exams',
      },
      {
        name:       'Results',
        path:       ROUTES.RESULTS,
        icon:       Award,
        roles:      [...ADMIN_ROLES, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, ROLES.STUDENT, ROLES.PARENT],
        permission: 'results',
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
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'leave',
      },
      {
        name:       'Payroll',
        path:       ROUTES.PAYROLL,
        icon:       Briefcase,
        roles:      ALL_STAFF,
        permission: 'payroll',
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
        permission: 'fees',
      },
      {
        name:       'Budget Allocation',
        path:       ROUTES.BUDGET,
        icon:       Wallet,
        roles:      [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT],
        permission: 'budget',
      },
      {
        name:       'Inventory',
        path:       ROUTES.INVENTORY.LIST,
        icon:       Warehouse,
        roles:      INVENTORY_ROLES,
        permission: 'inventory',
      },
      {
        name:       'Vendors',
        path:       ROUTES.VENDORS.LIST,
        icon:       Truck,
        roles:      INVENTORY_ROLES,
        permission: 'vendors',
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
        permission: 'transport',
      },
      {
        name:       'Hostel',
        path:       ROUTES.HOSTEL,
        icon:       Building2,
        roles:      FINANCE_ROLES,
        permission: 'hostel',
      },
      {
        name:       'Certificates & ID Cards',
        path:       ROUTES.CERTIFICATES,
        icon:       BadgeCheck,
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'certificates',
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
        permission: 'notifications',
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
        permission: 'audit-logs',
      },
      {
        name:       'Password Requests',
        path:       ROUTES.PASSWORD_REQUESTS,
        icon:       KeyRound,
        roles:      [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, 'admin', 'superadmin', 'super_admin', 'principal', 'director'],
        permission: null,
      },
      {
        name:       'Settings',
        path:       ROUTES.SETTINGS,
        icon:       SettingsIcon,
        roles:      [...ALL_STAFF, ROLES.STUDENT, ROLES.PARENT],
        permission: 'settings',
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
 * the given user is allowed to see based on dynamic role permissions.
 * @param {{ role: string, permissions?: string[] } | null} user
 * @returns {typeof NAV_SECTIONS}
 */
export const filterNavForUser = (user) => {
  if (!user) return [];
  const rawRole = (user.role || '').trim().toLowerCase();
  const normRole = rawRole.replace(/_/g, '-');

  return NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Super-admin has access to everything
        if (normRole === 'super-admin' || normRole === 'superadmin') return true;

        // Dynamic Role-Based Module Permission Check
        if (item.permission) {
          return hasModuleAccess(normRole, item.permission);
        }

        // Non-module fallback items (e.g. Password Requests)
        if (item.roles && item.roles.length > 0) {
          const itemRoles = item.roles.map((r) => String(r).toLowerCase().replace(/_/g, '-'));
          return itemRoles.includes(rawRole) || itemRoles.includes(normRole);
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
