import { useEffect, useRef, useState } from 'react';
import { Bookmark, GraduationCap } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/ui/Loader.jsx';
import { ROUTES } from '../../routes/routes.js';
import api from '../../services/api.js';
import studentService from '../../services/studentService.js';
import { clearStudentDraft, emptyStudentForm, getStudentDraft, saveStudentDraft, studentFormPayload, studentToForm } from '../../utils/studentForm.js';
import StudentForm from './StudentForm.jsx';

function StudentEditor({ studentId }) {
  const editing = Boolean(studentId);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [draft, setDraft] = useState(() => editing ? null : getStudentDraft());
  const [form, setForm] = useState(() => state?.resumeDraft && draft ? { ...emptyStudentForm(), ...draft.form } : emptyStudentForm());
  const [stepIndex, setStepIndex] = useState(() => state?.resumeDraft ? draft?.step || 0 : 0);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState({});
  const actionsLocked = submitting || Object.values(busy).some(Boolean);
  const [draftMessage, setDraftMessage] = useState('');
  const activeSession = useRef(null);
  const saving = useRef(false);
  const cancelPath = editing ? ROUTES.STUDENTS.detail(studentId) : ROUTES.STUDENTS.LIST;

  useEffect(() => {
    let active = true;
    if (editing) {
      studentService.getById(studentId).then((result) => {
        if (!active) return;
        const student = result?.student || result?.data?.student || (result?._id || result?.id ? result : null);
        if (!student) throw new Error('Student record not found.');
        setStudentName(student.name || [student.firstName, student.lastName].filter(Boolean).join(' '));
        setForm(studentToForm(student));
      }).catch((error) => {
        if (active) setLoadError(error.message || 'Could not load the student record.');
      }).finally(() => {
        if (active) setLoading(false);
      });
    } else {
      api.get('/sessions/active').then(({ data }) => {
        const session = data?.session || data?.data?.session;
        if (!active || !session) return;
        activeSession.current = {
          ...(session.sessionName && { academicYear: session.sessionName }),
          sessionId: session._id || session.id || null,
        };
        setForm((current) => ({ ...current, ...activeSession.current }));
      }).catch(() => {
        // Registration also supports the calendar academic year when there is no configured session.
      });
    }
    return () => { active = false; };
  }, [editing, studentId]);

  function restoreDraft() {
    setForm({ ...emptyStudentForm(), ...draft.form, ...activeSession.current });
    setStepIndex(draft.step || 0);
    setDraftMessage('Draft restored. Set a password again in the Portal step.');
  }

  function saveDraft() {
    const saved = saveStudentDraft(form, stepIndex);
    if (saved) setDraft(saved);
    setDraftMessage(saved ? 'Draft saved on this device. Passwords must be entered again when you resume.' : 'Could not save a draft on this device.');
  }

  async function submit() {
    if (saving.current) return;
    saving.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = studentFormPayload(form, editing);
      const result = editing ? await studentService.update(studentId, payload) : await studentService.create(payload);
      const data = result?.data || result;
      if (data?.success === false) throw new Error(data.message);
      if (!editing) clearStudentDraft();
      const id = data?.student?._id || data?.student?.id || studentId;
      navigate(id ? ROUTES.STUDENTS.detail(id) : ROUTES.STUDENTS.LIST, { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || 'Could not save the student. Please try again.');
    } finally {
      saving.current = false;
      setSubmitting(false);
    }
  }

  if (loading) return <Loader fullPage size="lg" text="Loading student record…" />;

  return (
    <div className="student-registration">
      <div className="student-page-heading">
        <nav aria-label="Breadcrumb" className="student-breadcrumb">
          <Link to={ROUTES.STUDENTS.LIST}>Students</Link>
          <span aria-hidden="true">/</span><span>{editing ? 'Edit student' : 'Registration'}</span>
        </nav>
        <div className="student-page-title">
          <div className="student-page-icon"><GraduationCap size={26} /></div>
          <div>
            <h1>{editing ? 'Edit student' : 'Register student'}</h1>
            {editing && studentName && <p>{studentName}</p>}
          </div>
        </div>
      </div>
      {loadError ? <p role="alert" className="student-submit-error student-error">{loadError}</p> : (
        <>
          {!editing && draft && (
            <div className="student-draft-banner">
              <span><Bookmark size={16} /> Saved draft</span>
              <div>
                <button type="button" disabled={actionsLocked} className="student-link" onClick={restoreDraft}>Resume</button>
                <button type="button" disabled={actionsLocked} className="student-link" onClick={() => {
                  clearStudentDraft();
                  setDraft(null);
                  setDraftMessage('Saved draft discarded.');
                }}>Discard</button>
              </div>
            </div>
          )}
          {draftMessage && <p role="status" className="student-draft-message">{draftMessage}</p>}
          <StudentForm form={form} setForm={setForm} editing={editing} onSubmit={submit} onCancel={() => navigate(cancelPath)}
            onSaveDraft={saveDraft} submitting={submitting} submitError={submitError} onClearError={() => setSubmitError('')}
            stepIndex={stepIndex} setStepIndex={setStepIndex} busy={busy} setBusy={setBusy} />
        </>
      )}
    </div>
  );
}

export default function StudentEdit() {
  const { studentId } = useParams();
  return <StudentEditor key={studentId || 'register'} studentId={studentId} />;
}
