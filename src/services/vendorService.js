/**
 * @file vendorService.js
 * @description Vendor Module API Service.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { VENDOR_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getVendors(params = {}) {
  try {
    const queryStr = buildQuery(params);
    const url = `${VENDOR_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const queryStr = buildQuery(params);
        const fallbackRes = await api.get(`/inventory/vendors${queryStr ? `?${queryStr}` : ''}`);
        return fallbackRes.data;
      } catch (fbErr) {
        console.error('Fallback fetch vendors error:', fbErr);
      }
    }
    console.error('Error fetching vendors:', error);
    return { data: { vendors: [] } };
  }
}

export async function getVendorById(id) {
  try {
    const url = VENDOR_URLS.BY_ID(id);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const fallbackRes = await api.get(`/inventory/vendors/${id}`);
        return fallbackRes.data;
      } catch (fbErr) {
        // Continue to standard throw
      }
    }
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export async function createVendor(data) {
  try {
    const response = await api.post(VENDOR_URLS.BASE, data);
    toast.success('Vendor registered successfully!');
    return response.data;
  } catch (error) {
    // If /vendors returned 404, fallback to /inventory/vendors
    if (error.response?.status === 404) {
      try {
        const fallbackRes = await api.post('/inventory/vendors', data);
        toast.success('Vendor registered successfully!');
        return fallbackRes.data;
      } catch (fbErr) {
        toast.error(fbErr.response?.data?.message || fbErr.message);
        throw fbErr;
      }
    }
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export async function updateVendor(id, data) {
  try {
    const response = await api.put(VENDOR_URLS.BY_ID(id), data);
    toast.success('Vendor updated successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export async function deleteVendor(id) {
  try {
    const response = await api.delete(VENDOR_URLS.BY_ID(id));
    toast.success('Vendor deleted / deactivated');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export async function getVendorBills(id) {
  try {
    const response = await api.get(VENDOR_URLS.BILLS(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    return { data: { bills: [] } };
  }
}

export async function recordVendorPayment(id, data) {
  try {
    const response = await api.post(VENDOR_URLS.PAY(id), data);
    toast.success('Payment recorded successfully!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

const vendorService = {
  getAll: getVendors,
  getById: getVendorById,
  create: createVendor,
  update: updateVendor,
  delete: deleteVendor,
  getBills: getVendorBills,
  recordPayment: recordVendorPayment,
};

export default vendorService;

