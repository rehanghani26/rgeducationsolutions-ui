import { dateOnly } from './formatters.js';

export const currentAcademicYear = (now = new Date()) => {
  const start = now.getFullYear() - Number(now.getMonth() < 3);
  return `${start}-${String(start + 1).slice(-2)}`;
};

const today = () => {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, '0')).join('-');
};

export function generateStudentPassword() {
  const random = crypto.getRandomValues(new Uint8Array(8));
  return `Std@${Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function emptyStudentForm() {
  return {
    firstName: '', lastName: '', gender: 'Male', dob: '', bloodGroup: '',
    nationality: 'Indian', motherTongue: 'Hindi', studentCategory: 'General',
    contactNumber: '', alternatePhone: '', address: '',
    classId: '', class: '', className: '', sectionId: '', section: '', sectionName: '',
    academicYear: currentAcademicYear(), sessionId: null, isLegacyStudent: false,
    admissionDate: today(), joiningDate: today(), admissionType: 'New Admission',
    enrollmentStatus: 'Enrolled', houseName: '', studentType: 'Day Scholar',
    mediumOfInstruction: 'English', specialEducationNeeds: 'None', careerInterest: '',
    previousSchoolName: '', previousClass: '', previousBoard: '',
    transferCertificateNumber: '', transferCertificateDate: '', academicHistory: [],
    parentName: '', parentContact: '', parentEmail: '', fatherName: '',
    fatherOccupation: '', fatherOrganization: '', motherName: '', motherContact: '',
    motherOccupation: '', guardianRelation: '', guardianAddress: '',
    aadhaarNumber: '', photo: '', imagesRef: { id: '', img: '' },
    aadhaarDocument: '', AdharRef: { id: '', pdf: '' }, documents: [],
    email: '', isEmailVerified: false, password: '', confirmPassword: '',
    status: 'active', accountExpiryDate: '', loginRestriction: 'none',
    forcePasswordChange: true, twoFactorEnabled: false,
  };
}

export const normalizeEmail = (value) => (value || '').trim().toLowerCase();
export const isLegacyStudent = (value) => value === true || value === 'true';

const recordId = (value) => value?._id || value?.id || (typeof value === 'object' ? '' : value) || '';
const pickFields = (fields, source) => Object.fromEntries(
  Object.keys(fields).filter((key) => source[key] != null).map((key) => [key, source[key]])
);

export function studentToForm(student) {
  const defaults = emptyStudentForm();
  const [firstName = '', ...lastNames] = (student.name || '').trim().split(/\s+/);
  const account = student.userDetails || student.user || {};
  const parent = student.parentDetails || student.parentId || {};
  const className = student.className || student.class || student.classId?.name || '';
  const sectionName = student.sectionName || student.section || student.sectionId?.name || '';
  const photo = student.photo || student.imagesRef?.img || student.avatar || student.image || '';
  const aadhaarDocument = student.aadhaarDocument || student.AdharRef?.pdf || student.aadhaarPdf || student.adharPdf || '';
  const status = String(student.status || '').toLowerCase().replace(/\s/g, '');
  const gender = String(student.gender || '').toLowerCase();
  const address = typeof student.address === 'object'
    ? [student.address?.street, student.address?.city].filter(Boolean).join(', ')
    : student.address;

  return {
    ...defaults,
    ...pickFields(defaults, student),
    firstName: student.firstName || firstName,
    lastName: student.lastName ?? lastNames.join(' '),
    gender: { female: 'Female', other: 'Other' }[gender] || 'Male',
    bloodGroup: String(student.bloodGroup || '').trim().toUpperCase(),
    address: address || '',
    classId: recordId(student.classId) || (className === 'N/A' ? '' : className),
    class: className === 'N/A' ? '' : className, className: className === 'N/A' ? '' : className,
    sectionId: recordId(student.sectionId) || (sectionName === 'N/A' ? '' : sectionName),
    section: sectionName === 'N/A' ? '' : sectionName, sectionName: sectionName === 'N/A' ? '' : sectionName,
    sessionId: recordId(student.sessionId) || null,
    admissionDate: dateOnly(student.admissionDate || student.joiningDate),
    joiningDate: dateOnly(student.joiningDate || student.admissionDate),
    dob: dateOnly(student.dob || student.dateOfBirth),
    transferCertificateDate: dateOnly(student.transferCertificateDate),
    accountExpiryDate: dateOnly(student.accountExpiryDate || account.accountExpiryDate),
    isLegacyStudent: isLegacyStudent(student.isLegacyStudent),
    parentName: student.parentName || parent.name || student.guardianName || student.fatherName || '',
    parentContact: student.parentContact || parent.phone || student.guardianPhone || student.emergencyContact || student.contactNumber || '',
    parentEmail: student.parentEmail || parent.email || student.guardianEmail || '',
    contactNumber: student.contactNumber || student.phone || student.mobileNumber || '',
    alternatePhone: student.alternatePhone || student.altPhone || '',
    aadhaarNumber: String(student.aadhaarNumber || student.aadharNumber || student.aadhaarNo || student.aadharNo || ''),
    photo,
    imagesRef: { id: student.imagesRef?.id || student.photoId || '', img: photo },
    aadhaarDocument,
    AdharRef: { id: student.AdharRef?.id || student.aadhaarDocId || '', pdf: aadhaarDocument },
    email: student.email || account.email || '',
    isEmailVerified: Boolean(student.isEmailVerified ?? account.isEmailVerified),
    forcePasswordChange: Boolean(student.forcePasswordChange ?? account.forcePasswordChange),
    twoFactorEnabled: Boolean(student.twoFactorEnabled ?? account.twoFactorEnabled),
    loginRestriction: student.loginRestriction || account.loginRestriction || 'none',
    status: { inactive: 'inactive', passout: 'Passout', graduated: 'graduated' }[status] || 'active',
    password: '', confirmPassword: '',
  };
}

export function studentFormPayload(form, editing = false) {
  const payload = pickFields(emptyStudentForm(), form);
  for (const key of Object.keys(payload)) {
    if (typeof payload[key] === 'string' && !['password', 'confirmPassword'].includes(key)) {
      payload[key] = payload[key].trim();
    }
  }
  payload.email = normalizeEmail(form.email);
  payload.name = [payload.firstName, payload.lastName].filter(Boolean).join(' ');
  payload.isLegacyStudent = isLegacyStudent(form.isLegacyStudent);
  for (const key of ['dob', 'admissionDate', 'joiningDate', 'transferCertificateDate', 'accountExpiryDate']) {
    payload[key] = payload[key] || null;
  }
  payload.documents = form.documents.filter(({ name, url }) => name?.trim() || url?.trim());
  payload.academicHistory = form.academicHistory.filter((row) => ['school', 'class', 'year', 'percentage'].some((field) => row[field]?.trim()));
  if (editing) {
    delete payload.password;
    delete payload.confirmPassword;
  }
  return payload;
}

export function validateStudentStep(step, form, editing) {
  const missing = (name) => !String(form[name] ?? '').trim();
  const errors = {};
  const require = (name, label) => { if (missing(name)) errors[name] = `${label} is required.`; };
  const email = (name, label) => {
    if (!missing(name) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[name].trim())) errors[name] = `Enter a valid ${label}.`;
  };

  if (step === 'profile') {
    require('firstName', 'First name');
    if (form.dob && form.dob > today()) errors.dob = 'Date of birth must be today or earlier.';
  }
  if (step === 'enrollment' && !editing) {
    require('admissionDate', 'Admission date');
  }
  if (step === 'family') {
    require('parentName', 'Parent or guardian name');
    require('parentContact', 'Parent or guardian phone');
    email('parentEmail', 'guardian email address');
  }
  if (step === 'documents') {
    if (!editing) {
      require('aadhaarNumber', 'Aadhaar number');
      require('photo', 'Student photo');
      require('aadhaarDocument', 'Aadhaar PDF');
    }
    form.documents.forEach(({ name, url }, index) => {
      if ((name?.trim() || url?.trim()) && !studentDocumentUrl(url)) {
        errors['documents-' + index + '-url'] = 'Enter a valid HTTP or HTTPS link.';
      }
    });
    if (!editing && !missing('aadhaarNumber') && !/^\d{12}$/.test(form.aadhaarNumber.replace(/[\s-]/g, ''))) {
      errors.aadhaarNumber = 'Enter the 12-digit Aadhaar number.';
    }
  }
  if (step === 'portal') {
    require('email', 'Student email');
    email('email', 'student email address');
    if (!editing) {
      if (form.password.trim().length < 6) errors.password = 'Use at least 6 characters.';
      if (!form.confirmPassword || form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Enter the same password again.';
      }
    }
  }
  return errors;
}

export function studentDocumentUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

const draftKey = 'student_registration_draft';
const draftForm = ({ password, confirmPassword, ...form }) => form;

export function getStudentDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey));
    if (!draft?.form || typeof draft.form !== 'object') return null;
    const step = Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= 5 ? draft.step : 0;
    return { ...draft, step, form: draftForm(draft.form) };
  } catch {
    return null;
  }
}

export function saveStudentDraft(form, step) {
  const draft = {
    form: draftForm(form),
    step,
    savedAt: new Date().toISOString(),
    studentName: [form.firstName, form.lastName].filter(Boolean).join(' ').trim() || 'Untitled student',
  };
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft));
    return draft;
  } catch {
    return null;
  }
}

export function clearStudentDraft() {
  try {
    localStorage.removeItem(draftKey);
  } catch {
    // Storage can be disabled by the browser.
  }
}
