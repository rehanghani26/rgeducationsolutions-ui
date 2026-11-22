import { useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, ClipboardCheck, Files, GraduationCap } from 'lucide-react';
import { SelectInput } from '../../components/ui/FormControls.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { getMyAcademics } from '../../services/syllabusService.js';
import { AcademicHero, AcademicLoad, AcademicState, AcademicTabs, Progress, Status, useAcademicData } from './AcademicUI.jsx';
import { AcademicTimetable } from './AcademicTimetable.jsx';
import { BookList } from './AcademicBooks.jsx';

const tabs = [
  { id: 'subjects', label: 'Subjects', icon: GraduationCap },
  { id: 'books', label: 'Prescribed books', icon: BookOpen },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'resources', label: 'Study resources', icon: Files },
  { id: 'results', label: 'Results', icon: ClipboardCheck },
];

export default function StudentAcademicView() {
  const { sessionId, sessionsLoading, sessionsError } = useAcademicSession();
  const [studentId, chooseStudent] = useState('');
  const [tab, chooseTab] = useState('subjects');
  const [expanded, setExpanded] = useState('');
  const state = useAcademicData(sessionId ? sessionId + '/' + studentId : '', (signal) => getMyAcademics(studentId, signal));
  const data = state.data;
  const enrollment = data?.enrollment;
  const description = [enrollment?.className, enrollment?.sectionName, data?.sessionName].filter(Boolean).join(' · ');
  return <div className="academic-workspace">
    <AcademicHero title="My Academics" icon={GraduationCap} description={description || 'Your subjects, books, timetable, and results.'} />
    {(sessionsLoading || sessionsError || state.loading || state.error) && <AcademicLoad state={sessionsError ? { error: sessionsError } : state} />}
    {!sessionsLoading && !sessionsError && !sessionId && <AcademicState title="Academic session unavailable" detail="Your school needs to configure an academic session." />}
    {data?.students.length > 1 && <section className="academic-panel">
      <SelectInput label="Choose a linked child" value={data.student?.id || ''} options={data.students.map((student) => ({ value: student.id, label: student.name }))}
        onChange={(event) => { chooseStudent(event.target.value); setExpanded(''); }} />
    </section>}
    {data && !enrollment && <AcademicState title={data.student ? 'No enrollment for this session' : 'Account needs a student link'}
      detail="Contact the school office if you expected to see a classroom here." />}
    {enrollment && <>
      <section className="academic-panel academic-panel-head">
        <div><h2>{data.student.name}</h2>
          <p className="academic-muted">{[enrollment.rollNumber != null && 'Roll ' + enrollment.rollNumber,
            enrollment.classTeacherName && 'Class teacher · ' + enrollment.classTeacherName].filter(Boolean).join(' · ')}</p>
        </div>
        {data.syllabusVersion > 0 && <Status value="published">Published syllabus v{data.syllabusVersion}</Status>}
      </section>
      <AcademicTabs tabs={tabs} active={tab} change={chooseTab} />
      {tab === 'subjects' && (data.subjects.length ? <section className="academic-panel academic-compact">
        <div><h2>Class progress</h2><p className="academic-muted">Chapter coverage reported by your subject teachers.</p></div>
        {data.subjects.map((subject) => <div className="academic-tile" key={subject.subjectId}>
          <button type="button" className="academic-row academic-navigate" aria-expanded={expanded === subject.subjectId}
            onClick={() => setExpanded(expanded === subject.subjectId ? '' : subject.subjectId)}>
            <span><strong>{subject.subjectName}</strong><small>{subject.teacherName || 'Subject teacher pending'}</small></span>
            <Progress completed={subject.completed} total={subject.chapters.length} />
          </button>
          {expanded === subject.subjectId && subject.chapters.map((chapter) => <div className="academic-row" key={chapter.id}>
            <span><strong>{chapter.title}</strong>{chapter.term && <small>{chapter.term}</small>}</span>
            <Status value={subject.chapterProgress.find((row) => row.chapterId === chapter.id)?.status || 'upcoming'} />
          </div>)}
        </div>)}
      </section> : <AcademicState title="Syllabus awaiting publication" detail="The school will publish the subjects and chapters for your class." />)}
      {tab === 'books' && <BookList subjects={data.subjects} context={description} showAvailability />}
      {tab === 'timetable' && <AcademicTimetable key={description} slots={data.timetable} />}
      {tab === 'resources' && <Resources subjects={data.subjects} />}
      {tab === 'results' && <Results results={data.results} />}
    </>}
  </div>;
}

function Resources({ subjects }) {
  const resources = subjects.flatMap((subject) => subject.resources.map((item) => ({
    ...item, subject: subject.subjectName, chapter: subject.chapters.find((chapter) => chapter.id === item.chapterId)?.title,
  })));
  if (!resources.length) return <AcademicState icon={Files} title="No shared resources" detail="Study links will appear here when a teacher shares them with your section." />;
  return <section className="academic-panel academic-compact"><h2>Study resources</h2>
    {resources.map((item) => <div className="academic-row" key={item.subject + '/' + item.id}>
      <span><strong>{item.title}</strong><small>{[item.subject, item.chapter].filter(Boolean).join(' · ')}</small></span>
      <a className="academic-btn" href={item.url} target="_blank" rel="noreferrer">Open resource <ArrowUpRight size={15} /></a>
    </div>)}
  </section>;
}

function Results({ results }) {
  if (!results.length) return <AcademicState icon={ClipboardCheck} title="No published results" detail="Your marks will appear after the school publishes them." />;
  return <section className="academic-panel academic-compact"><h2>Published results</h2>
    {results.map((result, index) => <details className="academic-tile" key={index}>
      <summary className="cursor-pointer text-sm font-semibold">{result.examName} · {result.totalObtained} / {result.totalMaxMarks}{result.grade && ' · Grade ' + result.grade}</summary>
      <div className="academic-compact">{(result.marks || []).map((mark, i) => <div className="academic-row" key={i}>
        <strong>{mark.subjectName}</strong><span>{mark.obtained} / {mark.maxMarks}</span>
      </div>)}</div>
    </details>)}
  </section>;
}
