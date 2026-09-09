/**
 * @file useExams.js
 * @description Plain React hooks for the Exams module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to examService.
 */

import { useState, useEffect, useCallback } from 'react';
import examService from '../services/examService.js';
import { mockExams } from '../data/mockData.js';

// ─── useExams ─────────────────────────────────────────────────────────────────
export const useExams = (params = {}) => {
  const [data, setData]       = useState({ exams: mockExams, pagination: { total: mockExams.length, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examService.getAll(params);
      if (res.data?.exams?.length > 0) setData(res.data);
    } catch (err) {
      setError(err);
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
      .then(res => setData(res.data?.exam ?? mockExams.find(e => e.id === id || e._id === id) ?? mockExams[0]))
      .catch(err => {
        setError(err);
        setData(mockExams.find(e => e.id === id || e._id === id) ?? mockExams[0]);
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
