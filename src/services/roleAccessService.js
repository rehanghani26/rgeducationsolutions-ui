import api from './api.js';
import { setCustomRolePermissions } from '../config/access.jsx';

/**
 * @file roleAccessService.js
 * @description API service for managing tenant role permissions and access control.
 */

export const roleAccessService = {
  /**
   * Fetch all roles with their module, button, and workflow permissions.
   */
  async getRolePermissions() {
    const res = await api.get('/role-access');
    const data = res.data?.data || res.data;
    if (data?.roles) {
      setCustomRolePermissions(data.roles);
    }
    return data;
  },

  /**
   * Fetch current authenticated user's role permissions.
   */
  async getMyPermissions() {
    const res = await api.get('/role-access/my');
    return res.data?.data || res.data;
  },

  /**
   * Update permissions for a specific role.
   */
  async updateRolePermissions(role, payload) {
    const res = await api.put(`/role-access/${role}`, payload);
    return res.data?.data || res.data;
  },

  /**
   * Reset role permissions to factory defaults.
   */
  async resetRolePermissions(role = null) {
    const url = role ? `/role-access/reset/${role}` : '/role-access/reset';
    const res = await api.post(url);
    return res.data?.data || res.data;
  },
};

export default roleAccessService;
