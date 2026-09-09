/**
 * @file teacherOptions.js
 * @description Centralized constant dropdown options for Teacher Creation & Profile Editing.
 */

export const DESIGNATION_OPTIONS = [
  { value: "Senior Faculty", label: "Senior Faculty" },
  { value: "Head of Department (HOD)", label: "Head of Department (HOD)" },
  { value: "Academic Coordinator", label: "Academic Coordinator" },
  { value: "Assistant Teacher", label: "Assistant Teacher" },
  { value: "Head Teacher", label: "Head Teacher" },
  { value: "Guest Lecturer", label: "Guest Lecturer" },
  { value: "Vice Principal", label: "Vice Principal" },
  { value: "Lab Instructor", label: "Lab Instructor" },
  { value: "Physical Education Teacher", label: "Physical Education Teacher" },
];

export const DEPARTMENT_OPTIONS = [
  { value: "Islamic Theology & Quranic Studies", label: "Islamic Theology & Quranic Studies" },
  { value: "Arabic Language & Grammar", label: "Arabic Language & Grammar" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Science & Physics", label: "Science & Physics" },
  { value: "Computer Science & IT", label: "Computer Science & IT" },
  { value: "English Literature", label: "English Literature" },
  { value: "Social Studies & History", label: "Social Studies & History" },
  { value: "Primary & Foundation Academics", label: "Primary & Foundation Academics" },
  { value: "Physical Education & Athletics", label: "Physical Education & Athletics" },
];

export const QUALIFICATION_OPTIONS = [
  { value: "Ph.D. in Islamic Studies", label: "Ph.D. in Islamic Studies" },
  { value: "M.A. Islamic Theology", label: "M.A. Islamic Theology" },
  { value: "M.Sc. Mathematics", label: "M.Sc. Mathematics" },
  { value: "M.A. English Literature", label: "M.A. English Literature" },
  { value: "B.Ed. Education", label: "B.Ed. Education" },
  { value: "B.Sc. Pure Sciences", label: "B.Sc. Pure Sciences" },
  { value: "B.A. Arts & Humanities", label: "B.A. Arts & Humanities" },
  { value: "Fazil / Alim Degree", label: "Fazil / Alim Degree" },
  { value: "Diploma in Primary Education", label: "Diploma in Primary Education" },
];

export const EXPERIENCE_OPTIONS = [
  { value: "Fresher (< 1 Year)", label: "Fresher (< 1 Year)" },
  { value: "1 - 3 Years", label: "1 - 3 Years" },
  { value: "3 - 5 Years", label: "3 - 5 Years" },
  { value: "5 - 10 Years", label: "5 - 10 Years" },
  { value: "10 - 15 Years", label: "10 - 15 Years" },
  { value: "15+ Years (Veteran Faculty)", label: "15+ Years (Veteran Faculty)" },
];

export const SUBJECT_OPTIONS = [
  { value: "ISL-101 Quranic Studies & Tajweed", label: "ISL-101 Quranic Studies & Tajweed" },
  { value: "ARB-102 Arabic Grammar & Literature", label: "ARB-102 Arabic Grammar & Literature" },
  { value: "MTH-103 Mathematics", label: "MTH-103 Mathematics" },
  { value: "PHY-104 Physics & Chemistry Lab", label: "PHY-104 Physics & Chemistry Lab" },
  { value: "ENG-105 English Language & Literature", label: "ENG-105 English Language & Literature" },
  { value: "CS-106 Computer Science & Coding", label: "CS-106 Computer Science & Coding" },
  { value: "HIS-107 History & Social Sciences", label: "HIS-107 History & Social Sciences" },
  { value: "URD-108 Urdu Language & Grammar", label: "URD-108 Urdu Language & Grammar" },
];

export const TEACHER_ROLE_OPTIONS = [
  { value: "teacher", label: "Teacher" },
  { value: "head-teacher", label: "Head Teacher" },
  { value: "hod", label: "Head of Department (HOD)" },
  { value: "coordinator", label: "Academic Coordinator" },
];

export default {
  DESIGNATION_OPTIONS,
  DEPARTMENT_OPTIONS,
  QUALIFICATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHER_ROLE_OPTIONS,
};
