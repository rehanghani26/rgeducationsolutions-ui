/**
 * @file useExams.js
 * @description Plain React hooks for the Exams module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to examService.
 */

import { useState, useEffect, useCallback } from 'react';
import examService from '../services/examService.js';

// ─── useExams ─────────────────────────────────────────────────────────────────
export const useExams = (params = {}) => {
  const [data, setData]       = useState({ exams: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examService.getAll(params);
      const list = Array.isArray(res?.exams)
        ? res.exams
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : Array.isArray(res?.data?.exams)
        ? res.data.exams
        : [];
      const pag = res.pagination || res.data?.pagination || { total: list.length, page: 1, pages: 1 };
      setData({ exams: list, pagination: pag });
    } catch (err) {
      setError(err);
      setData({ exams: [], pagination: { total: 0, page: 1, pages: 1 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useExam (single) ─────────────────────────────────────────────────────────
export const useExam = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    examService.getById(id)
      .then(res => {
        const found = res?.exam || res?.data?.exam || res?.data || null;
        setData(found);
      })
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useExamActivity ──────────────────────────────────────────────────────────
export const useExamActivity = (id) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    examService.getActivity(id)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────
export const useCreateExam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await examService.create(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useUpdateExam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await examService.update(id, data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useDeleteExam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (id, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await examService.delete(id);
      if (onSuccess) onSuccess();
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};
