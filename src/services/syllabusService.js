/**
 * @file syllabusService.js
 * @description API service for Class Syllabus, Subjects, Prescribed Books, and Passing Marks.
 */

import { toast } from "react-toastify";
import api from "./api.js";
import { SYLLABUS_URLS } from "../constants/urls.js";

// Fetch all configured syllabuses
export async function getAllSyllabus() {
  try {
    const { data } = await api.get(SYLLABUS_URLS.BASE);
    return data;
  } catch (err) {
    console.error("Failed to load syllabuses:", err);
    throw err;
  }
}

// Fetch syllabus for a specific class (auto-returns default template if not yet configured)
export async function getSyllabusByClass(classId, signal) {
  if (!classId) return null;
  const { data } = await api.get(SYLLABUS_URLS.BY_CLASS(classId), { signal });
  return data.data?.syllabus ?? data.syllabus ?? null;
}

// Save or update class syllabus
export async function saveClassSyllabus(classId, payload) {
  const { data } = await api.put(SYLLABUS_URLS.BY_CLASS(classId), payload);
  toast.success(data?.message || "Class syllabus updated successfully");
  return data;
}

// Reset class syllabus to recommended national standard
export async function resetClassSyllabus(classId) {
  const { data } = await api.post(SYLLABUS_URLS.RESET(classId));
  toast.success(data?.message || "Curriculum reset to standard defaults");
  return data?.syllabus;
}

export default {
  getAllSyllabus,
  getSyllabusByClass,
  saveClassSyllabus,
  resetClassSyllabus,
};
