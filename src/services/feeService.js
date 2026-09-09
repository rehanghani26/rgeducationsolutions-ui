/**
 * @file feeService.js
 * @description Finance / Fees module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default feeService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { FEE_URLS, EXPENSE_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getFees(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${FEE_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getFeeById(id) {
  try {
    const url = FEE_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getFeeActivity(id) {
  try {
    const url = FEE_URLS.ACTIVITY(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching fee activity:', error);
    return { data: { logs: [] } };
  }
}

export async function updateFee(id, data) {
  try {
    const response = await api.put(FEE_URLS.BY_ID(id), data);
    toast.success('Fee record updated successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function collectFee(data) {
  try {
    const response = await api.post(FEE_URLS.COLLECT, data);
    toast.success('Fee collected successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function exportFeesCsv() {
  try {
    const response = await api.get(FEE_URLS.EXPORT, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getExpenses(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${EXPENSE_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function createExpense(data) {
  try {
    const response = await api.post(EXPENSE_URLS.BASE, data);
    toast.success('Expense recorded successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const feeService = {
  getAll: getFees,
  getById: getFeeById,
  getActivity: getFeeActivity,
  update: updateFee,
  collect: collectFee,
  export: exportFeesCsv,
  getExpenses,
  createExpense,
};

export default feeService;
