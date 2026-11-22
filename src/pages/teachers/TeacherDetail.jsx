import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Activity, ArrowLeft, Briefcase, CalendarDays, Download, FileText,
  GraduationCap, KeyRound, Pencil, UserRound, Wallet,
} from 'lucide-react';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import { DataTable, ErrorMessage, Pending, Status } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { ROUTES } from '../../routes/routes.js';
import { notifyApiError } from '../../services/apiErrors.js';
import { getTeacherClassHistory } from '../../services/classService.js';
import { getTeacherActivity, getTeacherById, getTeacherCredentials, getTeacherFile } from '../../services/teacherService.js';
import { formatCurrency, formatDateShort } from '../../utils/formatters.js';
import { downloadSpreadsheetFile } from '../../utils/spreadsheet.js';
import { teacherManagerRoles } from '../../utils/teacherForm.js';
import TeacherLeavePanel from './TeacherLeavePanel.jsx';
import { TeacherAvatar, TeacherCredentialsDialog, TeacherFacts } from './TeacherProfileParts.jsx';
import TeacherTimetable from './TeacherTimetable.jsx';
import './teacher.css';

const tabs = [
  { id: 'overview', label: 'Overview', icon: UserRound },
  { id: 'timetable', label: 'Timetable', icon: GraduationCap },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'leaves', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'activity', label: 'Activity', icon: Activity },
];

const teacherIdOf = (teacher) => teacher._id || teacher.id;
const displayName = (teacher) => teacher.name || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ');

function ProfileOverview({ teacher }) {
  return <div className="teacher-panels">
    <section className="teacher-panel">
      <h2 className="teacher-section-title"><UserRound size={17} /> Personal and contact details</h2>
      <TeacherFacts items={[
        ['Email', teacher.email], ['Phone', teacher.phone || teacher.contactNumber], ['Alternate phone', teacher.alternatePhone],
        ['Date of birth', formatDateShort(teacher.dob)], ['Gender', teacher.gender], ['Blood group', teacher.bloodGroup],
        ['Address', teacher.address],
      ]} />
      <h2>Emergency contact</h2>
      <TeacherFacts items={[
        ['Name', teacher.emergencyContactName], ['Phone', teacher.emergencyContactPhone], ['Relationship', teacher.emergencyContactRelation],
      ]} />
    </section>
    <section className="teacher-panel">
      <h2 className="teacher-section-title"><Briefcase size={17} /> Employment and qualifications</h2>
      <TeacherFacts items={[
        ['Employee ID', teacher.employeeId || teacher.teacherId], ['Designation', teacher.designation], ['Department', teacher.department],
        ['Employment type', teacher.employmentType], ['Joining date', formatDateShort(teacher.joiningDate)],
        ['Qualification', teacher.qualification], ['Specialization', teacher.specialization], ['Experience', teacher.experience],
      ]} />
    </section>
  </div>;
}

function TeacherDocuments({ teacher, canManage }) {
  const [downloading, setDownloading] = useState(false);
  async function download() {
    setDownloading(true);
    try {
      const file = await getTeacherFile(teacherIdOf(teacher), 'aadhaar');
      downloadSpreadsheetFile(file, teacher.aadhaarFileName);
    } catch (error) {
      notifyApiError(error, 'Could not download the Aadhaar PDF.');
    } finally {
      setDownloading(false);
    }
  }

  return <section className="teacher-panel">
    <div className="teacher-section-bar">
      <h2 className="teacher-section-title"><FileText size={17} /> Profile documents</h2>
      {canManage && <Link className="proc-btn proc-btn-sm" to={ROUTES.TEACHERS.edit(teacherIdOf(teacher)) + '?step=documents'}><Pencil size={14} /> Edit documents</Link>}
    </div>
    <div className="teacher-panels">
      <div className="teacher-document">
        <TeacherAvatar teacher={teacher} />
        <div><strong>Profile photo</strong><p className="teacher-note">{teacher.photoName || 'No photo uploaded'}</p></div>
      </div>
      <div className="teacher-document">
        <span className="proc-icon"><FileText size={17} /></span>
        <div>
          <strong>Aadhaar PDF</strong>
          <p className="teacher-note">{teacher.aadhaarFileName || 'No PDF available'}</p>
          {teacher.aadhaarNumber && <p className="teacher-note">Aadhaar ending in {teacher.aadhaarNumber.slice(-4)}</p>}
          {teacher.aadhaarFileName && <button type="button" className="proc-btn proc-btn-sm mt-2" disabled={downloading} onClick={download}>
            <Download size={15} /> {downloading ? 'Downloading…' : 'Download PDF'}
          </button>}
        </div>
      </div>
    </div>
  </section>;
}

