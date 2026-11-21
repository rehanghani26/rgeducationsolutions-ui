/**
 * @file onlineClassService.js
 * @description Online Classes module API service.
 *
 * Uses the shared API client to report request errors,
 * plus default onlineClassService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { ONLINE_CLASS_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

export async function getOnlineClasses(params = {}) {
  const queryStr = buildQuery(params);
  const url = `${ONLINE_CLASS_URLS.BASE}${queryStr ? `?${queryStr}` : ''}`;
  const response = await api.get(url);
  return response.data;
}

export async function getOnlineClassById(id) {
  const response = await api.get(ONLINE_CLASS_URLS.BY_ID(id));
  return response.data;
}

export async function getOnlineClassActivity(id) {
  try {
    const response = await api.get(ONLINE_CLASS_URLS.ACTIVITY(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching online class activity:', error);
    return { logs: [] };
  }
}

export async function createOnlineClass(data) {
  const response = await api.post(ONLINE_CLASS_URLS.BASE, data);
  toast.success('Online class scheduled successfully');
  return { status: response.status, data: response.data };
}

export async function updateOnlineClass(id, data) {
  const response = await api.put(ONLINE_CLASS_URLS.BY_ID(id), data);
  toast.success('Online class updated successfully');
  return { status: response.status, data: response.data };
}

export async function deleteOnlineClass(id) {
  const response = await api.delete(ONLINE_CLASS_URLS.BY_ID(id));
  toast.success('Online class deleted');
  return response.data;
}

export async function joinOnlineClass(id) {
  const response = await api.post(ONLINE_CLASS_URLS.JOIN(id), {});
  toast.success('Attendance marked. Joining class...');
  return response.data;
}

const onlineClassService = {
  getAll: getOnlineClasses,
  getById: getOnlineClassById,
  getActivity: getOnlineClassActivity,
  create: createOnlineClass,
  update: updateOnlineClass,
  delete: deleteOnlineClass,
  join: joinOnlineClass,
};

export default onlineClassService;
