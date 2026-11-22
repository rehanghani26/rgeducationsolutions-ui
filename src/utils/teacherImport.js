import {
  asText, downloadSpreadsheetFile, loadSpreadsheet, readSpreadsheet, spreadsheetBoolean,
  spreadsheetCsv, spreadsheetDate, spreadsheetIdentifier,
} from './spreadsheet.js';
import { TEACHER_EMPLOYMENT_FIELDS, TEACHER_ROLE_OPTIONS } from '../constants/teacherOptions.js';
import { LOGIN_RESTRICTION_OPTIONS } from '../constants/commonOptions.js';

const columns = {
  firstName: ['first'], lastName: ['last', 'surname'], employeeId: ['employeeCode', 'empId'],
  email: ['emailAddress', 'loginEmail'], password: ['pass'], phone: ['phoneNumber', 'contactNumber', 'mobile'],
  alternatePhone: ['altPhone'], gender: ['sex'], dob: ['dateOfBirth'], bloodGroup: ['blood'],
  address: [], emergencyContactName: ['emergencyName'], emergencyContactPhone: ['emergencyPhone'],
  emergencyContactRelation: ['emergencyRelation'], aadhaarNumber: ['aadhaar', 'aadhar', 'aadharNumber', 'aadhaarNo'],
  designation: ['title'], department: ['dept'], qualification: ['degree'], specialization: ['speciality'],
  experience: ['experienceYears', 'yearsOfExperience'], employmentType: ['employment'],
  joiningDate: ['joining', 'dateOfJoining', 'joined'], salary: ['monthlySalary'], role: [],
  status: [], accountExpiryDate: ['expiryDate'], loginRestriction: [], forcePasswordChange: [],
  twoFactorEnabled: [],
};

export const teacherTemplateHeaders = Object.keys(columns);
const headerKey = (value) => asText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const headers = new Map(Object.entries({ ...columns, name: ['teacherName', 'fullName'] })
  .flatMap(([key, aliases]) => [key, ...aliases].map((alias) => [headerKey(alias), key])));
const identifiers = ['phone', 'alternatePhone', 'emergencyContactPhone', 'aadhaarNumber'];
const loginRestrictionAliases = new Map([
  ['no-restriction', 'none'],
  ['no-restrictions', 'none'],
  ['school-network-only', 'school-network'],
  ['office-hours-only', 'office-hours'],
]);
const sampleNames = [
  'Asha Sharma', 'Riya Patel', 'Aman Verma', 'Fatima Khan', 'Arjun Rao',
  'Meera Iyer', 'Neha Gupta', 'Rohan Mehta', 'Imran Sheikh', 'Kavya Nair',
  'Sara Ali', 'Vikram Joshi', 'Nisha Das', 'Kiran Singh', 'Yusuf Ansari',
  'Zoya Siddiqui', 'Ananya Sen', 'Rahul Kulkarni', 'Priya Reddy', 'Sameer Malik',
  'Diya Bose', 'Kabir Sethi', 'Sana Qureshi', 'Dev Menon', 'Isha Shah',
];

function teacherSampleRows() {
  return sampleNames.map((name, index) => {
    const [firstName, lastName] = name.split(' ');
    const number = String(index + 1).padStart(2, '0');
    const employment = Object.fromEntries(TEACHER_EMPLOYMENT_FIELDS.map(({ name, options }) =>
      [name, options[index % options.length].value]));
    const teacher = {
      firstName, lastName, phone: '00000000' + number, email: 'teacher.sample' + number + '@example.test',
      employmentType: 'Full-time', joiningDate: '2026-04-01', role: 'teacher', loginRestriction: 'none', ...employment,
    };
    return teacherTemplateHeaders.map((key) => teacher[key] ?? '');
  });
}

export async function downloadTeacherTemplate(format) {
  const samples = teacherSampleRows();
  if (format === 'csv') {
    downloadSpreadsheetFile(new Blob(['\uFEFF', spreadsheetCsv([teacherTemplateHeaders, ...samples])], { type: 'text/csv;charset=utf-8' }),
      'Teacher_Import_Template.csv');
    return;
  }
  const XLSX = await loadSpreadsheet();
  const workbook = XLSX.utils.book_new();
  const addSheet = (name, rows, widths) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  };
  const optionWidths = TEACHER_EMPLOYMENT_FIELDS.map(({ options, label }) =>
    Math.max(label.length, ...options.map(({ value }) => value.length)) + 3);
  const widths = teacherTemplateHeaders.map((key) => {
    const fieldIndex = TEACHER_EMPLOYMENT_FIELDS.findIndex(({ name }) => name === key);
    return Math.max(key.length + 3, key === 'email' ? 32 : 17, optionWidths[fieldIndex] || 0);
  });
  const textColumns = teacherTemplateHeaders.map((key) => key === 'password' || identifiers.includes(key));
  const excelRows = samples.map((row) => row.map((value, index) =>
    textColumns[index] ? { t: 's', v: value, z: '@' } : value));
  addSheet('Teachers', [teacherTemplateHeaders, ...excelRows], widths);
  addSheet('Options', [
    TEACHER_EMPLOYMENT_FIELDS.map(({ label }) => label),
    ...Array.from({ length: Math.max(...TEACHER_EMPLOYMENT_FIELDS.map(({ options }) => options.length)) }, (_, row) =>
      TEACHER_EMPLOYMENT_FIELDS.map(({ options }) => options[row]?.value ?? '')),
  ], optionWidths);
  addSheet('Instructions', [
    ['Field', 'How to fill it'],
    ['Teachers sheet', 'Replace the 25 sample rows with your staff details. Keep the header row.'],
    ['Options sheet', 'Copy choices for designation, department, qualification, specialization, and experience.'],
    ['Required fields', 'Enter firstName, lastName, phone, and designation.'],
    ['Employee ID and email', 'Leave blank to generate an employee ID and school login email.'],
    ['Password', 'Use at least 6 characters or leave blank to generate a password. Format the column as Text.'],
    ['Login restriction', 'Use None, School network, or Office hours. A blank cell uses None.'],
    ['Dates', 'Use YYYY-MM-DD or an Excel date.'],
    ['Phone and Aadhaar', 'Use Text format to preserve leading zeroes. The Aadhaar number is optional.'],
    ['Files and teaching', 'Add a photo and Aadhaar PDF from the teacher profile. Assign teaching periods in the timetable.'],
  ], [26, 100]);
  downloadSpreadsheetFile(new Blob([XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true })], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }), 'Teacher_Import_Template.xlsx');
}

