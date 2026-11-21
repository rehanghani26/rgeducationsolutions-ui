import { useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationBox from '../../../components/ui/ConfirmationBox.jsx';
import { SelectInput } from '../../../components/ui/FormControls.jsx';
import { ErrorMessage } from '../../../components/ui/ProcurementUI.jsx';
import { useAcademicSession } from '../../../context/AcademicSessionContext.jsx';
import { useProcurementResource } from '../../../hooks/useProcurement.js';
import api from '../../../services/api.js';

async function getClassMaster() {
  const { data } = await api.get('/erp/class-master');
  return (data.data?.classes || data.classes).filter((grade) => Number.isFinite(grade.sortOrder));
}

function RangeForm({ busy, setBusy, onClose, refresh }) {
  const master = useProcurementResource(getClassMaster);
  const [startClassId, setStart] = useState('');
  const [endClassId, setEnd] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(null);
  const classes = master.data || [];
  const first = classes.findIndex((grade) => grade.id === startClassId);
  const last = classes.findIndex((grade) => grade.id === endClassId);
  const range = first >= 0 && last >= first ? classes.slice(first, last + 1) : [];
  const options = classes.map((grade) => ({ value: grade.id, label: grade.name }));

  async function save() {
    if (busy || !range.length) return;
    setBusy(true);
    setError(null);
    try {
      await api.put('/erp/school-class-range', { startClassId, endClassId });
      await refresh();
      onClose();
      toast.success('School classes configured.');
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="proc-form border-t border-[var(--border-color)] pt-3" onSubmit={(event) => {
      event.preventDefault();
      if (range.length) setConfirm(true);
    }}>
      <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
        <SelectInput required label="Starting Class" name="startClassId" value={startClassId} options={options}
          onChange={(event) => setStart(event.target.value)} disabled={!classes.length} />
        <SelectInput required label="Ending Class" name="endClassId" value={endClassId} options={options}
          onChange={(event) => setEnd(event.target.value)} disabled={!classes.length} />
      </fieldset>
      {master.loading && <p className="proc-hint" role="status">Loading Class Master…</p>}
      <ErrorMessage error={master.error} onRetry={master.refresh} />
      {startClassId && endClassId && !range.length && <ErrorMessage error="Choose an Ending Class at or after the Starting Class." />}
      {range.length > 0 && <div className="flex flex-wrap gap-1.5" aria-label="Classes in the school range">
        {range.map((grade) => <span key={grade.id} className="session-class-chip">{grade.name}</span>)}
      </div>}
      <div className="proc-actions justify-end">
        <button type="button" className="proc-btn" disabled={busy} onClick={onClose}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={busy || !range.length}>Save School Classes</button>
      </div>
      {confirm && <ConfirmationBox
        heading="Set School Classes"
        confirmationMessage={`Set ${range[0].name} through ${range.at(-1).name} as the one-time class range for all academic sessions?`}
        leftButtonName="Cancel"
        rightButtonName={busy ? 'Saving…' : 'Confirm School Classes'}
        leftButtonDisabled={busy}
        rightButtonDisabled={busy}
        onLeftButtonClick={() => setConfirm(false)}
        onRightButtonClick={save}
      >
        <ErrorMessage error={error} />
      </ConfirmationBox>}
    </form>
  );
}

export default function SchoolClasses({ canManage, open, busy, setBusy, onOpen, onClose }) {
  const { schoolClasses, refreshSchoolClasses } = useAcademicSession();
  const { classes, classRange, loading, error } = schoolClasses;
  const [showClasses, setShowClasses] = useState(false);
  const range = classRange && classes.length
    ? classes[0].name + ' – ' + classes.at(-1).name
    : 'Set the range for all sessions';

  return (
    <section className="session-side-card session-school-classes" aria-label="School Classes">
      <div className="session-side-card-row">
        <span className="session-side-icon"><GraduationCap size={19} aria-hidden="true" /></span>
        <div className="session-side-card-text">
          <h2>School Classes</h2>
          {loading ? <p role="status">Loading classes…</p> : !error && <p>{range}</p>}
        </div>
        {classRange && classes.length > 0 && (
          <button type="button" className="session-icon-button session-classes-toggle"
            aria-label={showClasses ? 'Hide school classes' : 'View school classes'}
            aria-expanded={showClasses} aria-controls="session-school-class-list" onClick={() => setShowClasses((visible) => !visible)}>
            <ChevronDown size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      {!classRange && !loading && !error && canManage && !open && (
        <button type="button" className="proc-btn proc-btn-sm" onClick={onOpen} disabled={busy}>Set School Classes</button>
      )}
      {classRange && classes.length > 0 && (
        <ul id="session-school-class-list" className="session-school-class-list" hidden={!showClasses}>
          {classes.map((grade) => <li key={grade.id} className="session-class-chip">{grade.name}</li>)}
        </ul>
      )}
      <ErrorMessage error={error} onRetry={refreshSchoolClasses} />
      {!classRange && canManage && open && <RangeForm busy={busy} setBusy={setBusy} onClose={onClose} refresh={refreshSchoolClasses} />}
    </section>
  );
}
