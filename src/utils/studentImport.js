import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';
import { normalizeEmail, studentDocumentUrl } from './studentForm.js';
import {
  asText, downloadSpreadsheetFile as downloadStudentFile, loadSpreadsheet as loadXlsx,
  readSpreadsheet, spreadsheetBoolean as normalizeBoolean, spreadsheetCsv as toStudentCsv,
  spreadsheetDate as normalizeDate, spreadsheetIdentifier as identifier,
} from './spreadsheet.js';

export { downloadStudentFile, toStudentCsv };

const columns = {
  firstName: ['first'],
  lastName: ['last'],
  classId: ['class', 'className', 'grade', 'standard'],
  sectionId: ['section', 'sectionName', 'sec'],
  isLegacyStudent: ['legacyStudent', 'legacy'],
  admissionDate: [],
  joiningDate: ['joining', 'joined'],
  gender: ['sex'],
  dob: ['dateOfBirth', 'birth'],
  bloodGroup: ['blood'],
  contactNumber: ['phone', 'contact', 'mobile', 'mobileNumber'],
  alternatePhone: ['alternate', 'altPhone'],
  email: ['studentEmail', 'loginEmail', 'studentLoginEmail', 'emailAddress', 'studentEmailAddress'],
  address: [],
  admissionType: [],
  previousSchoolName: ['previousSchool', 'priorSchool'],
  previousClass: ['priorClass'],
  previousBoard: ['priorBoard'],
  transferCertificateNumber: ['tcNumber', 'tcNo', 'transferCertificate'],
  transferCertificateDate: ['tcDate'],
  enrollmentStatus: [],
  houseName: ['house'],
  studentCategory: ['category'],
  nationality: [],
  motherTongue: [],
  mediumOfInstruction: ['medium'],
  studentType: [],
  specialEducationNeeds: ['sen', 'specialNeeds'],
  careerInterest: [],
  parentName: ['guardian', 'guardianName', 'parent'],
  parentContact: ['parentPhone', 'parentNumber', 'guardianContact', 'guardianPhone'],
  parentEmail: ['guardianEmail'],
  fatherName: [],
  fatherOccupation: [],
  fatherOrganization: ['fatherOrg', 'fatherCompany'],
  motherName: [],
  motherContact: ['motherPhone', 'motherMobile'],
  motherOccupation: [],
  guardianRelation: ['relationship'],
  guardianAddress: [],
  aadhaarNumber: ['aadhaar', 'aadhar', 'aadharNumber', 'aadhaarNo', 'aadharNo', 'adharNumber', 'adharNo'],
  documents: [],
  academicHistory: [],
  status: [],
  accountExpiryDate: [],
  loginRestriction: [],
  forcePasswordChange: [],
  twoFactorEnabled: [],
  password: ['pass'],
};

const studentImportHeaders = Object.keys(columns);
export const studentTemplateHeaders = [
  'firstName', 'lastName', 'classId', 'sectionId', 'dob', 'gender', 'isLegacyStudent',
  'admissionDate', 'joiningDate', 'contactNumber', 'email', 'password', 'parentName', 'parentContact',
  'parentEmail', 'fatherName', 'motherName', 'aadhaarNumber', 'address',
];
const keyFor = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const headerMap = new Map(Object.entries({ ...columns, name: ['studentName'] })
  .flatMap(([key, aliases]) => [key, ...aliases].map((alias) => [keyFor(alias), key])));
const dateFields = ['dob', 'admissionDate', 'joiningDate', 'transferCertificateDate', 'accountExpiryDate'];
const boolFields = ['isLegacyStudent', 'forcePasswordChange', 'twoFactorEnabled'];
const identifierFields = ['contactNumber', 'alternatePhone', 'parentContact', 'motherContact', 'aadhaarNumber'];
const ignoredNames = new Set(['first name', 'firstname', 'total', 'subtotal', 'classid', 'sectionid', 'students', 'summary', 'count']);
const invalidChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/u;

const defaultClass = (classes) => classes.find((item) => item.name === 'Class 1') || classes[0];

