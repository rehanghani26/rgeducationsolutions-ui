import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../constants/roles.js';

/**
 * Module-wise Role Permissions Mapping
 * Handles frontend permission checks for all user roles.
 */
export const ROLE_PERMISSIONS = {
  // Super Admin has full access to all modules and actions
  [ROLES.SUPER_ADMIN]: {
    all: true,
    modules: ['*'],
    actions: ['create', 'read', 'update', 'delete', 'manage'],
  },

  // School Admin / Admin has full administrative access
  [ROLES.SCHOOL_ADMIN]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'fees',
      'inventory', 'library', 'transport', 'hostel', 'certificates',
      'notifications', 'reports', 'settings', 'online-classes', 'homework',
      'user-management'
    ],
    actions: ['create', 'read', 'update', 'delete', 'manage'],
  },

  'admin': {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'fees',
      'inventory', 'library', 'transport', 'hostel', 'certificates',
      'notifications', 'reports', 'settings', 'online-classes', 'homework',
      'user-management'
    ],
    actions: ['create', 'read', 'update', 'delete', 'manage'],
  },

  // Director has executive leadership and comprehensive management access
  [ROLES.DIRECTOR]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'fees',
      'inventory', 'library', 'transport', 'hostel', 'certificates',
      'notifications', 'reports', 'settings', 'online-classes', 'homework'
    ],
    actions: ['create', 'read', 'update', 'manage'],
  },

  // Principal has high-level overview and administrative management
  [ROLES.PRINCIPAL]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'fees',
      'inventory', 'library', 'transport', 'hostel', 'certificates',
      'notifications', 'reports', 'settings', 'online-classes', 'homework'
    ],
    actions: ['create', 'read', 'update', 'manage'],
  },

  // Support Staff / Peon: Attendance, Leave, Payroll, Profile, Notices, Settings
  [ROLES.PEON]: {
    modules: ['dashboard', 'profile', 'attendance', 'leave', 'payroll', 'notifications', 'settings'],
    actions: ['read', 'create'],
  },

  // Librarian: Library, Attendance, Leave, Payroll, Profile, Notices, Settings
  [ROLES.LIBRARIAN]: {
    modules: ['dashboard', 'profile', 'attendance', 'leave', 'payroll', 'library', 'notifications', 'settings'],
    actions: ['create', 'read', 'update'],
  },

  // Limited Role: Read-only access to basic modules
  'limited': {
    modules: ['dashboard', 'profile', 'students', 'academics', 'attendance', 'leave', 'notifications'],
    actions: ['read'],
    readOnly: true,
  },

  // Accountant: Finance, Fees, Payroll, Attendance, Leave, Profile, Expenses, Inventory
  [ROLES.ACCOUNTANT]: {
    modules: [
      'dashboard', 'profile', 'attendance', 'leave', 'fees', 'payroll', 'inventory', 'expenses',
      'transport', 'hostel', 'reports', 'students', 'certificates', 'settings'
    ],
    actions: ['create', 'read', 'update', 'manage'],
  },

  // TG (Teacher Guardian): Student care, attendance, academics, guidance, profile
  'tg': {
    modules: [
      'dashboard', 'profile', 'students', 'attendance', 'academics',
      'timetable', 'results', 'leave', 'payroll', 'notifications', 'certificates', 'settings'
    ],
    actions: ['create', 'read', 'update'],
  },

  // Counselor / Councellor: Student well-being, attendance, reports, profile
  'councellor': {
    modules: ['dashboard', 'profile', 'students', 'attendance', 'leave', 'payroll', 'reports', 'notifications', 'settings'],
    actions: ['read', 'update'],
  },
  'counselor': {
    modules: ['dashboard', 'profile', 'students', 'attendance', 'leave', 'payroll', 'reports', 'notifications', 'settings'],
    actions: ['read', 'update'],
  },

  // Teacher / Head Teacher / HOD / Coordinator
  [ROLES.TEACHER]: {
    modules: [
      'dashboard', 'profile', 'students', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'library', 'notifications',
      'settings', 'online-classes', 'homework', 'certificates'
    ],
    actions: ['create', 'read', 'update'],
  },
  [ROLES.HEAD_TEACHER]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'library', 'notifications',
      'settings', 'online-classes', 'homework', 'certificates'
    ],
    actions: ['create', 'read', 'update'],
  },
  [ROLES.HOD]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'library', 'notifications',
      'settings', 'online-classes', 'homework', 'certificates'
    ],
    actions: ['create', 'read', 'update'],
  },
  [ROLES.COORDINATOR]: {
    modules: [
      'dashboard', 'profile', 'students', 'teachers', 'academics', 'attendance',
      'timetable', 'exams', 'results', 'leave', 'payroll', 'notifications',
      'settings', 'online-classes', 'homework', 'certificates'
    ],
    actions: ['create', 'read', 'update'],
  },

  // Student: Student portal view (strictly read-only)
  [ROLES.STUDENT]: {
    modules: [
      'dashboard', 'profile', 'students', 'student-management', 'settings',
      'academics', 'attendance', 'leave', 'timetable', 'exams', 'results',
      'library', 'notifications', 'certificates', 'online-classes', 'homework'
    ],
    actions: ['read', 'create'], // allow applying for leave
    readOnly: false,
  },

  // Parent: Parent portal view
  [ROLES.PARENT]: {
    modules: [
      'dashboard', 'profile', 'students', 'academics', 'attendance',
      'leave', 'fees', 'exams', 'results', 'notifications', 'online-classes',
      'homework', 'certificates'
    ],
    actions: ['read', 'create'], // allow applying for leave
    readOnly: false,
  },
};

