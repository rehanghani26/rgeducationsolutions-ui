/**
 * @file homeworkService.js
 * @description Homework module API service.
 *
 * Uses the shared API client to report request errors,
 * plus default homeworkService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { HOMEWORK_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getHomework(params = {}) {
  const queryStr = buildQuery(params);
  const url = `${HOMEWORK_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url);
  return response.data;
}

export async function getHomeworkById(id) {
  const response = await api.get(HOMEWORK_URLS.BY_ID(id));
  return response.data;
}

export async function getHomeworkActivity(id) {
  try {
    const response = await api.get(HOMEWORK_URLS.ACTIVITY(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching homework activity:', error);
    return { logs: [] };
  }
}

export async function createHomework(data) {
  const response = await api.post(HOMEWORK_URLS.BASE, data);
  toast.success('Homework assignment created successfully');
  return { status: response.status, data: response.data };
}

export async function updateHomework(id, data) {
  const response = await api.put(HOMEWORK_URLS.BY_ID(id), data);
  toast.success('Homework updated successfully');
  return { status: response.status, data: response.data };
}

export async function deleteHomework(id) {
  const response = await api.delete(HOMEWORK_URLS.BY_ID(id));
  toast.success('Homework deleted');
  return response.data;
}

export async function submitHomework(id, data) {
  const response = await api.post(HOMEWORK_URLS.SUBMIT(id), data);
  toast.success('Homework submitted successfully');
  return { status: response.status, data: response.data };
}

export async function gradeSubmission(homeworkId, submissionId, data) {
  const response = await api.put(HOMEWORK_URLS.GRADE(homeworkId, submissionId), data);
  toast.success('Submission graded successfully');
  return { status: response.status, data: response.data };
}

const homeworkService = {
  getAll: getHomework,
  getById: getHomeworkById,
  getActivity: getHomeworkActivity,
  create: createHomework,
  update: updateHomework,
  delete: deleteHomework,
  submit: submitHomework,
  grade: gradeSubmission,
};

export default homeworkService;
