/**
 * @file teacherService.js
 * @description Teacher module API service following the EODSrc/services pattern.
 *
 * Uses the shared API client to report request errors,
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
export async function getTeachers(params = {}, signal) {
  const queryStr = buildQuery(params);
  const url = `${TEACHER_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url, { signal });
  return response.data;
}

/**
 * Fetch a single teacher by ID.
 * @param {string} id
 */
export async function getTeacherById(id, signal, sessionId) {
  const url = TEACHER_URLS.BY_ID(id);
  const response = await api.get(url, { signal, params: { sessionId: sessionId || undefined } });
  return response.data;
}

/**
 * Fetch activity logs for a teacher.
 * @param {string} id
 */
export async function getTeacherActivity(id, signal) {
  const response = await api.get(TEACHER_URLS.ACTIVITY(id), { signal });
  return response.data;
}

/**
 * Fetch credentials for a teacher (Super Admin only).
 * @param {string} id
 */
export async function getTeacherCredentials(id) {
  const url = `${TEACHER_URLS.BY_ID(id)}/credentials`;
  const response = await api.get(url);
  return response.data;
}

function profileRequest(profile, files) {
  const selected = Object.entries(files || {}).filter(([, file]) => file);
  if (!selected.length) return [profile];
  const form = new FormData();
  form.append('profile', JSON.stringify(profile));
  for (const [kind, file] of selected) form.append(kind, file);
  return [form, { headers: { 'Content-Type': 'multipart/form-data' } }];
}

/**
 * Create a new teacher record.
 * @param {object} data
 */
export async function createTeacher(data, files) {
  const response = await api.post(TEACHER_URLS.BASE, ...profileRequest(data, files));
  toast.success('Teacher account created successfully');
  return { status: response.status, data: response.data };
}

/**
 * Update an existing teacher record.
 * @param {string} id
 * @param {object} data
 */
export async function updateTeacher(id, data, files) {
  const response = await api.put(TEACHER_URLS.BY_ID(id), ...profileRequest(data, files));
  toast.success('Teacher updated successfully');
  return { status: response.status, data: response.data };
}

export async function getTeacherFile(id, kind, signal) {
  const { data } = await api.get(TEACHER_URLS.BY_ID(id) + '/files/' + kind, { responseType: 'blob', signal });
  return data;
}

/**
 * Delete a single teacher.
 * @param {string} id
 */
export async function deleteTeacher(id) {
  const response = await api.delete(TEACHER_URLS.BY_ID(id));
  toast.success('Teacher deleted successfully');
  return response.data;
}

/**
 * Bulk delete multiple teachers.
 * @param {string[]} ids
 */
export async function bulkDeleteTeachers(ids) {
  const response = await api.post(TEACHER_URLS.BULK_DELETE, { ids });
  toast.success('Selected teachers deleted successfully');
  return response.data;
}

/**
 * Reset a teacher login password.
 * @param {string} id
 * @param {object} data
 */
export async function resetTeacherPassword(id, data) {
  const response = await api.patch(TEACHER_URLS.RESET_PASSWORD(id), data);
  toast.success('Password updated successfully');
  return response.data;
}

/**
 * Bulk import teachers from CSV data.
 * @param {Array<object>} teachers
 */
export async function bulkImportTeachers(teachers) {
  const response = await api.post(`${TEACHER_URLS.BASE}/bulk-import`, { teachers });
  return response.data;
}

/**
 * Export teachers as CSV blob.
 */
export async function exportTeachersCsv() {
  const response = await api.get(TEACHER_URLS.EXPORT_CSV, { responseType: 'blob' });
  return response.data;
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
