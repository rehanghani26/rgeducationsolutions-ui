import { useEffect, useId, useState } from 'react';
import ReactSelect from '../ui/ReactSelect.jsx';
import { FieldLabel } from '../ui/FormControls.jsx';
import { getStudents } from '../../services/studentService.js';

const PAGE_SIZE = 20;
const empty = [];

async function loadStudentList({ search, page, limit, sessionId, signal }) {
  return getStudents({ search, page, limit, sessionId, status: 'active' }, { signal, localErrorUi: true });
}

function toOption(student) {
  return {
    value: String(student.studentId || student._id || student.id),
    label: [student.studentName || student.name, student.admissionNumber, student.className, student.sectionName].filter(Boolean).join(' · '),
    studentId: String(student.studentId || student._id || student.id),
    studentName: student.studentName || student.name,
    admissionNumber: student.admissionNumber,
  };
}

/** Controlled picker. A scoped loader can replace the Student directory and return the same { students, pagination } shape. */
export default function StudentDropdown({
  value, onChange, sessionId, loadStudents = loadStudentList, excludeIds = empty, disabled = false, label = 'Student',
}) {
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open || disabled) return undefined;
    const request = new AbortController();
    loadStudents({ search: query, page, limit: PAGE_SIZE, sessionId, signal: request.signal })
      .then(({ students, pagination }) => {
        if (request.signal.aborted) return;
        setResult((previous) => ({
          query, page, sessionId, loadStudents, pages: pagination.pages,
          options: [
            ...(page > 1 && previous?.query === query && previous?.loadStudents === loadStudents ? previous.options : []),
            ...students.map(toOption),
          ],
        }));
      })
      .catch(() => {
        if (!request.signal.aborted) setResult({ query, page, sessionId, loadStudents, error: true, options: [] });
      });
    return () => request.abort();
  }, [open, disabled, query, page, loadStudents, sessionId]);

  const current = result?.query === query && result?.sessionId === sessionId && result?.loadStudents === loadStudents ? result : null;
  const loading = open && (current?.page !== page || search.trim() !== query);
  const excluded = new Set(excludeIds.map(String));
  const options = (current?.options || empty).filter(({ value }) => !excluded.has(value));
  const more = Boolean(current && current.pages > page);

  return <div className="form-field min-w-0">
    <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
    <ReactSelect id={fieldId} isDisabled={disabled} isLoading={loading} isClearable filterOption={null}
      value={value ? toOption(value) : null} inputValue={search} options={options}
      placeholder="Search name or admission no."
      loadingMessage={() => 'Searching students…'}
      noOptionsMessage={() => current?.error ? 'Unable to load students. Reopen to retry.' : 'No matching students'}
      onMenuOpen={() => { setPage(1); setOpen(true); }}
      onMenuClose={() => { setOpen(false); setSearch(''); }}
      onInputChange={(input, { action }) => { if (action === 'input-change') setSearch(input); }}
      onMenuScrollToBottom={() => { if (more && !loading) setPage(page + 1); }}
      onChange={(option) => onChange(option ? {
        studentId: option.studentId, studentName: option.studentName, admissionNumber: option.admissionNumber,
      } : null)}
    />
    {open && more && !loading && options.length < 6 && (
      <button type="button" className="form-hint text-left underline"
        onMouseDown={(event) => event.preventDefault()} onClick={() => setPage(page + 1)}>Load more students</button>
    )}
  </div>;
}
