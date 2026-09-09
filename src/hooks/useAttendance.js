/**
 * @file useAttendance.js
 * @description Plain React hooks for the Attendance module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to attendanceService.
 */

import { useState, useEffect, useCallback } from 'react';
import attendanceService from '../services/attendanceService.js';
import { mockAttendance, mockAttendanceRecords } from '../data/mockData.js';

// ─── useAttendanceRecords ─────────────────────────────────────────────────────
export const useAttendanceRecords = (params = {}) => {
  const fallback = {
    records: mockAttendanceRecords,
    pagination: { total: mockAttendanceRecords.length, page: 1, pages: 1 },
  };

  const [data, setData]       = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getRecords(params);
      if (res.data?.records?.length > 0) {
        setData(res.data);
      } else {
        setData(fallback);
      }
    } catch (err) {
      setError(err);
      setData(fallback);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useAttendanceStats ───────────────────────────────────────────────────────
export const useAttendanceStats = (params = {}) => {
  const { summary } = mockAttendance;
  const [data, setData]       = useState({
    percentage: summary.presentPercentage,
    presentPercentage: summary.presentPercentage,
    total:   summary.total,
    present: summary.present,
    absent:  summary.absent,
    late:    summary.late || 12,
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