function ClassroomHistory({ teacherId }) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    const request = new AbortController();
    getTeacherClassHistory(teacherId, request.signal).then((response) => {
      if (!request.signal.aborted) setState({ records: response.data?.history || response.history || [] });
    }).catch((error) => {
      if (!request.signal.aborted) setState({ error });
    });
    return () => request.abort();
  }, [teacherId]);
  const columns = [
    { key: 'classroom', label: 'Classroom', render: (row) => {
      const classroom = row.classRoomId;
      const label = classroom?.displayName || row.classRoomName || row.className || 'Classroom';
      return classroom?._id ? <Link className="proc-link" to={ROUTES.ACADEMICS.classDetail(classroom._id)}>{label}</Link> : label;
    } },
    { key: 'session', label: 'Academic session', render: (row) => row.sessionId?.sessionName || row.sessionName || '—' },
    { key: 'assignedAt', label: 'Assigned', render: (row) => formatDateShort(row.assignedAt) },
    { key: 'state', label: 'Status', render: (row) => <Status value={row.isCurrent ? 'active' : 'completed'} label={row.isCurrent ? 'Current' : 'Previous'} /> },
  ];
  return <section className="teacher-panel">
    <h2 className="teacher-section-title"><GraduationCap size={17} /> Class teacher history</h2>
    {state.loading ? <Pending label="Loading class teacher history…" /> : state.error ? <ErrorMessage error={state.error} /> :
      <DataTable label="Class teacher history" columns={columns} rows={state.records}
        empty={<p className="teacher-note">No class teacher appointments recorded.</p>} />}
  </section>;
}

function TeacherActivity({ id }) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    const request = new AbortController();
    getTeacherActivity(id, request.signal).then((response) => {
      if (!request.signal.aborted) setState({ activity: response.data || response });
    }).catch((error) => {
      if (!request.signal.aborted) setState({ error });
    });
    return () => request.abort();
  }, [id]);
  return <section className="teacher-panel">
    <h2 className="teacher-section-title"><Activity size={17} /> Activity and sign-ins</h2>
    {state.loading ? <Pending label="Loading activity…" /> : state.error ? <ErrorMessage error={state.error} /> :
      <ActivityTimeline logs={state.activity.logs} loginHistory={state.activity.loginHistory} />}
  </section>;
}

export default function TeacherDetail() {
  const { teacherId } = useParams();
  return <Profile key={teacherId} id={teacherId} />;
}