export async function studentTemplateWorkbook(classes = [], session) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.utils.book_new();
  const addSheet = (name, rows, widths) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  };
  const grade = defaultClass(classes);
  const admissionDate = session?.startDate?.slice(0, 10) || '2026-04-01';
  const example = {
    firstName: 'Asha', lastName: 'Sharma', classId: grade?.name || 'Class 1', sectionId: 'Section A',
    isLegacyStudent: false, admissionDate, joiningDate: admissionDate, dob: '2019-08-12', gender: 'Female',
    contactNumber: '0987654321', email: 'asha@example.test', parentName: 'Maya Sharma', fatherName: 'Dev Sharma',
  };
  const widths = studentTemplateHeaders.map((key) => Math.max(key.length + 4, 19));
  const blankRow = studentTemplateHeaders.map((key) =>
    key === 'password' || identifierFields.includes(key) ? { t: 's', v: '', z: '@' } : null);
  addSheet('Students', [studentTemplateHeaders, blankRow], widths);
  addSheet('Example', [studentTemplateHeaders, studentTemplateHeaders.map((key) => example[key] ?? '')], widths);
  addSheet('Class and section options', [
    ['Class name', 'Class code', 'Class ID', 'Section name', 'Section ID'],
    ...Array.from({ length: Math.max(classes.length, SECTION_OPTIONS.length) }, (_, index) => [
      classes[index]?.name || '', classes[index]?.code || '', classes[index]?.id || '',
      SECTION_OPTIONS[index]?.name || '', SECTION_OPTIONS[index]?.id || '',
    ]),
  ], [23, 16, 29, 18, 15]);
  addSheet('Instructions', [
    ['Field', 'How to fill it'],
    ['Students sheet', 'Enter one student per row under the existing headers. The Example sheet shows a completed row.'],
    ['firstName', 'Required. You can also use a single Name column in an existing file.'],
    ['classId and sectionId', 'Use a name, code, or ID from your school. See Class and section options.'],
    ['Blank class and section', 'Uses Class 1 if offered, otherwise the first configured class. Blank section uses Section A.'],
    ['dob, admissionDate, joiningDate', 'Use YYYY-MM-DD or an Excel date. Admission and joining dates can differ.'],
    ['isLegacyStudent', 'Use TRUE or FALSE. A blank cell means FALSE.'],
    ['gender', 'Use Male, Female, or Other.'],
    ['Phone and Aadhaar', 'Format these columns as Text to preserve leading zeroes.'],
    ['email', 'Leave blank to generate the student login email. Use a unique address when filling this column.'],
    ['password', 'Optional. Enter a student login password of at least 6 characters. Use Text format. Leave it blank to generate one.'],
    ['Admission and roll numbers', 'The portal assigns these when you import.'],
  ], [32, 108]);
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
}

export async function downloadStudentTemplate(format, classes, session) {
  if (format === 'xlsx') {
    const workbook = await studentTemplateWorkbook(classes, session);
    downloadStudentFile(new Blob([workbook], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }), 'Student_Import_Template.xlsx');
  } else {
    const blob = new Blob(['\uFEFF', toStudentCsv([studentTemplateHeaders])], { type: 'text/csv;charset=utf-8' });
    downloadStudentFile(blob, 'Student_Import_Template.csv');
  }
}

function normalizePlacement(value, options, prefix, fallback) {
  const name = asText(value) || fallback?.name || '';
  const match = options.find((option) => [option.id, option.name, option.name.replace(prefix, ''), option.code, ...(option.aliases || [])]
    .some((candidate) => String(candidate || '').toLowerCase() === name.toLowerCase()));
  return match || { id: name, name };
}

function normalizeList(input, key) {
  try {
    const value = JSON.parse(input);
    const itemKeys = key === 'documents' ? ['name', 'url'] : ['school', 'class', 'year', 'percentage'];
    if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
      throw new Error();
    }
    const items = value.map((item) => Object.fromEntries(itemKeys.map((field) => [field, asText(item[field])])));
    if (key === 'documents' && items.some((item) => !studentDocumentUrl(item.url))) throw new Error();
    return items;
  } catch {
    throw new Error(key + (key === 'documents' ? ' must be a JSON array of names and HTTP or HTTPS links.' : ' must be a JSON array of school records.'));
  }
}