/**
 * Normalizes role string to lowercase kebab-case (e.g. 'Student' -> 'student', 'super_admin' -> 'super-admin')
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  const trimmed = String(role).trim().toLowerCase().replace(/_/g, '-');
  if (trimmed === 'superadmin') return 'super-admin';
  return trimmed;
};

/**
 * Return default module permissions array for a given role from ROLE_PERMISSIONS
 */
export const getDefaultRolePermissions = (role) => {
  const normRole = normalizeRole(role);
  const config = ROLE_PERMISSIONS[normRole] || ROLE_PERMISSIONS['teacher'] || ROLE_PERMISSIONS['student'];
  return config?.modules || ['dashboard', 'academics', 'attendance', 'profile'];
};

/**
 * Safely fetch current logged in user from localStorage
 */
export const getUserFromStorage = () => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    return JSON.parse(rawUser);
  } catch (e) {
    return null;
  }
};

/**
 * Resolve normalized user role string from user object or input
 */
export const getUserRole = (userOrRole) => {
  if (!userOrRole) {
    const stored = getUserFromStorage();
    return normalizeRole(stored?.role || '');
  }
  if (typeof userOrRole === 'string') return normalizeRole(userOrRole);
  return normalizeRole(userOrRole.role || '');
};

export const PERMISSION_ALIASES = {
  communication: ['notifications', 'communication'],
  notifications: ['communication', 'notifications'],
  exam: ['exams', 'exam'],
  exams: ['exam', 'exams'],
  fee: ['fees', 'fee'],
  fees: ['fee', 'fees'],
  payroll: ['payroll', 'salary', 'compensation'],
  attendance: ['attendance', 'leaves', 'leave'],
  leave: ['leave', 'leaves', 'attendance'],
  profile: ['profile', 'settings', 'account', 'my-profile'],
  'student-management': ['students', 'student-management'],
  students: ['student-management', 'students'],
  'teacher-management': ['teachers', 'teacher-management'],
  teachers: ['teacher-management', 'teachers'],
  'online-classes': ['online-classes'],
  homework: ['homework'],
  certificates: ['certificates', 'id-cards', 'documents', 'academics'],
  'id-cards': ['certificates', 'id-cards', 'documents'],
  documents: ['certificates', 'id-cards', 'documents'],
};

/**
 * Helper to check if user has access to a specific module
 * @param {object|string} userOrRole - User object or role string
 * @param {string} moduleName - Module identifier (e.g. 'students', 'fees')
 * @returns {boolean}
 */
