import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { getUserFromStorage } from '../../config/access.jsx';
import { ROLES } from '../../constants/roles.js';
import {
  User, CalendarCheck, ClipboardList, FileText, BadgeCheck, Activity, DollarSign, Lock
} from 'lucide-react';
import DetailPageLayout, { EditButton } from '../../components/ui/DetailPageLayout.jsx';
import PermissionMatrix from '../../components/ui/PermissionMatrix.jsx';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import { permissionOptions } from './StudentForm.jsx';
import { getStudentById, getStudentActivity } from '../../services';
import Loader from '../../components/ui/Loader.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) => (val && val !== 'null' && val !== 'undefined' ? val : '—');

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(([label, value]) => (
      <div key={label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold mt-0.5 text-slate-800 dark:text-slate-100">{fmt(value)}</p>
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Icon size={26} className="text-slate-400" />
    </div>
    <div>
      <p className="font-bold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  </div>
);

// ─── StudentDetail ─────────────────────────────────────────────────────────────

const StudentDetail = () => {
  const { studentId } = useParams();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: 'super-admin' };
  const userRole = user?.role || '';

  const canSeeCredentials = [ROLES.SUPER_ADMIN, 'superadmin', ROLES.STUDENT].includes(userRole);

  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);
  const [activity, setActivity] = useState({ logs: [], loginHistory: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [studentRes, actRes] = await Promise.all([
          getStudentById(studentId).catch(() => null),
          getStudentActivity(studentId).catch(() => null),
        ]);
        setStudent(studentRes?.student || studentRes?.data?.student || null);
        setActivity(actRes?.data || actRes || { logs: [], loginHistory: [] });
      } catch (err) {
        console.error("Error loading student detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [studentId]);

  // Resolve class / section display names from real data only
  const rawCls = student?.className || student?.classDetails?.name || student?.class;
  const rawSec = student?.sectionName || student?.sectionDetails?.name || student?.section;
  const className = (rawCls && rawCls !== 'null' && rawCls !== 'undefined') ? rawCls : null;
  const sectionName = (rawSec && rawSec !== 'null' && rawSec !== 'undefined') ? rawSec : null;

  const classSection = [className, sectionName].filter(Boolean).join(' – ') || '—';
  const subtitle = [
    student?.admissionNumber,
    student?.rollNumber != null ? `Roll ${student.rollNumber}` : null,
    classSection !== '—' ? classSection : null,
  ].filter(Boolean).join(' · ');

  const tabs = [
    { id: 'overview',     label: 'Overview',             icon: User },
    { id: 'academic',     label: 'Academic & Class',     icon: ClipboardList },
    { id: 'parent',       label: 'Parent / Guardian',    icon: FileText },
    { id: 'attendance',   label: 'Attendance Record',    icon: CalendarCheck },
    { id: 'fees',         label: 'Fee & Dues',           icon: DollarSign },
    { id: 'permissions',  label: 'Permissions',          icon: Lock },
    { id: 'certificates', label: 'Certificates & Sanad', icon: BadgeCheck },
    { id: 'activity',     label: 'Activity Logs',        icon: Activity },
  ];

  const renderTab = () => {
    switch (activeTab) {

      // ── Overview ───────────────────────────────────────────────────────────
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats — only show if real data exists */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Roll Number"    value={student?.rollNumber ?? '—'} />
              <StatsCard title="Admission No."  value={student?.admissionNumber ?? '—'} />
              <StatsCard title="Class"          value={className ?? '—'} />
              <StatsCard title="Section"        value={sectionName ?? '—'} />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Personal &amp; Contact Details
              </h3>
              <InfoGrid items={[
                ['Full Name',          student?.name],
                ['Admission Number',   student?.admissionNumber],
                ['Roll Number',        student?.rollNumber],
                ['Class & Section',    classSection],
                ['Gender',             student?.gender],
                ['Date of Birth',      student?.dob
                  ? format(new Date(student.dob), 'MMM d, yyyy')
                  : undefined],
                ['Blood Group',        student?.bloodGroup],
                ['Student Phone',      student?.contactNumber],
                ['Alternate Phone',    student?.alternatePhone],
                ['Student Email',      canSeeCredentials
                  ? student?.email
                  : '•••••@school.local'],
                ['Joining Date',       student?.joiningDate
                  ? format(new Date(student.joiningDate), 'MMM d, yyyy')
                  : undefined],
                ['Residential Address', student?.address],
              ]} />
            </div>
          </div>
        );

      // ── Academic & Class ──────────────────────────────────────────────────
      case 'academic':
        return (
          <div className="space-y-6">
            <InfoGrid items={[
              ['Enrolled Class',     className],
              ['Assigned Section',   sectionName],
              ['Roll Number',        student?.rollNumber],
              ['Academic Year',      student?.academicYear],
              ['Joining Date',       student?.joiningDate
                ? format(new Date(student.joiningDate), 'MMM d, yyyy')
                : undefined],
              ['Status',             student?.status],
            ]} />

            {student?.academicHistory?.length > 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Academic History
                </h4>
                <div className="space-y-2">
                  {student.academicHistory.map((entry, i) => (
                    <div key={i} className="flex flex-wrap gap-4 text-xs py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{entry.school}</span>
                      <span className="text-slate-500">Class: {entry.class}</span>
                      <span className="text-slate-500">Year: {entry.year}</span>
                      {entry.percentage && <span className="text-emerald-600 font-semibold">{entry.percentage}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No Academic History"
                description="Previous academic records will appear here once added."
              />
            )}
          </div>
        );

      // ── Parent / Guardian ─────────────────────────────────────────────────
      case 'parent':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Parent &amp; Guardian Information
            </h3>
            {student?.parentName || student?.parentContact ? (
              <InfoGrid items={[
                ['Parent / Guardian Name', student?.parentName],
                ['Primary Contact',        student?.parentContact],
                ['Parent Email',           student?.parentEmail],
                ['Aadhaar Number',         student?.aadhaarNumber],
              ]} />
            ) : (
              <EmptyState
                icon={FileText}
                title="No Parent Information"
                description="Parent or guardian details have not been added yet."
              />
            )}
          </div>
        );

      // ── Attendance ────────────────────────────────────────────────────────
      case 'attendance':
        return (
          <EmptyState
            icon={CalendarCheck}
            title="Attendance Records Not Yet Available"
            description="Attendance data will appear here once the attendance module is connected."
          />
        );

      // ── Fees ──────────────────────────────────────────────────────────────
      case 'fees':
        return (
          <EmptyState
            icon={DollarSign}
            title="Fee Records Not Yet Available"
            description="Fee payment history will appear here once the fee module is connected."
          />
        );

      // ── Permissions ───────────────────────────────────────────────────────
      case 'permissions':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Student Account Access Rights
            </h3>
            <PermissionMatrix
              options={permissionOptions}
              permissions={student?.permissions || []}
              readOnly
            />
          </div>
        );

      // ── Certificates ──────────────────────────────────────────────────────
      case 'certificates':
        return (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Certificates &amp; Verification
            </h3>
            {student?.documents?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {student.documents.map((doc, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="font-extrabold text-slate-800 dark:text-white">📄 {doc.name}</p>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-500 hover:underline"
                      >
                        View / Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BadgeCheck}
                title="No Documents Yet"
                description="Uploaded certificates and documents will appear here."
              />
            )}
          </div>
        );

      // ── Activity Logs ─────────────────────────────────────────────────────
      case 'activity':
        return (
          activity?.logs?.length > 0 || activity?.loginHistory?.length > 0 ? (
            <ActivityTimeline logs={activity.logs} loginHistory={activity.loginHistory} />
          ) : (
            <EmptyState
              icon={Activity}
              title="No Activity Logs"
              description="Student account activity and login history will appear here."
            />
          )
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Loader fullPage size="lg" text="Loading student profile..." />;
  }

  if (!student) {
    return (
      <EmptyState
        icon={User}
        title="Student Not Found"
        description="This student profile could not be loaded. They may have been deleted or the ID is invalid."
      />
    );
  }

  return (
    <DetailPageLayout
      loading={loading}
      backTo="/students"
      title={student.name || 'Student Profile'}
      subtitle={subtitle}
      status={student.status}
      avatar={student.name?.charAt(0)}
      actions={<EditButton to={`/students/${studentId}/edit`} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTab()}
    </DetailPageLayout>
  );
};

export default StudentDetail;
