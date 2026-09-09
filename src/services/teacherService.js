/**
 * @file teacherService.js
 * @description Teacher module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default teacherService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { TEACHER_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

/**
 * Fetch paginated teacher list.
 * @param {object} params
 */
export async function getTeachers(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${TEACHER_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Fetch a single teacher by ID.
 * @param {string} id
 */
export async function getTeacherById(id) {
  try {
    const url = TEACHER_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Fetch activity logs for a teacher.
 * @param {string} id
 */
export async function getTeacherActivity(id) {
  try {
    const url = TEACHER_URLS.ACTIVITY(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher activity:', error);
    return { data: { logs: [], loginHistory: [] } };
  }
}

/**
 * Fetch credentials for a teacher (Super Admin only).
 * @param {string} id
 */
export async function getTeacherCredentials(id) {
  try {
    const url = `${TEACHER_URLS.BY_ID(id)}/credentials`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Create a new teacher record.
 * @param {object} data
 */
export async function createTeacher(data) {
  try {
    const response = await api.post(TEACHER_URLS.BASE, data);
    toast.success('Teacher account created successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Update an existing teacher record.
 * @param {string} id
 * @param {object} data
 */
export async function updateTeacher(id, data) {
  try {
    const response = await api.put(TEACHER_URLS.BY_ID(id), data);
    toast.success('Teacher updated successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Delete a single teacher.
 * @param {string} id
 */
export async function deleteTeacher(id) {
  try {
    const response = await api.delete(TEACHER_URLS.BY_ID(id));
    toast.success('Teacher deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Bulk delete multiple teachers.
 * @param {string[]} ids
 */
export async function bulkDeleteTeachers(ids) {
  try {
    const response = await api.post(TEACHER_URLS.BULK_DELETE, { ids });
    toast.success('Selected teachers deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Reset a teacher login password.
 * @param {string} id
 * @param {object} data
 */
export async function resetTeacherPassword(id, data) {
  try {
    const response = await api.patch(TEACHER_URLS.RESET_PASSWORD(id), data);
    toast.success('Password updated successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Bulk import teachers from CSV data.
 * @param {Array<object>} teachers
 */
export async function bulkImportTeachers(teachers) {
  try {
    const response = await api.post(`${TEACHER_URLS.BASE}/bulk-import`, { teachers });
    toast.success(response.data?.message || 'Teachers imported successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Export teachers as CSV blob.
 */
export async function exportTeachersCsv() {
  try {
    const response = await api.get(TEACHER_URLS.EXPORT_CSV, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const teacherService = {
  getAll: getTeachers,
  getById: getTeacherById,
  getActivity: getTeacherActivity,
  getCredentials: getTeacherCredentials,
  create: createTeacher,
  update: updateTeacher,
  delete: deleteTeacher,
  bulkDelete: bulkDeleteTeachers,
  resetPassword: resetTeacherPassword,
  bulkImport: bulkImportTeachers,
  exportCsv: exportTeachersCsv,
};

export default teacherService;
