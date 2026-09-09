import { useState, useEffect, useCallback } from 'react';
import studentService from '../services/studentService.js';
import erpService from '../services/erpService.js';

// ─── useStudents ──────────────────────────────────────────────────────────────
export const useStudents = (params = {}) => {
  const [data, setData]       = useState({ students: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll(params);
      if (res.data) setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useStudent (single) ─────────────────────────────────────────────────────
export const useStudent = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    studentService.getById(id)
      .then(res => setData(res.data?.student || res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useStudentActivity ───────────────────────────────────────────────────────
export const useStudentActivity = (id) => {
  const [data, setData]       = useState({ logs: [], loginHistory: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    studentService.getActivity(id)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useClasses / useSections ─────────────────────────────────────────────────
export const useClasses = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    erpService.getClasses()
      .then(res => setData(res.data?.classes ?? []))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export const useSections = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    erpService.getSections()
      .then(res => setData(res.data?.sections ?? []))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────
export const useCreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await studentService.create(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useUpdateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await studentService.update(id, data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useDeleteStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (id, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await studentService.delete(id);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useBulkDeleteStudents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (ids, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await studentService.bulkDelete(ids);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useBulkPromoteStudents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (payload, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await studentService.bulkPromote(payload);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};
