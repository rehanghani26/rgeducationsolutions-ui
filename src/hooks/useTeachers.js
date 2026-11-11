/**
 * @file useTeachers.js
 * @description Plain React hooks for the Teacher module.
 *
 * Real API integration with teacherService.
 * All state managed with useState + useEffect.
 */

import { useState, useEffect, useCallback } from 'react';
import teacherService from '../services/teacherService.js';

// ─── useTeachers ─────────────────────────────────────────────────────────────
export const useTeachers = (params = {}) => {
  const [data, setData]       = useState({ teachers: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherService.getAll(params);
      if (res?.teachers) {
        setData({ teachers: res.teachers, pagination: res.pagination || { total: res.teachers.length, page: 1, pages: 1 } });
      } else if (res?.data?.teachers) {
        setData({ teachers: res.data.teachers, pagination: res.data.pagination || { total: res.data.teachers.length, page: 1, pages: 1 } });
      } else if (Array.isArray(res?.data)) {
        setData({ teachers: res.data, pagination: { total: res.data.length, page: 1, pages: 1 } });
      } else if (Array.isArray(res)) {
        setData({ teachers: res, pagination: { total: res.length, page: 1, pages: 1 } });
      } else {
        setData({ teachers: [], pagination: { total: 0, page: 1, pages: 1 } });
      }
    } catch (err) {
      setError(err);
      setData({ teachers: [], pagination: { total: 0, page: 1, pages: 1 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useTeacher (single) ─────────────────────────────────────────────────────
export const useTeacher = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    teacherService.getById(id)
      .then(res => setData(res?.teacher || res?.data?.teacher || res?.data || res || null))
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useTeacherActivity ───────────────────────────────────────────────────────
export const useTeacherActivity = (id) => {
  const [data, setData]       = useState({
    logs: [],
    loginHistory: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    teacherService.getActivity(id)
      .then(res => setData(res?.data || res || { logs: [], loginHistory: [] }))
      .catch(err => {
        setError(err);
        setData({ logs: [], loginHistory: [] });
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────
export const useCreateTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await teacherService.create(data);
      if (onSuccess) onSuccess(res?.data || res);
      return res?.data || res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};

export const useUpdateTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await teacherService.update(id, data);
      if (onSuccess) onSuccess(res?.data || res);
      return res?.data || res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};

export const useDeleteTeacher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (id, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await teacherService.delete(id);
      if (onSuccess) onSuccess(res);
      return { success: true };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};

export const useBulkDeleteTeachers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (ids, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await teacherService.bulkDelete(ids);
      if (onSuccess) onSuccess(res);
      return { success: true };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};

export const useResetTeacherPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await teacherService.resetPassword(id, data);
      if (onSuccess) onSuccess(res?.data || res);
      return res?.data || res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};
