import { useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api.js';
import Modal from '../ui/Modal.jsx';
import FormInput from '../ui/FormInput.jsx';
import FormSelect from '../ui/FormSelect.jsx';
import FormTextarea from '../ui/FormTextarea.jsx';

function defaultEndDate(startDate) {
  if (!startDate) return '';
  const date = new Date(startDate + 'T00:00:00Z');
  if (Number.isNaN(date.getTime())) return '';
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

const blankForm = { sessionName: '', startDate: '', endDate: '', notes: '', startClassId: '', endClassId: '' };

export function AcademicSessionSetupForm({ onComplete }) {
  const fieldId = useId();
  const [form, setForm] = useState(blankForm);
  const [sessionId, setSessionId] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError('');
    api.get('/setup/academic-session').then(({ data }) => {
      if (!mounted) return;
      const { session, classes: catalog = [] } = data.data || {};
      const startDate = session?.startDate?.slice(0, 10) || '';
      setSessionId(session?._id || session?.id || '');
      setClasses(catalog.filter((grade) => Number.isFinite(grade.sortOrder)));
      setForm({
        ...blankForm,
        sessionName: session?.sessionName || '',
        startDate,
        endDate: session?.endDate?.slice(0, 10) || defaultEndDate(startDate),
        notes: session?.notes || '',
        startClassId: session?.startClassId || '',
        endClassId: session?.endClassId || '',
      });
    }).catch((cause) => {
      if (mounted) setLoadError(cause.response?.data?.message || 'Academic setup could not be loaded.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [retry]);

  const startIndex = classes.findIndex(({ id }) => id === form.startClassId);
  const endIndex = classes.findIndex(({ id }) => id === form.endClassId);
  const range = startIndex >= 0 && endIndex >= startIndex ? classes.slice(startIndex, endIndex + 1) : [];
  const classOptions = classes.map(({ id, name }) => ({ value: id, label: name }));

  const change = (event) => {
    const { name, value } = event.target;
    setError('');
    setForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name === 'startDate' && (!previous.endDate || previous.endDate === defaultEndDate(previous.startDate))) {
        next.endDate = defaultEndDate(value);
      }
      if (name === 'startClassId' && classes.findIndex(({ id }) => id === value) > endIndex) {
        next.endClassId = '';
      }
      return next;
    });
  };

  const apply = async (event) => {
    event.preventDefault();
    if (!range.length || !form.sessionName.trim() || !form.startDate || form.endDate <= form.startDate) {
      setError('Enter valid dates and select a class range.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/setup/academic-session', { ...form, ...(sessionId && { sessionId }) });
      toast.success('Academic session and curriculum saved.');
      onComplete?.(data.session || data.data?.session);
    } catch (cause) {
      setError(cause.response?.data?.message || 'Academic setup could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p role="status">Loading academic setup…</p>;
  if (loadError) {
    return <div className="space-y-2"><p role="alert">{loadError}</p>
      <button type="button" className="underline" onClick={() => setRetry((value) => value + 1)}>Retry</button></div>;
  }

  return (
    <form className="space-y-5" onSubmit={apply}>
      <FormInput id={fieldId + '-name'} label="Session Name" name="sessionName" value={form.sessionName}
        onChange={change} placeholder="2027-2028" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput id={fieldId + '-start'} label="Start Date" type="date" name="startDate" value={form.startDate}
          onChange={change} required />
        <FormInput id={fieldId + '-end'} label="End Date" type="date" name="endDate" value={form.endDate}
          onChange={change} required />
      </div>
      <FormTextarea id={fieldId + '-notes'} label="Description" name="notes" value={form.notes} onChange={change} rows={2} />
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100">Curriculum</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect id={fieldId + '-starting-class'} label="Starting Class" name="startClassId"
            value={form.startClassId} options={classOptions} onChange={change} required />
          <FormSelect id={fieldId + '-ending-class'} label="Ending Class" name="endClassId"
            value={form.endClassId} options={classOptions.slice(Math.max(0, startIndex))} onChange={change} required />
        </div>
        {range.length > 0 && (
          <div aria-live="polite" className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <p className="mb-1 text-xs font-semibold">Included classes</p>
            <p className="text-sm">{range.map(({ name }) => name).join(' → ')}</p>
          </div>
        )}
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Applying…' : 'Apply'}
        </button>
      </div>
    </form>
  );
}

export default function MandatorySchoolProfileModal({ isOpen, onComplete }) {
  if (!isOpen) return null;
  return (
    <Modal open title="Academic Session & Curriculum Setup"
      showCloseButton={false} closeOnOverlayClick={false} closeOnEsc={false} zIndex="z-[70]">
      <AcademicSessionSetupForm onComplete={onComplete} />
    </Modal>
  );
}
