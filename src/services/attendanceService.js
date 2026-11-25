/**
 * @file attendanceService.js
 * @description Attendance module API service using the shared API client.
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
  const queryStr = buildQuery(params);
  const url = `${ATTENDANCE_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url);
  return response.data;
}

export async function getAttendanceById(id) {
  const response = await api.get(ATTENDANCE_URLS.BY_ID(id));
  return response.data;
}

export async function getAttendanceStatus(params = {}) {
  const queryStr = buildQuery(params);
  const url = `${ATTENDANCE_URLS.STATUS}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url);
  return response.data;
}

export async function getStudentAttendance(studentId, params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = studentId
      ? `${ATTENDANCE_URLS.BASE}/student/${studentId}${queryStr ? `?${queryStr}` : ''}`
      : `${ATTENDANCE_URLS.BASE}/student${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return {
      summary: {
        totalDays: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        halfDayCount: 0,
        leaveCount: 0,
        percentage: '0%',
      },
      logs: [],
    };
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
    return {
      stats: {
        totalStudents: 0,
        totalClasses: 0,
        todayMarkedClasses: 0,
        todayPresent: 0,
        todayAbsent: 0,
        todayLate: 0,
        todayHalfDay: 0,
        todayLeave: 0,
        notTaken: '0 Pending',
        notTakenClasses: 0,
        overallAttendance: '0%',
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        leave: 0,
        total: 0,
        percentage: 0,
        recordsCount: 0,
      },
    };
  }
}

export async function createAttendance(data) {
  const response = await api.post(ATTENDANCE_URLS.BASE, data);
  toast.success(response.data?.message || 'Attendance recorded successfully');
  return { status: response.status, data: response.data };
}

export async function updateAttendance(id, data) {
  const response = await api.put(ATTENDANCE_URLS.BY_ID(id), data);
  toast.success(response.data?.message || 'Attendance updated successfully');
  return { status: response.status, data: response.data };
}

export async function getMyAttendance() {
  try {
    const response = await api.get(`${ATTENDANCE_URLS.BASE}/my-attendance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my attendance:', error);
    return {
      summary: {
        totalDays: 0,
        presentCount: 0,
        absentCount: 0,
        halfDayCount: 0,
        lateCount: 0,
        leaveCount: 0,
        percentage: 'N/A',
      },
      logs: [],
    };
  }
}

const attendanceService = {
  getRecords: getAttendanceRecords,
  getById: getAttendanceById,
  getStatus: getAttendanceStatus,
  getStats: getAttendanceStats,
  create: createAttendance,
  update: updateAttendance,
  getStudentAttendance,
  getMyAttendance,
};

export default attendanceService;
