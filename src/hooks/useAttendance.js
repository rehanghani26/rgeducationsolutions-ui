/**
 * @file useAttendance.js
 * @description Plain React hooks for the Attendance module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to attendanceService.
 */

import { useState, useEffect, useCallback } from 'react';
import attendanceService from '../services/attendanceService.js';

// ─── useAttendanceRecords ─────────────────────────────────────────────────────
export const useAttendanceRecords = (params = {}) => {
  const emptyState = {
    records: [],
    pagination: { total: 0, page: 1, pages: 1 },
  };

  const [data, setData]       = useState(emptyState);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getRecords(params);
      if (res.data?.records) {
        setData(res.data);
      } else {
        setData(emptyState);
      }
    } catch (err) {
      setError(err);
      setData(emptyState);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useAttendanceStats ───────────────────────────────────────────────────────
export const useAttendanceStats = (params = {}) => {
  const [data, setData]       = useState({
    percentage: "N/A",
    presentPercentage: "N/A",
    total:   0,
    present: 0,
    absent:  0,
    late:    0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    attendanceService.getStats(params)
      .then(res => { if (res.data?.stats) setData(res.data.stats); })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

// ─── useCreateAttendance (mutation) ───────────────────────────────────────────
export const useCreateAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await attendanceService.create(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};
