/**
 * @file studentOptions.js
 * @description Standardized option sets for Student module fields:
 * - Admission & Lifecycle: Admission Type, Enrollment Status, Previous Education Boards
 * - Demographics & Academics: House, Social Category, Student Type, Medium, Special Needs
 * - Family & Guardian: Guardian Relationship
 */

export const ADMISSION_TYPE_OPTIONS = [
  { value: "New Admission", label: "New Admission" },
  { value: "Transfer", label: "Transfer Admission" },
  { value: "Re-admission", label: "Re-admission" },
  { value: "Provisional", label: "Provisional Admission" },
  { value: "Lateral Entry", label: "Lateral Entry" },
];

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: "Enrolled", label: "Enrolled (Active)" },
  { value: "Provisional", label: "Provisional" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Transferred", label: "Transferred" },
  { value: "Suspended", label: "Suspended" },
  { value: "Withdrawn", label: "Withdrawn" },
];

export const HOUSE_OPTIONS = [
  { value: "", label: "No House Assigned" },
  { value: "Blue House", label: "Blue House" },
  { value: "Red House", label: "Red House" },
  { value: "Green House", label: "Green House" },
  { value: "Yellow House", label: "Yellow House" },
];

export const STUDENT_CATEGORY_OPTIONS = [
  { value: "General", label: "General" },
  { value: "OBC", label: "OBC (Other Backward Class)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
  { value: "Minority", label: "Minority" },
  { value: "Other", label: "Other" },
];

export const STUDENT_TYPE_OPTIONS = [
  { value: "Day Scholar", label: "Day Scholar" },
  { value: "Boarding", label: "Boarding / Hosteller" },
  { value: "Semi-Boarding", label: "Semi-Boarding" },
];

export const MEDIUM_OF_INSTRUCTION_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Bilingual", label: "Bilingual (English + Hindi)" },
  { value: "Regional", label: "Regional Language" },
];

export const SPECIAL_EDUCATION_NEEDS_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Learning Support", label: "Learning Support / Remedial" },
  { value: "Visual Support", label: "Visual Support" },
  { value: "Hearing Support", label: "Hearing Support" },
  { value: "Physical / Mobility", label: "Physical / Mobility Support" },
  { value: "Other", label: "Other Special Support" },
];

export const PREVIOUS_BOARD_OPTIONS = [
  { value: "", label: "Select Board" },
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE / CISCE" },
  { value: "State Board", label: "State Education Board" },
  { value: "IB", label: "International Baccalaureate (IB)" },
  { value: "Cambridge", label: "Cambridge / IGCSE" },
  { value: "Other", label: "Other Board" },
];

export const GUARDIAN_RELATION_OPTIONS = [
  { value: "", label: "Select Relation" },
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Uncle", label: "Uncle" },
  { value: "Aunt", label: "Aunt" },
  { value: "Grandparent", label: "Grandparent" },
  { value: "Brother", label: "Elder Brother" },
  { value: "Sister", label: "Elder Sister" },
  { value: "Local Guardian", label: "Local Guardian" },
  { value: "Other", label: "Other" },
];

export default {
  ADMISSION_TYPE_OPTIONS,
  ENROLLMENT_STATUS_OPTIONS,
  HOUSE_OPTIONS,
  STUDENT_CATEGORY_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  MEDIUM_OF_INSTRUCTION_OPTIONS,
  SPECIAL_EDUCATION_NEEDS_OPTIONS,
  PREVIOUS_BOARD_OPTIONS,
  GUARDIAN_RELATION_OPTIONS,
};
