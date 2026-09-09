import api from './api.js';

/**
 * Service for administrative User Management operations
 */
export const userService = {
  /**
   * Fetch users list with optional search, role, and status filters
   * @param {Object} params - { search, role, status, page, limit, category }
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Fetch all roles with member counts and metadata
   */
  getRoles: async () => {
    const response = await api.get('/users/roles');
    return response.data;
  },

  /**
   * Fetch single user details
   * @param {string} id - User ID
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   * @param {Object} userData - { name, username, email, password, role, employeeId, isActive, permissions }
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Update existing user
   * @param {string} id - User ID
   * @param {Object} userData
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Toggle user active/inactive status
   * @param {string} id - User ID
   */
  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  },

  /**
   * Reset user password
   * @param {string} id - User ID
   * @param {string} newPassword
   * @param {boolean} forcePasswordChange
   */
  resetPassword: async (id, newPassword, forcePasswordChange = true) => {
    const response = await api.patch(`/users/${id}/reset-password`, {
      newPassword,
      forcePasswordChange
    });
    return response.data;
  },

  /**
   * Delete user
   * @param {string} id - User ID
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
