import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronDown, Clock, Copy, HelpCircle, Pencil, Plus, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { MotionConfig } from 'framer-motion';
import { toast } from 'react-toastify';
import Table from '../../components/Table/Table.jsx';
import { ErrorMessage } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { DAYS_OF_WEEK } from '../../constants/dateTime.js';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { getMasterPeriods, makeDefaultMasterPeriod } from '../../services/masterPeriodService.js';
import { recordId } from '../../utils/procurement.js';
import MasterScheduleEditor, { BellTimeline } from './masterPeriods/MasterScheduleEditor.jsx';
import {
  masterPeriodTemplates, periodLabel, scheduleDraft, templateSchedule, timeRange, typeLabel,
} from './masterPeriods/masterPeriodValues.js';
import './masterPeriods/masterPeriods.css';

const managers = ['super-admin', 'school-admin', 'principal', 'admin'];
const filters = [['all', 'All Schedules'], ['regular', 'Regular'], ['exam', 'Exam']];

function ScheduleDetails({ item, canManage, busy, onEdit, onDuplicate, onDefault }) {
  const days = DAYS_OF_WEEK.filter(({ id }) => item.days?.includes(id));
  const [dayId, setDayId] = useState(days[0]?.id);
  const day = item.daySchedules?.[dayId] ?? item.daySchedules?.[days[0]?.id] ?? item;
  return <div className="bell-details">
    <div className="bell-section-heading">
      <div className="bell-tabs" role="group" aria-label="Preview day">
        {days.map(({ id, label, short }) => (
          <button type="button" key={id} aria-label={label} aria-pressed={dayId === id} onClick={() => setDayId(id)}>{short}</button>
        ))}
      </div>
      {canManage && <div className="proc-actions">
        <button type="button" className="proc-btn proc-btn-sm" disabled={busy} onClick={() => onEdit(item)}><Pencil size={14} /> Edit</button>
        <button type="button" className="proc-btn proc-btn-sm" disabled={busy} onClick={() => onDuplicate(item)}><Copy size={14} /> Duplicate</button>
        {!item.isDefault && item.isActive !== false && item.isConfigured !== false && (
          <button type="button" className="proc-btn proc-btn-sm proc-primary" onClick={() => onDefault(item)} disabled={busy}>
            <Star size={14} /> Set as Default
          </button>
        )}
      </div>}
    </div>
    <BellTimeline day={day} />
    <ul className="bell-period-preview" aria-label="Period times">
      {(day.periods || []).map((period, index) => (
        <li key={period._id || index} data-period={period.type}><strong>{period.customLabel || periodLabel(period.type)}</strong>
          <span>{timeRange(period.startTime, period.endTime)}</span></li>
      ))}
    </ul>
  </div>;
}

