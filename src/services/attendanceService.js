/**
 * @file attendanceService.js
 * @description Attendance module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default attendanceService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { ATTENDANCE_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getAttendanceRecords(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${ATTENDANCE_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getAttendanceById(id) {
  try {
    const url = `${ATTENDANCE_URLS.BASE}/${id}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getStudentAttendance(studentId) {
  try {
    const url = `${ATTENDANCE_URLS.BASE}/student/${studentId}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return { summary: { totalDays: 0, presentCount: 0, absentCount: 0, lateCount: 0, percentage: '0%' }, logs: [] };
  }
}

export async function getAttendanceStats(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${ATTENDANCE_URLS.STATS}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return { data: { overall: 0, classBreakdown: [] } };
  }
}

export async function createAttendance(data) {
  try {
    const response = await api.post(ATTENDANCE_URLS.BASE, data);
    toast.success('Attendance recorded successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getMyAttendance() {
  try {
    const response = await api.get(`${ATTENDANCE_URLS.BASE}/my-attendance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my attendance:', error);
    return { data: { summary: {}, history: [] } };
  }
}

const attendanceService = {
  getRecords: getAttendanceRecords,
  getStats: getAttendanceStats,
  create: createAttendance,
  getMyAttendance,
};

export default attendanceService;
