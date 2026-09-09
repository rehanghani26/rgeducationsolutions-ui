import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import DetailPageLayout from '../../components/ui/DetailPageLayout.jsx';
import api from '../../services/api.js';

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(([label, value]) => (
      <div key={label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value || '—'}</p>
      </div>
    ))}
  </div>
);

const ClassDetail = () => {
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const [classData, setClassData]   = useState(null);
  const [studentsData, setStudents] = useState([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    api.get('/erp/classes')
      .then(res => {
        const cls = (res.data?.classes ?? []).find(c => (c.id || c._id) === classId);
        setClassData(cls ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    api.get(`/students?classId=${classId}&limit=100`)
      .then(res => setStudents(res.data?.students ?? []))
      .catch(() => {});
  }, [classId]);

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: User          },
    { id: 'students',  label: 'Students',  icon: GraduationCap },
    { id: 'teachers',  label: 'Teachers',  icon: User          },
    { id: 'subjects',  label: 'Subjects',  icon: BookOpen      },
    { id: 'timetable', label: 'Timetable', icon: Calendar      },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <InfoGrid items={[
            ['Class Name', classData?.name],
            ['Code',       classData?.code],
            ['Room',       classData?.room],
            ['Capacity',   classData?.capacity],
          ]} />
        );
      case 'students':
        return studentsData.length ? (
          <ul className="space-y-2">
            {studentsData.map(s => (
              <li key={s.id || s._id} className="text-xs font-semibold p-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span>{s.name}</span>
                <span className="text-slate-400">{s.admissionNumber}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-xs text-slate-500">No students in this class.</p>;
      case 'teachers':
        return <p className="text-xs text-slate-500">Assigned teachers will appear when linked to the Teacher module.</p>;
      case 'subjects':
        return <p className="text-xs text-slate-500">Subject assignments will appear from the Academics module.</p>;
      case 'timetable':
        return <p className="text-xs text-slate-500">Timetable will appear from the Timetable module.</p>;
      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      loading={loading}
      backTo="/academics/classes"
      title={classData?.name || 'Class'}
      subtitle={classData?.code || ''}
      avatar={classData?.name?.charAt(0)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTab()}
    </DetailPageLayout>
  );
};

export default ClassDetail;
