import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import ConfirmationBox from '../../components/ui/ConfirmationBox.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { DataTable, ErrorMessage, Pending } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { ROUTES } from '../../routes/routes.js';
import { notifyApiError } from '../../services/apiErrors.js';
import { bulkImportTeachers } from '../../services/teacherService.js';
import { teacherManagerRoles } from '../../utils/teacherForm.js';
import { downloadTeacherTemplate, readTeacherImport } from '../../utils/teacherImport.js';
import './teacher.css';

const teacherColumns = [
  { key: 'number', label: 'Row' },
  { key: 'name', label: 'Teacher', full: true, render: ({ teacher }) => <strong>{teacher.firstName} {teacher.lastName}</strong> },
  { key: 'designation', label: 'Designation', render: ({ teacher }) => teacher.designation },
  { key: 'department', label: 'Department', render: ({ teacher }) => teacher.department || '—' },
  { key: 'email', label: 'Login email', render: ({ teacher }) => teacher.email || 'Generated on import' },
];

function RowIssues({ issues }) {
  if (!issues.length) return null;
  return <details className="teacher-import-issues" open>
    <summary>{issues.length} {issues.length === 1 ? 'row needs' : 'rows need'} attention</summary>
    <ul>{issues.map(({ number, message }, index) =>
      <li key={index}><strong>{number ? 'Row ' + number : 'Import'}</strong> · {message}</li>
    )}</ul>
  </details>;
}

