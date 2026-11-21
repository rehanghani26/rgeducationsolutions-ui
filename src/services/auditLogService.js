/**
 * @file auditLogService.js
 * @description Audit Logs module API service following the EODSrc/services pattern.
 *
 * Uses the shared API client to report request errors,
 * plus default auditLogService export for backward compatibility.
 */

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
  const queryStr = buildQuery(params);
  const url = `${AUDIT_LOG_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url);
  return response.data;
}

const auditLogService = {
  getAll: getAuditLogs,
};

export default auditLogService;
