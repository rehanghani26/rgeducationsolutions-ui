import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookMarked, BookOpen, ChevronDown, GraduationCap, Layers, Plus, School, Search } from 'lucide-react';
import { Input, SelectInput } from '../components/ui/FormControls.jsx';
import { useAcademicSession } from '../context/AcademicSessionContext.jsx';
import api from '../services/api.js';
import { createSubject } from '../services/erpService.js';
import { getAcademicWorkspace } from '../services/syllabusService.js';
import {
  AcademicHero, AcademicLoad, AcademicState, AcademicTabs, ActionFeedback,
  Status, roomLabel, useAcademicAction, useAcademicData,
} from './academics/AcademicUI.jsx';
import { SyllabusEditor } from './academics/SyllabusEditor.jsx';
import ClassroomTeaching from './academics/ClassroomTeaching.jsx';
import StudentAcademicView from './academics/StudentAcademicView.jsx';

const tabs = [
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'subjects', label: 'Subjects', icon: BookMarked },
  { id: 'curriculum', label: 'Curriculum & Courses', icon: GraduationCap },
  { id: 'syllabus', label: 'Class Syllabus & Prescribed Books', icon: BookOpen },
];
const managerRoles = ['super-admin', 'superadmin', 'school-admin', 'admin', 'principal', 'director'];

export default function AcademicManagement({ initialTab }) {
  const role = useSelector((state) => state.auth?.user?.role)?.toLowerCase().replaceAll('_', '-');
  if (['student', 'parent'].includes(role)) return <StudentAcademicView />;
  return <StaffAcademics initialTab={initialTab} role={role} />;
}

function StaffAcademics({ initialTab, role }) {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const [addingSubject, setAddingSubject] = useState(false);
  const { sessionId, selected, sessionsLoading, sessionsError, refreshSchoolClasses } = useAcademicSession();
  const workspace = useAcademicData(sessionId, getAcademicWorkspace);
  const data = workspace.data;
  const manager = managerRoles.includes(role);
  const pathTab = ({ '/academics/sections': 'sections', '/academics/subjects': 'subjects' })[pathname];
  const activeTab = manager
    ? (tabs.some(({ id }) => id === params.get('tab')) ? params.get('tab') : initialTab || pathTab || 'classes')
    : 'curriculum';
  const classId = params.get('class') || '';
  const roomId = params.get('room') || '';
  const rooms = (data?.rooms || []).filter((room) => room.status !== 'archived');
  const canAddSubject = manager && data && !data.readOnly && activeTab === 'subjects';
  const activeTitle = tabs.find(({ id }) => id === activeTab)?.label;

  function navigate(tab, filters = {}) {
    setAddingSubject(false);
    setParams({ tab, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) });
  }
  function onSubjectCreated() {
    setAddingSubject(false);
    workspace.reload();
  }

  return <div className="academic-workspace academic-staff pb-8">
    <div className="academic-staff-frame">
      <AcademicHero icon={GraduationCap} title={manager ? 'Academics' : 'My Classes & Subjects'}
        description={manager ? (selected?.sessionName ? 'Academic session ' + selected.sessionName : undefined)
          : 'Track chapter coverage and share resources with your classes.'}
        actions={canAddSubject && !addingSubject && <button type="button" className="academic-btn academic-btn-primary"
          onClick={() => setAddingSubject(true)}><Plus size={16} aria-hidden="true" /> Add subject</button>} />
      {manager && data && !data.legacy && <AcademicTabs tabs={tabs} active={activeTab}
        change={(tab) => navigate(tab, { class: classId, room: roomId })} />}
    </div>
    {(sessionsLoading || sessionsError || workspace.loading || workspace.error) && <AcademicLoad state={sessionsError ? { error: sessionsError } : workspace} />}
    {!sessionsLoading && !sessionsError && !sessionId && <AcademicState title="Set up your academic session"
      detail="Choose an active session and set your school’s class range to start."
      action={manager && <Link className="academic-btn academic-btn-primary" to="/settings">Open settings <ArrowUpRight size={14} /></Link>} />}
    {data?.legacy && <LegacyRecords data={data} />}
    {data && !data.legacy && <>
      {canAddSubject && addingSubject && <CreateSubject cancel={() => setAddingSubject(false)} onCreated={onSubjectCreated} />}
      {activeTab === 'classes' && <ClassDirectory data={data} rooms={rooms} navigate={navigate}
        onOrderSaved={() => { workspace.reload(); refreshSchoolClasses(); }} />}
      {activeTab === 'sections' && <SectionDirectory rooms={rooms} classes={data.classes} classId={classId}
        selectClass={(value) => navigate('sections', { class: value })}
        openRoom={(room) => navigate('curriculum', { room: room.id })} />}
      {activeTab === 'subjects' && <SubjectDirectory subjects={data.subjects} />}
      {activeTab === 'curriculum' && <ClassroomTeaching rooms={rooms} roomId={roomId} manage={manager} teachers={data.teachers}
        onRoomChange={(room) => navigate('curriculum', { room })} />}
      {activeTab === 'syllabus' && <SyllabusEditor classId={classId}
        onClassChange={(value) => navigate('syllabus', { class: value })} refreshWorkspace={workspace.reload} />}
      {manager && data.legacyCourses.length > 0 && activeTab === 'curriculum' && <details className="academic-panel">
        <summary className="cursor-pointer text-sm font-semibold">Legacy courses in this session ({data.legacyCourses.length})</summary>
        <div className="academic-compact pt-3"><LegacyCourses rows={data.legacyCourses} /></div>
      </details>}
      {data.readOnly && <footer className="academic-muted">{activeTitle} · Read-only session</footer>}
    </>}
  </div>;
}

