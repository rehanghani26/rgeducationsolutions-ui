/**
 * @file examService.js
 * @description Examinations module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default examService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { EXAM_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getExams(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${EXAM_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getExamById(id) {
  try {
    const url = EXAM_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getExamActivity(id) {
  try {
    const url = EXAM_URLS.ACTIVITY(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam activity:', error);
    return { data: { logs: [] } };
  }
}

export async function createExam(data) {
  try {
    const response = await api.post(EXAM_URLS.BASE, data);
    toast.success('Exam scheduled successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function updateExam(id, data) {
  try {
    const response = await api.put(EXAM_URLS.BY_ID(id), data);
    toast.success('Exam details updated successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function deleteExam(id) {
  try {
    const response = await api.delete(EXAM_URLS.BY_ID(id));
    toast.success('Exam deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const examService = {
  getAll: getExams,
  getById: getExamById,
  getActivity: getExamActivity,
  create: createExam,
  update: updateExam,
  delete: deleteExam,
};

export default examService;
