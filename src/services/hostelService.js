import api from './api.js';

export const HOSTEL_API = '/erp/hostel';

export async function readHostel(path, { sessionId, signal, ...params } = {}) {
  const { data } = await api.get(HOSTEL_API + path, {
    params: { ...params, sessionId: sessionId || undefined }, signal, localErrorUi: true,
  });
  return data.data;
}

export async function saveHostel(path, method, payload, sessionId) {
  const { data } = await api.request({
    url: HOSTEL_API + path, method, data: payload, params: { sessionId: sessionId || undefined }, localErrorUi: true,
  });
  return data.data;
}

export function hostelError(error) {
  return error?.response?.data?.message || 'Unable to load or save hostel records. Try again.';
}
