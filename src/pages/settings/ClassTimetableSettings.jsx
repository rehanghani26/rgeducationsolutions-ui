import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarDays, CheckCircle2, ChevronDown, Clock, GraduationCap, HelpCircle, Lock, Plus } from 'lucide-react';
import { MotionConfig } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmationBox from '../../components/ui/ConfirmationBox.jsx';
import { ErrorMessage, Field, Pending } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { SECTION_OPTIONS } from '../../constants/academicOptions.js';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import api from '../../services/api.js';
import { notifyApiError } from '../../services/apiErrors.js';
import { getMasterPeriods } from '../../services/masterPeriodService.js';
import { recordId } from '../../utils/procurement.js';
import { masterScheduleForTimetable } from '../timetable/timetableUtils.js';
import TimetableDirectory from './classTimetable/TimetableDirectory.jsx';
import TimetableEditor from './classTimetable/TimetableEditor.jsx';
import { classLabel, classesWithAvailableSections, scheduleType, timetableClass, timetableDays } from './classTimetable/timetableValues.js';
import './classTimetable/classTimetable.css';

const writeRoles = ['super-admin', 'school-admin', 'admin', 'principal'];
const loadingList = { rows: [], loading: true, error: null };
const masterSettingsPath = '/settings/master-period';

function ChooseClass({ classes, onOpen, onClose }) {
  const firstField = useRef(null);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [allSections, setAllSections] = useState(false);
  const grade = classes.find((item) => item.id === classId);
  const available = grade?.sections || [];
  const section = available.find((item) => item.id === sectionId) || available[0];
  const count = available.length;
  const savedCount = SECTION_OPTIONS.length - count;

  let hint = 'Choose a class to see its available sections.';
  if (grade) {
    const availability = count === 1 ? '1 section available.' : count + ' sections available.';
    hint = allSections ? (count === 1 ? 'Saving will create a timetable for ' + section.name + '.'
      : 'Saving will create ' + count + ' separate timetables.')
      : availability + (savedCount ? ' Edit saved sections in the list below.' : '');
  }

  useEffect(() => { firstField.current?.focus(); }, []);

  function changeClass(event) {
    setClassId(event.target.value);
    setSectionId('');
    setAllSections(false);
  }

  function open(event) {
    event.preventDefault();
    if (!grade || !section) return;
    onOpen(grade, allSections ? available : [section]);
  }

  return (
    <section className="ct-panel ct-create" aria-labelledby="ct-create-title">
      <h2 id="ct-create-title">Choose a class and section</h2>
      <form onSubmit={open}>
        <div className="ct-create-fields">
          <Field label="Class">
            <select ref={firstField} className="ct-control" value={grade?.id || ''} onChange={changeClass} required>
              <option value="">Choose a class</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Section">
            <select className="ct-control" value={allSections ? '' : section?.id || ''} disabled={!grade || allSections}
              onChange={(event) => setSectionId(event.target.value)} required={!allSections}>
              {!grade || allSections ? <option value="">{allSections ? 'All selected' : 'Select a class'}</option>
                : available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <label className="ct-all-sections" data-checked={allSections || undefined} data-disabled={!grade || undefined}>
            <input type="checkbox" checked={allSections} disabled={!grade} aria-describedby="ct-available-sections"
              onChange={(event) => setAllSections(event.target.checked)} />
            <span>All sections</span>
          </label>
        </div>
        <div className="ct-create-footer">
          <p id="ct-available-sections" className="ct-muted" role="status">{hint}</p>
          <div className="proc-actions">
            <button type="button" className="proc-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="proc-btn proc-primary" disabled={!section}>Open builder</button>
          </div>
        </div>
      </form>
    </section>
  );
}

function ClassTimetables({ session, sessionId, canEdit, classes, schoolClasses, refreshSchoolClasses }) {
  const [directory, setDirectory] = useState(loadingList);
  const [master, setMaster] = useState(loadingList);
  const [directoryRequest, setDirectoryRequest] = useState(0);
  const [masterRequest, setMasterRequest] = useState(0);
  const [help, setHelp] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const availableClasses = useMemo(() => classesWithAvailableSections(classes, directory.rows), [classes, directory.rows]);
  const defaultSchedule = masterScheduleForTimetable(master.rows);
  const hasTeachingPeriods = timetableDays(defaultSchedule).some((day) => day.slots.some((slot) => slot.number));
  const availabilityLoaded = !directory.loading && !directory.error && !schoolClasses.loading && !schoolClasses.error;
  const allSectionsSaved = availabilityLoaded && classes.length > 0 && availableClasses.length === 0;
  const canCreate = canEdit && availabilityLoaded && availableClasses.length > 0 &&
    !master.loading && !master.error && hasTeachingPeriods;

  useEffect(() => {
    const request = new AbortController();
    api.get('/periods/timetable', { params: { scheduleType, sessionId: sessionId || undefined }, signal: request.signal })
      .then(({ data }) => {
        if (request.signal.aborted) return;
        const rows = data.data?.timetables ?? data.timetables;
        if (!Array.isArray(rows)) throw new Error(data.message || 'Class timetables could not be loaded.');
        setDirectory({ rows, loading: false, error: null });
      })
      .catch((error) => {
        if (request.signal.aborted) return;
        notifyApiError(error);
        setDirectory({ rows: [], loading: false, error });
      });
    return () => request.abort();
  }, [sessionId, directoryRequest]);

  useEffect(() => {
    const request = new AbortController();
    getMasterPeriods(scheduleType, request.signal, sessionId)
      .then((rows) => {
        if (!request.signal.aborted) setMaster({ rows, loading: false, error: null });
      })
      .catch((error) => {
        if (!request.signal.aborted) setMaster({ rows: [], loading: false, error });
      });
    return () => request.abort();
  }, [sessionId, masterRequest]);

  function reloadDirectory() {
    setDirectory(loadingList);
    setDirectoryRequest((request) => request + 1);
  }

  function reloadMaster() {
    setMaster(loadingList);
    setMasterRequest((request) => request + 1);
  }

  function openTimetable(row, editing) {
    setChoosing(false);
    setEditor({ identity: timetableClass(row, classes), row, editing: canEdit && editing });
  }

  function openNewTimetable(grade, sections) {
    const identity = { classId: grade.id, className: grade.name };
    if (sections.length === 1) {
      identity.sectionId = sections[0].id;
      identity.sectionName = sections[0].name;
    }
    setChoosing(false);
    setEditor({ identity, sections, editing: true });
  }

  function savedTimetables(rows) {
    if (rows.length === 1) setEditor((current) => ({ ...current, row: rows[0] }));
    else setEditor(null);
    const ids = new Set(rows.map(recordId));
    setDirectory((current) => ({
      ...current, rows: [...rows, ...current.rows.filter((item) => !ids.has(recordId(item)))],
    }));
  }

  async function deleteTimetable() {
    const id = recordId(deleting);
    if (!id || !canEdit) return;
    try {
      const { data } = await api.delete('/periods/timetable/' + encodeURIComponent(id), {
        params: { byId: true, sessionId: sessionId || undefined },
      });
      if (!data.success) {
        notifyApiError(data);
        return;
      }
      setDirectory((current) => ({ ...current, rows: current.rows.filter((row) => recordId(row) !== id) }));
      setDeleting(null);
      toast.success('Timetable deleted.');
    } catch (error) {
      notifyApiError(error);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="ct-page">
        <header className="ct-header">
          <div className="ct-title">
            <span className="ct-title-icon"><CalendarDays size={20} aria-hidden="true" /></span>
            <div>
              <h1>Class Timetables</h1>
              <p>{session?.sessionName ? 'Academic session ' + session.sessionName : 'Weekly schedules by class and section'}</p>
            </div>
          </div>
          <div className="proc-actions">
            <button type="button" className="proc-btn" onClick={() => setHelp(!help)} aria-controls="ct-guide" aria-expanded={help}>
              <HelpCircle size={15} /> How it works <ChevronDown size={13} />
            </button>
            {!editor && canCreate && !choosing && <button type="button" className="proc-btn proc-primary" onClick={() => setChoosing(true)}>
              <Plus size={17} /> New timetable
            </button>}
            {!canEdit && <span className="ct-readonly"><Lock size={13} /> Read only</span>}
          </div>
        </header>

        <section id="ct-guide" className="ct-guide" hidden={!help} aria-label="How class timetables work">
          <p><strong>Master Period sets the school day.</strong> It supplies the working days, teaching times, and breaks. New class timetables use the default regular schedule.</p>
          <p><strong>Choose where to create the timetable.</strong> Pick one section or use All sections to start a separate timetable for each available section. Edit existing timetables from the saved list.</p>
          <p><strong>Review your week, then save.</strong> Use Day to copy assignments to the same teaching periods on other school days.</p>
        </section>

        {editor ? <TimetableEditor
          timetable={editor.row}
          identity={editor.identity}
          sections={editor.sections}
          startEditing={editor.editing}
          master={master}
          sessionId={sessionId}
          canEdit={canEdit}
          onReloadMaster={reloadMaster}
          onClose={() => setEditor(null)}
          onSaved={savedTimetables}
          onCreateConflict={reloadDirectory}
        /> : <>
          {canEdit && !master.loading && (master.error ? (
            <ErrorMessage error={master.error} onRetry={reloadMaster} />
          ) : !hasTeachingPeriods && (
            <div className="ct-notice">
              <Clock size={18} aria-hidden="true" />
              <div><strong>Set up teaching periods</strong><p>Set a default regular Master Period schedule with teaching periods to build a class timetable.</p></div>
              <Link className="proc-btn" to={masterSettingsPath}>Open Master Period</Link>
            </div>
          ))}
          {canEdit && !schoolClasses.loading && (schoolClasses.error ? (
            <ErrorMessage error={schoolClasses.error} onRetry={refreshSchoolClasses} />
          ) : classes.length === 0 && (
            <div className="ct-notice">
              <GraduationCap size={18} aria-hidden="true" />
              <div><strong>Set the school class range</strong><p>Ask your school administrator to set the starting and ending classes for this school.</p></div>
            </div>
          ))}
          {canEdit && allSectionsSaved && <div className="ct-notice ct-coverage-notice">
            <CheckCircle2 size={18} aria-hidden="true" />
            <div><strong>All sections have timetables</strong><p>Use Edit in the saved list to make changes for this academic session.</p></div>
          </div>}
          {choosing && canCreate && <ChooseClass classes={availableClasses} onOpen={openNewTimetable} onClose={() => setChoosing(false)} />}
          <TimetableDirectory
            directory={directory} schedules={master.rows} classes={classes} canEdit={canEdit} canCreate={canCreate}
            onReload={() => { reloadDirectory(); reloadMaster(); }} onOpen={openTimetable} onDelete={setDeleting}
          />
        </>}
        {deleting && <ConfirmationBox
          heading="Delete timetable?"
          confirmationMessage={'Delete all assignments for ' + classLabel(timetableClass(deleting, classes)) + ' in this academic session?'}
          leftButtonName="Cancel"
          rightButtonName="Delete timetable"
          onLeftButtonClick={() => setDeleting(null)}
          onRightButtonClick={deleteTimetable}
        />}
      </div>
    </MotionConfig>
  );
}

export default function ClassTimetableSettings() {
  const {
    selected, sessionId, sessionsLoading, sessionsError, refresh,
    readOnly, classOptions, schoolClasses, refreshSchoolClasses,
  } = useAcademicSession();
  const user = useSelector((state) => state.auth?.user);
  if (!sessionId && (sessionsLoading || sessionsError)) {
    return <div className="ct-page">
      <section className="ct-panel" aria-label="Class Timetables">
        {sessionsLoading ? <Pending label="Loading academic sessions…" /> : <div className="ct-inset">
          <ErrorMessage error={sessionsError} onRetry={() => refresh().catch(() => {})} />
        </div>}
      </section>
    </div>;
  }
  return <ClassTimetables
    key={sessionId}
    session={selected}
    sessionId={sessionId}
    canEdit={!readOnly && writeRoles.includes(getUserRole(user))}
    classes={classOptions}
    schoolClasses={schoolClasses}
    refreshSchoolClasses={refreshSchoolClasses}
  />;
}
