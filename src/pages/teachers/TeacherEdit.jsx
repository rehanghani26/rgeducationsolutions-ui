import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { ErrorMessage, Pending } from '../../components/ui/ProcurementUI.jsx';
import TeacherForm from './TeacherForm.jsx';
import { TeacherCredentialsDialog } from './TeacherProfileParts.jsx';
import { blankTeacherForm, payloadFromForm, teacherDraftFromRecord, teacherManagerRoles } from '../../utils/teacherForm.js';
import { createTeacher, getTeacherById, updateTeacher } from '../../services/teacherService.js';
import { notifyApiError } from '../../services/apiErrors.js';
import { getUserRole } from '../../config/access.jsx';
import { ROUTES } from '../../routes/routes.js';
import './teacher.css';

export default function TeacherEdit() {
  const { teacherId } = useParams();
  const [query] = useSearchParams();
  const initialStep = teacherId && query.get('step') === 'documents' ? 'documents' : 'personal';
  return <TeacherProfileEditor key={(teacherId || 'new') + '-' + initialStep} teacherId={teacherId} initialStep={initialStep} />;
}

function TeacherProfileEditor({ teacherId, initialStep }) {
  const navigate = useNavigate();
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const canManage = teacherManagerRoles.includes(role);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(Boolean(teacherId));
  const [loadError, setLoadError] = useState(null);
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(blankTeacherForm);
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [login, setLogin] = useState(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!teacherId || !canManage) return;
    const request = new AbortController();
    setLoading(true);
    setLoadError(null);
    getTeacherById(teacherId, request.signal).then((data) => {
      if (request.signal.aborted) return;
      const teacher = data.teacher || data.data?.teacher;
      if (!teacher) throw new Error('Teacher profile could not be loaded.');
      setRecord(teacher);
      setForm(teacherDraftFromRecord(teacher));
    }).catch((error) => {
      if (!request.signal.aborted) setLoadError(error);
    }).finally(() => {
      if (!request.signal.aborted) setLoading(false);
    });
    return () => request.abort();
  }, [teacherId, canManage, reload]);

  const returnPath = teacherId ? ROUTES.TEACHERS.detail(teacherId) : ROUTES.TEACHERS.LIST;
  async function save() {
    if (submitting.current || !canManage) return;
    submitting.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const profile = payloadFromForm(form, Boolean(teacherId));
      const { data } = teacherId ? await updateTeacher(teacherId, profile, files) : await createTeacher(profile, files);
      const id = data.teacher?._id || data.teacher?.id || teacherId;
      if (!data.success || !id) throw new Error(data.message || 'Teacher profile could not be saved.');
      if (!teacherId && data.accountCreated) setLogin({ ...data.accountCreated, id });
      else navigate(ROUTES.TEACHERS.detail(id));
    } catch (error) {
      setSaveError(error);
      notifyApiError(error, 'Could not save the teacher profile.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <main className="teacher-page">
    <PageHeader title={teacherId ? 'Edit teacher' : 'Register teacher'} subtitle={record?.name}
      breadcrumbs={[{ label: 'Teachers', to: ROUTES.TEACHERS.LIST }, { label: teacherId ? 'Edit profile' : 'Registration' }]} />
    {!canManage ? <ErrorMessage error="You do not have permission to manage teacher profiles." />
      : loading ? <Pending label="Loading teacher profile…" />
      : loadError ? <ErrorMessage error={loadError} onRetry={() => setReload((value) => value + 1)} />
      : <TeacherForm form={form} onChange={setForm} files={files} onFilesChange={setFiles} record={record} initialStep={initialStep}
        editing={Boolean(teacherId)} saving={saving} error={saveError} onClearError={() => setSaveError(null)}
        onSave={save} onCancel={() => navigate(returnPath)} />}
    {login && <TeacherCredentialsDialog account={login} created onClose={() => navigate(ROUTES.TEACHERS.detail(login.id))} />}
  </main>;
}
