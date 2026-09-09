/**
 * @file useTeachers.js
 * @description Plain React hooks for the Teacher module.
 *
 * API response calls commented out to directly serve hardcoded demo data response.
 * All HTTP calls delegated to teacherService.
 */

import { useState, useEffect, useCallback } from 'react';
import teacherService from '../services/teacherService.js';
import { mockTeachers } from '../data/mockData.js';

// ─── useTeachers ─────────────────────────────────────────────────────────────
export const useTeachers = (params = {}) => {
  const [data, setData]       = useState({ teachers: mockTeachers, pagination: { total: mockTeachers.length, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      // API call commented out to use hardcoded actual response:
      // const res = await teacherService.getAll(params);
      // if (res.data?.teachers?.length > 0) setData(res.data);
      
      // Directly return hardcoded actual response:
      setData({ teachers: mockTeachers, pagination: { total: mockTeachers.length, page: 1, pages: 1 } });
    } catch (err) {
      setError(err);
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
    // API call commented out to use hardcoded actual response:
    // teacherService.getById(id)
    //   .then(res => setData(res.data?.teacher))
    //   .catch(err => setError(err));

    // Directly return hardcoded actual response:
    const found = mockTeachers.find(t => t.id === id || t._id === id) || mockTeachers[0];
    setData(found);
    setLoading(false);
  }, [id]);

  return { data, loading, error };
};

// ─── useTeacherActivity ───────────────────────────────────────────────────────
export const useTeacherActivity = (id) => {
  const [data, setData]       = useState({
    logs: [
      { id: "log-1", action: "Profile Record Updated", date: "2026-08-01 10:15 AM", user: "Admin" },
      { id: "log-2", action: "Class 10 Attendance Submitted", date: "2026-08-05 08:00 AM", user: "Self" },
    ],
    loginHistory: [
      { id: "lh-1", date: "2026-08-05 07:30 AM", ip: "192.168.1.45", device: "Chrome (Windows)" },
      { id: "lh-2", date: "2026-08-04 07:35 AM", ip: "192.168.1.45", device: "Chrome (Windows)" },
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // API call commented out to use hardcoded actual response:
    // teacherService.getActivity(id)
    //   .then(res => setData(res.data))
    //   .catch(err => setError(err));
    setLoading(false);
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
      // API call commented out to return mock created data response:
      // const res = await teacherService.create(data);
      const res = { data: { message: "Teacher created successfully", teacher: { ...data, id: `tch-${Date.now()}` } } };
      if (onSuccess) onSuccess(res.data);
      return res.data;
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
      // API call commented out to return mock updated data response:
      // const res = await teacherService.update(id, data);
      const res = { data: { message: "Teacher updated successfully", teacher: { ...data, id } } };
      if (onSuccess) onSuccess(res.data);
      return res.data;
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
      // API call commented out to return mock response:
      // const res = await teacherService.delete(id);
      if (onSuccess) onSuccess();
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
      // API call commented out to return mock response:
      // const res = await teacherService.bulkDelete(ids);
      if (onSuccess) onSuccess();
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
      // API call commented out to return mock response:
      // const res = await teacherService.resetPassword(id, data);
      const res = { data: { message: "Password reset successfully" } };
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
};
