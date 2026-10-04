/**
 * @file index.js
 * @description General utilities barrel export including permission checkVisibility helper
 */

import { hasModuleAccess, getUserFromStorage, getUserRole } from "../config/access.jsx";
import { ROLES } from "../constants/roles.js";

/**
 * Checks visibility/permission for a module or action.
 * Matches the enterprise permission pattern:
 * checkVisibility(section, permissionAction, pageConfig)
 *
 * @param {string} section - e.g. "main", "sub", or module name
 * @param {string} permissionAction - e.g. "View Setting", "Edit", "Delete"
 * @param {object} [pageConfig] - Optional page configuration from Redux state.access.pages
 * @returns {boolean}
 */
export const checkVisibility = (section, permissionAction, pageConfig) => {
  // If specific page configuration is defined in Redux access slice
  if (pageConfig && typeof pageConfig === "object") {
    if (pageConfig[permissionAction] !== undefined) {
      return Boolean(pageConfig[permissionAction]);
    }
    if (pageConfig.view !== undefined) {
      return Boolean(pageConfig.view);
    }
    if (pageConfig.enabled !== undefined) {
      return Boolean(pageConfig.enabled);
    }
  }

  // Fallback to role-based system access check
  const user = getUserFromStorage();
  if (!user) return false;

  const role = getUserRole(user);
  if (role === ROLES.SUPER_ADMIN || role === "superadmin" || role === "admin" || role === ROLES.SCHOOL_ADMIN) {
    return true;
  }

  // Check module permission in access config
  return hasModuleAccess(user, "settings");
};

export default {
  checkVisibility,
};
