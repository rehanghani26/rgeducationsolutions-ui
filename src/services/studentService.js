/**
 * @file studentService.js
 * @description Student module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default studentService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { STUDENT_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

/**
 * Fetch paginated student list.
 * @param {object} params
 */
export async function getStudents(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${STUDENT_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Fetch a single student by ID.
 * @param {string} id
 */
export async function getStudentById(id) {
  try {
    const url = STUDENT_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Fetch activity / audit logs for a student.
 * @param {string} id
 */
export async function getStudentActivity(id) {
  try {
    const url = STUDENT_URLS.ACTIVITY(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student activity:', error);
    return { data: { logs: [], loginHistory: [] } };
  }
}

/**
 * Fetch credentials for a student (Super Admin only).
 * @param {string} id
 */
export async function getStudentCredentials(id) {
  try {
    const url = `${STUDENT_URLS.BY_ID(id)}/credentials`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Create a new student record.
 * @param {object} data
 */
export async function createStudent(data) {
  try {
    const response = await api.post(STUDENT_URLS.BASE, data);
    toast.success('Student registered successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Update an existing student record.
 * @param {string} id
 * @param {object} data
 */
export async function updateStudent(id, data) {
  try {
    const response = await api.put(STUDENT_URLS.BY_ID(id), data);
    toast.success('Student updated successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Delete a single student.
 * @param {string} id
 */
export async function deleteStudent(id) {
  try {
    const response = await api.delete(STUDENT_URLS.BY_ID(id));
    toast.success('Student deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Bulk delete multiple students.
 * @param {string[]} ids
 */
export async function bulkDeleteStudents(ids) {
  try {
    const response = await api.post(STUDENT_URLS.BULK_DELETE, { ids });
    toast.success('Selected students deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Bulk promote students to next class.
 * @param {object} payload
 */
export async function bulkPromoteStudents(payload) {
  try {
    const response = await api.post(STUDENT_URLS.BULK_PROMOTE, payload);
    toast.success('Students promoted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Bulk import students from CSV array data.
 * @param {Array<object>} students
 */
export async function bulkImportStudents(students) {
  try {
    const response = await api.post(STUDENT_URLS.BULK_IMPORT, { students });
    const { count, total, errors = [] } = response.data || {};
    if (errors.length > 0) {
      toast.warning(`Imported ${count}/${total} students. ${errors.length} row(s) failed.`);
    } else {
      toast.success(response.data?.message || `Successfully imported ${count} students!`);
    }
    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Export student list as CSV blob.
 */
export async function exportStudentsCsv() {
  try {
    const response = await api.get(STUDENT_URLS.EXPORT_CSV, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

/**
 * Upload student file (photo or Aadhaar PDF) to backend which streams to Cloudinary.
 * @param {File} file
 * @param {'photo' | 'aadhaar'} type
 */
export async function uploadStudentFile(file, type = 'photo') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post(STUDENT_URLS.UPLOAD_FILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'File upload failed';
    toast.error(msg);
    throw { status: error.response?.status, message: msg };
  }
}

/**
 * Fetch a student image or document by its ID (imagesRef.id or AdharRef.id)
 * @param {string} fileId
 */
export async function getStudentFileById(fileId) {
  try {
    const response = await api.get(`/students/file/${fileId}`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'File not found';
    toast.error(msg);
    throw { status: error.response?.status, message: msg };
  }
}

const studentService = {
  getAll: getStudents,
  getById: getStudentById,
  getActivity: getStudentActivity,
  getCredentials: getStudentCredentials,
  create: createStudent,
  update: updateStudent,
  delete: deleteStudent,
  bulkDelete: bulkDeleteStudents,
  bulkPromote: bulkPromoteStudents,
  bulkImport: bulkImportStudents,
  exportCsv: exportStudentsCsv,
  uploadFile: uploadStudentFile,
  getFileById: getStudentFileById,
};

export default studentService;
