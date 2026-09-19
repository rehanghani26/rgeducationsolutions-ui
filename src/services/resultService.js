/**
 * @file resultService.js
 * @description Results module API service.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { RESULT_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

// Get all results (admin/teacher)
export async function getResults(params = {}) {
  try {
    const qs = buildQuery(params);
    const { data } = await api.get(`${RESULT_URLS.BASE}${qs ? `?${qs}` : ''}`);
    return data;
  } catch (err) {
    throw err;
  }
}

// Student's full result history
export async function getStudentHistory(studentId, params = {}) {
  try {
    const qs = buildQuery(params);
    const { data } = await api.get(`${RESULT_URLS.STUDENT_HISTORY(studentId)}${qs ? `?${qs}` : ''}`);
    return data;
  } catch (err) {
    throw err;
  }
}

// Single student exam result
export async function getStudentExamResult(examId, studentId) {
  try {
    const { data } = await api.get(RESULT_URLS.STUDENT_EXAM(examId, studentId));
    return data;
  } catch (err) {
    throw err;
  }
}

// Class result sheet (all students for one exam + class)
export async function getClassResults(examId, classId, params = {}) {
  try {
    const qs = buildQuery(params);
    const { data } = await api.get(`${RESULT_URLS.CLASS_RESULTS(examId, classId)}${qs ? `?${qs}` : ''}`);
    return data;
  } catch (err) {
    throw err;
  }
}

// Exam analytics / stats
export async function getExamStats(examId, params = {}) {
  try {
    const qs = buildQuery(params);
    const { data } = await api.get(`${RESULT_URLS.STATS(examId)}${qs ? `?${qs}` : ''}`);
    return data;
  } catch (err) {
    throw err;
  }
}

// Bulk upsert results (teacher marks entry)
export async function bulkUpsertResults(payload) {
  try {
    const { data } = await api.post(RESULT_URLS.BULK, payload);
    toast.success(data.message || 'Results saved successfully');
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save results');
    throw err;
  }
}

// Publish all results for a class exam
export async function publishResults(examId, classId, params = {}) {
  try {
    const qs = buildQuery(params);
    const { data } = await api.put(`${RESULT_URLS.PUBLISH(examId, classId)}${qs ? `?${qs}` : ''}`);
    toast.success(data.message || 'Results published!');
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to publish results');
    throw err;
  }
}

// Update single result
export async function updateResult(id, payload) {
  try {
    const { data } = await api.put(RESULT_URLS.BY_ID(id), payload);
    toast.success('Result updated');
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update result');
    throw err;
  }
}

// Delete result
export async function deleteResult(id) {
  try {
    const { data } = await api.delete(RESULT_URLS.BY_ID(id));
    toast.success('Result deleted');
    return data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete result');
    throw err;
  }
}

const resultService = {
  getAll: getResults,
  getStudentHistory,
  getStudentExamResult,
  getClassResults,
  getExamStats,
  bulkUpsert: bulkUpsertResults,
  publish: publishResults,
  update: updateResult,
  delete: deleteResult,
};

export default resultService;