function ClassDirectory({ data, rooms, navigate, onOrderSaved }) {
  const [search, setSearch] = useState('');
  const published = data.classes.filter((grade) => grade.version).length;
  const query = search.trim().toLowerCase();
  const shown = data.classes.filter((grade) => (grade.name + ' ' + grade.code).toLowerCase().includes(query));
  const sectionCounts = new Map();
  for (const room of rooms) sectionCounts.set(room.classId, (sectionCounts.get(room.classId) || 0) + 1);

  return <div className="academic-directory-stack">
    <div className="academic-overview-stats">
      {[
        { icon: School, label: 'Class levels', value: data.classes.length },
        { icon: Layers, label: 'Active sections', value: rooms.length },
        { icon: BookOpen, label: 'Published syllabuses', value: published, total: data.classes.length },
      ].map(({ icon: Icon, label, value, total }) => <div className="academic-overview-stat" key={label}>
        <span className="academic-icon"><Icon size={20} aria-hidden="true" /></span>
        <dl><dt>{label}</dt><dd>{value}{total != null && <span> / {total}</span>}</dd></dl>
        {total > 0 && <progress value={value} max={total} aria-label="Syllabus publication progress" />}
      </div>)}
    </div>
    <section className="academic-panel academic-directory">
      <header className="academic-directory-header">
        <div className="academic-directory-title"><School size={19} aria-hidden="true" />
          <div><h2>Classes in the school range</h2><p>Ordered by Class Master</p></div>
        </div>
        <div className="academic-directory-tools">
          {data.classes.length > 0 && <DirectorySearch label="Search classes" placeholder="Search classes"
            value={search} onChange={(event) => setSearch(event.target.value)} />}
          <Link className="academic-btn" to="/academics/classes">Manage classrooms <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </div>
      </header>
      <div className="academic-directory-body">
        {shown.length > 0 ? <div className="academic-directory-grid">
          {shown.map((grade) => <DirectoryCard key={grade.id} icon={School} title={grade.name}
            detail={sectionCounts.get(grade.id) === 1 ? '1 section' : (sectionCounts.get(grade.id) || 0) + ' sections'}
            status={<Status value={grade.status} />} destination="Syllabus"
            onClick={() => navigate('syllabus', { class: grade.id })} />)}
        </div> : <AcademicState title={query ? 'No matching classes' : 'Set the school class range'} detail={
          query ? 'Try another class name or code.' : 'Choose the first and last class for your school in Settings.'
        } />}
      </div>
    </section>
    <details className="academic-panel academic-master">
      <summary><BookMarked size={17} aria-hidden="true" /> Class Master directory <ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="academic-compact pt-3">
        {data.classMaster.map((grade) => <ClassOrderRow key={grade.id + '/' + grade.sortOrder} grade={grade}
          readOnly={data.readOnly || grade.virtual} inRange={data.classes.some((row) => row.id === grade.id)} onSaved={onOrderSaved} />)}
      </div>
    </details>
  </div>;
}

