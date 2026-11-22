import { dateOnly } from './formatters.js';

export const teacherManagerRoles = ['super-admin', 'school-admin', 'admin', 'principal'];
export const teacherFileLimit = 1024 * 1024;

export const blankTeacherForm = {
  firstName: '', lastName: '', gender: '', dob: '', phone: '', alternatePhone: '', email: '', address: '', bloodGroup: '',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '', aadhaarNumber: '',
  employeeId: '', joiningDate: '', designation: '', department: '', qualification: '', specialization: '',
  experience: '', employmentType: '', salary: '',
  role: 'teacher',
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
};

export const randomPassword = () => 'Tch@' + Array.from(crypto.getRandomValues(new Uint8Array(8)),
  (byte) => byte.toString(16).padStart(2, '0')).join('');

export function teacherDraftFromRecord(teacher, defaults = blankTeacherForm) {
  const [givenName, ...surname] = String(teacher.name || '').trim().split(/\s+/);
  return {
    ...defaults,
    ...Object.fromEntries(Object.keys(blankTeacherForm).filter((key) => teacher[key] != null).map((key) => [key, teacher[key]])),
    firstName: teacher.firstName || givenName,
    lastName: teacher.lastName || surname.join(' '),
    phone: teacher.phone || teacher.contactNumber || '',
    dob: teacher.dob ? dateOnly(teacher.dob) : '',
    joiningDate: teacher.joiningDate ? dateOnly(teacher.joiningDate) : '',
    accountExpiryDate: teacher.accountExpiryDate ? dateOnly(teacher.accountExpiryDate) : '',
    password: '',
    confirmPassword: '',
  };
}

const trim = (value) => String(value ?? '').trim();

export function payloadFromForm(form, editing = false) {
  const profile = Object.fromEntries(Object.keys(blankTeacherForm)
    .filter((field) => !['password', 'confirmPassword'].includes(field))
    .map((field) => [field, typeof form[field] === 'string' ? trim(form[field]) : form[field]]));
  profile.salary = Number(form.salary || 0);
  if (!editing) {
    if (trim(form.password)) {
      profile.password = form.password;
      profile.confirmPassword = form.confirmPassword || form.password;
    } else profile.generateRandomPassword = true;
  }
  return profile;
}

export function validateTeacherStep(step, form, editing) {
  const errors = {};
  const require = (key, label) => { if (!trim(form[key])) errors[key] = 'Enter ' + label + '.'; };
  if (step === 'personal') {
    require('firstName', 'a first name');
    require('lastName', 'a last name');
    require('phone', 'a phone number');
    require('email', 'a login email');
    if (trim(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(form.email))) errors.email = 'Enter a valid email address.';
  }
  if (step === 'employment') {
    require('designation', 'a designation');
    if (form.salary && (!Number.isFinite(Number(form.salary)) || Number(form.salary) < 0)) errors.salary = 'Enter a valid salary.';
  }
  if (step === 'documents' && trim(form.aadhaarNumber) && !/^\d{12}$/.test(form.aadhaarNumber.replace(/[\s-]/g, ''))) {
    errors.aadhaarNumber = 'Enter a 12-digit Aadhaar number.';
  }
  if (step === 'portal' && !editing && (form.password || form.confirmPassword)) {
    if (trim(form.password).length < 6) errors.password = 'Use at least 6 characters, or leave both fields blank.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match.';
  }
  return errors;
}

export function teacherUploadError(kind, file) {
  if (file.size > teacherFileLimit || file.size === 0) return 'Choose a file up to 1 MB.';
  if (kind === 'aadhaar') {
    return file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name)) ? '' : 'Choose a PDF file.';
  }
  return /^image\/(jpeg|png|webp)$/.test(file.type) || (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name)) ? '' : 'Choose a JPG, PNG, or WebP photo.';
}
