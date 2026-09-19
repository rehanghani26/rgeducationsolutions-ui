/**
 * @file roles.js
 * @description Centralized user role name constants.
 *
 * Prevents typo bugs from raw role strings and makes role
 * management refactor-safe across guards, navigation, and permissions.
 *
 * Usage:
 *   import { ROLES, ADMIN_ROLES } from '../constants/roles.js';
 *   allowedRoles={[ROLES.SUPER_ADMIN, ROLES.PRINCIPAL]}
 */

// ─── Individual Role Constants ─────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:  'super-admin',
  SCHOOL_ADMIN: 'school-admin',
  DIRECTOR:     'director',
  PRINCIPAL:    'principal',
  TEACHER:      'teacher',
  HEAD_TEACHER: 'head-teacher',
  HOD:          'hod',
  COORDINATOR:  'coordinator',
  ACCOUNTANT:   'accountant',
  LIBRARIAN:    'librarian',
  PEON:         'peon',
  STUDENT:      'student',
  PARENT:       'parent',
};

// ─── Role Group Shortcuts ──────────────────────────────────────────────────────

/** Privileged roles that bypass per-module permission checks */
export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  'admin',
  'superadmin',
  'super_admin',
  'school_admin',
  ROLES.DIRECTOR,
  ROLES.PRINCIPAL,
];

/** All staff roles */
export const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.DIRECTOR,
  ROLES.PRINCIPAL,
  ROLES.TEACHER,
  ROLES.HEAD_TEACHER,
  ROLES.HOD,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
  ROLES.LIBRARIAN,
  ROLES.PEON,
];

/** Roles with student management access */
export const STUDENT_MGMT_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.TEACHER,
  ROLES.HEAD_TEACHER,
  ROLES.HOD,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
  ROLES.PARENT,
];

/** Roles with teacher management access */
export const TEACHER_MGMT_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.HEAD_TEACHER,
  ROLES.HOD,
  ROLES.COORDINATOR,
  ROLES.ACCOUNTANT,
];

/** Roles with finance/fees access */
export const FINANCE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.PRINCIPAL,
];

/** Roles with inventory access */
export const INVENTORY_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.ACCOUNTANT,
  ROLES.LIBRARIAN,
  ROLES.HOD,
];

export default ROLES;
