import { useCallback, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { CheckboxInput, SelectInput } from '../../../components/ui/FormControls.jsx';
import { DataTable, Empty, ErrorMessage, Pagination, Pending, SearchField } from '../../../components/ui/ProcurementUI.jsx';
import { useAcademicSession } from '../../../context/AcademicSessionContext.jsx';
import { useDebouncedSearch, useProcurementResource } from '../../../hooks/useProcurement.js';
import api from '../../../services/api.js';
import { recordId } from '../../../utils/procurement.js';
export default function StudentProgression({ session, sessions, busy, setBusy }) {
  const { schoolClasses } = useAcademicSession();
  const configured = Boolean(schoolClasses.classRange);
  const scope = '?sessionId=' + (configured ? encodeURIComponent(recordId(session)) : '');
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [target, setTarget] = useState(session.sessionName);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const query = useDebouncedSearch(search);

  const loadStudents = useCallback(async () => {
    const { data } = await api.get('/students' + scope, {
      params: { page, search: query, className: grade || undefined },
    });
    return { students: data.students || data.data || [], pagination: data.pagination };
  }, [grade, page, query, scope]);

  const loadPromotionStatus = useCallback(async () => {
    const { data } = await api.get('/students/promotion-status' + scope);
    return data.canRollback;
  }, [scope]);

  const roster = useProcurementResource(loadStudents);
  const rollback = useProcurementResource(loadPromotionStatus, !configured);
  const students = roster.data?.students || [];
  const grades = schoolClasses.classes;
  const visibleSelection = students.map(recordId).filter((id) => selected.includes(id));
  const allSelected = students.length > 0 && visibleSelection.length === students.length;
  const filtersPending = search.trim() !== query;

  async function promote(action, studentIds) {
    if (busy || filtersPending || !studentIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post('/students/promote' + scope, {
        mode: 'individual',
        action,
        sourceClass: grade,
        studentIds,
        targetSession: configured ? session.sessionName : target,
      });
      const count = data.updatedCount;
      if (count) toast.success(`${count} ${count === 1 ? 'student' : 'students'} ${action === 'promote' ? 'promoted' : 'demoted'}.`);
      else toast.info('No selected students were eligible for this move.');
      setSelected([]);
      setPage(1);
      roster.refresh();
      if (!configured) rollback.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  async function undoPromotion() {
    if (busy || !window.confirm('Undo student promotions made in the last 24 hours?')) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post('/students/rollback-promotion' + scope, { maxHours: 24 });
      toast.success(`${data.revertedCount} student records restored.`);
      setSelected([]);
      setPage(1);
      roster.refresh();
      rollback.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      key: 'selection',
      label: <CheckboxInput aria-label="Select all students on this page" checked={allSelected}
        indeterminate={visibleSelection.length > 0 && !allSelected} disabled={busy || filtersPending || !students.length}
        onChange={() => setSelected(allSelected ? [] : students.map(recordId))} />,
      render: (student) => {
        const id = recordId(student);
        return <CheckboxInput aria-label={'Select ' + student.name} checked={selected.includes(id)} disabled={busy || filtersPending}
          onChange={() => setSelected((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id])} />;
      },
    },
    { key: 'name', label: 'Student', full: true, render: (student) => <><strong>{student.name}</strong><small>{student.admissionNumber || '—'}</small></> },
    { key: 'className', label: 'Class', render: (student) => student.className || student.class || '—' },
    { key: 'status', label: 'Status', render: (student) => <span className="capitalize">{student.status || '—'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (student) => <div className="proc-actions">
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => promote('promote', [recordId(student)])} disabled={busy || filtersPending}>Promote</button>
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => promote('demote', [recordId(student)])} disabled={busy || filtersPending}>Demote</button>
      </div>,
    },
  ];

  return (
    <section className="proc-panel proc-pad proc-stack" aria-label="Student progression">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="proc-title">Student Progression</h3>
        {rollback.data && !configured && (
          <button type="button" className="proc-btn proc-btn-sm" onClick={undoPromotion} disabled={busy}>
            <RotateCcw size={14} /> Undo Recent Promotion
          </button>
        )}
      </div>
      <fieldset disabled={busy} className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SelectInput label="Class" value={grade} showPlaceholder={false}
          options={[{ value: '', label: 'All Classes' }, ...grades.map((item) => ({ value: item.name, label: item.name }))]}
          onChange={({ target }) => { setGrade(target.value); setPage(1); setSelected([]); }} />
        {!configured && <SelectInput label="Target Session" value={target} showPlaceholder={false}
          options={sessions.map((item) => ({ value: item.sessionName, label: item.sessionName }))}
          onChange={(event) => setTarget(event.target.value)} />}
        <SearchField label="Search students" value={search}
          onChange={(value) => { setSearch(value); setPage(1); setSelected([]); }} />
      </fieldset>
      {visibleSelection.length > 0 && <div className="proc-actions">
        <span className="mr-1 text-xs font-semibold">{visibleSelection.length} selected</span>
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => promote('promote', visibleSelection)} disabled={busy || filtersPending}>
          <ArrowUpRight size={14} /> Promote Selected
        </button>
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => promote('demote', visibleSelection)} disabled={busy || filtersPending}>
          <ArrowDownRight size={14} /> Demote Selected
        </button>
      </div>}
      {busy && <p className="proc-hint" role="status">Updating student records…</p>}
      <ErrorMessage error={error} />
      <ErrorMessage error={roster.error} onRetry={roster.refresh} />
      {roster.loading && <Pending label="Loading students" />}
      {roster.data && <>
        <DataTable label="Students in the current session" rows={students} columns={columns}
          empty={<Empty title="No students found" />} />
        <Pagination pagination={roster.data.pagination} onPage={(next) => { if (!busy) { setPage(next); setSelected([]); } }} />
      </>}
    </section>
  );
}