export default function MasterPeriodSettings() {
  const { sessionId, readOnly } = useAcademicSession();
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const canManage = managers.includes(role) && !readOnly;
  const [state, setState] = useState({ schedules: [], loading: true, error: null });
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState('all');
  const [openedId, setOpenedId] = useState('');
  const [editor, setEditor] = useState(null);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const { schedules, loading, error } = state;

  useEffect(() => {
    setState({ schedules: [], loading: true, error: null });
    setEditor(null);
    setOpenedId('');
    setActionError(null);
  }, [sessionId]);

  useEffect(() => {
    const request = new AbortController();
    getMasterPeriods(undefined, request.signal).then(
      (schedules) => {
        if (!request.signal.aborted) setState({ schedules, loading: false, error: null });
      },
      (error) => {
        if (!request.signal.aborted) setState((current) => ({ ...current, loading: false, error }));
      },
    );
    return () => request.abort();
  }, [sessionId, reload]);

  function openEditor(schedule, duplicate) {
    setActionError(null);
    setEditor(scheduleDraft(schedule, duplicate));
  }

  function updateList(saved) {
    setState((current) => ({
      ...current,
      schedules: [saved, ...current.schedules.filter((item) => recordId(item) !== recordId(saved)).map((item) =>
        saved.isDefault && item.scheduleType === saved.scheduleType ? { ...item, isDefault: false } : item)],
    }));
    setFilter('all');
    setOpenedId(recordId(saved));
    setReload((count) => count + 1);
  }

  async function chooseDefault(item) {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      updateList(await makeDefaultMasterPeriod(recordId(item)));
      toast.success(typeLabel(item.scheduleType) + ' default updated.');
    } catch (error) {
      setActionError(error);
    } finally {
      setBusy(false);
    }
  }

  const visible = schedules.filter((item) => filter === 'all' || item.scheduleType === filter);
  const opened = visible.find((item) => recordId(item) === openedId);
  const toggle = (item) => setOpenedId((id) => id === recordId(item) ? '' : recordId(item));
  const columns = [
    { key: 'name', headData: 'Schedule', showOnMobile: true, bodyData: (item) => <div>
      <strong className="bell-schedule-name">{item.name}</strong>
      <small className="bell-mobile-summary">{typeLabel(item.scheduleType)} \u00b7 {timeRange(item.schoolStartTime, item.schoolEndTime)}</small>
    </div> },
    { key: 'hours', headData: 'School Hours', showOnMobile: false, bodyData: (item) =>
      <span className="bell-hours">{timeRange(item.schoolStartTime, item.schoolEndTime)}</span> },
    { key: 'days', headData: 'Working Days', showOnMobile: false, bodyData: (item) => (item.days || []).length },
    { key: 'type', headData: 'Type', showOnMobile: false, bodyData: (item) =>
      <span className="bell-schedule-type" data-type={item.scheduleType}>{typeLabel(item.scheduleType)}</span> },
    { key: 'default', headData: <span className="sr-only">Default</span>, showOnMobile: true, bodyData: (item) => item.isDefault &&
      <span className="bell-default-label"><Star size={13} aria-hidden="true" /> Default</span> },
    { key: 'details', headData: <span className="sr-only">Details</span>, showOnMobile: true, bodyData: (item) => {
      const expanded = recordId(item) === openedId;
      return <button type="button" className="proc-btn proc-btn-sm bell-disclosure" aria-expanded={expanded}
        aria-label={(expanded ? 'Hide ' : 'View ') + item.name} onClick={() => toggle(item)}>
        <span className="bell-desktop-details">Details</span><ChevronDown size={15} aria-hidden="true" />
      </button>;
    } },
  ];

  return <MotionConfig reducedMotion="user">
    <section className="bell-page" aria-labelledby="bell-page-title">
      <header className="bell-page-header">
        <div className="bell-page-heading">
          <span className="bell-page-icon"><Clock size={23} aria-hidden="true" /></span>
          <h1 id="bell-page-title">Master Period & Timetable</h1>
        </div>
        <div className="proc-actions">
          <button type="button" className="proc-btn" aria-expanded={help} aria-controls="bell-guide"
            onClick={() => setHelp((open) => !open)}><HelpCircle size={16} aria-hidden="true" /> How it works</button>
          {canManage && !editor && <button type="button" className="proc-btn proc-primary" disabled={loading || busy || Boolean(error)}
            onClick={() => openEditor()}><Plus size={16} aria-hidden="true" /> New Schedule</button>}
        </div>
      </header>

      <section id="bell-guide" className="bell-guide" hidden={!help} aria-label="How master schedules work">
        <p>A master schedule sets the school hours, working days, and bell times. Class timetables add subjects, teachers, and rooms to those periods.</p>
        <p>Start with a template or build a day from scratch. Change its hours to fit the teaching periods around fixed breaks. Copy the day to other working days, or edit those days individually.</p>
        <p>Set a default for regular and exam days. New class timetables start from that default. Saved timetables use their saved period times.</p>
      </section>

      <ErrorMessage error={error} onRetry={() => setReload((count) => count + 1)} />
      <ErrorMessage error={actionError} />

      {canManage && editor ? (
        <MasterScheduleEditor initial={editor} setBusy={setBusy} onCancel={() => setEditor(null)}
          onSaved={(saved) => { updateList(saved); setEditor(null); toast.success('Schedule saved.'); }} />
      ) : <>
        {canManage && <section className="bell-template-section" aria-labelledby="bell-templates-title">
          <h2 id="bell-templates-title" className="bell-section-title">Schedule Templates</h2>
          <div className="bell-template-grid">
            {masterPeriodTemplates.map((template) => (
              <button type="button" className="bell-template" key={template.id} disabled={loading || busy || Boolean(error)}
                onClick={() => openEditor(templateSchedule(template))}>
                <span className="bell-template-icon"><CalendarDays size={18} aria-hidden="true" /></span>
                <strong>{template.name.replace(/ Schedule$/, '')}</strong>
                <span className="bell-template-hours">{timeRange(template.schoolStartTime, template.schoolEndTime)}</span>
                <ArrowRight className="bell-template-arrow" size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>}

        <section className="proc-panel bell-library" aria-labelledby="bell-library-title">
          <div className="bell-section-heading bell-library-header">
            <h2 id="bell-library-title" className="bell-section-title">Saved Schedules</h2>
            <div className="bell-tabs" role="group" aria-label="Filter schedules">
              {filters.map(([id, label]) => <button type="button" key={id} aria-pressed={filter === id}
                onClick={() => { setFilter(id); setOpenedId(''); }}>{label}</button>)}
            </div>
          </div>
          <Table tableLabel="Saved master schedules" showToolbar={false} className="bell-table" tableClassName="bell-table-frame"
            tableHeadClassName="bell-table-head" trClassname="bell-table-row"
            tableLayout={columns} data={visible} openedRow={opened ? [opened] : []} collapseAttribute="_id"
            onRowClick={toggle} loadingTableContent={loading && !schedules.length}
            noRecordText={error ? 'Schedules unavailable' : 'No saved schedules'}
            noRecordDescription={canManage && !error ? 'Choose a template or create a new schedule.' : ''}
            Collapse={(item) => <ScheduleDetails key={recordId(item)} item={item} canManage={canManage} busy={busy}
              onEdit={openEditor} onDuplicate={(item) => openEditor(item, true)} onDefault={chooseDefault} />} />
        </section>
      </>}
    </section>
  </MotionConfig>;
}
