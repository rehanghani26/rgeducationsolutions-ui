import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays } from 'date-fns';
import {
  NotebookPen, Plus, Edit2, Trash2, Calendar, Clock,
  CheckCircle2, Loader2, AlertTriangle, FileText, Star,
  Send, Award, Eye, ClipboardCheck, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import SearchFilters from '../../components/ui/SearchFilters.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { Can, CanButton, getUserFromStorage } from '../../config/access.jsx';
import homeworkService from '../../services/homeworkService.js';
import { useSelector } from 'react-redux';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITIES = ['low', 'normal', 'high'];
const HW_STATUSES = ['draft', 'published', 'closed'];
const BLANK_HW = {
  title: '', subject: '', instructions: '', className: '', sectionName: '',
  dueDate: '', totalMarks: 10, priority: 'normal', status: 'published', attachments: [],
};
const BLANK_SUBMIT = { content: '', attachments: [] };
const BLANK_GRADE = { marks: '', feedback: '', status: 'graded' };

const fmtDate = (v) => { try { return v ? format(new Date(v), 'MMM d, yyyy') : '—'; } catch { return String(v || '—'); } };

const dueSoonBadge = (dueDate) => {
  if (!dueDate) return null;
  const days = differenceInDays(new Date(dueDate), new Date());
  if (days < 0) return <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">Overdue</span>;
  if (days <= 3) return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Due Soon</span>;
  return null;
};

const priorityBadge = (priority) => {
  const map = {
    high: 'bg-red-500/15 text-red-500 border border-red-500/20',
    normal: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
    low: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${map[priority] || map.normal}`}>
      {priority}
    </span>
  );
};

// ─── Seed fallback (client-side) ──────────────────────────────────────────────
const SEED = [
  {
    _id: 'hw-1', id: 'hw-1', title: 'Linear Equations Practice Set', subject: 'Mathematics',
    instructions: 'Complete problems 1–25 from Chapter 4. Show all working steps.',
    className: 'Class 10', sectionName: 'Section A', teacherName: 'Severus Snape',
    issueDate: '2026-09-03', dueDate: '2026-09-07', totalMarks: 25, priority: 'high',
    status: 'published', attachments: [], submissions: [],
  },
  {
    _id: 'hw-2', id: 'hw-2', title: 'Photosynthesis Lab Report', subject: 'Science',
    instructions: 'Write a full lab report (min. 600 words) on the photosynthesis experiment.',
    className: 'Class 10', sectionName: 'Section A', teacherName: 'Filius Flitwick',
    issueDate: '2026-09-02', dueDate: '2026-09-10', totalMarks: 20, priority: 'normal',
    status: 'published', attachments: [], submissions: [],
  },
  {
    _id: 'hw-3', id: 'hw-3', title: 'History Essay: Industrial Revolution', subject: 'History',
    instructions: 'Write a 500-word analytical essay on the social impact of the Industrial Revolution.',
    className: 'Class 11', sectionName: 'All Sections', teacherName: 'Filius Flitwick',
    issueDate: '2026-09-01', dueDate: '2026-09-06', totalMarks: 30, priority: 'high',
    status: 'published', attachments: [], submissions: [],
  },
];

// ─── Sub-component: Submissions List ─────────────────────────────────────────
const SubmissionsList = ({ submissions = [], homeworkId, totalMarks, canGrade, onGraded }) => {
  const [expanded, setExpanded] = useState(null);
  const [gradeModal, setGradeModal] = useState(null);
  const [gradeForm, setGradeForm] = useState(BLANK_GRADE);
  const [submitting, setSubmitting] = useState(false);

  const openGrade = (sub) => {
    setGradeModal(sub);
    setGradeForm({ marks: sub.marks ?? '', feedback: sub.feedback ?? '', status: sub.status || 'graded' });
  };

  const handleGrade = (e) => {
    e.preventDefault();
    setSubmitting(true);
    homeworkService.grade(homeworkId, gradeModal.id || gradeModal._id, gradeForm)
      .then(() => { setGradeModal(null); onGraded?.(); })
      .catch(() => setGradeModal(null))
      .finally(() => setSubmitting(false));
  };

  if (!submissions.length) {
    return <p className="text-xs text-slate-400 text-center py-6">No submissions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {submissions.map((sub, i) => (
        <div key={sub._id || sub.id || i} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-500 text-[10px] font-extrabold">
                {(sub.studentName || 'S')[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{sub.studentName || sub.studentId}</p>
                <p className="text-[10px] text-slate-400">{sub.admissionNumber || ''} · Submitted {fmtDate(sub.submittedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                sub.status === 'graded' ? 'bg-green-500/15 text-green-500' :
                sub.status === 'returned' ? 'bg-blue-500/15 text-blue-400' :
                sub.status === 'late' ? 'bg-red-500/15 text-red-500' :
                'bg-amber-500/15 text-amber-500'
              }`}>{sub.status}</span>
              {sub.marks !== null && sub.marks !== undefined && (
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{sub.marks}/{totalMarks}</span>
              )}
              {expanded === i ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
            </div>
          </div>
          {expanded === i && (
            <div className="px-4 pb-3 pt-1 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              {sub.content && <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{sub.content}</p>}
              {sub.feedback && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-0.5">Teacher Feedback</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{sub.feedback}</p>
                </div>
              )}
              {canGrade && (
                <button onClick={() => openGrade(sub)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition-colors">
                  <Award size={11} /> Grade Submission
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title="Grade Submission" size="sm">
        {gradeModal && (
          <form onSubmit={handleGrade} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{gradeModal.studentName}</p>
              <p className="text-[10px] text-slate-400">{gradeModal.admissionNumber}</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Marks (out of {totalMarks})</label>
              <input type="number" min={0} max={totalMarks} value={gradeForm.marks}
                onChange={(e) => setGradeForm((p) => ({ ...p, marks: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Feedback</label>
              <textarea rows={3} value={gradeForm.feedback}
                onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))}
                placeholder="Provide constructive feedback..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={gradeForm.status}
                onChange={(e) => setGradeForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white">
                <option value="graded">Graded</option>
                <option value="returned">Returned for Revision</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setGradeModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-60 flex items-center gap-1.5">
                {submitting && <Loader2 size={11} className="animate-spin" />} Submit Grade
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HomeworkManagement = () => {
  const authUser = useSelector((s) => s.auth?.user);
  const currentUser = authUser || getUserFromStorage();
  const role = (currentUser?.role || '').toLowerCase().replace(/_/g, '-');
  const isAdmin = ['super-admin', 'superadmin', 'school-admin', 'admin', 'principal', 'director'].includes(role);
  const isTeacher = ['teacher', 'head-teacher', 'hod', 'coordinator'].includes(role);
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const canWrite = (isAdmin || isTeacher) && !isStudent && !isParent;
  const canGrade = (isAdmin || isTeacher) && !isStudent && !isParent;
  const canRead = true;

  const [homework, setHomework] = useState(SEED);
  const [stats, setStats] = useState({ total: 0, assigned: 0, dueSoon: 0, submitted: 0, graded: 0, pendingReview: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(BLANK_HW);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submitForm, setSubmitForm] = useState(BLANK_SUBMIT);

  const fetchHW = useCallback(() => {
    setLoading(true);
    homeworkService.getAll({ page, limit: 20, search, status: statusFilter, priority: priorityFilter })
      .then((res) => {
        if (res?.homework !== undefined) {
          setHomework(res.homework.length ? res.homework : SEED);
          if (res.stats) setStats(res.stats);
          if (res.pagination) setPagination(res.pagination);
        }
      })
      .catch(() => setHomework(SEED))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchHW(); }, [fetchHW]);

  const openCreate = () => { setEditTarget(null); setForm(BLANK_HW); setShowForm(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setForm({ ...BLANK_HW, ...row, dueDate: row.dueDate ? String(row.dueDate).slice(0, 10) : '' });
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const action = editTarget
      ? homeworkService.update(editTarget._id || editTarget.id, form)
      : homeworkService.create(form);
    action
      .then(() => { setShowForm(false); fetchHW(); })
      .catch(() => {
        if (editTarget) {
          setHomework((prev) => prev.map((h) => (h._id === editTarget._id ? { ...h, ...form } : h)));
        } else {
          setHomework((prev) => [{ ...form, _id: `hw-${Date.now()}`, id: `hw-${Date.now()}`, submissions: [] }, ...prev]);
        }
        setShowForm(false);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    homeworkService.delete(deleteTarget._id || deleteTarget.id)
      .then(() => { fetchHW(); setDeleteTarget(null); })
      .catch(() => { setHomework((prev) => prev.filter((h) => h._id !== deleteTarget._id)); setDeleteTarget(null); })
      .finally(() => setSubmitting(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    homeworkService.submit(submitTarget._id || submitTarget.id, submitForm)
      .then(() => { setSubmitTarget(null); setSubmitForm(BLANK_SUBMIT); fetchHW(); })
      .catch(() => setSubmitTarget(null))
      .finally(() => setSubmitting(false));
  };

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const columns = [
    {
      key: 'title',
      label: 'Assignment',
      render: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{row.title}</p>
            {dueSoonBadge(row.dueDate)}
          </div>
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">{row.subject}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{row.instructions}</p>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">{row.className}</p>
          <p className="text-slate-400">{row.sectionName}</p>
        </div>
      ),
    },
    {
      key: 'teacher',
      label: 'Assigned By',
      render: (row) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{row.teacherName || '—'}</span>,
    },
    {
      key: 'due',
      label: 'Due Date',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Calendar size={11} className="text-slate-400" />
          {fmtDate(row.dueDate)}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => priorityBadge(row.priority || 'normal'),
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Users size={11} className="text-slate-400" />
          {row.submissions?.length || 0}
        </div>
      ),
    },
    {
      key: 'marks',
      label: 'Max Marks',
      render: (row) => <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{row.totalMarks}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); setDetailTarget(row); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors" title="View">
            <Eye size={13} />
          </button>
          {canWrite && (
            <button onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors" title="Edit">
              <Edit2 size={13} />
            </button>
          )}
          {isStudent && (
            <button onClick={(e) => { e.stopPropagation(); setSubmitTarget(row); setSubmitForm(BLANK_SUBMIT); }}
              disabled={row.status === 'closed'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-500 hover:bg-indigo-500/25 text-[10px] font-bold transition-colors disabled:opacity-50" title="Submit">
              <Send size={10} /> Submit
            </button>
          )}
          {isAdmin && (
            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statsCards = [
    { label: 'Assigned', value: stats.assigned || homework.length, icon: NotebookPen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Due Soon', value: stats.dueSoon ?? 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Submissions', value: stats.submitted ?? 0, icon: Send, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Graded', value: stats.graded ?? 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pending Review', value: stats.pendingReview ?? 0, icon: ClipboardCheck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Homework"
        subtitle="Create assignments, track submissions, and provide feedback to students."
        breadcrumbs={[{ label: 'Homework' }]}
        actions={
          canWrite ? (
            <Can module="homework" action="create">
              <CanButton id="ASSIGN_HOMEWORK">
                <button id="btn-create-homework" onClick={openCreate}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all">
                  <Plus size={14} /> Assign Homework
                </button>
              </CanButton>
            </Can>
          ) : null
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
              <card.icon size={16} className={card.color} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{card.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <SearchFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by title, subject, teacher, class..."
            filters={[
              {
                key: 'priority', value: priorityFilter,
                onChange: (v) => { setPriorityFilter(v); setPage(1); },
                options: [
                  { value: '', label: 'All Priorities' },
                  ...PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
                ],
              },
              {
                key: 'status', value: statusFilter,
                onChange: (v) => { setStatusFilter(v); setPage(1); },
                options: [
                  { value: '', label: 'All Statuses' },
                  ...HW_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
                ],
              },
            ]}
            onClear={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }}
          />
        </div>
        <div className="p-5">
          {loading ? (
            <Loader fullPage size="lg" text="Loading homework assignments..." />
          ) : (
            <DataTable
              columns={columns}
              data={homework}
              loading={loading}
              pagination={pagination}
              onPageChange={setPage}
              onRowClick={(row) => setDetailTarget(row)}
            />
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {canWrite && (
        <Modal open={showForm} onClose={() => setShowForm(false)}
          title={editTarget ? 'Edit Homework' : 'Assign Homework'} size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Assignment Title *</label>
              <input required value={form.title} onChange={(e) => setField('title', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Chapter 5 Practice Problems" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject *</label>
              <input required value={form.subject} onChange={(e) => setField('subject', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Due Date *</label>
              <input required type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class Name *</label>
              <input required value={form.className} onChange={(e) => setField('className', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Class 10" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section</label>
              <input value={form.sectionName} onChange={(e) => setField('sectionName', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Section A (blank = all)" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Total Marks</label>
              <input type="number" min={1} value={form.totalMarks} onChange={(e) => setField('totalMarks', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {HW_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Instructions *</label>
              <textarea required rows={4} value={form.instructions} onChange={(e) => setField('instructions', e.target.value)}
                placeholder="Detailed instructions for students..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-60 flex items-center gap-2">
              {submitting && <Loader2 size={12} className="animate-spin" />}
              {editTarget ? 'Save Changes' : 'Assign Homework'}
            </button>
          </div>
        </form>
      </Modal>
      )}

      {/* Detail / Submissions Modal */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Homework Details" size="lg">
        {detailTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{detailTarget.title}</h3>
                  {dueSoonBadge(detailTarget.dueDate)}
                </div>
                <p className="text-indigo-500 font-semibold text-xs mt-0.5">{detailTarget.subject}</p>
              </div>
              {priorityBadge(detailTarget.priority)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Class', value: `${detailTarget.className} · ${detailTarget.sectionName}` },
                { label: 'Teacher', value: detailTarget.teacherName },
                { label: 'Due Date', value: fmtDate(detailTarget.dueDate) },
                { label: 'Total Marks', value: detailTarget.totalMarks },
                { label: 'Status', value: detailTarget.status },
                { label: 'Submissions', value: detailTarget.submissions?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold capitalize">{String(value)}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Instructions</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{detailTarget.instructions}</p>
            </div>

            {isStudent && detailTarget.status !== 'closed' && (
              <button
                onClick={() => { setSubmitTarget(detailTarget); setSubmitForm(BLANK_SUBMIT); setDetailTarget(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
                <Send size={12} /> Submit Homework
              </button>
            )}

            {(canGrade || isParent) && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-3">
                  Submissions ({detailTarget.submissions?.length || 0})
                </p>
                <SubmissionsList
                  submissions={detailTarget.submissions || []}
                  homeworkId={detailTarget._id || detailTarget.id}
                  totalMarks={detailTarget.totalMarks}
                  canGrade={canGrade}
                  onGraded={fetchHW}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Student Submit Modal */}
      <Modal open={!!submitTarget} onClose={() => setSubmitTarget(null)} title="Submit Homework" size="sm">
        {submitTarget && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{submitTarget.title}</p>
              <p className="text-[10px] text-indigo-500 mt-0.5">Due: {fmtDate(submitTarget.dueDate)} · {submitTarget.totalMarks} marks</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Your Answer / Submission</label>
              <textarea rows={5} value={submitForm.content}
                onChange={(e) => setSubmitForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write your answer here, or paste your work..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setSubmitTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-60 flex items-center gap-2">
                {submitting && <Loader2 size={11} className="animate-spin" />}
                <Send size={11} /> Submit
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Homework"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All submissions will be lost.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={submitting}
        danger
      />
    </div>
  );
};

export default HomeworkManagement;
