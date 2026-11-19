import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';
import { normalizeEmail, studentDocumentUrl } from './studentForm.js';

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

export const studentImportHeaders = Object.keys(columns);
const keyFor = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const headerMap = new Map(Object.entries({ ...columns, name: ['studentName'] })
  .flatMap(([key, aliases]) => [key, ...aliases].map((alias) => [keyFor(alias), key])));
const dateFields = ['dob', 'admissionDate', 'joiningDate', 'transferCertificateDate', 'accountExpiryDate'];
const boolFields = ['isLegacyStudent', 'forcePasswordChange', 'twoFactorEnabled'];
const ignoredNames = new Set(['first name', 'firstname', 'total', 'subtotal', 'classid', 'sectionid', 'students', 'summary', 'count']);
const invalidChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/u;

const example = {
  firstName: 'Asha', lastName: 'Sharma', classId: 'cls-10', sectionId: 'sec-a',
  isLegacyStudent: false, admissionDate: '2026-04-05', joiningDate: '2026-04-08',
  address: '12 School Road, Delhi', parentName: 'Maya Sharma', fatherName: 'Dev Sharma',
  email: 'asha@example.test',
};
const templateRows = [studentImportHeaders, studentImportHeaders.map((key) => example[key] ?? '')];

export function toStudentCsv(rows) {
  return rows.map((row) => row.map((cell) => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(',')).join('\r\n');
}

export function downloadStudentFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

let xlsxReady;
function loadXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  xlsxReady ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    const fail = () => {
      script.remove();
      reject(new Error('Excel support could not load. Try again or use CSV.'));
    };
    script.onload = () => window.XLSX ? resolve(window.XLSX) : fail();
    script.onerror = fail;
    document.head.append(script);
  }).catch((error) => {
    xlsxReady = undefined;
    throw error;
  });
  return xlsxReady;
}

export async function downloadStudentTemplate(format) {
  if (format === 'xlsx') {
    const XLSX = await loadXlsx();
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(templateRows), 'Students');
    XLSX.writeFile(workbook, 'Student_Import_Template.xlsx');
    return;
  }
  const blob = new Blob(['\uFEFF', toStudentCsv(templateRows)], { type: 'text/csv;charset=utf-8' });
  downloadStudentFile(blob, 'Student_Import_Template.csv');
}

function readCsv(text) {
  const rows = [];
  let cells = [];
  let field = '';
  let quoted = false;
  let closed = false;
  let line = 1;
  let rowNumber = 1;
  const pushField = () => {
    cells.push(field);
    field = '';
    closed = false;
  };
  const pushRow = () => {
    pushField();
    rows.push({ number: rowNumber, cells });
    cells = [];
  };

  const input = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else {
        field += char;
        if (char === '\n') line++;
      }
    } else if (char === ',') {
      pushField();
    } else if (char === '\n') {
      pushRow();
      rowNumber = ++line;
    } else if (char === '"' && field.trim() === '' && !closed) {
      field = '';
      quoted = true;
    } else if (!(closed && /\s/.test(char))) {
      if (closed || char === '"') throw new Error('Invalid CSV quoting on line ' + line + '.');
      field += char;
    }
  }
  if (quoted) throw new Error('Unclosed quoted cell starting on row ' + rowNumber + '.');
  if (field || cells.length || closed) pushRow();
  return rows;
}

const asText = (value) => String(value ?? '').trim();
const identifier = (value) => asText(value).replace(/^'(?=[+\d-])/, '').replace(/\.0$/, '');

function normalizeDate(value, key, date1904) {
  let input = asText(value);
  if (typeof value === 'number' && value >= 0 && value < 2958466) {
    const days = Math.floor(value);
    // Excel's 1900 calendar includes a fictitious February 29 at serial 60.
    if (!date1904 && days === 60) throw new Error(key + ' contains an invalid Excel date.');
    const unixEpoch = date1904 ? 24107 : days < 60 ? 25568 : 25569;
    input = new Date((days - unixEpoch) * 86400000).toISOString().slice(0, 10);
  } else {
    const legacy = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (legacy) input = [legacy[3], legacy[2].padStart(2, '0'), legacy[1].padStart(2, '0')].join('-');
  }
  const date = new Date(input + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input) {
    throw new Error(key + ' must be a valid date in YYYY-MM-DD format.');
  }
  return input;
}

function normalizeBoolean(input, key) {
  const value = asText(input).toLowerCase();
  if (['true', 'yes', '1'].includes(value)) return true;
  if (['false', 'no', '0'].includes(value)) return false;
  throw new Error(key + ' must be true or false.');
}

function normalizePlacement(value, options, prefix, fallback) {
  const name = asText(value) || fallback.name;
  const match = options.find((option) => [option.id, option.name, option.name.replace(prefix, '')]
    .some((candidate) => candidate.toLowerCase() === name.toLowerCase()));
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

function normalizeStudentRow(raw, date1904) {
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
    .map((key) => [key, asText(raw[key])]));
  for (const key of dateFields) if (key in values) values[key] = normalizeDate(raw[key], key, date1904);
  for (const key of boolFields) if (key in values) values[key] = normalizeBoolean(raw[key], key);
  for (const key of ['contactNumber', 'alternatePhone', 'parentContact', 'motherContact', 'aadhaarNumber']) {
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
  const cls = normalizePlacement(values.classId, CLASS_OPTIONS, 'Class ', CLASS_OPTIONS.find((item) => item.id === 'cls-1'));
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

export async function readStudentImport(file) {
  let rows;
  let date1904 = false;
  if (/\.(xlsx|xls)$/i.test(file.name)) {
    const XLSX = await loadXlsx();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    date1904 = Boolean(workbook.Workbook?.WBProps?.date1904);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet?.['!ref']) throw new Error('The first worksheet is empty.');
    const rowOffset = XLSX.utils.decode_range(sheet['!ref']).s.r;
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true, blankrows: true })
      .map((cells, index) => ({ number: rowOffset + index + 1, cells }));
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    rows = readCsv(await file.text());
  } else {
    throw new Error('Choose a CSV, XLSX, or XLS file.');
  }

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
      const student = normalizeStudentRow(raw, date1904);
      if (student.email && emails.has(student.email)) throw new Error('This student email already appears in the file.');
      if (student.email) emails.add(student.email);
      students.push({ number, student });
    } catch (error) {
      issues.push({ number, message: error.message });
    }
  }
  return { students, issues };
}