function DirectorySearch({ label, ...props }) {
  return <Input className="academic-directory-search" type="search" label={label} showLabel={false}
    icon={<Search size={16} aria-hidden="true" />} {...props} />;
}

function DirectoryCard({ icon: Icon, title, detail, status, destination, onClick }) {
  const card = <>
    <span className="academic-directory-card-main">
      <span className="academic-icon"><Icon size={17} aria-hidden="true" /></span>
      <span><strong>{title}</strong><small>{detail}</small></span>
    </span>
    <span className="academic-directory-card-footer">
      <span className="academic-directory-statuses">{status}</span>
      {destination && <span className="academic-directory-link">{destination}<ArrowRight size={15} aria-hidden="true" /></span>}
    </span>
  </>;
  return onClick
    ? <button type="button" className="academic-directory-card academic-directory-card-link" onClick={onClick}>{card}</button>
    : <div className="academic-directory-card">{card}</div>;
}

function ClassOrderRow({ grade, readOnly, inRange, onSaved }) {
  const [edit, setEdit] = useState(false);
  const [order, setOrder] = useState(grade.sortOrder ?? '');
  const action = useAcademicAction();
  async function save(event) {
    event.preventDefault();
    const saved = await action.run(() => api.patch('/erp/class-master/' + encodeURIComponent(grade.id) + '/order', { sortOrder: order }));
    if (saved) { setEdit(false); onSaved(); }
  }
  return <div className="academic-row">
    <span><strong>{grade.name}</strong><small>{grade.code}{grade.sortOrder != null && ' · Order ' + grade.sortOrder}</small></span>
    <span className="academic-actions"><Status>{inRange ? 'In school range' : 'Outside school range'}</Status>
      {!readOnly && !edit && <button type="button" className="academic-btn" onClick={() => setEdit(true)}>Change order</button>}
    </span>
    {edit && <form className="academic-fields w-full" onSubmit={save}>
      <Input label="Class order" type="number" min="0" required value={order} onChange={(event) => setOrder(event.target.value)} />
      <div className="academic-actions">
        <button type="submit" className="academic-btn academic-btn-primary" disabled={action.busy}>Save order</button>
        <button type="button" className="academic-btn" disabled={action.busy} onClick={() => setEdit(false)}>Cancel</button>
      </div>
      <ActionFeedback action={action} />
    </form>}
  </div>;
}

function SectionDirectory({ rooms, classes, classId, selectClass, openRoom }) {
  const filter = classes.some((row) => row.id === classId) ? classId : '';
  const matches = rooms.filter((room) => !filter || room.classId === filter);
  return <section className="academic-panel academic-directory">
    <header className="academic-directory-header">
      <div className="academic-directory-title"><Layers size={19} aria-hidden="true" /><h2>Session sections</h2></div>
      <div className="academic-directory-tools">
        <SelectInput className="academic-directory-filter" label="Filter by class" showLabel={false}
          value={filter} onChange={(event) => selectClass(event.target.value)}>
          <option value="">All classes</option>
          {classes.map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}
        </SelectInput>
        <Link className="academic-btn" to="/academics/classes">Manage enrollment <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
    </header>
    <div className="academic-directory-body">
      {matches.length > 0 ? <div className="academic-directory-grid">
        {matches.map((room) => <DirectoryCard key={room.id} icon={Layers} title={roomLabel(room)}
          detail={[room.classTeacherName || 'Class teacher unassigned', room.studentCount + ' enrolled'].join(' · ')}
          destination="Courses" onClick={() => openRoom(room)}
          status={<>
            <Status value={room.timetableId ? 'published' : undefined}>{room.timetableId ? 'Timetable linked' : 'Timetable pending'}</Status>
            {room.openRequests > 0 && <Status value="in-review">{room.openRequests} open {room.openRequests === 1 ? 'request' : 'requests'}</Status>}
          </>} />)}
      </div> : <AcademicState icon={Layers} title="No sections in this view" />}
    </div>
  </section>;
}

