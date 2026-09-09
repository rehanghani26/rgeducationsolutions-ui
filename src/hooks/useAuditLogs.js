/**
 * @file useAuditLogs.js
 * @description Plain React hooks for the Audit Logs module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to auditLogService.
 */

import { useState, useEffect, useCallback } from 'react';
import auditLogService from '../services/auditLogService.js';

// ─── useAuditLogs ─────────────────────────────────────────────────────────────
export const useAuditLogs = (params = {}) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getAll(params);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
