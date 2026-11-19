import { toast } from 'react-toastify';
import api from './api.js';
import { VENDOR_URLS } from '../constants/urls.js';

export const getVendors = async (params = {}) => (await api.get(VENDOR_URLS.BASE, { params })).data;
export const getVendorById = async (id) => (await api.get(VENDOR_URLS.BY_ID(id))).data;
export const getVendorBills = async (id, params) => (await api.get(VENDOR_URLS.BILLS(id), { params })).data;

async function save(request) {
  const { data } = await request;
  if (data.message) toast.success(data.message);
  return data;
}

export const createVendor = (data) => save(api.post(VENDOR_URLS.BASE, data));
export const updateVendor = (id, data) => save(api.put(VENDOR_URLS.BY_ID(id), data));
export const deleteVendor = (id) => save(api.delete(VENDOR_URLS.BY_ID(id)));
export const recordVendorPayment = (id, data) => save(api.post(VENDOR_URLS.PAY(id), data));

export default {
  getAll: getVendors,
  getById: getVendorById,
  create: createVendor,
  update: updateVendor,
  delete: deleteVendor,
  getBills: getVendorBills,
  recordPayment: recordVendorPayment,
};
