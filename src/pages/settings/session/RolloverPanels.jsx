import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarClock, MoveUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Input, SwitchInput } from '../../../components/ui/FormControls.jsx';
import { ErrorMessage, Pending } from '../../../components/ui/ProcurementUI.jsx';
import { useProcurementResource } from '../../../hooks/useProcurement.js';
import api from '../../../services/api.js';
import { recordId } from '../../../utils/procurement.js';
import { formatSessionDate, sessionPath } from './sessionValues.js';

export async function getRolloverSettings() {
  const { data } = await api.get('/sessions/rollover-settings');
  return data.data;
}

export function RolloverSettingsForm({ settings, busy, setBusy, onSaved, onCancel }) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState(null);
  const heading = useRef(null);
  const update = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }));

  useEffect(() => {
    heading.current?.focus();
  }, []);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.put('/sessions/rollover-settings', form);
      toast.success('Rollover settings saved.');
      onSaved();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="proc-panel proc-pad proc-form">
      <div className="proc-heading">
        <span className="proc-icon"><CalendarClock size={17} /></span>
        <h2 ref={heading} tabIndex={-1} className="outline-none">Student Rollover Settings</h2>
      </div>
      <fieldset disabled={busy} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input required name="timeZone" label="School time zone" value={form.timeZone} onChange={update} />
          <Input required name="prepareTime" type="time" label="Preparation time on the final day"
            value={form.prepareTime} onChange={update} />
          <Input required name="cutoffTime" type="time" label="Upgrade time on the first day"
            value={form.cutoffTime} onChange={update} />
        </div>
        <SwitchInput label="Enable automatic promotion" description="Run eligible upgrades at the scheduled time."
          checked={form.autoPromote} onChange={(event) => setForm({ ...form, autoPromote: event.target.checked })} />
      </fieldset>
      <ErrorMessage error={error} />
      <div className="proc-form-footer">
        <button type="button" className="proc-btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Rollover Settings'}</button>
      </div>
    </form>
  );
}

export function SessionUpgrade({ source, targetId, busy, setBusy, onFinished, onCancel }) {
  const path = sessionPath(recordId(source)) + '/rollover';
  const loadPreview = useCallback(async () => {
    const { data } = await api.get(path + '/preview');
    return data.data;
  }, [path]);
  const preview = useProcurementResource(loadPreview);
  const plan = preview.data;
  const rows = plan?.rows || [];
  const issues = plan?.issues || [];
  const mismatchedTarget = targetId && plan?.target && recordId(plan.target) !== targetId;
  const approved = plan?.version && !plan.due && plan.execution?.status === 'pending' && plan.execution?.planVersion === plan.version;
  const [error, setError] = useState(null);
  const heading = useRef(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  async function confirm() {
    if (busy || !plan?.version || issues.length || mismatchedTarget || approved) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.post(path, { planVersion: plan.version });
      const execution = data.data;
      if (execution.status === 'completed') {
        toast.success(`${execution.promotedCount} promoted, ${execution.passoutCount} Passout.`);
        onFinished(recordId(plan.target));
      } else {
        toast.success('Approval recorded. The upgrade will run at the scheduled time.');
        preview.refresh();
      }
    } catch (error) {
      setError(error);
      preview.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proc-panel proc-pad proc-stack" aria-label="Upgrade preview">
      <div className="proc-heading">
        <span className="proc-icon"><MoveUpRight size={17} /></span>
        <h3 ref={heading} tabIndex={-1} className="proc-title outline-none">Upgrade Session</h3>
      </div>
      {preview.loading && <Pending label="Loading upgrade preview" />}
      <ErrorMessage error={preview.error} onRetry={preview.refresh} />
      <ErrorMessage error={error || plan?.execution?.error} />
      {mismatchedTarget ? <p className="proc-hint">The next session is {plan.target.sessionName}. Open that session to review the upgrade.</p> : (
        <>
          {plan?.message && <p className="text-sm">{plan.message}</p>}
          {plan && !plan.source?.isCurrent && <p className="text-sm">The source session has closed. Refresh the sessions list to view the current session.</p>}
          {plan?.target && plan.version && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span>{plan.source.sessionName}</span><ArrowRight size={15} aria-hidden="true" /><span>{plan.target.sessionName}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="session-class-chip">{rows.filter((row) => row.action === 'promoted').length} to promote</span>
                <span className="session-class-chip">{rows.filter((row) => row.action === 'passout').length} Passout</span>
              </div>
              {!plan.due && (
                <p className="text-sm" role={approved ? 'status' : undefined}>
                  {approved ? 'Upgrade approved for ' : plan.settings.autoPromote ? 'Upgrade scheduled for ' : 'Earliest upgrade '}
                  {formatSessionDate(plan.target.startDate)} at {plan.settings.cutoffTime} ({plan.settings.timeZone}).
                </p>
              )}
              {rows.length > 0 && (
                <ul className="session-preview-rows" aria-label="Student placements">
                  {rows.map((row) => (
                    <li key={row.studentId}>
                      <span className="font-medium">{row.name}</span>
                      <span>{row.fromClass} → {row.toClass}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {issues.length > 0 && (
            <div className="proc-danger text-sm" role="alert">
              <p className="font-semibold">Resolve these enrollments before upgrading.</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {issues.map((issue) => <li key={issue.studentId}>{issue.name} · {issue.reason}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
      <div className="proc-form-footer">
        <button type="button" className="proc-btn" onClick={onCancel} disabled={busy}>{approved ? 'Done' : 'Cancel'}</button>
        {plan?.version && !mismatchedTarget && !approved && (
          <button type="button" className="proc-btn proc-primary" onClick={confirm} disabled={busy || issues.length > 0}>
            {busy ? 'Saving…' : plan.due ? 'Confirm Upgrade' : 'Approve Scheduled Upgrade'}
          </button>
        )}
      </div>
    </section>
  );
}