function SubjectDirectory({ subjects }) {
  const [search, setSearch] = useState('');
  const rows = subjects.filter((row) => (row.name + ' ' + row.code).toLowerCase().includes(search.trim().toLowerCase()));
  return <section className="academic-panel academic-directory">
    <header className="academic-directory-header">
      <div className="academic-directory-title"><BookMarked size={19} aria-hidden="true" /><h2>Subject Master</h2></div>
      <DirectorySearch label="Search subjects" placeholder="Search subjects" value={search} onChange={(event) => setSearch(event.target.value)} />
    </header>
    <div className="academic-directory-body">
      {rows.length > 0 ? <div className="academic-directory-grid">
        {rows.map((row) => <DirectoryCard key={row.id} icon={BookMarked} title={row.name} detail={row.code}
          status={<Status>{row.type === 'practical' ? 'Practical' : 'Theory'}</Status>} />)}
      </div> : <AcademicState icon={BookMarked} title={search.trim() ? 'No matching subjects' : 'No subjects yet'} />}
    </div>
  </section>;
}

function CreateSubject({ cancel, onCreated }) {
  const [fields, setFields] = useState({ name: '', code: '', type: 'theory' });
  const action = useAcademicAction();
  const field = (name) => ({ value: fields[name], onChange: (event) => setFields({ ...fields, [name]: event.target.value }) });
  async function submit(event) {
    event.preventDefault();
    if (await action.run(() => createSubject(fields))) onCreated();
  }
  return <form className="academic-panel academic-compact" onSubmit={submit}>
    <div className="academic-panel-head"><h2>Add subject</h2>
      <button type="button" className="academic-btn" disabled={action.busy} onClick={cancel}>Cancel</button></div>
    <div className="academic-fields">
      <Input label="Subject name" required maxLength={100} {...field('name')} />
      <Input label="Code" required maxLength={30} placeholder="e.g. MATH" {...field('code')} />
      <SelectInput label="Type" options={[{ label: 'Theory', value: 'theory' }, { label: 'Practical', value: 'practical' }]} {...field('type')} />
    </div>
    <ActionFeedback action={action} />
    <div className="academic-form-footer"><button type="submit" className="academic-btn academic-btn-primary" disabled={action.busy}>
      {action.busy ? 'Saving…' : 'Save'}
    </button></div>
  </form>;
}

function LegacyRecords({ data }) {
  return <section className="academic-panel academic-compact">
    <h2>Legacy / Unassigned</h2><p className="academic-muted">These records need review before they can be associated with a session.</p>
    {data.legacySyllabus.map((row) => <div className="academic-row" key={row.id}>
      <span><strong>{row.className}</strong><small>{row.academicYear} · {row.subjectCount} subjects</small></span><Status>Syllabus</Status>
    </div>)}
    <LegacyCourses rows={data.legacyCourses} />
    {!data.legacySyllabus.length && !data.legacyCourses.length && <AcademicState title="No unassigned records" />}
  </section>;
}

function LegacyCourses({ rows }) {
  return rows.map((row) => <div className="academic-row" key={row.id}>
    <span><strong>{row.name || row.code || 'Course'}</strong><small>{roomLabel(row)}</small></span><Status>Needs review</Status>
  </div>);
}
