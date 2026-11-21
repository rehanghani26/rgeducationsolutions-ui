import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Download, Grid3x3, Layers, List, Pencil, Save, User } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationBox from '../../../components/ui/ConfirmationBox.jsx';
import { ErrorMessage, Pending } from '../../../components/ui/ProcurementUI.jsx';
import api from '../../../services/api.js';
import { notifyApiError } from '../../../services/apiErrors.js';
import { getSyllabusByClass } from '../../../services/syllabusService.js';
import { getTeachers } from '../../../services/teacherService.js';
import { recordId } from '../../../utils/procurement.js';
import { masterScheduleForTimetable } from '../../timetable/timetableUtils.js';
import { AssignmentDialog, SyllabusDialog } from './TimetableDialogs.jsx';
import { DaySchedule, TeacherSchedule, WeekSchedule } from './TimetableGrid.jsx';
import {
  classLabel, copyTeachingPeriods, downloadTimetable, emptyAllocation, hasAssignment, readAllocations,
  scheduleType, timetableAllocations, timetableDays, timetableProgress,
} from './timetableValues.js';

const views = [
  { id: 'week', label: 'Week', icon: Grid3x3 },
  { id: 'day', label: 'Day', icon: List },
  { id: 'teacher', label: 'Teacher', icon: User },
];
const loadingOptions = { loading: true, teachers: [], subjects: [], syllabus: null };

async function getTeacherOptions(signal) {
  const params = { limit: 100, sort: 'name' };
  const first = await getTeachers(params, signal);
  const teachers = [...(first.teachers || [])];
  for (let page = 2; page <= (first.pagination?.pages || 1); page += 1) {
    const next = await getTeachers({ ...params, page }, signal);
    teachers.push(...(next.teachers || []));
  }
  return teachers;
}

