import { getDefaultRolePermissions } from '../config/access.jsx';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';
import { DEPARTMENT_OPTIONS, DESIGNATION_OPTIONS, EXPERIENCE_OPTIONS, QUALIFICATION_OPTIONS, SUBJECT_OPTIONS } from '../constants/teacherOptions.js';
import { getOptionValue, splitSelections } from './formOptions.js';
import { dateOnly } from './formatters.js';

export const permissionOptions = [
  ['dashboard', 'Dashboard Access'],
  ['student-management', 'Student Management'],
  ['attendance', 'Attendance Management'],
  ['exam', 'Exam Management'],
  ['marks', 'Marks Entry'],
  ['homework', 'Homework Management'],
  ['timetable', 'Timetable Access'],
  ['leave', 'Leave Management'],
  ['fee', 'Fee Management'],
  ['library', 'Library Access'],
  ['inventory', 'Inventory Access'],
  ['reports', 'Reports Access'],
  ['communication', 'Communication Access'],
];

export const blankTeacherForm = {
  firstName: '', lastName: '', gender: 'Male', dob: '', phone: '', alternatePhone: '', email: '', address: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  designation: DESIGNATION_OPTIONS[0].value,
  department: DEPARTMENT_OPTIONS[0].value,
  qualification: QUALIFICATION_OPTIONS[0].value,
  experience: EXPERIENCE_OPTIONS[2].value,
  salary: '',
  classesAssignedText: CLASS_OPTIONS[12].name,
  sectionsAssignedText: SECTION_OPTIONS[0].name,
  subjectsAssignedText: SUBJECT_OPTIONS[0].value,
  isClassTeacher: false,
  role: 'teacher',
  permissions: getDefaultRolePermissions('teacher'),
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
};

export const randomPassword = () => 'Tch@' + Math.random().toString(36).slice(2, 8) + Math.floor(100 + Math.random() * 900);

function assignmentValues(value) {
  return splitSelections(value).map((entry) => entry?.name ?? getOptionValue(entry)).filter((entry) => entry != null && entry !== '');
}

export function teacherDraftFromRecord(teacher, defaults = blankTeacherForm) {
  return {
    ...defaults,
    ...teacher,
    dob: dateOnly(teacher.dob),
    joiningDate: dateOnly(teacher.joiningDate),
    accountExpiryDate: dateOnly(teacher.accountExpiryDate),
    classesAssignedText: assignmentValues(teacher.classesAssigned ?? teacher.assignedClasses).join(', '),
    sectionsAssignedText: assignmentValues(teacher.sectionsAssigned ?? teacher.assignedSections).join(', '),
    subjectsAssignedText: assignmentValues(teacher.subjectsAssigned ?? teacher.assignedSubjects).join(', '),
    permissions: Array.isArray(teacher.permissions) ? teacher.permissions : defaults.permissions,
    password: '',
    confirmPassword: '',
  };
}

const trim = (value) => String(value ?? '').trim();

export const payloadFromForm = (form) => ({
  firstName: trim(form.firstName),
  lastName: trim(form.lastName),
  gender: form.gender,
  dob: form.dob || undefined,
  phone: trim(form.phone),
  alternatePhone: trim(form.alternatePhone),
  email: trim(form.email),
  address: trim(form.address),
  joiningDate: form.joiningDate || undefined,
  designation: trim(form.designation),
  department: trim(form.department),
  qualification: trim(form.qualification),
  experience: trim(form.experience),
  salary: Number(form.salary) || 0,
  classesAssigned: splitSelections(form.classesAssignedText),
  sectionsAssigned: splitSelections(form.sectionsAssignedText),
  subjectsAssigned: splitSelections(form.subjectsAssignedText),
  isClassTeacher: form.isClassTeacher,
  role: form.role,
  permissions: form.permissions,
  status: form.status,
  accountExpiryDate: form.accountExpiryDate || undefined,
  loginRestriction: form.loginRestriction,
  twoFactorEnabled: form.twoFactorEnabled,
  forcePasswordChange: form.forcePasswordChange,
  password: form.password,
  confirmPassword: form.confirmPassword || form.password,
});
