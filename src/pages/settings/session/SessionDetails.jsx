import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, GraduationCap, LayoutGrid, MoveUpRight, Pencil, Trash2, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../../../components/ui/ProcurementUI.jsx';
import { useAcademicSession } from '../../../context/AcademicSessionContext.jsx';
import { useProcurementResource } from '../../../hooks/useProcurement.js';
import { ROUTES } from '../../../routes/routes.js';
import api from '../../../services/api.js';
import { getSessionBudget } from '../../../services/budgetService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { recordId } from '../../../utils/procurement.js';
import { SessionUpgrade } from './RolloverPanels.jsx';
import SessionForm from './SessionForm.jsx';
import StudentProgression from './StudentProgression.jsx';
import { formatSessionDate, sessionNeighbors, sessionPath } from './sessionValues.js';

export default function SessionDetails({
  session, sessions, activeSession, nextSession, canManage, canReadBudget,
  busy, setBusy, onChanged, onDeleted, onUpgraded,
}) {
  const [view, setView] = useState('details');
  const [error, setError] = useState(null);
  const id = recordId(session);
  const loadBudget = useCallback(() => getSessionBudget(id), [id]);
  const budget = useProcurementResource(loadBudget, canReadBudget);
  const { schoolClasses } = useAcademicSession();
  const editable = canManage && session.group !== 'previous';
  const upcoming = session.group === 'upcoming';
  const canUpgrade = canManage && (session.isCurrent || (upcoming && id === recordId(nextSession)));
  const canShowStudents = canManage && session.isCurrent;

  function open(next) {
    setError(null);
    setView((current) => current === next ? 'details' : next);
  }

  async function activate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.patch(sessionPath(id) + '/activate');
      onChanged(data.data?.session || data.session);
      toast.success('Current session updated.');
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const { previous, following } = sessionNeighbors(sessions, session);
    const adjustment = previous && following.length ? ' Later upcoming sessions will move to keep the dates consecutive.' : '';
    if (busy || !window.confirm(`Delete the upcoming session "${session.sessionName}"?` + adjustment)) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await api.delete(sessionPath(id));
      onDeleted(id, data.data?.shiftedSessions);
      toast.success('Session deleted.');
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }

  if (view === 'edit') {
    return <div className="proc-pad">
      <SessionForm session={session} sessions={sessions} activeSession={activeSession}
        busy={busy} setBusy={setBusy} onCancel={() => setView('details')}
        onSaved={(saved, shifted) => {
          setView('details');
          onChanged(saved, shifted);
          toast.success(shifted.length ? 'Session saved and upcoming dates updated.' : 'Session saved.');
        }} />
    </div>;
  }

  return (
    <section className="proc-pad proc-stack" aria-label={session.sessionName + ' session details'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="proc-title">Session Details</h2>
        <div className="proc-actions">
          {editable && <button type="button" className="proc-btn" onClick={() => open('edit')} disabled={busy}>
            <Pencil size={15} /> Edit
          </button>}
          {editable && upcoming && !activeSession && schoolClasses.classRange && (
            <button type="button" className="proc-btn proc-primary" onClick={activate} disabled={busy}>Set Current</button>
          )}
          {canUpgrade && <button type="button" className="proc-btn proc-primary" aria-expanded={view === 'upgrade'}
            onClick={() => open('upgrade')} disabled={busy}>
            <MoveUpRight size={15} /> Upgrade Session
          </button>}
        </div>
      </div>
      <dl className="session-detail-grid">
        {[
          ['Start Date', formatSessionDate(session.startDate)],
          ['End Date', formatSessionDate(session.endDate)],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {session.notes && (
        <div className="min-w-0 text-sm">
          <h3 className="font-semibold">Notes</h3>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[var(--text-secondary)]">{session.notes}</p>
        </div>
      )}
      <ErrorMessage error={error} />
      <div className="proc-actions">
        {canReadBudget && (
          <Link className="proc-btn proc-btn-sm flex-wrap" to={ROUTES.BUDGET + '?session=' + encodeURIComponent(id)}>
            <Wallet size={14} /> Salary Budget
            {budget.data && <>
              <strong>{formatCurrency(budget.data.salaryBudget)}</strong>
              <span className="text-[var(--text-secondary)]">{formatCurrency(budget.data.salarySpent)} spent</span>
            </>}
          </Link>
        )}
        {session.isCurrent && <>
          <Link className="proc-btn proc-btn-sm" to="/settings/master-period"><Bell size={14} /> Bell Schedule</Link>
          <Link className="proc-btn proc-btn-sm" to="/settings/class-timetable"><LayoutGrid size={14} /> Class Timetable</Link>
        </>}
        {canShowStudents && <button type="button" className="proc-btn proc-btn-sm" aria-expanded={view === 'students'}
          onClick={() => open('students')} disabled={busy}>
          <GraduationCap size={15} /> Student Progression
        </button>}
        {editable && upcoming && !session.previousSessionId && (
          <button type="button" className="proc-btn proc-btn-sm proc-danger" onClick={remove} disabled={busy}>
            <Trash2 size={14} /> Delete Session
          </button>
        )}
      </div>
      {canUpgrade && view === 'upgrade' && (
        <SessionUpgrade source={activeSession} targetId={upcoming ? id : undefined} busy={busy} setBusy={setBusy}
          onCancel={() => setView('details')} onFinished={onUpgraded} />
      )}
      {canShowStudents && view === 'students' && (
        <StudentProgression session={session} sessions={sessions} busy={busy} setBusy={setBusy} />
      )}
    </section>
  );
}