function normalizeTeacherRow(raw, date1904) {
  const [givenName, ...last] = asText(raw.name).split(/\s+/);
  const teacher = Object.fromEntries(teacherTemplateHeaders.filter((key) => asText(raw[key]))
    .map((key) => [key, key === 'password' ? String(raw[key]) : asText(raw[key])]));
  teacher.firstName ||= givenName;
  teacher.lastName ||= givenName ? last.join(' ') || '-' : '';
  if (!teacher.firstName || !teacher.lastName || !teacher.phone || !teacher.designation) {
    throw new Error('Enter first name, last name, phone, and designation.');
  }
  if (/\p{C}/u.test(teacher.firstName + teacher.lastName)) throw new Error('Enter a valid teacher name.');
  if (teacher.email) {
    teacher.email = teacher.email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) throw new Error('Enter a valid teacher email.');
  }
  if (teacher.password && teacher.password.trim().length < 6) throw new Error('Use at least 6 characters or leave the password blank.');
  if (teacher.employeeId) teacher.employeeId = teacher.employeeId.toUpperCase();
  for (const key of identifiers) if (key in teacher) teacher[key] = spreadsheetIdentifier(raw[key]);
  if (teacher.aadhaarNumber && !/^\d{12}$/.test(teacher.aadhaarNumber.replace(/[\s-]/g, ''))) throw new Error('Enter a 12-digit Aadhaar number.');
  for (const key of ['dob', 'joiningDate', 'accountExpiryDate']) if (key in teacher) teacher[key] = spreadsheetDate(raw[key], key, date1904);
  for (const key of ['forcePasswordChange', 'twoFactorEnabled']) if (key in teacher) teacher[key] = spreadsheetBoolean(raw[key], key);
  if (teacher.salary) {
    teacher.salary = Number(teacher.salary);
    if (!Number.isFinite(teacher.salary) || teacher.salary < 0) throw new Error('Enter a valid salary.');
  }
  if (teacher.gender) {
    teacher.gender = ['Male', 'Female', 'Other'].find((name) => name.toLowerCase() === teacher.gender.toLowerCase());
    if (!teacher.gender) throw new Error('Choose Male, Female, or Other for gender.');
  }
  if (teacher.role) {
    teacher.role = teacher.role.toLowerCase().replace(/[\s_]+/g, '-');
    if (!TEACHER_ROLE_OPTIONS.some((option) => option.value === teacher.role)) throw new Error('Choose a faculty role.');
  }
  if (teacher.status) {
    teacher.status = teacher.status.toLowerCase();
    if (!['active', 'inactive'].includes(teacher.status)) throw new Error('Choose active or inactive status.');
  }
  if (teacher.loginRestriction) {
    const key = teacher.loginRestriction.toLowerCase().replace(/[\s_\p{Pd}]+/gu, '-');
    const restriction = loginRestrictionAliases.get(key) ?? key;
    if (!LOGIN_RESTRICTION_OPTIONS.some(({ value }) => value === restriction)) {
      throw new Error('Login restriction must be None, School network, or Office hours. A blank cell uses None.');
    }
    teacher.loginRestriction = restriction;
  }
  return teacher;
}

export async function readTeacherImport(file) {
  const { rows, date1904 } = await readSpreadsheet(file, 'Teachers');
  const [header, ...records] = rows.filter(({ cells }) => cells.some((cell) => asText(cell)));
  if (!header || !records.length) throw new Error('Add at least one teacher row under the headers.');
  const keys = header.cells.map((cell) => headers.get(headerKey(cell)));
  if (!keys.includes('firstName') && !keys.includes('name')) throw new Error('Use the template with a firstName or Name column.');
  const emails = new Set();
  const employeeIds = new Set();
  const teachers = [];
  const issues = [];
  for (const { number, cells } of records) {
    try {
      if (cells.slice(keys.length).some((cell) => asText(cell))) throw new Error('This row has more values than the header. Quote CSV values containing commas.');
      const raw = {};
      keys.forEach((key, index) => { if (key && asText(cells[index])) raw[key] = cells[index]; });
      const teacher = normalizeTeacherRow(raw, date1904);
      if (teacher.email && emails.has(teacher.email)) throw new Error('This email already appears in the spreadsheet.');
      if (teacher.employeeId && employeeIds.has(teacher.employeeId)) throw new Error('This employee ID already appears in the spreadsheet.');
      if (teacher.email) emails.add(teacher.email);
      if (teacher.employeeId) employeeIds.add(teacher.employeeId);
      teachers.push({ number, teacher });
    } catch (error) {
      issues.push({ number, message: error.message });
    }
  }
  return { teachers, issues };
}
