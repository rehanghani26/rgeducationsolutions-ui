/**
 * @file documentConstants.js
 * @description Constants for the ID Cards & Certificates module.
 * Certificate types, statuses, recipient types, and display mappings.
 */

// ─── Certificate Types ────────────────────────────────────────────────────────

export const CERTIFICATE_TYPES = {
  BONAFIDE:      'BONAFIDE',
  CHARACTER:     'CHARACTER',
  ACHIEVEMENT:   'ACHIEVEMENT',
  PARTICIPATION: 'PARTICIPATION',
  TC:            'TC',
  CUSTOM:        'CUSTOM',
};

export const CERTIFICATE_TYPE_LABELS = {
  BONAFIDE:      'Bonafide Certificate',
  CHARACTER:     'Character Certificate',
  ACHIEVEMENT:   'Achievement Certificate',
  PARTICIPATION: 'Participation Certificate',
  TC:            'Transfer Certificate',
  CUSTOM:        'Custom Certificate',
};

export const CERTIFICATE_TYPE_OPTIONS = Object.entries(CERTIFICATE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ─── Certificate Statuses ─────────────────────────────────────────────────────

export const CERTIFICATE_STATUSES = {
  VALID:   'VALID',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
};

export const CERTIFICATE_STATUS_COLORS = {
  VALID:   'emerald',
  REVOKED: 'rose',
  EXPIRED: 'amber',
};

// ─── Recipient Types ──────────────────────────────────────────────────────────

export const RECIPIENT_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  STAFF:   'staff',
};

export const RECIPIENT_TYPE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  staff:   'Staff',
};

// ─── Template Categories ──────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = {
  STUDENT_ID_CARD: 'student-id-card',
  TEACHER_ID_CARD: 'teacher-id-card',
  STAFF_ID_CARD:   'staff-id-card',
  CERTIFICATE:     'certificate',
};

export const TEMPLATE_CATEGORY_LABELS = {
  'student-id-card': 'Student ID Card',
  'teacher-id-card': 'Teacher ID Card',
  'staff-id-card':   'Staff ID Card',
  'certificate':     'Certificate',
};

// ─── Module Tabs ──────────────────────────────────────────────────────────────

export const DOCUMENT_TABS = [
  { id: 'id-cards',    label: 'ID Cards',      icon: 'CreditCard' },
  { id: 'certificates', label: 'Certificates', icon: 'Award' },
  { id: 'templates',   label: 'Templates',     icon: 'Layout' },
  { id: 'verify',      label: 'Verify',        icon: 'ShieldCheck' },
];

// ─── Placeholder Data ─────────────────────────────────────────────────────────

/** Used for template previews when real student data is not available */
export const STUDENT_PLACEHOLDER = {
  name: 'N/A',
  admissionNumber: 'N/A',
  rollNumber: 'N/A',
  class: 'N/A',
  section: 'N/A',
  dob: 'N/A',
  bloodGroup: 'N/A',
  gender: 'N/A',
  parentName: 'N/A',
  academicYear: 'N/A',
  photo: null,
};

/** Used for template previews when real teacher data is not available */
export const TEACHER_PLACEHOLDER = {
  name: 'N/A',
  employeeId: 'N/A',
  designation: 'N/A',
  department: 'N/A',
  subjectsAssigned: [],
  joiningDate: 'N/A',
  photo: null,
};

/** Used for template previews when real staff data is not available */
export const STAFF_PLACEHOLDER = {
  name: 'N/A',
  employeeId: 'N/A',
  designation: 'N/A',
  department: 'N/A',
  photo: null,
};

/** Used for certificate template previews */
export const CERTIFICATE_PLACEHOLDER = {
  certificateNumber: 'N/A',
  certificateType: 'BONAFIDE',
  recipientName: 'N/A',
  admissionNumber: 'N/A',
  class: 'N/A',
  section: 'N/A',
  academicSession: 'N/A',
  issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  purposeNote: 'N/A',
};

/** School placeholder used when settings are not yet loaded */
export const SCHOOL_PLACEHOLDER = {
  schoolName: 'N/A',
  schoolLogo: '',
  schoolAddress: 'N/A',
  schoolPhone: 'N/A',
  schoolEmail: 'N/A',
  schoolWebsite: 'N/A',
  schoolMotto: 'N/A',
  principalName: 'N/A',
};

// Aliases
export const MOCK_STUDENT_DATA = STUDENT_PLACEHOLDER;
export const MOCK_TEACHER_DATA = TEACHER_PLACEHOLDER;
export const MOCK_STAFF_DATA = STAFF_PLACEHOLDER;
export const MOCK_CERTIFICATE_DATA = CERTIFICATE_PLACEHOLDER;
export const MOCK_SCHOOL_DATA = SCHOOL_PLACEHOLDER;
