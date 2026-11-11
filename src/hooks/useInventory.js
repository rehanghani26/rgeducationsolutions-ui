/**
 * @file useInventory.js
 * @description Plain React hooks for the Inventory module.
 *
 * No react-query. All state managed with useState + useEffect.
 * All HTTP calls delegated to inventoryService.
 */

import { useState, useEffect, useCallback } from 'react';
import inventoryService from '../services/inventoryService.js';

// ─── useInventory ─────────────────────────────────────────────────────────────
export const useInventory = (params = {}) => {
  const [data, setData]       = useState({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAll(params);
      if (res.data?.items) setData(res.data);
      else setData({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
    } catch (err) {
      setError(err);
      setData({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── useInventoryItem (single) ────────────────────────────────────────────────
export const useInventoryItem = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    inventoryService.getById(id)
      .then(res => setData(res.data?.item || null))
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useInventoryActivity ─────────────────────────────────────────────────────
export const useInventoryActivity = (id) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    inventoryService.getActivity(id)
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// ─── useInventoryAlerts ───────────────────────────────────────────────────────
export const useInventoryAlerts = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    inventoryService.getAlerts()
      .then(res => setData(res.data?.alerts ?? []))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

// ─── useVendors ───────────────────────────────────────────────────────────────
export const useVendors = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    inventoryService.getVendors()
      .then(res => setData(res.data?.vendors ?? []))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

// ─── Mutation helpers ─────────────────────────────────────────────────────────
export const useCreateInventoryItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await inventoryService.create(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useUpdateInventoryItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async ({ id, data }, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await inventoryService.update(id, data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};

export const useAdjustStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (data, { onSuccess } = {}) => {
    setLoading(true);
    try {
      const res = await inventoryService.adjustStock(data);
      if (onSuccess) onSuccess(res.data);
      return res.data;
    } catch (err) { setError(err); throw err; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
};
