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

export async function createBulkInventoryItems(payload) {
  try {
    const response = await api.post(INVENTORY_URLS.BULK, payload);
    toast.success(response.data?.message || 'Inventory record created successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function uploadInventoryFiles(files = []) {
  try {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return [];
    const formData = new FormData();
    fileList.forEach((f) => formData.append('files', f));
    const response = await api.post(INVENTORY_URLS.UPLOAD_ATTACHMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data?.files || [];
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'File upload failed');
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
export async function createPurchaseBill(payload) {
  try {
    return await createBulkInventoryItems(payload);
  } catch (error) {
    console.error('Error in createPurchaseBill compatibility wrapper:', error);
    return { data: null };
  }
}

export async function getPurchases(params = {}) {
  return { data: { purchases: [] } };
}

export async function createMaterialIssuance(data) {
  try {
    return await adjustStock({ ...data, type: 'STOCK_ADJUST_SUB' });
  } catch (error) {
    console.error('Error in createMaterialIssuance compatibility wrapper:', error);
    return { data: null };
  }
}

export async function getIssuances(params = {}) {
  return { data: { issuances: [] } };
}

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
  createBulk: createBulkInventoryItems,
  uploadAttachments: uploadInventoryFiles,
  update: updateInventoryItem,
  delete: deleteInventoryItem,
  adjustStock,
  getTransactions: getInventoryTransactions,
  getVendors,
  createPurchaseBill,
  getPurchases,
  createMaterialIssuance,
  getIssuances,
};

export default inventoryService;
