/**
 * @file leaveService.js
 * @description Centralized Leave Management API client service for Student, Teacher, Staff, and Admins.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { LEAVE_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

/**
 * Universal dynamic profile endpoint:
 * Send studentId, teacherId, or userId -> returns applicant profile, stats, pending requests, and approval history.
 */
export async function getApplicantLeaveProfile(applicantId) {
  try {
    const url = LEAVE_URLS.APPLICANT(encodeURIComponent(applicantId));
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching applicant leave profile:', error);
    return {
      success: false,
      summary: { totalApplications: 0, totalDaysApplied: 0, approvedDays: 0, pendingDays: 0, rejectedDays: 0 },
      pendingRequests: [],
      history: [],
      activeLeaveNow: null,
      message: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Returns current authenticated user's own leave requests
 */
export async function getMyLeaves() {
  try {
    const response = await api.get(LEAVE_URLS.MY);
    return response.data;
  } catch (error) {
    console.error('Error fetching my leaves:', error);
    return { success: false, leaves: [] };
  }
}

/**
 * Administrative leave console query with pagination & filters
 */
export async function getAllLeaves(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${LEAVE_URLS.ALL}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    return { success: false, leaves: [], total: 0, page: 1, pages: 1 };
  }
}

/**
 * Submits a new leave request (self or on-behalf)
 */
export async function requestLeave(payload) {
  try {
    const response = await api.post(LEAVE_URLS.REQUEST, payload);
    toast.success(response.data?.message || 'Leave request submitted successfully.');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to submit leave request.';
    toast.error(msg);
    throw { status: error.response?.status, message: msg };
  }
}

/**
 * Reviews (approves or rejects) a leave request and triggers attendance sync
 */
export async function reviewLeave(leaveId, { status, reviewRemarks = '' }) {
  try {
    const url = LEAVE_URLS.REVIEW(leaveId);
    const response = await api.patch(url, { status, reviewRemarks });
    toast.success(response.data?.message || `Leave ${status} successfully.`);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to review leave application.';
    toast.error(msg);
    throw { status: error.response?.status, message: msg };
  }
}

/**
 * Cancels a pending leave application
 */
export async function cancelLeave(leaveId) {
  try {
    const url = LEAVE_URLS.BY_ID(leaveId);
    const response = await api.delete(url);
    toast.success(response.data?.message || 'Leave request cancelled.');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to cancel leave application.';
    toast.error(msg);
    throw { status: error.response?.status, message: msg };
  }
}

/**
 * Returns active approved leaves on a specific date and classroom for attendance taking
 */
export async function getActiveLeavesOnDate(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${LEAVE_URLS.ACTIVE_ON_DATE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching active leaves on date:', error);
    return { success: false, leaves: [], count: 0 };
  }
}

const leaveService = {
  getApplicantLeaveProfile,
  getMyLeaves,
  getAllLeaves,
  requestLeave,
  reviewLeave,
  cancelLeave,
  getActiveLeavesOnDate,
};

export default leaveService;
