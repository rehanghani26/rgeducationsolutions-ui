import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { AlertCircle, CalendarDays, CalendarClock, ChevronDown, HelpCircle, Plus, Settings2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Table from '../../components/Table/Table.jsx';
import { ErrorMessage, Pending } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import api from '../../services/api.js';
import { getAcademicSessions } from '../../services/budgetService.js';
import { dateInput, recordId } from '../../utils/procurement.js';
import { getRolloverSettings, RolloverSettingsForm } from './session/RolloverPanels.jsx';
import SchoolClasses from './session/SchoolClasses.jsx';
import SessionDetails from './session/SessionDetails.jsx';
import SessionForm from './session/SessionForm.jsx';
import SessionTimeline from './session/SessionTimeline.jsx';
import {
  formatSessionDate, formatSessionRange, nextSessionFor, scheduleBreak, sessionNeighbors, SESSION_STATUS, sessionStatus,
} from './session/sessionValues.js';
import './session/sessionManagement.css';

const permissions = ['super-admin', 'school-admin', 'principal', 'admin'];
const statusOrder = Object.keys(SESSION_STATUS);
const filters = { all: 'All Sessions', ...SESSION_STATUS };

export default function SessionManagementSettings() {
  const [list, setList] = useState({ sessions: [], loading: true, error: null });
  const [request, setRequest] = useState(0);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState('');
  const [panel, setPanel] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { refresh: refreshSessionChoices, schoolClasses } = useAcademicSession();
  const canManage = useSelector((state) => permissions.includes(getUserRole(state.auth?.user)));
  const { canReadBudget } = useProcurementAccess();
  const rollover = useProcurementResource(getRolloverSettings, canManage);
  const { sessions, loading, error } = list;
  const activeSession = sessions.find((session) => session.isCurrent);
  const nextSession = nextSessionFor(activeSession, sessions);
  const dateIssue = scheduleBreak(sessions, activeSession);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        let schedule = await getAcademicSessions();
        if (controller.signal.aborted) return;
        const current = schedule.find((item) => item.isCurrent);
        if (canManage && current && !sessionNeighbors(schedule, current).following.length) {
          setList({ sessions: schedule, loading: true, error: null });
          const { data } = await api.post('/sessions/upcoming', {}, { signal: controller.signal });
          if (controller.signal.aborted) return;
          schedule = data.data.sessions;
          refreshSessionChoices().catch(() => {});
        }
        setList({ sessions: schedule, loading: false, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setList((previous) => ({ ...previous, loading: false, error }));
      }
    }
    void load();
    return () => controller.abort();
  }, [request, canManage, refreshSessionChoices]);

  const rows = useMemo(() => sessions.map((session) => ({
    ...session,
    id: recordId(session),
    group: sessionStatus(session, activeSession),
  })).sort((left, right) => {
    const order = statusOrder.indexOf(left.group) - statusOrder.indexOf(right.group);
    const byDate = dateInput(left.startDate).localeCompare(dateInput(right.startDate));
    return order || (left.group === 'upcoming' ? byDate : -byDate);
  }), [sessions, activeSession]);
  const upcoming = rows.find((row) => row.group === 'upcoming'
    && (!activeSession || dateInput(row.startDate) >= dateInput(activeSession.startDate)));
  const formSession = { 'current-dates': activeSession, 'upcoming-dates': upcoming, dates: dateIssue?.session }[panel];
  const showDateForm = canManage && (panel === 'new' || Boolean(formSession));
  const visibleRows = filter === 'all' ? rows : rows.filter((row) => row.group === filter);
  const openedRow = visibleRows.find((row) => row.id === openId);
  const rolloverMode = rollover.data ? (rollover.data.autoPromote ? 'Automatic' : 'Approval required')
    : rollover.error ? 'Settings unavailable' : 'Loading settings…';

  function reload() {
    setList((previous) => ({ ...previous, loading: true, error: null }));
    setRequest((value) => value + 1);
  }

  function syncSessions() {
    reload();
    refreshSessionChoices().catch(() => {});
  }

  function selectFilter(key) {
    setFilter(key);
    setOpenId('');
  }

  function toggleRow(row) {
    if (busy) return;
    setPanel(null);
    setOpenId((id) => id === row.id ? '' : row.id);
  }

  function togglePanel(name) {
    setOpenId('');
    setPanel((previous) => previous === name ? null : name);
  }

  function sessionChanged(saved, shifted = []) {
    if (saved) {
      const id = recordId(saved);
      const changed = [...shifted, saved];
      const changedIds = new Set(changed.map(recordId));
      setList((previous) => ({
        ...previous,
        sessions: [...previous.sessions.filter((session) => !changedIds.has(recordId(session))), ...changed],
      }));
      setOpenId(id);
      if (filter !== 'all' && filter !== sessionStatus(saved, activeSession)) setFilter('all');
    }
    setPanel(null);
    syncSessions();
  }

  function sessionDeleted(id, shifted = []) {
    const affected = new Set([id, ...shifted.map(recordId)]);
    setList((previous) => ({
      ...previous, sessions: [...previous.sessions.filter((session) => !affected.has(recordId(session))), ...shifted],
    }));
    setOpenId('');
    syncSessions();
  }

  function sessionUpgraded(id) {
    setFilter('all');
    setOpenId(id);
    syncSessions();
  }

  const columns = [
    {
      key: 'session',
      headData: 'Session',
      showOnMobile: true,
      bodyData: (session) => <div className="min-w-0">
        <span className="block truncate font-semibold" title={session.sessionName}>{session.sessionName}</span>
        <span className="mt-0.5 block whitespace-normal text-xs text-[var(--text-secondary)] md:hidden">{formatSessionRange(session)}</span>
      </div>,
    },
    {
      key: 'dates',
      headData: 'Date Range',
      showOnMobile: false,
      bodyData: (session) => <span className="whitespace-normal text-[var(--text-secondary)]">{formatSessionRange(session)}</span>,
    },
    {
      key: 'status',
      headData: 'Status',
      showOnMobile: true,
      bodyData: (session) => <span className={'proc-status session-status-' + session.group}>{SESSION_STATUS[session.group]}</span>,
    },
    {
      key: 'details',
      headData: <span className="sr-only">Details</span>,
      showOnMobile: true,
      bodyData: (session) => {
        const expanded = openId === session.id;
        return <button type="button" className="proc-btn proc-btn-sm session-row-disclosure" disabled={busy}
          aria-label={`${expanded ? 'Hide' : 'View'} ${session.sessionName} session details`}
          aria-expanded={expanded} aria-controls={expanded ? 'session-details-' + session.id : undefined}
          onClick={() => toggleRow(session)}>
          <span className="hidden md:inline">Details</span><ChevronDown size={15} aria-hidden="true" />
        </button>;
      },
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <section className="session-directory" aria-labelledby="academic-session-list">
        <header className="session-page-header">
          <div className="session-page-heading">
            <span className="session-page-icon" aria-hidden="true"><CalendarDays size={23} /></span>
            <h1 id="academic-session-list">Academic Sessions</h1>
          </div>
          <div className="proc-actions">
            <button type="button" className="proc-btn session-help-button" onClick={() => setHelpOpen((open) => !open)} disabled={busy}
              aria-expanded={helpOpen} aria-controls={helpOpen ? 'session-guide' : undefined}>
              <HelpCircle size={16} aria-hidden="true" /> How it works
            </button>
            {canManage && (
              <button type="button" className="proc-btn proc-primary" onClick={() => togglePanel('new')}
                disabled={busy || !schoolClasses.classRange || loading || Boolean(error)}
                aria-expanded={panel === 'new'} aria-controls={panel === 'new' ? 'session-date-form' : undefined}>
                <Plus size={16} aria-hidden="true" /> New Session
              </button>
            )}
          </div>
        </header>

        {helpOpen && (
          <section className="session-guide" id="session-guide" aria-label="How academic sessions work">
            <p>Each academic session groups the school year’s enrollments, attendance, and results.</p>
            <p>The next session is created automatically. It starts the day after the current session ends and runs for one year by default. Changing an end date moves upcoming dates while keeping each session’s planned length.</p>
            <p>Student rollover settings control how students move to the next session. Use New Session to plan additional years.</p>
          </section>
        )}

        <div className="session-overview">
          <SessionTimeline current={activeSession} upcoming={upcoming} busy={busy} loading={loading}
            panel={panel} onEdit={canManage ? togglePanel : undefined} />
          <div className="session-overview-controls">
            <SchoolClasses canManage={canManage} open={panel === 'classes'} busy={busy} setBusy={setBusy}
              onOpen={() => togglePanel('classes')} onClose={() => setPanel(null)} />
            {canManage && (
              <section className="session-side-card" aria-label="Student Rollover">
                <div className="session-side-card-row">
                  <span className="session-side-icon"><CalendarClock size={19} aria-hidden="true" /></span>
                  <div className="session-side-card-text"><h2>Student Rollover</h2><p>{rolloverMode}</p></div>
                  <button type="button" className="session-icon-button" onClick={() => togglePanel('automatic')} disabled={busy}
                    title="Rollover settings" aria-label="Rollover settings"
                    aria-expanded={panel === 'automatic'} aria-controls={panel === 'automatic' ? 'automatic-rollover-panel' : undefined}>
                    <Settings2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {dateIssue && (
          <div className="session-date-notice">
            <p><AlertCircle size={17} aria-hidden="true" /><span><strong>Align session dates.</strong> {dateIssue.session.sessionName} should start on {formatSessionDate(dateIssue.expectedStart)} to follow {dateIssue.previous.sessionName}.</span></p>
            {canManage && <button type="button" className="proc-btn proc-btn-sm" disabled={busy || loading}
              aria-expanded={panel === 'dates'} aria-controls={panel === 'dates' ? 'session-date-form' : undefined}
              onClick={() => togglePanel('dates')}>Review Dates</button>}
          </div>
        )}

        {canManage && panel === 'automatic' && (
          <div id="automatic-rollover-panel">
            {rollover.loading && <Pending label="Loading rollover settings" />}
            <ErrorMessage error={rollover.error} onRetry={rollover.refresh} />
            {rollover.data && (
              <RolloverSettingsForm settings={rollover.data} busy={busy} setBusy={setBusy}
                onCancel={() => setPanel(null)} onSaved={() => { rollover.refresh(); setPanel(null); }} />
            )}
          </div>
        )}
        {showDateForm && (
          <div id="session-date-form">
            <SessionForm key={panel + ':' + recordId(formSession)} session={formSession}
              sessions={sessions} activeSession={activeSession} busy={busy} setBusy={setBusy} onCancel={() => setPanel(null)}
              onSaved={(saved, shifted) => {
                sessionChanged(saved, shifted);
                toast.success(panel === 'new' ? 'Session created.' : 'Session dates updated.');
              }} />
          </div>
        )}

        <ErrorMessage error={error} onRetry={reload} />
        <section className="session-list-panel proc-panel" aria-labelledby="session-schedule-title">
          <div className="session-list-header">
            <h2 id="session-schedule-title">Session Schedule</h2>
            <div className="session-filters" role="group" aria-label="Filter sessions by status">
              {Object.entries(filters).map(([key, label]) => (
                <button type="button" key={key} onClick={() => selectFilter(key)} aria-pressed={filter === key} disabled={busy}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Table
            className="session-table"
            tableLabel="Academic sessions"
            tableClassName="session-table-frame"
            tableHeadClassName="session-table-head"
            trClassname="session-table-row"
            showToolbar={false}
            tableLayout={columns}
            data={visibleRows}
            onRowClick={busy ? undefined : toggleRow}
            openedRow={openedRow ? [openedRow] : []}
            loadingTableContent={loading && !sessions.length}
            noRecordText={error && !sessions.length ? 'Sessions unavailable' : filter === 'all' ? 'No academic sessions yet' : 'No ' + filters[filter].toLowerCase() + ' sessions'}
            noRecordDescription={!error && !sessions.length && canManage ? 'Use New Session to set the dates for your first school year.' : ''}
            Collapse={(session) => (
              <div id={'session-details-' + session.id}>
                <SessionDetails session={session} sessions={sessions} activeSession={activeSession} nextSession={nextSession}
                  canManage={canManage} canReadBudget={canReadBudget} busy={busy} setBusy={setBusy}
                  onChanged={sessionChanged} onDeleted={sessionDeleted} onUpgraded={sessionUpgraded} />
              </div>
            )}
          />
        </section>
      </section>
    </MotionConfig>
  );
}
