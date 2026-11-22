import api from './api.js';
import { SYLLABUS_URLS } from '../constants/urls.js';

const base = SYLLABUS_URLS.BASE;
const byClass = SYLLABUS_URLS.BY_CLASS;
const roomPath = (id) => base + '/classrooms/' + encodeURIComponent(id);
const read = (url, config) => api.get(url, config).then(({ data }) => data.data);
const send = (method, url, payload) => api[method](url, payload).then(({ data }) => data.data);

export async function getSyllabusByClass(classId, signal) {
  if (!classId) return null;
  const { syllabus } = await read(byClass(classId), { signal });
  return syllabus;
}

export const getAcademicWorkspace = (signal) => read(base + '/workspace', { signal });
export const getPublishedSyllabuses = (signal) => read(base, { signal });
export const getMyAcademics = (studentId, signal) => read(base + '/mine', { params: { studentId: studentId || undefined }, signal });
export const getClassroomAcademics = (roomId, signal) => read(roomPath(roomId), { signal });
export const getSyllabusDraft = (classId, signal) => read(byClass(classId) + '/draft', { signal });
export const copySyllabus = (classId, sourceSessionId) => read(byClass(classId) + '/copy', { params: { sourceSessionId } });
export const saveSyllabusDraft = (classId, payload) => send('put', byClass(classId), payload);
export const changeSyllabusStatus = (classId, payload) => send('post', byClass(classId) + '/status', payload);

export const changeClassroomSubject = (roomId, subjectId, action, payload) => send(
  ['request', 'resolve'].includes(action) ? 'post' : 'put',
  roomPath(roomId) + '/subjects/' + encodeURIComponent(subjectId) + '/' + action,
  payload,
);

export default { getSyllabusByClass };
