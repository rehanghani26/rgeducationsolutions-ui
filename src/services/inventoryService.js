/**
 * @file inventoryService.js
 * @description Dynamic Inventory, Purchases, Issuance & Budget Integration API Service.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { INVENTORY_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getInventoryItems(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${INVENTORY_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getInventoryById(id) {
  try {
    const url = INVENTORY_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function getInventorySummary() {
  try {
    const response = await api.get(INVENTORY_URLS.SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return null;
  }
}

export async function getInventoryAlerts() {
  try {
    const response = await api.get(INVENTORY_URLS.ALERTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return { data: [] };
  }
}

export async function createInventoryItem(data) {
  try {
    const response = await api.post(INVENTORY_URLS.BASE, data);
    toast.success('Inventory item created successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function updateInventoryItem(id, data) {
  try {
    const response = await api.put(INVENTORY_URLS.BY_ID(id), data);
    toast.success('Inventory item updated successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function deleteInventoryItem(id) {
  try {
    const response = await api.delete(INVENTORY_URLS.BY_ID(id));
    toast.success('Inventory item deleted');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function adjustStock(data) {
  try {
    const response = await api.post(INVENTORY_URLS.STOCK_ADJUST, data);
    toast.success('Stock adjusted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

// ─── Purchases (Inward Stock & Vendor Bills) ──────────────────────────────────
export async function createPurchaseBill(data) {
  try {
    const response = await api.post(INVENTORY_URLS.PURCHASES, data);
    toast.success('Purchase bill recorded & stock updated!');
    return response.data;
  } catch (error) {
    const errData = error.response?.data;
    if (errData?.overrun) {
      toast.error(errData.message, { autoClose: 7000 });
      return { overrun: true, data: errData };
    }
    toast.error(errData?.message || error.message);
    throw error;
  }
}

export async function getPurchases(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${INVENTORY_URLS.PURCHASES}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return { data: { purchases: [] } };
  }
}

// ─── Issuances (Outward Stock & Class-Wise Requisition) ────────────────────────
export async function createMaterialIssuance(data) {
  try {
    const response = await api.post(INVENTORY_URLS.ISSUANCES, data);
    toast.success('Material issued successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export async function getIssuances(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${INVENTORY_URLS.ISSUANCES}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching issuances:', error);
    return { data: { issuances: [] } };
  }
}

// ─── Unified Transactions Ledger ──────────────────────────────────────────────
export async function getInventoryTransactions(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${INVENTORY_URLS.TRANSACTIONS}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: { transactions: [] } };
  }
}

// ─── Backward compatibility ───────────────────────────────────────────────────
export async function getVendors() {
  try {
    const response = await api.get(INVENTORY_URLS.VENDORS);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return { data: [] };
  }
}

export async function getInventoryActivity(id) {
  try {
    const url = INVENTORY_URLS.ACTIVITY(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory activity:', error);
    return { data: { logs: [] } };
  }
}

const inventoryService = {
  getAll: getInventoryItems,
  getById: getInventoryById,
  getSummary: getInventorySummary,
  getAlerts: getInventoryAlerts,
  getActivity: getInventoryActivity,
  create: createInventoryItem,
  update: updateInventoryItem,
  delete: deleteInventoryItem,
  adjustStock,
  createPurchase: createPurchaseBill,
  getPurchases,
  createIssuance: createMaterialIssuance,
  getIssuances,
  getTransactions: getInventoryTransactions,
  getVendors,
};

export default inventoryService;
