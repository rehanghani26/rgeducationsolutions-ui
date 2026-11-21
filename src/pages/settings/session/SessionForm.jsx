import { useEffect, useRef, useState } from 'react';
import ConfirmationBox from '../../../components/ui/ConfirmationBox.jsx';
import { Input, SwitchInput, TextareaInput } from '../../../components/ui/FormControls.jsx';
import { ErrorMessage } from '../../../components/ui/ProcurementUI.jsx';
import api from '../../../services/api.js';
import { recordId } from '../../../utils/procurement.js';
import {
  addSessionDays, formatSessionRange, sessionDraft, sessionNeighbors, sessionPath, upcomingDateChanges,
} from './sessionValues.js';

function DateAdjustments({ changes }) {
  if (!changes.length) return null;
  return <div className="space-y-2">
    <p className="text-sm font-medium">Upcoming dates after saving</p>
    <ul className="session-preview-rows" aria-label="Upcoming dates after saving">
      {changes.map((item) => (
        <li key={recordId(item)}>
          <span className="font-semibold">{item.sessionName}</span>
          <span>{formatSessionRange(item)}</span>
        </li>
      ))}
    </ul>
  </div>;
}

export default function SessionForm({ session, sessions, activeSession, busy, setBusy, onSaved, onCancel }) {
  const { previous, following } = sessionNeighbors(sessions, session);
  const [form, setForm] = useState(() => ({
    ...sessionDraft(session, previous, sessions),
    isCurrent: !activeSession,
  }));
  const [error, setError] = useState(null);
  const [pendingSave, setPendingSave] = useState(null);
  const heading = useRef(null);
  const validDates = form.startDate && form.endDate > form.startDate;
  const changes = validDates ? upcomingDateChanges(following, form.endDate, activeSession) : [];

  useEffect(() => {
    heading.current?.focus();
  }, []);

  function change({ target: { name, value } }) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'startDate' && !session) {
        const oldDefaults = sessionDraft(null, null, sessions, current.startDate);
        const defaults = sessionDraft(null, null, sessions, value);
        if (!current.sessionName || current.sessionName === oldDefaults.sessionName) next.sessionName = defaults.sessionName;
        if (!current.endDate || current.endDate === oldDefaults.endDate) next.endDate = defaults.endDate;
      }
      return next;
    });
  }

  function requestSave(event) {
    event.preventDefault();
    if (busy || pendingSave) return;
    if (!form.sessionName.trim() || !validDates) {
      setError('Enter a session name and an end date after the start date.');
      return;
    }
    const values = { ...form };
    // Session edits preserve the current session selection.
    if (session) delete values.isCurrent;
    setError(null);
    setPendingSave({ values, changes });
  }

  async function confirmSave() {
    if (busy || !pendingSave) return;
    const id = recordId(session);
    setBusy(true);
    setError(null);
    try {
      const { values } = pendingSave;
      const { data } = id ? await api.put(sessionPath(id), values) : await api.post('/sessions', values);
      setPendingSave(null);
      onSaved(data.data?.session || data.session, data.data?.shiftedSessions || []);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="proc-panel proc-pad proc-form" onSubmit={requestSave}>
      <h2 ref={heading} tabIndex={-1} className="proc-title outline-none">
        {session ? 'Edit Session' : 'New Session'}
      </h2>
      <fieldset disabled={busy} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input required name="sessionName" label="Session Name" value={form.sessionName} onChange={change} placeholder="2026–2027" />
          <Input required name="startDate" label="Start Date" type="date" value={form.startDate} onChange={change}
            readOnly={Boolean(previous)} readOnlyDisplay
            hint={previous ? 'Starts the day after ' + previous.sessionName + ' ends.' : 'Choose the first day of this session.'} />
          <Input required name="endDate" label="End Date" type="date" min={addSessionDays(form.startDate, 1)} value={form.endDate} onChange={change}
            hint={session ? 'Change the last day to adjust this session. Upcoming dates follow automatically.' : 'Defaults to a full year. Choose a different last day if needed.'} />
        </div>
        <TextareaInput name="notes" label="Notes" rows={2} value={form.notes} onChange={change} />
        {!session && !activeSession && <SwitchInput label="Set as current session" checked={form.isCurrent}
          onChange={(event) => setForm((current) => ({ ...current, isCurrent: event.target.checked }))} />}
      </fieldset>
      <div aria-live="polite"><DateAdjustments changes={changes} /></div>
      {!pendingSave && <ErrorMessage error={error} />}
      <div className="proc-form-footer">
        <button type="button" className="proc-btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save Session'}
        </button>
      </div>
      {pendingSave && (
        <ConfirmationBox
          heading={session ? 'Save Session Changes' : 'Create Session'}
          confirmationMessage={(session ? 'Save ' : 'Create ') + pendingSave.values.sessionName
            + ' for ' + formatSessionRange(pendingSave.values)
            + (pendingSave.values.isCurrent ? ' as the current session.' : '.')}
          leftButtonName="Cancel"
          rightButtonName={busy ? 'Saving…' : session ? 'Save Changes' : 'Create Session'}
          leftButtonDisabled={busy}
          rightButtonDisabled={busy}
          onLeftButtonClick={() => setPendingSave(null)}
          onRightButtonClick={confirmSave}
        >
          <div className="text-slate-800"><DateAdjustments changes={pendingSave.changes} /></div>
          <ErrorMessage error={error} />
        </ConfirmationBox>
      )}
    </form>
  );
}
