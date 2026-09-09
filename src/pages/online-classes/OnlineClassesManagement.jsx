import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Video, Plus, ExternalLink, Edit2, Trash2, Calendar, Clock,
  Users, Monitor, BookOpen, Signal, CheckCircle2, Loader2,
  X, Link2, KeyRound, FileText,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import SearchFilters from '../../components/ui/SearchFilters.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { Can, CanButton, getUserFromStorage } from '../../config/access.jsx';
import onlineClassService from '../../services/onlineClassService.js';
import { useSelector } from 'react-redux';

// ─── Constants ────────────────────────────────────────────────────────────────
const PLATFORMS = ['Google Meet', 'Zoom', 'Microsoft Teams', 'YouTube Live', 'School LMS', 'Other'];
const STATUSES = ['scheduled', 'live', 'completed', 'cancelled'];
const BLANK_FORM = {
  title: '', subject: '', agenda: '', className: '', sectionName: '',
  scheduledDate: '', startTime: '', endTime: '', platform: 'Google Meet',
  meetingLink: '', meetingId: '', passcode: '', capacity: 60,
  status: 'scheduled', resources: [],
};

const fmtDate = (v) => { try { return v ? format(new Date(v), 'MMM d, yyyy') : '—'; } catch { return String(v || '—'); } };
const fmtTime = (v) => v || '—';

const statusColor = (status) => {
  const map = {
    live: 'bg-green-500/15 text-green-400 border border-green-500/30',
    scheduled: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    completed: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };
  return map[String(status).toLowerCase()] || 'bg-slate-500/15 text-slate-400';
};

const platformIcon = (platform) => {
  const icons = { Zoom: '📹', 'Google Meet': '🎥', 'Microsoft Teams': '💼', 'YouTube Live': '▶️', 'School LMS': '🏫' };
  return icons[platform] || '🔗';
};

