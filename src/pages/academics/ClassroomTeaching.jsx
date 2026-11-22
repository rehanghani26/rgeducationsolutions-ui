import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarDays, Layers, Plus, Save, Trash2 } from 'lucide-react';
import { Input, SelectInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { changeClassroomSubject, getClassroomAcademics } from '../../services/syllabusService.js';
import {
  AcademicLoad, AcademicState, AcademicTabs, ActionFeedback, NavigateRow, Progress, Status,
  newAcademicId, roomLabel, useAcademicAction, useAcademicData,
} from './AcademicUI.jsx';
import { AcademicTimetable } from './AcademicTimetable.jsx';

const tabs = [{ id: 'subjects', label: 'Subjects', icon: BookOpen }, { id: 'timetable', label: 'Timetable', icon: CalendarDays }];
const statuses = ['upcoming', 'in-progress', 'completed'].map((value) => ({
  value, label: { upcoming: 'Upcoming', 'in-progress': 'In progress', completed: 'Completed' }[value],
}));

export default function ClassroomTeaching({ rooms, roomId, onRoomChange, teachers, manage }) {
  const { sessionId } = useAcademicSession();
  const [tab, setTab] = useState('subjects');
  const [subjectChoice, chooseSubject] = useState('');
  const currentRoom = rooms.find((room) => room.id === roomId) || rooms[0];
  const data = useAcademicData(currentRoom ? sessionId + '/' + currentRoom.id : '',
    (signal) => getClassroomAcademics(currentRoom.id, signal));
  if (!rooms.length) return <AcademicState icon={Layers} title={manage ? 'Create a section to start teaching' : 'No assigned classrooms'}
    detail={manage ? 'Add a section for this session, then assign teachers to its subjects.' : 'Your classrooms will appear here when the school assigns them.'} />;
  const subject = data.data?.subjects.find((entry) => entry.subjectId === subjectChoice);
  return <div className="academic-compact">
    <section className="academic-panel academic-compact">
      <div className="academic-panel-head">
        <div><h2>{roomLabel(currentRoom)}</h2><p className="academic-muted">Class teacher · {currentRoom.classTeacherName || 'Unassigned'}</p></div>
        <div className="academic-actions">
          {data.data?.syllabusVersion > 0 && <Status value="published">Syllabus v{data.data.syllabusVersion}</Status>}
          {manage && <Link className="academic-btn" to={'/academics/classes/' + currentRoom.id}>Classroom details <ArrowUpRight size={14} /></Link>}
        </div>
      </div>
      <div className="academic-fields"><SelectInput label="Classroom" value={currentRoom.id}
        options={rooms.map((room) => ({ value: room.id, label: roomLabel(room)
          + (room.openRequests ? ' · ' + room.openRequests + ' open ' + (room.openRequests === 1 ? 'request' : 'requests') : '') }))}
        onChange={(event) => { onRoomChange(event.target.value); chooseSubject(''); }} /></div>
    </section>
    <AcademicTabs tabs={tabs} active={tab} change={setTab} label="Classroom views" />
    {(data.loading || data.error) && <AcademicLoad state={data} />}
    {data.data && tab === 'timetable' && <AcademicTimetable key={currentRoom.id} slots={data.data.timetable} />}
    {data.data && tab === 'subjects' && (data.data.subjects.length ? <>
      <section className="academic-panel academic-compact">
        <h2>Classroom subjects</h2>
        {data.data.subjects.map((entry) => <NavigateRow key={entry.subjectId} name={entry.subjectName}
          detail={entry.teacherName || 'Subject teacher unassigned'} onClick={() => chooseSubject(entry.subjectId === subject?.subjectId ? '' : entry.subjectId)}>
          {entry.changeRequest?.note && !entry.changeRequest.resolvedAt && <Status value="in-review">Change requested</Status>}
          <Progress completed={entry.completed} total={entry.chapters.length} />
        </NavigateRow>)}
      </section>
      {subject && <DeliveryEditor key={currentRoom.id + '/' + subject.subjectId + '/' + subject.revision + '/' + data.data.syllabusVersion}
        room={currentRoom} subject={subject} syllabusVersion={data.data.syllabusVersion} canAssign={data.data.canAssign}
        teachers={teachers} onSaved={data.reload} />}
    </> : <AcademicState title={data.data.syllabusVersion ? 'No subjects assigned to you' : 'Syllabus is awaiting publication'}
      action={manage && <Link className="academic-btn academic-btn-primary" to={'/academics/syllabus?class=' + currentRoom.classId}>Open class syllabus</Link>} />)}
  </div>;
}

function DeliveryEditor({ room, subject, syllabusVersion, canAssign, teachers, onSaved }) {
  const [teacherId, setTeacherId] = useState(subject.teacherId || '');
  const [progress, setProgress] = useState(subject.chapterProgress);
  const [resources, setResources] = useState(subject.resources);
  const [note, setNote] = useState('');
  const action = useAcademicAction();
  const openRequest = subject.changeRequest?.note && !subject.changeRequest.resolvedAt;
  const completed = progress.filter((row) => row.status === 'completed').length;
  const dirty = progress !== subject.chapterProgress || resources !== subject.resources;

  function save(type, values) {
    return action.run(async () => {
      await changeClassroomSubject(room.id, subject.subjectId, type, {
        ...values, revision: subject.revision, syllabusVersion,
      });
      onSaved();
    });
  }
  function setChapter(chapterId, fields) {
    setProgress((current) => {
      const previous = current.find((row) => row.chapterId === chapterId);
      const value = { status: 'upcoming', plannedDate: '', ...previous, ...fields, chapterId };
      return [...current.filter((row) => row.chapterId !== chapterId), value];
    });
  }
  function setResource(id, values) {
    setResources((current) => current.map((row) => row.id === id ? { ...row, ...values } : row));
  }

  return <section className="academic-panel academic-compact">
    <div className="academic-panel-head">
      <div><h2>{subject.subjectName}</h2><p className="academic-muted">{subject.teacherName || 'Subject teacher unassigned'}</p></div>
      <Progress completed={completed} total={subject.chapters.length} />
    </div>
    {canAssign && <div className="academic-fields academic-divider">
      <SelectInput label="Subject teacher" value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
        <option value="">Unassigned</option>
        {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}{teacher.employeeId && ' · ' + teacher.employeeId}</option>)}
      </SelectInput>
      <button type="button" className="academic-btn justify-self-start" disabled={action.busy || dirty || teacherId === subject.teacherId}
        onClick={() => save('assignment', { teacherId })}>Save assignment</button>
    </div>}
    <div className="academic-panel-head academic-divider"><h3>Chapter coverage</h3></div>
    {!subject.chapters.length && <p className="academic-muted">The published syllabus has no chapters for this subject.</p>}
    {subject.chapters.map((chapter) => {
      const current = progress.find((row) => row.chapterId === chapter.id);
      return <div className="academic-item-editor" key={chapter.id}>
        <div className="academic-panel-head"><strong className="text-sm">{chapter.title}</strong>{chapter.term && <Status>{chapter.term}</Status>}</div>
        {subject.editable ? <div className="academic-fields">
          <SelectInput label="Coverage status" value={current?.status || 'upcoming'} options={statuses}
            onChange={(event) => setChapter(chapter.id, { status: event.target.value })} />
          <Input label="Planned date" type="date" value={current?.plannedDate || ''} onChange={(event) => setChapter(chapter.id, { plannedDate: event.target.value })} />
        </div> : <div className="academic-actions"><Status value={current?.status || 'upcoming'} />{current?.plannedDate && <span className="academic-muted">{current.plannedDate}</span>}</div>}
      </div>;
    })}
    <div className="academic-panel-head academic-divider"><h3>Study resources</h3>
      {subject.editable && <button type="button" className="academic-btn" onClick={() =>
        setResources([...resources, { id: newAcademicId(), title: '', url: '', chapterId: '', shared: true }])}><Plus size={15} /> Add resource</button>}
    </div>
    {!resources.length && <p className="academic-muted">No resource links have been added.</p>}
    {resources.map((resource) => subject.editable ? <div className="academic-item-editor" key={resource.id}>
      <div className="academic-fields">
        <Input label="Resource title" value={resource.title} onChange={(event) => setResource(resource.id, { title: event.target.value })} />
        <Input label="Resource link" type="url" value={resource.url} placeholder="https://" onChange={(event) => setResource(resource.id, { url: event.target.value })} />
        <SelectInput label="Chapter" value={resource.chapterId} onChange={(event) => setResource(resource.id, { chapterId: event.target.value })}>
          <option value="">Whole subject</option>
          {subject.chapters.map((chapter) => <option value={chapter.id} key={chapter.id}>{chapter.title}</option>)}
        </SelectInput>
      </div>
      <div className="academic-panel-head"><label className="academic-check"><input type="checkbox" checked={resource.shared}
        onChange={(event) => setResource(resource.id, { shared: event.target.checked })} /> Share with students</label>
        <button type="button" className="academic-btn" onClick={() => setResources(resources.filter((row) => row.id !== resource.id))}><Trash2 size={15} /> Remove resource</button></div>
    </div> : <div className="academic-row" key={resource.id}><a className="academic-resource" href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a></div>)}
    {subject.editable && <div className="academic-form-footer">
      <button type="button" className="academic-btn academic-btn-primary" disabled={action.busy || !dirty}
        onClick={() => save('delivery', { chapterProgress: progress, resources })}><Save size={15} /> Save coverage and resources</button>
    </div>}
    {(subject.editable || openRequest) && <div className="academic-divider academic-compact">
      <h3>Syllabus change request</h3>
      {openRequest && <p className="academic-notice">{subject.changeRequest.note}</p>}
      {openRequest && canAssign && <button type="button" className="academic-btn justify-self-start" disabled={action.busy || dirty}
        onClick={() => save('resolve', {})}>Mark reviewed</button>}
      {subject.editable && !openRequest && <>
        <TextareaInput label="Proposed change to chapters or books" rows={2} maxLength={800} value={note} onChange={(event) => setNote(event.target.value)} />
        <button type="button" className="academic-btn justify-self-start" disabled={action.busy || dirty || !note.trim()}
          onClick={() => save('request', { note })}>Send to academic lead</button>
      </>}
    </div>}
    <ActionFeedback action={action} />
  </section>;
}
