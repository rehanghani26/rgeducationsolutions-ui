import { useId, useState } from 'react';
import { BookOpen, ExternalLink, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { Empty, ErrorMessage, Field, Pending } from '../../../components/ui/ProcurementUI.jsx';
import { timeRange } from '../masterPeriods/masterPeriodValues.js';
import { emptyAllocation, hasAssignment, textKey } from './timetableValues.js';

export function AssignmentDialog({ selection, assignment, options, canCopy, onRetry, onApply, onClose }) {
  const subjectList = useId();
  const [draft, setDraft] = useState(assignment || emptyAllocation);
  const [copy, setCopy] = useState(false);
  const { day, slot } = selection;
  const syllabus = options.syllabus?.subjects || [];
  const names = new Map([...syllabus.map((item) => item.subjectName), ...options.subjects]
    .filter(Boolean).map((name) => [textKey(name), name]));
  const subject = syllabus.find((item) => textKey(item.subjectName) === textKey(draft.subject));
  const book = draft.bookName || subject?.bookName;
  const savedTeacher = draft.teacherId || (draft.teacherName ? 'saved-teacher' : '');
  const fallbackTeacher = savedTeacher && !options.teachers.some((item) => String(item._id || item.id) === String(savedTeacher));
  const optionError = options.syllabusError || options.teachersError || options.subjectsError;

  function changeSubject(value) {
    const match = syllabus.find((item) => textKey(item.subjectName) === textKey(value));
    setDraft((previous) => ({
      ...previous, subject: value, bookName: match?.bookName || '', subjectCode: match?.subjectCode || '',
    }));
  }

  function changeTeacher(value) {
    const teacher = options.teachers.find((item) => String(item._id || item.id) === value);
    setDraft((previous) => ({ ...previous, teacherId: teacher ? value : '', teacherName: teacher?.name || '' }));
  }

  function apply() {
    onApply({
      ...draft,
      subject: draft.subject.trim(),
      roomNo: draft.roomNo.trim(),
      bookName: book || '',
      subjectCode: draft.subjectCode || subject?.subjectCode || '',
    }, copy);
  }

  const footer = <>
    {hasAssignment(assignment) && <button type="button" className="proc-btn ct-danger ct-clear" onClick={() => onApply(emptyAllocation, false)}>
      <Trash2 size={15} /> Clear period
    </button>}
    <button type="button" className="proc-btn" onClick={onClose}>Cancel</button>
    <button type="button" className="proc-btn proc-primary" disabled={!hasAssignment(draft)} onClick={apply}>Apply assignment</button>
  </>;

  return (
    <Modal open onClose={onClose} title={hasAssignment(assignment) ? 'Edit teaching period' : 'Assign teaching period'}
      subtitle={day.label + ' · ' + slot.label + ' · ' + timeRange(slot.startTime, slot.endTime)}
      size="md" className="ct-dialog" footer={footer}
    >
      <div className="ct-assignment-fields">
        {optionError && <ErrorMessage error={optionError} onRetry={onRetry} />}
        <Field label="Subject" hint="Choose a suggestion or type a custom subject.">
          <input type="text" className="ct-control" list={subjectList} value={draft.subject} onChange={(event) => changeSubject(event.target.value)} autoFocus />
        </Field>
        <datalist id={subjectList}>
          {[...names.values()].map((name) => <option value={name} key={name} />)}
        </datalist>
        {book && <div className="ct-book-note"><BookOpen size={16} /><div><strong>{book}</strong>
          <p>{[subject?.author, subject?.publisher].filter(Boolean).join(' · ') || 'Prescribed book'}</p>
        </div></div>}
        <div className="ct-assignment-pair">
          <Field label="Teacher">
            <select className="ct-control" value={savedTeacher} onChange={(event) => changeTeacher(event.target.value)}>
              <option value="">{options.loading ? 'Loading teachers…' : 'Choose a teacher'}</option>
              {fallbackTeacher && <option value={savedTeacher}>{draft.teacherName || 'Saved teacher'}</option>}
              {options.teachers.map((teacher) => <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                {teacher.name}{teacher.employeeId ? ' · ' + teacher.employeeId : ''}
              </option>)}
            </select>
          </Field>
          <Field label="Room">
            <input type="text" className="ct-control" placeholder="e.g. Room 12" value={draft.roomNo} onChange={(event) => setDraft({ ...draft, roomNo: event.target.value })} />
          </Field>
        </div>
        {canCopy && <label className="ct-copy-option">
          <input type="checkbox" checked={copy} onChange={(event) => setCopy(event.target.checked)} />
          <span><strong>Apply to other school days</strong><small>Replace assignments for {slot.label} on days that have it.</small></span>
        </label>}
      </div>
    </Modal>
  );
}

export function SyllabusDialog({ className, options, onClose, onRetry, onOpenSettings }) {
  const subjects = options.syllabus?.subjects || [];
  return (
    <Modal open onClose={onClose} title={className + ' syllabus and books'} size="xl" className="ct-dialog"
      footer={<>
        <button type="button" className="proc-btn" onClick={onOpenSettings}><ExternalLink size={15} /> Syllabus settings</button>
        <button type="button" className="proc-btn" onClick={onClose}>Close</button>
      </>}
    >
      {options.loading ? <Pending label="Loading syllabus…" />
        : options.syllabusError ? <ErrorMessage error={options.syllabusError} onRetry={onRetry} />
        : subjects.length ? <div className="ct-book-grid">
          {subjects.map((item, index) => <article key={item.subjectCode || item.subjectName + index}>
            <strong>{item.subjectName}{item.subjectCode && <span>{item.subjectCode}</span>}</strong>
            <p>{item.bookName || 'No prescribed book'}</p>
            {(item.author || item.publisher) && <small>{[item.author, item.publisher].filter(Boolean).join(' · ')}</small>}
            <small>Maximum {item.maxMarks ?? 100} marks · Pass {item.passMarks ?? 35}</small>
          </article>)}
        </div> : <Empty icon={BookOpen} title="No syllabus configured" description="Add class subjects and prescribed books in Syllabus settings." />}
    </Modal>
  );
}