export default function TeacherBulkImport() {
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const canManage = teacherManagerRoles.includes(role);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const working = useRef(false);
  const busy = reading || importing;

  async function choose(file) {
    if (!file || working.current || !canManage) return;
    working.current = true;
    setReading(true);
    setDragging(false);
    setFileName(file.name);
    setPreview(null);
    setResult(null);
    setError(null);
    try {
      setPreview(await readTeacherImport(file));
    } catch (issue) {
      setError(issue);
    } finally {
      setReading(false);
      working.current = false;
    }
  }

  async function template(format) {
    setDownloading(true);
    try {
      await downloadTeacherTemplate(format);
    } catch (issue) {
      notifyApiError(issue, 'Could not download the teacher template.');
    } finally {
      setDownloading(false);
    }
  }

  async function importTeachers() {
    if (!canManage || !preview?.teachers.length || working.current) return;
    working.current = true;
    setImporting(true);
    setError(null);
    try {
      const response = await bulkImportTeachers(preview.teachers.map(({ teacher }) => teacher));
      const report = response.data?.count !== undefined ? response.data : response;
      if (!Number.isInteger(report.count)) {
        throw new Error(response.message || 'The server could not complete the import.');
      }
      const issues = [...preview.issues, ...(report.errors || []).map(({ index, error: message }) => ({
        number: preview.teachers[index]?.number, message,
      }))].sort((left, right) => (left.number || 0) - (right.number || 0));
      setResult({ count: report.count, issues });
      setPreview(null);
    } catch (issue) {
      setError(issue);
      notifyApiError(issue, 'Could not import the teachers.');
    } finally {
      setConfirm(false);
      setImporting(false);
      working.current = false;
    }
  }

  const count = preview?.teachers.length || 0;
  const readyLabel = count + (count === 1 ? ' teacher' : ' teachers');
  return <main className="teacher-page">
    <PageHeader title="Import teachers" breadcrumbs={[{ label: 'Teachers', to: ROUTES.TEACHERS.LIST }, { label: 'Bulk import' }]} />
    {!canManage ? <ErrorMessage error="You do not have permission to import teachers." /> : <>
      <div className="teacher-panels">
        <section className="teacher-panel">
          <div className="teacher-section-bar"><h2 className="teacher-section-title"><FileSpreadsheet size={17} /> Teacher template</h2></div>
          <p className="teacher-note">Both templates include 25 sample teachers. Replace the sample rows with your staff details before uploading.</p>
          <div className="proc-actions mt-3">
            <button type="button" className="proc-btn proc-primary" disabled={downloading} onClick={() => template('xlsx')}><Download size={15} /> Excel template</button>
            <button type="button" className="proc-btn" disabled={downloading} onClick={() => template('csv')}><Download size={15} /> CSV template</button>
          </div>
          <details className="teacher-template-help">
            <summary>How to fill the template</summary>
            <ul>
              <li>Enter a first name, last name, phone, and designation for each teacher. Leave employee ID or email blank to generate them.</li>
              <li>Use the Excel Options sheet to find all 20 choices for each employment field.</li>
              <li>Use at least six characters for a password, or leave the column blank to generate one.</li>
              <li>Use None, School network, or Office hours for login restriction. A blank cell uses None.</li>
              <li>Use Excel dates or YYYY-MM-DD. Format phone numbers and Aadhaar numbers as text to preserve leading zeroes.</li>
              <li>Upload the photo and Aadhaar PDF from the teacher profile. Assign subjects and classes in the Class Timetable Builder.</li>
            </ul>
          </details>
        </section>
        <section className="teacher-panel">
          <div className="teacher-section-bar"><h2 className="teacher-section-title"><Upload size={17} /> Upload spreadsheet</h2></div>
          <div className={'teacher-upload-zone' + (dragging ? ' teacher-upload-active' : '')}
            onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
            onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}>
            <strong>{fileName || 'Drop your teacher spreadsheet here'}</strong>
            <p className="teacher-note">Excel (.xlsx, .xls) or CSV</p>
            <input type="file" id="teacher-import-file" className="sr-only" accept=".xlsx,.xls,.csv" disabled={busy}
              onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ''; }} />
            <label htmlFor="teacher-import-file" className="proc-btn" aria-disabled={busy}>{fileName ? 'Choose another file' : 'Choose file'}</label>
          </div>
          {reading && <Pending label="Checking spreadsheet…" />}
        </section>
      </div>
      {error && <ErrorMessage error={error} />}
      {preview && <section className="teacher-panel" aria-labelledby="teacher-import-preview">
        <div className="teacher-section-bar">
          <h2 id="teacher-import-preview">Review spreadsheet</h2>
          <button className="proc-btn proc-primary" type="button" disabled={!count || busy}
            onClick={() => setConfirm(true)}>Import {readyLabel}</button>
        </div>
        <RowIssues issues={preview.issues} />
        <DataTable label="Teacher spreadsheet preview" columns={teacherColumns} rows={preview.teachers.slice(0, 10)} id={(row) => row.number}
          empty={<p className="teacher-note">Correct the listed errors and upload the file again.</p>} />
        {count > 10 && <p className="teacher-note mt-2">Showing the first 10 of {count} valid rows.</p>}
      </section>}
      {result && <section className="teacher-panel" aria-labelledby="teacher-import-result" aria-live="polite">
        <div className="teacher-section-bar">
          <h2 id="teacher-import-result" className="teacher-section-title">
            {result.count > 0 ? <>
              <CheckCircle2 size={17} /> {result.count} {result.count === 1 ? 'teacher' : 'teachers'} imported
            </> : <><AlertCircle size={17} /> No teachers imported</>}
          </h2>
          {result.count > 0 && <Link className="proc-btn" to={ROUTES.TEACHERS.LIST}>View teachers</Link>}
        </div>
        <RowIssues issues={result.issues} />
      </section>}
    </>}
    {confirm && <ConfirmationBox heading="Confirm teacher import"
      confirmationMessage={'Import ' + readyLabel + ' and create their login accounts? Rows with errors will be skipped.'}
      leftButtonName="Cancel" rightButtonName={importing ? 'Importing…' : 'Import teachers'}
      onLeftButtonClick={() => setConfirm(false)} onRightButtonClick={importTeachers} />}
  </main>;
}
