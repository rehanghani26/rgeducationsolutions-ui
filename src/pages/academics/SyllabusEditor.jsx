import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, BookMarked, BookOpen, ChevronDown, Copy, Eye, ListOrdered, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Input, SelectInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import ConfirmationBox from '../../components/ui/ConfirmationBox.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { changeSyllabusStatus, copySyllabus, getSyllabusDraft, saveSyllabusDraft } from '../../services/syllabusService.js';
import { ActionFeedback, AcademicLoad, AcademicState, Status, formatDate, idOf, newAcademicId, useAcademicAction, useAcademicData } from './AcademicUI.jsx';
import { BookList } from './AcademicBooks.jsx';

import './syllabus.css';

const countLabel = (count, noun) => count + ' ' + noun + (count === 1 ? '' : 's');
const chapterId = (chapter, index) => chapter.id || String(index);
const blankBook = { title: '', edition: '', author: '', publisher: '', isbn: '', catalogBookId: '', required: true };
const formatClass = (grade) => ({ value: grade.id, label: grade.name });
const revise = (rows, index, values) => rows.map((row, i) => i === index ? { ...row, ...values } : row);
const remove = (rows, index) => rows.filter((_, i) => i !== index);
const move = (rows, index, direction) => {
  const next = [...rows];
  const target = index + direction;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export function SyllabusEditor({ classId, onClassChange, refreshWorkspace }) {
  const { classOptions, sessionId, readOnly, sessionsLoading, sessionsError } = useAcademicSession();
  const [choice, choose] = useState('');
  const current = classOptions.find(({ id }) => id === (classId || choice))?.id || classOptions[0]?.id;
  const data = useAcademicData(sessionId && sessionId !== 'legacy' && current ? sessionId + '/' + current : '',
    (signal) => getSyllabusDraft(current, signal));
  if (sessionsLoading || sessionsError || data.loading || data.error) {
    return <AcademicLoad state={sessionsError ? { error: sessionsError } : data} />;
  }
  if (!current || !data.data) return <AcademicState title="Choose an academic session and class"
    detail="Set the school class range before building the syllabus." />;
  return <SyllabusDraft key={sessionId + '/' + current + '/' + (data.data.draft.revision || 0)} record={data.data}
    classPicker={<SelectInput label="Class" options={classOptions.map(formatClass)} value={current}
      onChange={(event) => onClassChange ? onClassChange(event.target.value) : choose(event.target.value)} />}
    readOnly={readOnly} onSaved={() => { data.reload(); refreshWorkspace?.(); }} />;
}

function SyllabusDraft({ record, classPicker, readOnly, onSaved }) {
  const { draft, subjects: catalog, books } = record;
  const { sessions } = useAcademicSession();
  const [subjects, setSubjects] = useState(draft.subjects);
  const [description, setDescription] = useState(draft.description || '');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [expanded, setExpanded] = useState(0);
  const [chapterKey, selectChapter] = useState(null);
  const chapterNodes = useRef(new Map());
  const pendingJump = useRef(null);
  const headingId = useId();
  const [preview, setPreview] = useState(false);
  const [historyVersion, setHistoryVersion] = useState('');
  const [source, setSource] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const action = useAcademicAction();
  const dirty = subjects !== draft.subjects || description !== (draft.description || '');
  const revision = draft.revision || 0;
  const available = useMemo(() => catalog.filter((entry) => !subjects.some((row) => row.subjectId === entry.id)), [catalog, subjects]);
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const published = historyVersion ? (draft.history || []).find((row) => String(row.version) === historyVersion) : draft.published;

  const rows = preview ? published?.subjects || [] : subjects;
  const selectedIndex = rows[expanded] ? expanded : 0;
  const subject = rows[selectedIndex];
  const subjectName = (row) => (preview ? '' : catalog.find((item) => item.id === row.subjectId)?.name) || row.subjectName || 'Unmapped subject';
  const chapters = subject?.chapters || [];
  const overview = preview ? published?.description : description;

  function pickSubject(index) {
    setExpanded(index);
    selectChapter(null);
  }
  function focusChapter(key) {
    const node = chapterNodes.current.get(key);
    node?.focus({ preventScroll: true });
    node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function openChapter(key) {
    if (key === chapterKey) return focusChapter(key);
    pendingJump.current = key;
    selectChapter(key);
  }
  useEffect(() => {
    if (chapterKey !== null && pendingJump.current === chapterKey) focusChapter(chapterKey);
    pendingJump.current = null;
  }, [chapterKey]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function addSubject() {
    const subject = available.find((row) => row.id === newSubjectId);
    if (!subject) return;
    pickSubject(subjects.length);
    setSubjects([...subjects, { subjectId: subject.id, subjectName: subject.name, maxMarks: 100, passMarks: 35, books: [], chapters: [] }]);
    setNewSubjectId('');
  }
  function save() {
    return action.run(async () => {
      await saveSyllabusDraft(draft.classId, { revision, description, subjects });
      onSaved();
    }, 'Draft saved.');
  }
  function status(next) {
    return action.run(async () => {
      await changeSyllabusStatus(draft.classId, { revision, action: next, note: reviewNote });
      onSaved();
    });
  }
  function copy() {
    action.run(async () => {
      const previous = await copySyllabus(draft.classId, source);
      setSubjects(previous.subjects);
      setDescription(previous.description || '');
      pickSubject(0);
    }, 'Previous syllabus loaded into the editor. Save it as a draft when ready.');
  }

  return <div className="syllabus-workbench">
    <header className="syllabus-mast academic-panel">
      <div className="syllabus-heading">
        <span className="academic-icon"><BookMarked size={25} aria-hidden="true" /></span>
        <div><div className="syllabus-heading-line"><h2>{draft.className} syllabus</h2>
          <Status value={preview ? 'published' : draft.status || (idOf(draft) ? 'legacy' : 'unplanned')} /></div>
          <p>{countLabel(rows.length, 'subject')} · {countLabel(rows.reduce((n, row) => n + (row.chapters?.length || 0), 0), 'chapter')}{preview && ' · Student view'}</p>
        </div>
      </div>
      <div className="syllabus-tools">{classPicker}
        {draft.published && <button type="button" className="academic-btn" onClick={() => { setPreview(!preview); pickSubject(0); }}>
          <Eye size={16} /> {preview ? 'Back to plan' : 'View published'}
        </button>}
      </div>
    </header>
    {preview && draft.history?.length > 0 && <SelectInput label="Published version" value={historyVersion}
      onChange={(event) => { setHistoryVersion(event.target.value); pickSubject(0); }}>
      <option value="">Latest version</option>
      {draft.history.map((row) => <option key={row.version} value={row.version}>Version {row.version} · {formatDate(row.publishedAt)}</option>)}
    </SelectInput>}
    <section className="syllabus-subjects academic-panel">
      <div className="academic-panel-head"><h2>Subjects</h2></div>
      {!!rows.length && <nav className="syllabus-subject-nav" aria-label="Syllabus subjects">{rows.map((row, index) =>
        <button type="button" key={row.subjectId || index} aria-pressed={index === selectedIndex}
          onClick={() => pickSubject(index)}>{subjectName(row)}</button>)}</nav>}
      {!preview && !readOnly && available.length > 0 && <details className="syllabus-add-subject" open={subjects.length ? undefined : true}>
        <summary><Plus size={15} /> Add subject</summary>
        <div className="syllabus-add-controls"><SelectInput label="Subject Master" value={newSubjectId} onChange={(event) => setNewSubjectId(event.target.value)}>
          <option value="">Choose a subject</option>
          {available.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.code}</option>)}
        </SelectInput><button type="button" className="academic-btn" disabled={!newSubjectId} onClick={addSubject}>Add to syllabus</button></div>
      </details>}
    </section>
    <div className="syllabus-layout">
      <section className="syllabus-content academic-panel" aria-labelledby={headingId}>
        <div className="syllabus-content-head"><BookOpen size={23} aria-hidden="true" /><div>
          <h2 id={headingId}>{subject ? subjectName(subject) : 'Class syllabus'}</h2>
          {subject && <p>{countLabel(chapters.length, 'chapter')} · {countLabel(subject.books?.length || 0, 'book')}</p>}
        </div></div>
        <div className="syllabus-content-body academic-compact">
          {subject ? <SubjectFields key={(preview ? 'published' : 'draft') + selectedIndex + '/' + historyVersion} subject={subject} books={books}
            available={available} readOnly={readOnly || preview} hideBooks={preview} chapterKey={chapterKey} selectChapter={selectChapter} openChapter={openChapter}
            chapterNodes={chapterNodes} onChange={(values) => setSubjects(revise(subjects, selectedIndex, values))}
            onRemove={() => { setSubjects(remove(subjects, selectedIndex)); pickSubject(Math.max(0, selectedIndex - 1)); }} />
            : <AcademicState title="No subjects in this syllabus" detail={!preview && !readOnly ? (available.length ? 'Choose a subject from Subject Master to begin.' : 'Create a subject in Subject Master to begin.') : undefined} />}
          {preview && published && <BookList subjects={rows} context={[draft.className, draft.academicYear].join(' · ')} />}
          {(!preview || overview) && <details className="syllabus-disclosure"><summary>Syllabus overview <ChevronDown size={16} /></summary>
            {preview || readOnly ? <p>{overview || 'No overview added.'}</p> : <TextareaInput label="Overview" rows={3} value={description}
              onChange={(event) => setDescription(event.target.value)} maxLength={1000} />}
          </details>}
          {!preview && draft.reviewNote && <p className="academic-notice">{draft.reviewNote}</p>}
        </div>
      </section>
      <div className="syllabus-rail">
        <nav className="syllabus-outline academic-panel" aria-label="Chapter outline">
          <div className="syllabus-rail-head"><ListOrdered size={20} aria-hidden="true" /><h2>Chapter outline</h2></div>
          {subject && <p className="syllabus-outline-subject">{subjectName(subject)}</p>}
          {chapters.length ? <ol>{chapters.map((chapter, index) => {
            const key = chapterId(chapter, index);
            return <li key={key}>
              {(!index || chapter.term !== chapters[index - 1].term) && chapter.term && <div className="syllabus-term">{chapter.term}</div>}
              <button type="button" aria-current={chapterKey === key ? 'location' : undefined} onClick={() => openChapter(key)}>
                <span>{index + 1}</span>{chapter.title?.trim() || 'Untitled chapter'}
              </button>
            </li>;
          })}</ol> : <p className="academic-muted">No chapters yet.</p>}
        </nav>
        <aside className="academic-panel syllabus-publishing academic-compact">
      <h2>Publishing</h2>
      <p className="academic-muted">{draft.published ? 'Version ' + draft.published.version + ' published ' + formatDate(draft.published.publishedAt)
        : 'Students will see this plan after it is published.'}</p>
      {readOnly ? <Status>Read-only session</Status> : <>
        {(!revision || dirty) && <button type="button" className="academic-btn academic-btn-primary" disabled={action.busy || !subjects.length}
          onClick={save}><Save size={15} /> Save draft</button>}
        {draft.status === 'draft' && !dirty && <button type="button" className="academic-btn academic-btn-primary"
          disabled={action.busy} onClick={() => status('submit')}>Submit for review</button>}
        {draft.status === 'in-review' && !dirty && <>
          <button type="button" className="academic-btn academic-btn-primary" disabled={action.busy} onClick={() => setConfirming(true)}>Publish syllabus</button>
          <TextareaInput label="Review note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={500} rows={2} />
          <button type="button" className="academic-btn" disabled={action.busy || !reviewNote.trim()} onClick={() => status('return')}>Return to draft</button>
        </>}
        {!idOf(draft) && completedSessions.length > 0 && <div className="academic-divider academic-compact">
          <SelectInput label="Copy from a completed session" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">Choose a session</option>
            {completedSessions.map((session) => <option key={idOf(session)} value={idOf(session)}>{session.sessionName}</option>)}
          </SelectInput>
          <button type="button" className="academic-btn" disabled={action.busy || !source || dirty} onClick={copy}><Copy size={15} /> Load previous syllabus</button>
        </div>}
      </>}
      {!confirming && <ActionFeedback action={action} />}
        </aside>
      </div>
    </div>
    {confirming && <ConfirmationBox heading="Publish this syllabus?"
      confirmationMessage="Students and teachers will see this version, including the prescribed books and chapters."
      leftButtonName="Cancel" rightButtonName="Publish" onLeftButtonClick={() => setConfirming(false)}
      onRightButtonClick={async () => { if (await status('publish')) setConfirming(false); }}>
      <ActionFeedback action={action} />
    </ConfirmationBox>}
  </div>;
}

function SubjectFields({ subject, books, available, readOnly, hideBooks, chapterKey, selectChapter, openChapter, chapterNodes, onChange, onRemove }) {
  const chapters = subject.chapters || [];
  return <div className="academic-compact">
    {!subject.subjectId && !readOnly && <SelectInput label="Match this subject to Subject Master" value="" onChange={(event) => {
      const match = available.find((item) => item.id === event.target.value);
      if (match) onChange({ subjectId: match.id, subjectName: match.name });
    }}>
      <option value="">Choose a subject</option>
      {available.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.code}</option>)}
    </SelectInput>}
    <div className="academic-panel-head syllabus-section-title"><h3>Chapters</h3>
      {!readOnly && <button type="button" className="academic-btn" onClick={() => {
        const id = newAcademicId();
        onChange({ chapters: [...subject.chapters, { id, title: '', term: '' }] });
        openChapter(id);
      }}><Plus size={15} /> Add chapter</button>}
    </div>
    {!chapters.length && <p className="academic-muted">No chapters yet.</p>}
    <ol className="syllabus-chapters">{chapters.map((chapter, index) => {
      const key = chapterId(chapter, index);
      const selected = key === chapterKey;
      const title = chapter.title?.trim() || 'Untitled chapter';
      return <li key={key} className={selected ? 'is-selected' : undefined}>
        <button type="button" className="syllabus-chapter-row" ref={(node) => {
          if (node) chapterNodes.current.set(key, node);
          else chapterNodes.current.delete(key);
        }} aria-expanded={readOnly ? undefined : selected} onClick={() => selectChapter(selected ? null : key)}>
          <span className="syllabus-number">{String(index + 1).padStart(2, '0')}</span>
          <strong>{title}</strong>{chapter.term && <small>{chapter.term}</small>}
          {!readOnly && <Pencil size={15} aria-hidden="true" />}
        </button>
        {selected && !readOnly && <div className="syllabus-chapter-edit">
          <div className="academic-fields">
            <Input label="Chapter title" value={chapter.title} maxLength={160}
              onChange={(event) => onChange({ chapters: revise(subject.chapters, index, { title: event.target.value }) })} />
            <Input label="Term" placeholder="e.g. Term 1" value={chapter.term} maxLength={80}
              onChange={(event) => onChange({ chapters: revise(subject.chapters, index, { term: event.target.value }) })} />
          </div>
          <div className="academic-actions">
            <button type="button" className="academic-btn" disabled={!index}
              onClick={() => onChange({ chapters: move(subject.chapters, index, -1) })}><ArrowUp size={15} /> Move up</button>
            <button type="button" className="academic-btn" disabled={index === subject.chapters.length - 1}
              onClick={() => onChange({ chapters: move(subject.chapters, index, 1) })}><ArrowDown size={15} /> Move down</button>
            <button type="button" className="academic-btn" aria-label={'Remove chapter ' + title}
              onClick={() => { onChange({ chapters: remove(subject.chapters, index) }); selectChapter(null); }}><Trash2 size={15} /></button>
          </div>
        </div>}
      </li>;
    })}</ol>
    <details className="syllabus-disclosure"><summary>Assessment <span>{subject.maxMarks} marks · Pass {subject.passMarks}</span><ChevronDown size={16} /></summary>
      <div className="academic-fields">
        <Input label="Full marks" type="number" min="1" value={subject.maxMarks} readOnly={readOnly} onChange={(event) => onChange({ maxMarks: event.target.value })} />
        <Input label="Pass marks" type="number" min="0" value={subject.passMarks} readOnly={readOnly} onChange={(event) => onChange({ passMarks: event.target.value })} />
      </div>
    </details>
    {!hideBooks && <>
    <div className="academic-panel-head academic-divider"><h3>Prescribed books</h3>
      {!readOnly && <button type="button" className="academic-btn" onClick={() => onChange({ books: [...subject.books, { ...blankBook }] })}><Plus size={15} /> Add book</button>}
    </div>
    {!subject.books.length && <p className="academic-muted">No books assigned.</p>}
    {subject.books.map((book, index) => <BookDisclosure key={index} book={book}>
      {!readOnly && books.length > 0 && <SelectInput label="Library catalog (optional)" value={book.catalogBookId || ''}
        onChange={(event) => {
          const match = books.find((row) => row.id === event.target.value);
          const values = match ? { catalogBookId: match.id, title: match.title, author: match.author, isbn: match.isbn } : { catalogBookId: '' };
          onChange({ books: revise(subject.books, index, values) });
        }}>
        <option value="">Enter a book manually</option>
        {books.map((entry) => <option key={entry.id} value={entry.id}>{entry.title} · {entry.isbn}</option>)}
      </SelectInput>}
      <div className="academic-fields">{[['title', 'Title'], ['edition', 'Edition'], ['author', 'Author'], ['publisher', 'Publisher'], ['isbn', 'ISBN']].map(([field, label]) =>
        <Input key={field} label={label} value={book[field] || ''} readOnly={readOnly}
          onChange={(event) => onChange({ books: revise(subject.books, index, { [field]: event.target.value }) })} />)}</div>
      <div className="academic-panel-head">
        <label className="academic-check"><input type="checkbox" disabled={readOnly} checked={book.required !== false}
          onChange={(event) => onChange({ books: revise(subject.books, index, { required: event.target.checked }) })} /> Required book</label>
        {!readOnly && <button type="button" className="academic-btn" onClick={() => onChange({ books: remove(subject.books, index) })}><Trash2 size={15} /> Remove book</button>}
      </div>
    </BookDisclosure>)}
    </>}
    {!readOnly && <div className="academic-form-footer"><button type="button" className="academic-btn" onClick={onRemove}><Trash2 size={15} /> Remove subject</button></div>}
  </div>;
}

function BookDisclosure({ book, children }) {
  const [open, setOpen] = useState(!book.title);
  return <details className="syllabus-disclosure syllabus-book" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary><BookMarked size={17} />{book.title || 'Untitled book'}<ChevronDown size={16} /></summary>
    <div className="academic-compact">{children}</div>
  </details>;
}

export default function ClassSyllabusSettings() {
  return <div className="academic-workspace"><SyllabusEditor /></div>;
}