// ─── Seed fallback (client-side) ──────────────────────────────────────────────
const SEED = [
  {
    _id: 'oc-1', id: 'oc-1', title: 'Mathematics Problem Solving Clinic',
    subject: 'Mathematics', agenda: 'Linear equations, word problems, and doubt clearing.',
    className: 'Class 10', sectionName: 'Section A', teacherName: 'Severus Snape',
    scheduledDate: '2026-09-05', startTime: '10:00', endTime: '10:45',
    platform: 'Google Meet', meetingLink: 'https://meet.google.com/school-class-10a-maths',
    meetingId: 'school-class-10a-maths', passcode: 'class10', status: 'scheduled', capacity: 60,
    resources: [{ title: 'Pre-class worksheet', url: 'https://school.local/resources/math-worksheet', type: 'document' }],
    attendance: [],
  },
  {
    _id: 'oc-2', id: 'oc-2', title: 'Science Lab Safety Briefing',
    subject: 'Science', agenda: 'Virtual lab safety rules and experiment preparation.',
    className: 'Class 11', sectionName: 'All Sections', teacherName: 'Filius Flitwick',
    scheduledDate: '2026-09-06', startTime: '12:00', endTime: '12:40',
    platform: 'Zoom', meetingLink: 'https://zoom.us/j/school-class-11-science',
    meetingId: 'school-class-11-science', passcode: 'science11', status: 'scheduled', capacity: 90,
    resources: [], attendance: [],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const OnlineClassesManagement = () => {
  const authUser = useSelector((s) => s.auth?.user);
  const currentUser = authUser || getUserFromStorage();
  const role = (currentUser?.role || '').toLowerCase().replace(/_/g, '-');
  const isAdmin = ['super-admin', 'superadmin', 'school-admin', 'admin', 'principal', 'director'].includes(role);
  const isTeacher = ['teacher', 'head-teacher', 'hod', 'coordinator'].includes(role);
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const canWrite = (isAdmin || isTeacher) && !isStudent && !isParent;

  const [classes, setClasses] = useState(SEED);
  const [stats, setStats] = useState({ total: 0, today: 0, live: 0, upcoming: 0, completed: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchClasses = useCallback(() => {
    setLoading(true);
    onlineClassService.getAll({ page, limit: 20, search, status: statusFilter, date: dateFilter })
      .then((res) => {
        if (res?.onlineClasses?.length >= 0) {
          setClasses(res.onlineClasses.length ? res.onlineClasses : SEED);
          if (res.stats) setStats(res.stats);
          if (res.pagination) setPagination(res.pagination);
        }
      })
      .catch(() => setClasses(SEED))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, dateFilter]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const openCreate = () => { setEditTarget(null); setForm(BLANK_FORM); setShowForm(true); };
  const openEdit = (row) => { setEditTarget(row); setForm({ ...BLANK_FORM, ...row, scheduledDate: row.scheduledDate ? String(row.scheduledDate).slice(0, 10) : '' }); setShowForm(true); };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const action = editTarget
      ? onlineClassService.update(editTarget._id || editTarget.id, form)
      : onlineClassService.create(form);

    action
      .then(() => { setShowForm(false); fetchClasses(); })
      .catch(() => {
        // Optimistic fallback
        if (editTarget) {
          setClasses((prev) => prev.map((c) => (c._id === editTarget._id ? { ...c, ...form } : c)));
        } else {
          setClasses((prev) => [{ ...form, _id: `oc-${Date.now()}`, id: `oc-${Date.now()}`, attendance: [] }, ...prev]);
        }
        setShowForm(false);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    onlineClassService.delete(deleteTarget._id || deleteTarget.id)
      .then(() => { fetchClasses(); setDeleteTarget(null); })
      .catch(() => { setClasses((prev) => prev.filter((c) => c._id !== deleteTarget._id && c.id !== deleteTarget.id)); setDeleteTarget(null); })
      .finally(() => setSubmitting(false));
  };

  const handleJoin = (row) => {
    setJoiningId(row._id || row.id);
    onlineClassService.join(row._id || row.id)
      .then((res) => {
        const link = res?.meetingLink || row.meetingLink;
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
        fetchClasses();
      })
      .catch(() => {
        if (row.meetingLink) window.open(row.meetingLink, '_blank', 'noopener,noreferrer');
      })
      .finally(() => setJoiningId(null));
  };

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const columns = [
    {
      key: 'title',
      label: 'Class / Subject',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{row.title}</p>
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">{row.subject}</p>
          {row.agenda && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{row.agenda}</p>}
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class / Section',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">{row.className}</p>
          <p className="text-slate-400">{row.sectionName}</p>
        </div>
      ),
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.teacherName || '—'}</span>
      ),
    },
    {
      key: 'schedule',
      label: 'Date & Time',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
            <Calendar size={11} className="text-slate-400" />
            {fmtDate(row.scheduledDate)}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={11} />
            {fmtTime(row.startTime)} – {fmtTime(row.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {platformIcon(row.platform)} {row.platform}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setDetailTarget(row); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
            title="View Details"
          >
            <ExternalLink size={13} />
          </button>
          {canWrite && (
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(row); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition-colors"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
          )}
          {isStudent && (
            <button
              onClick={(e) => { e.stopPropagation(); handleJoin(row); }}
              disabled={joiningId === (row._id || row.id) || row.status === 'cancelled'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 text-green-500 hover:bg-green-500/25 text-[10px] font-bold transition-colors disabled:opacity-50"
              title="Join Class"
            >
              {joiningId === (row._id || row.id) ? <Loader2 size={10} className="animate-spin" /> : <Signal size={10} />}
              Join
            </button>
          )}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statsCards = [
    { label: 'Total Classes', value: stats.total || classes.length, icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Today', value: stats.today ?? 0, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Live Now', value: stats.live ?? 0, icon: Signal, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Upcoming', value: stats.upcoming ?? 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.completed ?? 0, icon: CheckCircle2, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Online Classes"
        subtitle="Schedule and manage virtual classes, track attendance, and share resources."
        breadcrumbs={[{ label: 'Online Classes' }]}
        actions={
          canWrite ? (
            <Can module="online-classes" action="create">
              <CanButton id="SCHEDULE_ONLINE_CLASS">
                <button
                  id="btn-create-online-class"
                  onClick={openCreate}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
                >
                  <Plus size={14} /> Schedule Class
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

      {/* Table + Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchFilters
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search by title, subject, teacher, class..."
              filters={[
                {
                  key: 'status', value: statusFilter,
                  onChange: (v) => { setStatusFilter(v); setPage(1); },
                  options: [
                    { value: '', label: 'All Statuses' },
                    ...STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
                  ],
                },
              ]}
              onClear={() => { setSearch(''); setStatusFilter(''); setDateFilter(''); setPage(1); }}
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="h-[38px] px-3 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <Loader fullPage size="lg" text="Loading online classes..." />
          ) : (
            <DataTable
              columns={columns}
              data={classes}
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
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={editTarget ? 'Edit Online Class' : 'Schedule Online Class'}
          size="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class Title *</label>
                <input required value={form.title} onChange={(e) => setField('title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Mathematics Doubt Clearing Session" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject *</label>
                <input required value={form.subject} onChange={(e) => setField('subject', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Platform</label>
                <select value={form.platform} onChange={(e) => setField('platform', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
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
                  placeholder="e.g. Section A (leave blank for all)" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Scheduled Date *</label>
                <input required type="date" value={form.scheduledDate} onChange={(e) => setField('scheduledDate', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Start Time *</label>
                <input required type="time" value={form.startTime} onChange={(e) => setField('startTime', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">End Time *</label>
                <input required type="time" value={form.endTime} onChange={(e) => setField('endTime', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Meeting Link *</label>
                <div className="relative">
                  <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required value={form.meetingLink} onChange={(e) => setField('meetingLink', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://meet.google.com/..." />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Meeting ID</label>
                <input value={form.meetingId} onChange={(e) => setField('meetingId', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Optional" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Passcode</label>
                <div className="relative">
                  <KeyRound size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.passcode} onChange={(e) => setField('passcode', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={(e) => setField('capacity', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                <select value={form.status} onChange={(e) => setField('status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Agenda / Description</label>
                <textarea rows={3} value={form.agenda} onChange={(e) => setField('agenda', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Topics to be covered in this session..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-2">
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {editTarget ? 'Save Changes' : 'Schedule Class'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Class Details" size="md">
        {detailTarget && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{detailTarget.title}</h3>
                <p className="text-indigo-500 font-semibold text-xs mt-0.5">{detailTarget.subject}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${statusColor(detailTarget.status)}`}>
                {detailTarget.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: Calendar, label: 'Date', value: fmtDate(detailTarget.scheduledDate) },
                { icon: Clock, label: 'Time', value: `${fmtTime(detailTarget.startTime)} – ${fmtTime(detailTarget.endTime)}` },
                { icon: Users, label: 'Class', value: `${detailTarget.className} · ${detailTarget.sectionName}` },
                { icon: Monitor, label: 'Platform', value: `${platformIcon(detailTarget.platform)} ${detailTarget.platform}` },
                { icon: BookOpen, label: 'Teacher', value: detailTarget.teacherName },
                { icon: Users, label: 'Capacity', value: `${detailTarget.capacity} students` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={13} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{label}</p>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {detailTarget.agenda && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Agenda</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{detailTarget.agenda}</p>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <a href={detailTarget.meetingLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors">
                <ExternalLink size={12} /> Open Meeting Link
              </a>
              {detailTarget.passcode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <KeyRound size={12} /> Passcode: <span className="font-mono">{detailTarget.passcode}</span>
                </div>
              )}
              {isStudent && (
                <button onClick={() => handleJoin(detailTarget)} disabled={joiningId === (detailTarget._id || detailTarget.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition-colors disabled:opacity-60">
                  {joiningId === (detailTarget._id || detailTarget.id) ? <Loader2 size={12} className="animate-spin" /> : <Signal size={12} />}
                  Join &amp; Mark Attendance
                </button>
              )}
            </div>

            {detailTarget.resources?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Resources</p>
                <div className="space-y-1.5">
                  {detailTarget.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                      <FileText size={12} className="text-indigo-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{detailTarget.attendance?.length || 0} students joined</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Online Class"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={submitting}
        danger
      />
    </div>
  );
};

export default OnlineClassesManagement;
