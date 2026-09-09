/**
 * @file erpService.js
 * @description ERP shared data API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default erpService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { ERP_URLS } from '../constants/urls.js';

export async function getClasses() {
  try {
    const response = await api.get(ERP_URLS.CLASSES);
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { data: { classes: [] } };
  }
}

export async function createClass(data) {
  try {
    const response = await api.post(ERP_URLS.CLASSES, data);
    toast.success('Class created successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getSections() {
  try {
    const response = await api.get(ERP_URLS.SECTIONS);
    return response.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return { data: { sections: [] } };
  }
}

export async function createSection(data) {
  try {
    const response = await api.post(ERP_URLS.SECTIONS, data);
    toast.success('Section created successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getSubjects() {
  try {
    const response = await api.get(ERP_URLS.SUBJECTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { data: { subjects: [] } };
  }
}

export async function createSubject(data) {
  try {
    const response = await api.post(ERP_URLS.SUBJECTS, data);
    toast.success('Subject created successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getDashboardStats() {
  try {
    const response = await api.get(ERP_URLS.DASHBOARD);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { data: {} };
  }
}

export async function getSettings() {
  try {
    const response = await api.get(ERP_URLS.SETTINGS);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { data: {} };
  }
}

export async function getNotices() {
  try {
    const response = await api.get('/erp/notices');
    return response.data;
  } catch (error) {
    console.error('Error fetching notices:', error);
    return { success: false, notices: [] };
  }
}

export async function createNotice(data) {
  try {
    const response = await api.post('/erp/notices', data);
    toast.success('Notice published successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function deleteNotice(id) {
  try {
    const response = await api.delete(`/erp/notices/${id}`);
    toast.success('Notice removed successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const erpService = {
  getClasses,
  createClass,
  getSections,
  createSection,
  getSubjects,
  createSubject,
  getDashboard: getDashboardStats,
  getSettings,
  getNotices,
  createNotice,
  deleteNotice,
};

export default erpService;
