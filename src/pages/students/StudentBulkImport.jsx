import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { useRef, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getUserRole } from '../../config/access.jsx';
import { ROUTES } from '../../routes/routes.js';
import { bulkImportStudents, cleanCorruptedStudents } from '../../services/studentService.js';
import { downloadStudentTemplate, readStudentImport, studentTemplateHeaders } from '../../utils/studentImport.js';
import './studentRegistration.css';
import { Input } from '../../components/ui/FormControls.jsx';
import { ErrorMessage } from '../../components/ui/ProcurementUI.jsx';
import { notifyApiError } from '../../services/apiErrors.js';

const panel = 'min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-1)] p-3 sm:p-5';
const muted = 'text-sm text-[var(--text-secondary)]';
const secondary = 'student-button student-secondary';
const fieldGuide = [
  ['Student name', 'Use firstName and lastName, or a single Name column.'],
  ['Class and section', 'Use the names, codes, or IDs listed in the workbook. Blank class uses Class 1 if offered, otherwise the first configured class. Blank section uses Section A.'],
  ['Legacy and dates', 'Use true or false for isLegacyStudent. Blank means false. Use YYYY-MM-DD or an Excel date. Admission and joining dates can differ.'],
  ['Student login password', 'Use the password column to enter at least 6 characters. Format it as Text in Excel. A blank cell gets a generated password.'],
  ['Documents and history', 'Optional documents and academicHistory cells accept JSON arrays. Documents use name and url. History entries use school, class, year, and percentage.'],
  ['Identifiers', 'Admission and roll numbers are assigned on import. In Excel, format phone and Aadhaar columns as Text to preserve leading zeroes.'],
];

function RowIssues({ issues }) {
  if (issues.length === 0) return null;
  return (
    <details className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" open>
      <summary className="cursor-pointer font-semibold">{issues.length} {issues.length === 1 ? 'row needs' : 'rows need'} attention</summary>
      <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
        {issues.map(({ number, message }, index) => (
          <li key={`${number}-${index}`} className="break-words"><strong>{number ? `Row ${number}` : 'Import'}</strong> · {message}</li>
        ))}
      </ul>
    </details>
  );
}

