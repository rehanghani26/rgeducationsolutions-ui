import api from './api.js';

export async function getAcademicSessions() {
  const { data } = await api.get('/sessions');
  return data.data?.sessions || data.sessions || [];
}

export async function getSessionBudget(id) {
  const { data } = await api.get('/budget/session/' + encodeURIComponent(id));
  return data.data?.budget ?? data.budget ?? null;
}

export async function saveBudget(fields) {
  const { data } = await api.post('/budget', fields);
  return data.data.budget;
}

export async function reviseBudget(id, fields) {
  const { data } = await api.post('/budget/session/' + encodeURIComponent(id) + '/revise', fields);
  return data.data.budget;
}
