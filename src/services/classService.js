/**
 * @file classService.js
 * @description Frontend API service for session-scoped ClassRooms, Class Teacher assignment,
 * Timetable assignment, and Student Session History.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { CLASSROOM_URLS } from '../constants/urls.js';

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return q.toString();
};

/**
 * Fetch all classrooms with optional query filter (e.g. sessionId, classId, sectionId, isActive)
 */
export async function getClassRooms(params = {}) {
  try {
    const qs = buildQuery(params);
    const url = `${CLASSROOM_URLS.BASE}${qs ? `?${qs}` : ''}`;
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch classrooms');
    throw error;
  }
}

/**
 * Fetch classrooms for a specific academic session
 */
export async function getClassRoomsBySession(sessionId) {
  try {
    const res = await api.get(CLASSROOM_URLS.BY_SESSION(sessionId));
    return res.data;
  } catch (error) {
    console.error('Error fetching classrooms by session:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch classrooms for session');
    throw error;
  }
}

/**
 * Fetch single classroom by ID
 */
export async function getClassRoomById(id) {
  try {
    const res = await api.get(CLASSROOM_URLS.BY_ID(id));
    return res.data;
  } catch (error) {
    console.error('Error fetching classroom detail:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch classroom');
    throw error;
  }
}

/**
 * Create a new classroom
 */
export async function createClassRoom(payload) {
  try {
    const res = await api.post(CLASSROOM_URLS.BASE, payload);
    toast.success(res.data?.message || 'Classroom created successfully');
    return res.data;
  } catch (error) {
    console.error('Error creating classroom:', error);
    toast.error(error.response?.data?.message || 'Failed to create classroom');
    throw error;
  }
}

/**
 * Update classroom details (room, capacity, notes, isActive)
 */
export async function updateClassRoom(id, payload) {
  try {
    const res = await api.put(CLASSROOM_URLS.BY_ID(id), payload);
    toast.success(res.data?.message || 'Classroom updated successfully');
    return res.data;
  } catch (error) {
    console.error('Error updating classroom:', error);
    toast.error(error.response?.data?.message || 'Failed to update classroom');
    throw error;
  }
}

/**
 * Delete classroom
 */
export async function deleteClassRoom(id) {
  try {
    const res = await api.delete(CLASSROOM_URLS.BY_ID(id));
    toast.success(res.data?.message || 'Classroom deleted successfully');
    return res.data;
  } catch (error) {
    console.error('Error deleting classroom:', error);
    toast.error(error.response?.data?.message || 'Failed to delete classroom');
    throw error;
  }
}

/**
 * Assign class teacher to classroom (from Teacher module)
 */
export async function assignClassTeacher(classRoomId, { teacherId, notes = '' }) {
  try {
    const res = await api.patch(CLASSROOM_URLS.ASSIGN_TEACHER(classRoomId), {
      teacherId,
      notes,
    });
    toast.success(res.data?.message || 'Class teacher assigned successfully');
    return res.data;
  } catch (error) {
    console.error('Error assigning class teacher:', error);
    toast.error(error.response?.data?.message || 'Failed to assign class teacher');
    throw error;
  }
}

/**
 * Remove/unassign class teacher from classroom
 */
export async function removeClassTeacher(classRoomId, { reason = '' } = {}) {
  try {
    const res = await api.patch(CLASSROOM_URLS.REMOVE_TEACHER(classRoomId), { reason });
    toast.success(res.data?.message || 'Class teacher removed');
    return res.data;
  } catch (error) {
    console.error('Error removing class teacher:', error);
    toast.error(error.response?.data?.message || 'Failed to remove class teacher');
    throw error;
  }
}

/**
 * Get classroom's teacher assignment history
 */
export async function getClassTeacherHistory(classRoomId) {
  try {
    const res = await api.get(CLASSROOM_URLS.TEACHER_LOGS(classRoomId));
    return res.data;
  } catch (error) {
    console.error('Error fetching class teacher history:', error);
    throw error;
  }
}

