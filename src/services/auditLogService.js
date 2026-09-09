/**
 * @file auditLogService.js
 * @description Audit Logs module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default auditLogService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { AUDIT_LOG_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getAuditLogs(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${AUDIT_LOG_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const auditLogService = {
  getAll: getAuditLogs,
};

export default auditLogService;
