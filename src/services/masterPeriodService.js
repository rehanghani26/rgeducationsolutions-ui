import api from './api.js';
import { recordId } from '../utils/procurement.js';

const pathFor = (id) => '/periods/' + encodeURIComponent(id);

export async function getMasterPeriods(type, signal, sessionId) {
  const { data } = await api.get('/periods', { params: { type, sessionId: sessionId || undefined }, signal });
  return data.data?.schedules ?? data.schedules ?? [];
}

export async function saveMasterPeriod(schedule) {
  const id = recordId(schedule);
  const { data } = id ? await api.put(pathFor(id), schedule) : await api.post('/periods', schedule);
  return data.data?.schedule ?? data.schedule;
}

export async function makeDefaultMasterPeriod(id) {
  const { data } = await api.patch(pathFor(id) + '/default');
  return data.data?.schedule ?? data.schedule;
}
