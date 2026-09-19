import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, BookOpen, GraduationCap, Award, Activity, ClipboardList, ExternalLink, CheckCircle } from 'lucide-react';
import DetailPageLayout, { EditButton } from '../../components/ui/DetailPageLayout.jsx';
import ActivityTimeline from '../../components/ui/ActivityTimeline.jsx';
import examService from '../../services/examService.js';
import resultService from '../../services/resultService.js';
import { mockExams } from '../../data/mockData.js';
import Loader from '../../components/ui/Loader.jsx';

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {items.map(([label, value]) => (
      <div key={label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-semibold mt-0.5 dark:text-slate-100">{value || '—'}</p>
      </div>
    ))}
  </div>
);

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [exam, setExam] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classResults, setClassResults] = useState({});

  // Direct useEffect API Fetch
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      examService.getById(id).catch(() => null),
      examService.getActivity(id).catch(() => null),
    ]).then(([res, actRes]) => {
      const fallbackExam = mockExams.find((e) => e.id === id || e._id === id) || mockExams[0];
      const realExam = res?.exam || res?.data?.exam || res?.data;
      setExam(realExam ? { ...fallbackExam, ...realExam } : fallbackExam);
      setActivity(actRes?.logs || actRes?.data || { logs: [] });
    }).finally(() => setLoading(false));
  }, [id]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <InfoGrid items={[
              ['Exam Name', exam?.name || exam?.title],
              ['Term & Session', `${exam?.term || 'Term 1'} (${exam?.session || '2025-2026'})`],
              ['Scheduled Date', exam?.date ? format(new Date(exam.date), 'MMM d, yyyy') : exam?.startDate ? format(new Date(exam.startDate), 'MMM d, yyyy') : null],
              ['Status', exam?.status],
              ['Duration', exam?.duration || '2 Hours 30 Mins'],
              ['Total / Pass Marks', `${exam?.totalMarks || 100} Marks (Pass: ${exam?.passMarks || 40})`],
              ['Venue & Rooms', exam?.venue || 'Main Examination Hall & Block A'],
              ['Head Supervisor', exam?.supervisor || 'Sheikh Abdullah Al-Hafiz'],
            ]} />

            {exam?.description && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Guidelines</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{exam.description}</p>
              </div>
            )}
          </div>
        );
      case 'subjects':
        const subjectsList = exam?.subjectsList || [
          { code: 'ISL-101', name: 'Quranic Sciences & Tajweed', date: '2026-09-15', time: '09:00 AM - 11:30 AM', room: 'Hall A' },
          { code: 'ARB-102', name: 'Classical Arabic Grammar', date: '2026-09-17', time: '09:00 AM - 11:30 AM', room: 'Hall A' },
          { code: 'MTH-103', name: 'Mathematics & Geometry', date: '2026-09-19', time: '09:00 AM - 11:30 AM', room: 'Hall B' },
        ];
        return (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Subject Code</th>
                  <th className="pb-3">Subject Name</th>
                  <th className="pb-3">Exam Date</th>
                  <th className="pb-3">Time Slot</th>
                  <th className="pb-3">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjectsList.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-indigo-500">{sub.code}</td>
                    <td className="py-3 font-extrabold text-slate-800 dark:text-white">{sub.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-semibold">{sub.date}</td>
                    <td className="py-3 text-slate-500 font-medium">{sub.time}</td>
                    <td className="py-3 text-slate-500 font-bold">{sub.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'classes':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Grade 10 - Section A", "Grade 10 - Section B", "Grade 9 - Section A"].map((clsName) => (
              <div key={clsName} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-white">🏫 {clsName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Assigned Target Group</p>
              </div>
            ))}
          </div>
        );
      case 'results':
        const classes = exam?.classNames || exam?.classes || ['Grade 10 - Section A'];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Class-wise Results</h4>
              <button
                onClick={() => navigate('/results')}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-all"
              >
                <ClipboardList size={12} /> Enter Results
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls) => {
                const clsKey = typeof cls === 'string' ? cls : cls.name;
                return (
                  <div key={clsKey} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">🏫 {clsKey}</p>
                      <button
                        onClick={() => navigate('/results')}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> View
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Click "Enter Results" to upload marks for this class</p>
                  </div>
                );
              })}
            </div>
            {exam?.isPublished && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                <CheckCircle size={14} /> Results have been published for this exam.
              </div>
            )}
          </div>
        );
      case 'activity':
        return <ActivityTimeline logs={activity?.logs || []} />;
      default:
        return null;
    }
  };

  return (
    <DetailPageLayout
      loading={loading}
      backTo="/exams"
      title={exam?.name || exam?.title || 'Exam Detail'}
      subtitle={`${exam?.term || ''} · ${exam?.date ? format(new Date(exam.date), 'MMM d, yyyy') : exam?.startDate ? format(new Date(exam.startDate), 'MMM d, yyyy') : ''}`}
      status={exam?.status}
      avatar={exam?.name?.charAt(0)}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTab()}
    </DetailPageLayout>
  );
};

export default ExamDetail;
