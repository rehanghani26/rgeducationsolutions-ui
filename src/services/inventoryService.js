/**
 * @file inventoryService.js
 * @description Inventory module API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default inventoryService export for backward compatibility.
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

export async function getInventoryAlerts() {
  try {
    const response = await api.get(INVENTORY_URLS.ALERTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return { data: [] };
  }
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

export async function createInventoryItem(data) {
  try {
    const response = await api.post(INVENTORY_URLS.BASE, data);
    toast.success('Inventory item created successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function updateInventoryItem(id, data) {
  try {
    const response = await api.put(INVENTORY_URLS.BY_ID(id), data);
    toast.success('Inventory item updated successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function adjustStock(data) {
  try {
    const response = await api.post(INVENTORY_URLS.STOCK_ADJUST, data);
    toast.success('Stock adjusted successfully');
    return { status: response.status, data: response.data };
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

const inventoryService = {
  getAll: getInventoryItems,
  getById: getInventoryById,
  getActivity: getInventoryActivity,
  getAlerts: getInventoryAlerts,
  getVendors,
  create: createInventoryItem,
  update: updateInventoryItem,
  adjustStock,
};

export default inventoryService;