/**
 * Get teacher's all current & past classroom assignments
 */
export async function getTeacherClassHistory(teacherId) {
  try {
    const res = await api.get(CLASSROOM_URLS.TEACHER_HISTORY(teacherId));
    return res.data;
  } catch (error) {
    console.error('Error fetching teacher class history:', error);
    throw error;
  }
}

/**
 * Enroll students into classroom
 */
export async function enrollStudents(classRoomId, { studentIds, rollNumberMap = {} }) {
  try {
    const res = await api.post(CLASSROOM_URLS.ENROLL(classRoomId), {
      studentIds,
      rollNumberMap,
    });
    toast.success(res.data?.message || 'Students enrolled successfully');
    return res.data;
  } catch (error) {
    console.error('Error enrolling students:', error);
    toast.error(error.response?.data?.message || 'Failed to enroll students');
    throw error;
  }
}

/**
 * Remove student from classroom
 */
export async function removeStudentFromClass(classRoomId, studentId) {
  try {
    const res = await api.delete(CLASSROOM_URLS.REMOVE_STUDENT(classRoomId, studentId));
    toast.success(res.data?.message || 'Student removed from classroom');
    return res.data;
  } catch (error) {
    console.error('Error removing student:', error);
    toast.error(error.response?.data?.message || 'Failed to remove student');
    throw error;
  }
}

/**
 * Get students currently enrolled in this classroom
 */
export async function getClassStudents(classRoomId) {
  try {
    const res = await api.get(CLASSROOM_URLS.STUDENTS(classRoomId));
    return res.data;
  } catch (error) {
    console.error('Error fetching classroom students:', error);
    throw error;
  }
}

/**
 * Assign timetable to classroom (supports 3 modes: link_existing, clone, from_master_periods)
 */
export async function assignTimetableToClass(classRoomId, payload) {
  try {
    const res = await api.patch(CLASSROOM_URLS.ASSIGN_TIMETABLE(classRoomId), payload);
    toast.success(res.data?.message || 'Timetable assigned successfully');
    return res.data;
  } catch (error) {
    console.error('Error assigning timetable:', error);
    toast.error(error.response?.data?.message || 'Failed to assign timetable');
    throw error;
  }
}

/**
 * Get classroom's assigned timetable
 */
export async function getClassTimetable(classRoomId) {
  try {
    const res = await api.get(CLASSROOM_URLS.TIMETABLE(classRoomId));
    return res.data;
  } catch (error) {
    console.error('Error fetching classroom timetable:', error);
    throw error;
  }
}

/**
 * Get student's current enrollment + full session history
 * Accepts student ID or admissionNumber!
 */
export async function getStudentSessionHistory(studentIdOrAdmissionNo) {
  try {
    const res = await api.get(CLASSROOM_URLS.STUDENT_HISTORY(studentIdOrAdmissionNo));
    return res.data;
  } catch (error) {
    console.error('Error fetching student session history:', error);
    throw error;
  }
}

/**
 * Bulk promote students from this classroom to a target classroom
 */
export async function promoteClassStudents(classRoomId, payload) {
  try {
    const res = await api.post(CLASSROOM_URLS.PROMOTE(classRoomId), payload);
    toast.success(res.data?.message || 'Students promoted successfully');
    return res.data;
  } catch (error) {
    console.error('Error promoting students:', error);
    toast.error(error.response?.data?.message || 'Failed to promote students');
    throw error;
  }
}

export default {
  getClassRooms,
  getClassRoomsBySession,
  getClassRoomById,
  createClassRoom,
  updateClassRoom,
  deleteClassRoom,
  assignClassTeacher,
  removeClassTeacher,
  getClassTeacherHistory,
  getTeacherClassHistory,
  enrollStudents,
  removeStudentFromClass,
  getClassStudents,
  assignTimetableToClass,
  getClassTimetable,
  getStudentSessionHistory,
  promoteClassStudents,
};