function ImportPreview({ students, issues, importing, canImport, onSubmit }) {
  return (
    <section className={`${panel} space-y-3`} aria-labelledby="student-import-preview">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h2 className="text-base font-bold" id="student-import-preview">Review spreadsheet</h2>
        <p className={muted}>{students.length} ready to import</p>
      </div>
      <RowIssues issues={issues} />
      {students.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700" role="region" aria-label="Student spreadsheet preview" tabIndex={0}>
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">First {Math.min(students.length, 8)} of {students.length} valid students</caption>
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  {['Row', 'Student', 'Class and section', 'Legacy', 'Admission', 'Joining'].map((label, index) => (
                    <th scope="col" key={label} className={`px-2.5 py-2 sm:px-3.5 ${index > 3 ? 'hidden md:table-cell' : ''}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {students.slice(0, 8).map(({ number, student }) => (
                  <tr key={number}>
                    <td className="px-2.5 py-2 text-slate-600 sm:px-3.5 dark:text-slate-300">{number}</td>
                    <th scope="row" className="break-words px-2.5 py-2 font-semibold sm:px-3.5">{student.firstName} {student.lastName}</th>
                    <td className="px-2.5 py-2 sm:px-3.5">{student.class} · {student.section}</td>
                    <td className="px-2.5 py-2 sm:px-3.5">{student.isLegacyStudent ? 'Yes' : 'No'}</td>
                    <td className="hidden px-3.5 py-2 tabular-nums md:table-cell">{student.admissionDate || '—'}</td>
                    <td className="hidden px-3.5 py-2 tabular-nums md:table-cell">{student.joiningDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={muted}>Showing {Math.min(students.length, 8)} of {students.length} valid rows.</p>
            <button type="button" className="student-button student-primary" disabled={importing || !canImport} onClick={onSubmit}>
              {importing ? 'Importing…' : `Import ${students.length} ${students.length === 1 ? 'student' : 'students'}`}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default function StudentBulkImport() {
  const scope = useAcademicSession();
  return <StudentImportPage key={scope.sessionId} scope={scope} />;
}

function StudentImportPage({ scope }) {
  const {
    selected, sessionId, readOnly, sessionsLoading, sessionsError, refresh,
    classOptions, schoolClasses, refreshSchoolClasses,
  } = scope;
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [fileError, setFileError] = useState('');
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [templateBusy, setTemplateBusy] = useState(false);
  const busy = reading || importing;
  const processing = useRef(false);
  const loadingOptions = schoolClasses.loading || (sessionsLoading && !sessionId);
  const optionsError = schoolClasses.error || (!sessionId && sessionsError);
  const canImport = !loadingOptions && !optionsError && !readOnly && classOptions.length > 0;

  async function chooseFile(file) {
    if (!file || processing.current || !canImport) return;
    processing.current = true;
    setDragging(false);
    setReading(true);
    setFileName(file.name);
    setPreview(null);
    setResult(null);
    setFileError('');
    try {
      setPreview(await readStudentImport(file, classOptions));
    } catch (error) {
      setFileError(error.message || 'Could not read this spreadsheet.');
    } finally {
      setReading(false);
      processing.current = false;
    }
  }

  async function importStudents() {
    if (!canImport || !preview?.students.length || processing.current) return;
    processing.current = true;
    setImporting(true);
    setFileError('');
    try {
      const { data } = await bulkImportStudents(preview.students.map(({ student }) => student), sessionId);
      const report = data?.data ?? data;
      if (!data?.success || !Number.isInteger(report?.count)) {
        throw new Error(data?.message || 'The server could not complete the import.');
      }
      const issues = [...preview.issues, ...(report.errors || []).map(({ index, error }) => ({
        number: preview.students[index]?.number, message: error,
      }))];
      setResult({ count: report.count, issues });
      setPreview(null);
    } catch (error) {
      setFileError(error.message || 'Could not import the students.');
    } finally {
      setImporting(false);
      processing.current = false;
    }
  }

  async function template(format) {
    setTemplateBusy(true);
    try {
      await downloadStudentTemplate(format, classOptions, selected);
    } catch (error) {
      notifyApiError(error);
    } finally {
      setTemplateBusy(false);
    }
  }

  async function cleanRecords() {
    if (!window.confirm('Purge student records containing corrupted binary text?')) return;
    setCleaning(true);
    try {
      await cleanCorruptedStudents();
      toast.success('Corrupted records cleaned.');
    } catch (error) {
      notifyApiError(error, 'Could not clean corrupted records.');
    } finally {
      setCleaning(false);
    }
  }

  return (
    <div className="student-registration">
      <header className="student-page-heading">
        <nav className="student-breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.STUDENTS.LIST}>Students</Link><span aria-hidden="true">/</span><span aria-current="page">Bulk import</span>
        </nav>
        <div className="student-page-title">
          <div className="student-page-icon"><FileSpreadsheet size={24} aria-hidden="true" /></div>
          <div>
            <h1>Bulk import students</h1>
            <p>{selected?.sessionName ? 'Academic session ' + selected.sessionName : 'Register students from a spreadsheet.'}</p>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1fr)] lg:items-start lg:gap-4">
        <section className={`${panel} space-y-3`} aria-labelledby="student-import-template">
          <div>
            <h2 className="text-base font-bold" id="student-import-template">Spreadsheet template</h2>
            <p className={`mt-1 ${muted}`}>Fill the Students sheet in Excel. The workbook includes an example and your school's class options.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="student-button student-primary !ml-0" disabled={templateBusy || schoolClasses.loading} onClick={() => template('xlsx')}>
              <Download size={15} aria-hidden="true" /> {templateBusy ? 'Preparing template…' : 'Excel template'}
            </button>
            <button type="button" className={secondary} onClick={() => template('csv')}><Download size={15} aria-hidden="true" /> CSV template</button>
          </div>
          <details className="border-t border-[var(--border-color)] pt-3 text-sm">
            <summary className="cursor-pointer font-semibold">Column formatting</summary>
            <dl className={`mt-2 space-y-2 ${muted}`}>
              {fieldGuide.map(([label, description]) => (
                <div key={label}><dt className="font-semibold text-slate-900 dark:text-slate-100">{label}</dt><dd>{description}</dd></div>
              ))}
            </dl>
            <button type="button" className="student-link mt-2" onClick={async () => {
              try {
                await navigator.clipboard.writeText(studentTemplateHeaders.join(','));
                toast.success('CSV header copied.');
              } catch {
                toast.error('Could not copy the header. It is included in the CSV template.');
              }
            }}>Copy CSV header</button>
          </details>
        </section>

        <section className={`${panel} space-y-3`} aria-labelledby="student-import-upload">
          <h2 className="text-base font-bold" id="student-import-upload">Upload spreadsheet</h2>
          {optionsError && <ErrorMessage error={optionsError} onRetry={() => {
            if (schoolClasses.error) refreshSchoolClasses();
            if (!sessionId && sessionsError) refresh().catch(() => {});
          }} />}
          {!loadingOptions && !optionsError && readOnly && <p className={muted} role="status">Select the active academic session to import students.</p>}
          {!loadingOptions && !optionsError && !readOnly && classOptions.length === 0 &&
            <p className={muted} role="status">Set the school class range before importing students.</p>}
          <div className={`rounded-lg border border-dashed p-3 sm:p-4 ${dragging
            ? 'border-orange-600 bg-orange-50 dark:border-orange-400 dark:bg-orange-950'
            : 'border-[var(--border-color)] bg-[var(--surface-2)]'}`}
            onDragOver={(event) => { event.preventDefault(); if (!busy && canImport) setDragging(true); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
            onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
            <Input className="sr-only student-file-input" id="student-import-file" aria-describedby="student-import-file-hint"
              type="file" accept=".csv,.xlsx,.xls,.txt" disabled={busy || !canImport} onChange={(event) => {
                chooseFile(event.target.files[0]);
                event.target.value = '';
              }} />
            <label htmlFor="student-import-file" className={secondary + (busy || !canImport ? ' !cursor-default opacity-60' : '')}>
              <Upload size={16} aria-hidden="true" /> {reading ? 'Reading spreadsheet…' : fileName ? 'Choose another file' : 'Choose file'}
            </label>
            <p className={`mt-2 ${muted}`} id="student-import-file-hint" role={loadingOptions ? 'status' : undefined}>
              {loadingOptions ? 'Loading academic session and class options…' : 'Choose or drop a CSV or Excel file.'}
            </p>
            {fileName && <p className="mt-2 break-words text-sm font-semibold" role="status">{fileName}</p>}
          </div>
          {fileError && <p className="student-error" role="alert">{fileError}</p>}
        </section>
      </div>

      {preview && <ImportPreview {...preview} importing={importing} canImport={canImport} onSubmit={importStudents} />}
      {result && (
        <section className={`${panel} space-y-3`} aria-labelledby="student-import-results">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="student-import-results" className="text-base font-bold">Import results</h2>
              <p className={`mt-1 flex items-center gap-1.5 ${muted}`} role="status">
                {result.count > 0 && <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />}
                {result.count} {result.count === 1 ? 'student' : 'students'} imported
              </p>
            </div>
            <Link to={ROUTES.STUDENTS.LIST} className={secondary}>Student directory</Link>
          </div>
          {result.count > 0 && <p className={muted}>A super-admin can view the login password under <strong>DB Credentials</strong> on the student profile.</p>}
          <RowIssues issues={result.issues} />
          {result.issues.length > 0 && <p className={muted}>To retry, upload a spreadsheet with only the corrected rows.</p>}
        </section>
      )}
      {['super-admin', 'school-admin', 'admin', 'director'].includes(role) && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">Data maintenance</summary>
          <button type="button" className="student-link student-remove mt-1" disabled={cleaning || busy} onClick={cleanRecords}>
            {cleaning ? 'Cleaning…' : 'Purge corrupted records'}
          </button>
        </details>
      )}
    </div>
  );
}
