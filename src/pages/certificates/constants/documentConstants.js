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
  name: 'Rahul Kumar',
  admissionNumber: 'STU-2026-0001',
  rollNumber: '12',
  class: 'Class 10',
  section: 'Section A',
  dob: '2010-05-15',
  bloodGroup: 'B+',
  gender: 'Male',
  parentName: 'Suresh Kumar',
  academicYear: '2026-27',
  photo: null,
};

/** Used for template previews when real teacher data is not available */
export const TEACHER_PLACEHOLDER = {
  name: 'Dr. Priya Sharma',
  employeeId: 'TCH-2026-0001',
  designation: 'Senior Teacher',
  department: 'Mathematics',
  subjectsAssigned: ['Mathematics', 'Physics'],
  joiningDate: '2020-06-01',
  photo: null,
};

/** Used for template previews when real staff data is not available */
export const STAFF_PLACEHOLDER = {
  name: 'Rajesh Verma',
  employeeId: 'STF-2026-0001',
  designation: 'Accountant',
  department: 'Administration',
  photo: null,
};

/** Used for certificate template previews */
export const CERTIFICATE_PLACEHOLDER = {
  certificateNumber: 'CERT-2026-000001',
  certificateType: 'BONAFIDE',
  recipientName: 'Rahul Kumar',
  admissionNumber: 'STU-2026-0001',
  class: 'Class 10',
  section: 'Section A',
  academicSession: '2026-27',
  issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  purposeNote: 'This certificate is issued for the purpose of bank account opening.',
};

/** School placeholder used when settings are not yet loaded */
export const SCHOOL_PLACEHOLDER = {
  schoolName: 'ABC Public School',
  schoolLogo: '',
  schoolAddress: '123 Education Street, Knowledge City - 400001',
  schoolPhone: '+91 98765 43210',
  schoolEmail: 'admin@abcschool.edu',
  schoolWebsite: 'www.abcschool.edu',
  schoolMotto: 'Excellence in Education',
  principalName: 'Dr. Anita Gupta',
};

// Aliases
export const MOCK_STUDENT_DATA = STUDENT_PLACEHOLDER;
export const MOCK_TEACHER_DATA = TEACHER_PLACEHOLDER;
export const MOCK_STAFF_DATA = STAFF_PLACEHOLDER;
export const MOCK_CERTIFICATE_DATA = CERTIFICATE_PLACEHOLDER;
export const MOCK_SCHOOL_DATA = SCHOOL_PLACEHOLDER;
