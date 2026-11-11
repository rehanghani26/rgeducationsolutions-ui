/**
 * @file useFees.js
 * @description Plain React hooks for the Finance / Fees module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to feeService.
 */

import { useState, useEffect, useCallback } from 'react';
import feeService from '../services/feeService.js';

// ─── useFees ──────────────────────────────────────────────────────────────────
export const useFees = (params = {}) => {
  const [data, setData]       = useState({ fees: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feeService.getAll(params);
      if (res.data?.fees) setData(res.data);
      else setData({ fees: [], pagination: { total: 0, page: 1, pages: 1 } });
    } catch (err) {
      setError(err);
      setData({ fees: [], pagination: { total: 0, page: 1, pages: 1 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useFee (single) ─────────────────────────────────────────────────────────
export const useFee = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    feeService.getById(id)
      .then(res => setData(res.data?.fee || null))
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useFeeActivity ───────────────────────────────────────────────────────────
export const useFeeActivity = (id) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    feeService.getActivity(id)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useExpenses ─────────────────────────────────────────────────────────────
export const useExpenses = (params = {}) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    feeService.getExpenses(params)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────
export const useCollectFee = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await feeService.collect(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useUpdateFee = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await feeService.update(id, data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useCreateExpense = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await feeService.createExpense(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};
