/**
 * @file teacherOptions.js
 * @description Centralized constant dropdown options for Teacher Creation & Profile Editing.
 */

import { optionsFromValues } from '../utils/formOptions.js';

export const DESIGNATION_OPTIONS = optionsFromValues([
  'Teacher',
  'Pre-Primary Teacher',
  'Primary School Teacher',
  'Assistant Teacher',
  'Middle School Teacher',
  'Secondary School Teacher',
  'Senior Secondary Teacher',
  'Language Teacher',
  'Computer Science Teacher',
  'Lab Instructor',
  'Special Education Teacher',
  'Art Teacher',
  'Music Teacher',
  'Physical Education Teacher',
  'Guest Lecturer',
  'Senior Faculty',
  'Academic Coordinator',
  'Head Teacher',
  'Head of Department (HOD)',
  'Vice Principal',
]);

export const DEPARTMENT_OPTIONS = optionsFromValues([
  'English Literature',
  'Early Childhood Education',
  'Primary & Foundation Academics',
  'Urdu',
  'Social Studies & History',
  'Science & Physics',
  'Chemistry',
  'Hindi',
  'Computer Science & IT',
  'Biology',
  'Special Education',
  'Visual Arts',
  'Music',
  'Physical Education & Athletics',
  'Arabic Language & Grammar',
  'Islamic Theology & Quranic Studies',
  'Economics',
  'Geography',
  'Mathematics',
  'Commerce & Accountancy',
]);

export const QUALIFICATION_OPTIONS = optionsFromValues([
  'M.A. English Literature',
  'Diploma in Primary Education',
  'D.El.Ed.',
  'Fazil / Alim Degree',
  'B.El.Ed.',
  'M.Sc. Physics',
  'M.Sc. Chemistry',
  'B.Ed. Education',
  'M.Sc. Computer Science',
  'B.Sc. Pure Sciences',
  'Diploma in Special Education',
  'B.A. Arts & Humanities',
  'Bachelor of Music (B.Mus.)',
  'B.P.Ed.',
  'M.A. Islamic Theology',
  'Ph.D. in Islamic Studies',
  'M.A. Economics',
  'M.Ed.',
  'M.Sc. Mathematics',
  'M.Com.',
]);

export const SPECIALIZATION_OPTIONS = optionsFromValues([
  'English Language & Literature',
  'Early Childhood Education',
  'Primary Education',
  'Urdu Language',
  'History & Civics',
  'Physics',
  'Chemistry',
  'Hindi Language',
  'Computer Science',
  'Biology',
  'Special Education',
  'Visual Arts',
  'Music',
  'Physical Education',
  'Arabic Language',
  'Quranic Studies & Tajweed',
  'Economics',
  'Geography',
  'Mathematics',
  'Commerce & Accountancy',
]);

export const EXPERIENCE_OPTIONS = optionsFromValues([
  'Fresher (< 1 Year)',
  '1 Year',
  ...Array.from({ length: 17 }, (_, index) => (index + 2) + ' Years'),
  '19+ Years',
]);

export const TEACHER_EMPLOYMENT_FIELDS = [
  { name: 'designation', label: 'Designation', options: DESIGNATION_OPTIONS, required: true },
  { name: 'department', label: 'Department', options: DEPARTMENT_OPTIONS },
  { name: 'qualification', label: 'Qualification', options: QUALIFICATION_OPTIONS },
  { name: 'specialization', label: 'Specialization', options: SPECIALIZATION_OPTIONS },
  { name: 'experience', label: 'Experience', options: EXPERIENCE_OPTIONS },
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
  SPECIALIZATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHER_ROLE_OPTIONS,
};