export default function TimetableEditor({
  timetable, identity, sections = [], startEditing, master, sessionId, canEdit, onReloadMaster,
  onClose, onSaved, onCreateConflict,
}) {
  const navigate = useNavigate();
  const heading = useRef(null);
  const saveInProgress = useRef(false);
  const saved = useMemo(() => readAllocations(timetable), [timetable]);
  const [draft, setDraft] = useState(startEditing ? saved : null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState(() => window.matchMedia('(max-width: 900px)').matches ? 'day' : 'week');
  const [dayId, setDayId] = useState('');
  const [teacher, setTeacher] = useState('');
  const [slot, setSlot] = useState(null);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [options, setOptions] = useState(loadingOptions);
  const [optionsRequest, setOptionsRequest] = useState(0);
  const [confirmation, setConfirmation] = useState(null);
  const editing = canEdit && draft !== null;
  const dirty = editing && draft !== saved;
  const assignments = editing ? draft : saved;
  const schedule = useMemo(() => masterScheduleForTimetable(master.rows, timetable), [master.rows, timetable]);
  const days = useMemo(() => timetableDays(schedule), [schedule]);
  const day = days.find((item) => item.id === dayId) || days.find((item) => item.index === new Date().getDay()) || days[0];
  const { total, assigned } = timetableProgress(days, assignments);
  const hasSchedule = days.some((item) => item.slots.length > 0);
  const bulk = sections.length > 1;
  const name = bulk ? identity.className + ' - ' + sections.length + ' sections' : classLabel(identity);
  const classIdentifier = identity.classId || identity.className;
  const needOptions = editing || showSyllabus;

  useEffect(() => { heading.current?.focus(); }, []);

  useEffect(() => {
    if (!dirty) return;
    function warn(event) { event.preventDefault(); }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!needOptions) return;
    const request = new AbortController();
    setOptions((current) => ({ ...current, loading: true, syllabusError: null, teachersError: null, subjectsError: null }));
    Promise.allSettled([
      getSyllabusByClass(classIdentifier, request.signal),
      getTeacherOptions(request.signal),
      api.get('/erp/subjects', { signal: request.signal }).then(({ data }) => (data.subjects || []).map((item) => item.name)),
    ]).then(([syllabus, teachers, subjects]) => {
      if (request.signal.aborted) return;
      setOptions({
        loading: false,
        syllabus: syllabus.value || null, syllabusError: syllabus.reason,
        teachers: teachers.value || [], teachersError: teachers.reason,
        subjects: subjects.value || [], subjectsError: subjects.reason,
      });
    });
    return () => request.abort();
  }, [needOptions, classIdentifier, optionsRequest]);

  function leave(action) {
    if (saving) return;
    if (dirty) {
      setConfirmation({
        heading: 'Discard unsaved changes?',
        message: 'Changes to this timetable will be lost.',
        button: 'Discard changes',
        action,
      });
    } else action();
  }

  function applyAssignment(value, copy) {
    if (!editing || saving) return;
    const key = slot.slot.key;
    const otherDays = copy ? copyTeachingPeriods(days, slot.day, { [key]: value }) : {};
    setDraft((current) => ({ ...current, ...otherDays, [key]: value }));
    setSlot(null);
  }

  function copyDay() {
    if (!editing || saving) return;
    const copies = copyTeachingPeriods(days, day, assignments);
    const changes = Object.entries(copies).filter(([key, value]) => Object.keys(emptyAllocation).some((field) =>
      (assignments[key]?.[field] || '') !== (value[field] || '')));
    if (!changes.length) {
      toast.info('Matching periods already have these assignments.');
      return;
    }
    const apply = () => {
      setDraft((current) => ({ ...current, ...Object.fromEntries(changes) }));
      toast.success(changes.length + (changes.length === 1 ? ' period copied.' : ' periods copied.'));
    };
    if (changes.some(([key]) => hasAssignment(assignments[key]))) {
      setConfirmation({
        heading: 'Replace matching assignments?',
        message: 'Copying ' + day.label + ' will replace existing assignments in matching teaching periods on other days.',
        button: 'Copy assignments',
        action: apply,
      });
    } else apply();
  }

  async function save() {
    if (!editing || !hasSchedule || saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);
    const timetableId = recordId(timetable);
    const targets = bulk
      ? { ...identity, sectionIds: sections.map(({ id }) => id) }
      : { ...identity, classSectionKey: name, createOnly: true };
    try {
      const { data } = await api.post(bulk ? '/periods/timetable/sections' : '/periods/timetable', {
        ...(timetableId ? { timetableId } : targets),
        scheduleType,
        masterPeriodId: timetable?.masterPeriodId || recordId(schedule),
        allocations: timetableAllocations(days, assignments),
      }, { params: { sessionId: sessionId || undefined } });
      const rows = bulk ? data.data?.timetables ?? data.timetables : [data.data?.timetable ?? data.timetable];
      if (!data.success || !Array.isArray(rows) || rows.length !== (bulk ? sections.length : 1) || rows.some((row) => !recordId(row))) {
        notifyApiError(data, 'The timetable could not be saved.');
        return;
      }
      setDraft(null);
      onSaved(rows);
      toast.success(bulk ? rows.length + ' timetables saved.' : 'Timetable saved.');
    } catch (error) {
      notifyApiError(error);
      if (!timetableId && error.response?.status === 409) onCreateConflict();
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }

  function retryOptions() { setOptionsRequest((request) => request + 1); }
  function openAssignment(selectedDay, selectedSlot) { setSlot({ day: selectedDay, slot: selectedSlot }); }
  const gridProps = { days, assignments, editing, disabled: saving, onAssign: openAssignment };

  return (
    <section className="ct-panel ct-editor" aria-labelledby="ct-editor-title" aria-busy={saving}>
      <div className="ct-editor-heading">
        <div>
          <button type="button" className="ct-back" onClick={() => leave(onClose)} disabled={saving}>
            <ArrowLeft size={15} /> All timetables
          </button>
          <h2 id="ct-editor-title" ref={heading} tabIndex={-1}>{name}</h2>
        </div>
        <div className="proc-actions">
          {dirty && <span className="ct-unsaved" role="status">Unsaved changes</span>}
          {editing ? <>
            <button type="button" className="proc-btn" disabled={saving} onClick={() => leave(timetable ? () => setDraft(null) : onClose)}>Cancel</button>
            <button type="button" className="proc-btn proc-primary" disabled={saving || !hasSchedule} onClick={save}>
              <Save size={15} /> {saving ? 'Saving…' : bulk ? 'Save ' + sections.length + ' timetables' : 'Save timetable'}
            </button>
          </> : canEdit && hasSchedule && (
            <button type="button" className="proc-btn proc-primary" onClick={() => setDraft(saved)}><Pencil size={15} /> Edit timetable</button>
          )}
        </div>
      </div>

      {bulk && <div className="ct-section-plan">
        <Layers size={17} aria-hidden="true" />
        <div>
          <strong>Sections included</strong>
          <ul aria-label="Sections included">
            {sections.map((section) => <li key={section.id}>{section.name}</li>)}
          </ul>
          <p>Each section starts with these assignments. Edit each timetable separately after saving.</p>
        </div>
      </div>}

      {!hasSchedule ? <div className="ct-inset">
        {master.loading ? <Pending label="Loading period times…" /> : master.error ? <ErrorMessage error={master.error} onRetry={onReloadMaster} />
          : <div className="ct-notice">
            <Clock size={18} aria-hidden="true" />
            <div><strong>No period times available</strong><p>Set up a regular Master Period schedule for this academic session.</p></div>
            {canEdit && <Link className="proc-btn" to="/settings/master-period">Open Master Period</Link>}
          </div>}
      </div> : <>
        <div className="ct-schedule">
          <div><Clock size={15} aria-hidden="true" /><span>Master Period</span><strong>{schedule.name}</strong></div>
          <div className="ct-schedule-progress"><strong>{assigned} of {total}</strong><span>teaching periods assigned</span></div>
        </div>
        <div className="ct-toolbar ct-editor-toolbar">
          <div className="ct-tabs" role="group" aria-label="Timetable view">
            {views.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={view === id} onClick={() => setView(id)}>
              <Icon size={14} aria-hidden="true" /> {label}
            </button>)}
          </div>
          <div className="proc-actions">
            <button type="button" className="proc-btn" disabled={saving} onClick={() => setShowSyllabus(true)}><BookOpen size={15} /> Syllabus & books</button>
            <button type="button" className="proc-btn" disabled={saving} onClick={() => downloadTimetable(name, days, assignments)}><Download size={15} /> Export CSV</button>
          </div>
        </div>
        {view === 'week' && <WeekSchedule {...gridProps} />}
        {view === 'day' && <DaySchedule {...gridProps} day={day} onDayChange={setDayId} onCopy={copyDay} />}
        {view === 'teacher' && <TeacherSchedule days={days} assignments={assignments} teacher={teacher} onTeacherChange={setTeacher} />}
      </>}
      {slot && editing && <AssignmentDialog
        selection={slot} assignment={assignments[slot.slot.key]} options={options}
        canCopy={days.some((item) => item.id !== slot.day.id && item.slots.some((period) => period.number === slot.slot.number))}
        onRetry={retryOptions} onApply={applyAssignment} onClose={() => setSlot(null)}
      />}
      {showSyllabus && <SyllabusDialog
        className={identity.className} options={options} onClose={() => setShowSyllabus(false)} onRetry={retryOptions}
        onOpenSettings={() => { setShowSyllabus(false); leave(() => navigate('/settings/syllabus')); }}
      />}
      {confirmation && <ConfirmationBox
        heading={confirmation.heading}
        confirmationMessage={confirmation.message}
        leftButtonName="Cancel"
        rightButtonName={confirmation.button}
        onLeftButtonClick={() => setConfirmation(null)}
        onRightButtonClick={() => { setConfirmation(null); confirmation.action(); }}
      />}
    </section>
  );
}
