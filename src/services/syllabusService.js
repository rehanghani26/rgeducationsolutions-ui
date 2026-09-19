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
export async function getSyllabusByClass(classId) {
  if (!classId) return null;
  try {
    const { data } = await api.get(SYLLABUS_URLS.BY_CLASS(classId));
    return data?.syllabus || null;
  } catch (err) {
    console.error(`Failed to load syllabus for class ${classId}:`, err);
    throw err;
  }
}

// Save or update class syllabus
export async function saveClassSyllabus(classId, payload) {
  try {
    const { data } = await api.put(SYLLABUS_URLS.BY_CLASS(classId), payload);
    toast.success(data?.message || "Class syllabus updated successfully");
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || "Failed to update class syllabus";
    toast.error(msg);
    throw err;
  }
}

// Reset class syllabus to recommended national standard
export async function resetClassSyllabus(classId) {
  try {
    const { data } = await api.post(SYLLABUS_URLS.RESET(classId));
    toast.success(data?.message || "Curriculum reset to standard defaults");
    return data?.syllabus;
  } catch (err) {
    const msg = err.response?.data?.message || "Failed to reset class syllabus";
    toast.error(msg);
    throw err;
  }
}

export default {
  getAllSyllabus,
  getSyllabusByClass,
  saveClassSyllabus,
  resetClassSyllabus,
};