export const hasModuleAccess = (userOrRole, moduleName) => {
  const role = getUserRole(userOrRole);
  if (!role) return false;

  // Super-admin always has full access
  if (role === ROLES.SUPER_ADMIN || role === 'superadmin') return true;

  // Check explicit permissions array attached to user object if available
  if (typeof userOrRole === 'object' && Array.isArray(userOrRole?.permissions)) {
    const userPerms = userOrRole.permissions;
    if (userPerms.includes(moduleName)) return true;
    
    // Check aliases
    const aliases = PERMISSION_ALIASES[moduleName] || [moduleName];
    if (aliases.some(alias => userPerms.includes(alias))) return true;
  }

  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  if (roleConfig.all || (Array.isArray(roleConfig.modules) && roleConfig.modules.includes('*'))) return true;

  const aliases = PERMISSION_ALIASES[moduleName] || [moduleName];
  return Array.isArray(roleConfig.modules) && roleConfig.modules.some(mod => mod === '*' || mod === moduleName || aliases.includes(mod));
};

/**
 * Helper to check if user can perform a specific action (e.g. 'create', 'update', 'delete')
 * @param {object|string} userOrRole
 * @param {string} moduleName
 * @param {string} action
 * @returns {boolean}
 */
export const hasActionAccess = (userOrRole, moduleName, action = 'read') => {
  if (!hasModuleAccess(userOrRole, moduleName)) return false;

  const role = getUserRole(userOrRole);
  if (role === ROLES.SUPER_ADMIN || role === 'superadmin') return true;

  // Strict guard: Students and Parents can NEVER perform update, or delete on academic/class/homework modules
  if ((role === ROLES.STUDENT || role === ROLES.PARENT) && action !== 'read' && moduleName !== 'leave') {
    return false;
  }

  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  if (roleConfig.all) return true;

  // If role is read-only and action is modifying, deny
  if (roleConfig.readOnly && action !== 'read') return false;

  // Strictly check actions array
  if (Array.isArray(roleConfig.actions)) {
    if (roleConfig.actions.includes('*')) return true;
    return roleConfig.actions.includes(action);
  }

  return true;
};

/**
 * Get list of all allowed modules for a given role or user
 */
export const getAllowedModules = (userOrRole) => {
  const role = getUserRole(userOrRole);
  if (!role) return [];

  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return [];
  return roleConfig.modules;
};

/**
 * React Component: AccessGuard
 * Route wrapper that protects routes on the frontend based on role or module access.
 */
export const AccessGuard = ({ children, module, allowedRoles, fallback = <Navigate to="/dashboard" replace /> }) => {
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser || getUserFromStorage();

  if (!currentUser) return <Navigate to="/login" replace />;

  const userRole = getUserRole(currentUser);

  if (allowedRoles && allowedRoles.length > 0) {
    const normAllowed = allowedRoles.map(r => normalizeRole(r));
    if (!normAllowed.includes(userRole) && userRole !== ROLES.SUPER_ADMIN && userRole !== 'superadmin') {
      return fallback;
    }
  }

  if (module) {
    if (!hasModuleAccess(currentUser, module)) {
      return fallback;
    }
  }

  return children;
};

/**
 * React Component: Can / HasAccess
 * Conditional rendering component for UI elements (e.g. Buttons, Actions).
 */
export const Can = ({ children, module, action = 'read', role, fallback = null }) => {
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser || getUserFromStorage();

  if (!currentUser) return fallback;

  const userRole = getUserRole(currentUser);

  if (role) {
    const rolesArray = (Array.isArray(role) ? role : [role]).map(r => normalizeRole(r));
    if (!rolesArray.includes(userRole) && userRole !== ROLES.SUPER_ADMIN && userRole !== 'superadmin') {
      return fallback;
    }
  }

  if (module) {
    if (!hasActionAccess(currentUser, module, action)) return fallback;
  }

  return <>{children}</>;
};

export * from './buttonAccess.jsx';

export default {
  ROLE_PERMISSIONS,
  getUserFromStorage,
  getUserRole,
  hasModuleAccess,
  hasActionAccess,
  getAllowedModules,
  AccessGuard,
  Can,
};