function normalizeStudentRow(raw, date1904, classes) {
  const [givenName, ...familyNames] = asText(raw.name).split(/\s+/);
  const firstName = asText(raw.firstName) || givenName;
  const lastName = asText(raw.lastName) || (raw.firstName ? '' : familyNames.join(' '));
  if (!/[\p{L}\p{N}]/u.test(firstName) || invalidChars.test(firstName) || invalidChars.test(lastName)) {
    throw new Error('Enter a valid first name or student name.');
  }
  if (ignoredNames.has(firstName.toLowerCase()) || (firstName.toLowerCase().startsWith('cls-') && !lastName)) {
    throw new Error('Remove the repeated header or summary row.');
  }
  const values = Object.fromEntries(studentImportHeaders.filter((key) => asText(raw[key]) !== '')
    .map((key) => [key, key === 'password' ? String(raw[key]) : asText(raw[key])]));
  if (values.password && values.password.trim().length < 6) {
    throw new Error('Password must have at least 6 characters. Leave it blank to generate one.');
  }
  for (const key of dateFields) if (key in values) values[key] = normalizeDate(raw[key], key, date1904);
  for (const key of boolFields) if (key in values) values[key] = normalizeBoolean(raw[key], key);
  for (const key of identifierFields) {
    if (key in values) values[key] = identifier(raw[key]);
  }
  for (const key of ['documents', 'academicHistory']) {
    if (key in values) values[key] = normalizeList(values[key], key);
  }
  for (const key of ['email', 'parentEmail']) {
    if (values[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[key])) {
      throw new Error(key + ' must be a valid email address.');
    }
  }
  if (values.gender) {
    const gender = ['Male', 'Female', 'Other'].find((option) => option.toLowerCase() === values.gender.toLowerCase());
    if (!gender) throw new Error('Gender must be Male, Female, or Other.');
    values.gender = gender;
  }
  if (values.status) {
    const statuses = { active: 'active', inactive: 'inactive', passout: 'Passout', graduated: 'graduated' };
    const status = statuses[keyFor(values.status)];
    if (!status || !Object.hasOwn(statuses, keyFor(values.status))) throw new Error('Unrecognized account status.');
    values.status = status;
  }
  if (values.loginRestriction && !['none', 'school-network', 'office-hours'].includes(values.loginRestriction)) {
    throw new Error('Login restriction must be none, school-network, or office-hours.');
  }
  const cls = normalizePlacement(values.classId, classes, 'Class ', defaultClass(classes));
  if (!classes.some((grade) => String(grade.id) === String(cls.id))) {
    throw new Error('Class "' + cls.name + '" is outside the school class range.');
  }
  const section = normalizePlacement(values.sectionId, SECTION_OPTIONS, 'Section ', SECTION_OPTIONS[0]);
  return {
    ...values,
    firstName,
    lastName,
    classId: cls.id,
    class: cls.name,
    sectionId: section.id,
    section: section.name,
    parentName: values.parentName || values.fatherName || '',
    isLegacyStudent: values.isLegacyStudent ?? false,
    email: normalizeEmail(values.email),
  };
}

export async function readStudentImport(file, classes = CLASS_OPTIONS.filter((item) => !item.isPassout)) {
  const { rows, date1904 } = await readSpreadsheet(file, 'Students');
  const [header, ...records] = rows.filter(({ cells }) => cells.some((cell) => asText(cell)));
  if (!header || !records.length) throw new Error('Add a header and at least one student row.');
  const keys = header.cells.map((col) => headerMap.get(keyFor(col)));
  if (!keys.includes('firstName') && !keys.includes('name')) {
    throw new Error('The header must contain firstName or Name. You can use the template to get started.');
  }

  const students = [];
  const issues = [];
  const emails = new Set();
  for (const { number, cells } of records) {
    try {
      if (cells.slice(keys.length).some((cell) => asText(cell))) {
        throw new Error('This row has more values than the header. Quote CSV values containing commas.');
      }
      const raw = {};
      keys.forEach((key, index) => {
        if (key && asText(cells[index]) && !asText(raw[key])) raw[key] = cells[index];
      });
      const student = normalizeStudentRow(raw, date1904, classes);
      if (student.email && emails.has(student.email)) throw new Error('This student email already appears in the file.');
      if (student.email) emails.add(student.email);
      students.push({ number, student });
    } catch (error) {
      issues.push({ number, message: error.message });
    }
  }
  return { students, issues };
}
