import { toast } from 'react-toastify';
import api from './api.js';
import { INVENTORY_URLS } from '../constants/urls.js';

const read = async (url, params) => (await api.get(url, { params })).data;

async function save(request) {
  const { data } = await request;
  if (data.message) toast.success(data.message);
  return data;
}

export const getInventoryItems = (params) => read(INVENTORY_URLS.BASE, params);
export const getInventoryById = (id) => read(INVENTORY_URLS.BY_ID(id));
export const getInventorySummary = (params) => read(INVENTORY_URLS.SUMMARY, params);
export const getInventoryAlerts = () => read(INVENTORY_URLS.ALERTS);
export const getInventoryActivity = (id) => read(INVENTORY_URLS.ACTIVITY(id));
export const getInventoryTransactions = (params) => read(INVENTORY_URLS.TRANSACTIONS, params);
export const getVendors = (params) => read(INVENTORY_URLS.VENDORS, params);
export const getPurchases = (params) => read(INVENTORY_URLS.PURCHASES, params);

export const createInventoryItem = (data) => save(api.post(INVENTORY_URLS.BASE, data));
export const createBulkInventoryItems = (data) => save(api.post(INVENTORY_URLS.BULK, data));
export const updateInventoryItem = (id, data) => save(api.put(INVENTORY_URLS.BY_ID(id), data));
export const deleteInventoryItem = (id) => save(api.delete(INVENTORY_URLS.BY_ID(id)));
export const adjustStock = (data) => save(api.post(INVENTORY_URLS.STOCK_ADJUST, data));
export const createPurchaseBill = (data) => save(api.post(INVENTORY_URLS.PURCHASES, data));

export function inventoryAttachmentUrl(value) {
  if (!value) return undefined;
  try {
    const base = new URL(api.defaults.baseURL, window.location.origin);
    const photo = typeof value === 'string' && value.startsWith('/inventory-catalog/');
    const url = new URL(value, photo ? window.location.origin : base);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export async function uploadInventoryFiles(files = []) {
  const fileList = Array.isArray(files) ? files : [files];
  if (!fileList.length) return [];
  const formData = new FormData();
  fileList.forEach((file) => formData.append('files', file));
  const { data } = await api.post(INVENTORY_URLS.UPLOAD_ATTACHMENT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data?.files || [];
}

export default {
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
};