function Profile({ id }) {
  const user = useSelector((state) => state.auth?.user);
  const { sessionId } = useAcademicSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = getUserRole(user);
  const canManage = teacherManagerRoles.includes(role);
  const canReview = canManage || role === 'director';
  const [profile, setProfile] = useState({ loading: true });
  const [reload, setReload] = useState(0);
  const [account, setAccount] = useState(null);
  const [openingAccount, setOpeningAccount] = useState(false);
  const requestedTab = searchParams.get('tab');
  const tab = tabs.some(({ id: tabId }) => tabId === requestedTab) ? requestedTab : 'overview';

  function selectTab(tabId) {
    const next = new URLSearchParams(searchParams);
    if (tabId === 'overview') next.delete('tab');
    else next.set('tab', tabId);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }

  useEffect(() => {
    const request = new AbortController();
    setProfile({ loading: true });
    getTeacherById(id, request.signal, sessionId).then((data) => {
      if (request.signal.aborted) return;
      const teacher = data.teacher || data.data?.teacher;
      if (!teacher) throw new Error('Teacher profile could not be loaded.');
      setProfile({ teacher, timetable: data.timetable || data.data?.timetable });
    }).catch((error) => {
      if (!request.signal.aborted) setProfile({ error });
    });
    return () => request.abort();
  }, [id, sessionId, reload]);

  async function credentials() {
    setOpeningAccount(true);
    try {
      const { credentials: details } = await getTeacherCredentials(id);
      if (details) setAccount(details);
    } catch (error) {
      notifyApiError(error, 'Could not load the teacher login details.');
    } finally {
      setOpeningAccount(false);
    }
  }

  const { teacher, timetable, loading, error } = profile;
  const subtitle = teacher && [teacher.designation, teacher.department, teacher.employeeId || teacher.teacherId].filter(Boolean).join(' · ');
  return <main className="teacher-page">
    <nav aria-label="Teacher navigation"><Link className="proc-btn proc-btn-sm" to={ROUTES.TEACHERS.LIST}><ArrowLeft size={15} /> Teachers</Link></nav>
    {loading ? <Pending label="Loading teacher profile…" /> :
      error ? <ErrorMessage error={error} onRetry={() => setReload((value) => value + 1)} /> : <>
        <header className="teacher-hero">
          <div className="teacher-hero-name">
            <TeacherAvatar teacher={teacher} />
            <div>
              <h1>{displayName(teacher) || 'Teacher profile'}</h1>
              {subtitle && <p className="teacher-note">{subtitle}</p>}
            </div>
          </div>
          <div className="proc-actions">
            {teacher.status && <Status value={teacher.status} label={teacher.status === 'active' ? 'Active' : teacher.status === 'inactive' ? 'Inactive' : teacher.status} />}
            {role === 'super-admin' && <button type="button" className="proc-btn" disabled={openingAccount}
              onClick={credentials}><KeyRound size={15} /> Login details</button>}
            {canManage && <Link className="proc-btn proc-primary" to={ROUTES.TEACHERS.edit(teacherIdOf(teacher))}><Pencil size={15} /> Edit profile</Link>}
          </div>
        </header>
        <nav className="teacher-nav" aria-label="Teacher profile sections">
          {tabs.map(({ id: key, label, icon: Icon }) => <button type="button" key={key} aria-pressed={tab === key} onClick={() => selectTab(key)}>
            <Icon size={15} aria-hidden="true" /> {label}
          </button>)}
        </nav>
        {tab === 'overview' && <ProfileOverview teacher={teacher} />}
        {tab === 'timetable' && <>
          <TeacherTimetable teacher={teacher} timetable={timetable} canManage={canManage} onRetry={() => setReload((value) => value + 1)} />
          <ClassroomHistory teacherId={teacherIdOf(teacher)} />
        </>}
        {tab === 'documents' && <TeacherDocuments teacher={teacher} canManage={canManage} />}
        {tab === 'leaves' && <TeacherLeavePanel teacher={teacher} canReview={canReview} />}
        {tab === 'payroll' && <section className="teacher-panel">
          <h2 className="teacher-section-title"><Wallet size={17} /> Payroll information</h2>
          <TeacherFacts items={[
            ['Monthly base salary', teacher.salary != null ? formatCurrency(teacher.salary) : '—'],
            ['Employment type', teacher.employmentType],
          ]} />
        </section>}
        {tab === 'activity' && <TeacherActivity id={id} />}
      </>}
    {account && <TeacherCredentialsDialog account={account} onClose={() => setAccount(null)} />}
  </main>;
}
