import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  KeyRound,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  User,
  MessageSquare,
  Lock,
  Sparkles,
  Check,
  X,
  FileText,
  Filter,
  Shield,
  Search,
  Download,
  Users,
  Calendar,
  ChevronRight,
  Info,
  SlidersHorizontal,
  History,
  GraduationCap,
} from 'lucide-react';
import {
  submitPasswordChangeRequest,
  getPasswordChangeRequests,
  reviewPasswordChangeRequest,
  directPasswordReset,
} from '../../services/passwordRequestService.js';
import { getStudents } from '../../services/studentService.js';
import { getUserFromStorage } from '../../config/access.jsx';

export default function PasswordSecuritySettings() {
  const authUserFromStore = useSelector((state) => state.auth?.user);
  const user = authUserFromStore || getUserFromStorage() || {};
  const userRole = (user?.role || '').toLowerCase().replace(/_/g, '-');
  const isSuperAdmin = ['super-admin', 'superadmin', 'school-admin', 'principal', 'admin', 'director'].includes(userRole);
  const isStudent = userRole === 'student';

  // Active Tab state
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'pending' : 'request');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  // Form State for Student/User Request
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPwd, setShowPwd] = useState({ new: false, confirm: false, direct: false });

  // Direct Admin Reset Form State
  const [directReset, setDirectReset] = useState({
    targetUserId: '',
    targetUserName: '',
    targetUserEmail: '',
    targetAdmissionNo: '',
    targetClass: '',
    newPassword: '',
    adminNotes: 'Direct Administrative Reset by Super Admin',
  });
  const [directResetSubmitting, setDirectResetSubmitting] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Admin Review Modal state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    request: null,
    action: 'approve', // 'approve' | 'reject'
    adminNotes: '',
  });

  // Audit Trail Detail Modal
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    request: null,
  });

  // Filter & Search state for history
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Load requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getPasswordChangeRequests();
      if (res?.requests) {
        setRequests(res.requests);
      }
      if (res?.stats) {
        setStats(res.stats);
      } else if (res?.requests) {
        setStats({
          total: res.requests.length,
          pending: res.requests.filter((r) => r.status === 'pending').length,
          approved: res.requests.filter((r) => r.status === 'approved').length,
          rejected: res.requests.filter((r) => r.status === 'rejected').length,
        });
      }
    } catch (err) {
      console.error('Failed to load password change requests:', err);
      toast.error('Failed to load password change requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Compute pending list for quick approval tab
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending');
  }, [requests]);

  // Filtered and searched history
  const filteredHistory = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          String(r.userName || '').toLowerCase().includes(q) ||
          String(r.userEmail || '').toLowerCase().includes(q) ||
          String(r.admissionNumber || '').toLowerCase().includes(q) ||
          String(r.className || '').toLowerCase().includes(q) ||
          String(r.sectionName || '').toLowerCase().includes(q) ||
          String(r.notes || '').toLowerCase().includes(q) ||
          String(r.adminNotes || '').toLowerCase().includes(q) ||
          String(r.reviewedByName || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [requests, statusFilter, searchQuery, sortOrder]);

  // Password strength calculation
  const pwdStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-slate-700' };
    }
  }, [newPassword]);

  // Handle Student Request Submit
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Requested new password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation password do not match.');
      return;
    }
    if (!notes.trim()) {
      toast.error('Please write a brief note/reason for requesting this password change.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitPasswordChangeRequest({
        newPassword,
        notes: notes.trim(),
      });
      toast.success(res?.message || 'Password change request submitted to Super Admin!');
      setNewPassword('');
      setConfirmPassword('');
      setNotes('');
      fetchRequests();
      setActiveTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit password change request');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Admin Review Modal
  const handleOpenReview = (request, action) => {
    setReviewModal({
      isOpen: true,
      request,
      action,
      adminNotes: action === 'approve' ? 'Approved by Super Admin' : 'Rejected by Super Admin',
    });
  };

  // Confirm Review Action
  const handleConfirmReview = async () => {
    if (!reviewModal.request) return;
    const { request, action, adminNotes } = reviewModal;
    const id = request._id || request.id;
    setReviewingId(id);

    try {
      const res = await reviewPasswordChangeRequest(id, {
        action,
        adminNotes: adminNotes.trim(),
      });
      toast.success(res?.message || `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setReviewModal({ isOpen: false, request: null, action: 'approve', adminNotes: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setReviewingId(null);
    }
  };

  // Search students for direct password reset
  const handleSearchStudents = async (query) => {
    setStudentSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setStudentSearchResults([]);
      return;
    }
    try {
      setSearchingStudents(true);
      const res = await getStudents({ search: query.trim(), limit: 8 });
      const list = Array.isArray(res?.students)
        ? res.students
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setStudentSearchResults(list);
    } catch (err) {
      console.warn('Student search error:', err);
    } finally {
      setSearchingStudents(false);
    }
  };

  // Select student for direct reset
  const handleSelectStudentForReset = (stu) => {
    const userId = stu.user?._id || stu.user?.id || stu.user || stu._id || stu.id;
    setDirectReset({
      targetUserId: String(userId),
      targetUserName: stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'Student',
      targetUserEmail: stu.email || stu.user?.email || '',
      targetAdmissionNo: stu.admissionNumber || '',
      targetClass: stu.className || stu.class || '',
      newPassword: '',
      adminNotes: `Direct reset by Super Admin for student ${stu.admissionNumber || stu.name}`,
    });
    setStudentSearchResults([]);
    setStudentSearchQuery('');
  };

  // Submit direct password reset
  const handleSubmitDirectReset = async (e) => {
    e.preventDefault();
    if (!directReset.targetUserId) {
      toast.error('Please select a student or user to reset.');
      return;
    }
    if (!directReset.newPassword || directReset.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setDirectResetSubmitting(true);
      const res = await directPasswordReset({
        targetUserId: directReset.targetUserId,
        newPassword: directReset.newPassword,
        adminNotes: directReset.adminNotes.trim(),
      });
      toast.success(res?.message || 'Password directly updated and recorded into history!');
      setDirectReset({
        targetUserId: '',
        targetUserName: '',
        targetUserEmail: '',
        targetAdmissionNo: '',
        targetClass: '',
        newPassword: '',
        adminNotes: 'Direct Administrative Reset by Super Admin',
      });
      fetchRequests();
      setActiveTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user password');
    } finally {
      setDirectResetSubmitting(false);
    }
  };

  // Export History CSV
  const handleExportCSV = () => {
    if (!filteredHistory.length) {
      toast.info('No records to export');
      return;
    }

    const headers = [
      'Request ID',
      'Name',
      'Email',
      'Admission No',
      'Class',
      'Section',
      'Role',
      'Status',
      'Requested At',
      'Student Notes',
      'Reviewed By',
      'Reviewed At',
      'Admin Remarks',
    ];

    const rows = filteredHistory.map((r) => [
      `"${r._id || r.id || ''}"`,
      `"${r.userName || ''}"`,
      `"${r.userEmail || ''}"`,
      `"${r.admissionNumber || ''}"`,
      `"${r.className || ''}"`,
      `"${r.sectionName || ''}"`,
      `"${r.userRole || ''}"`,
      `"${r.status || ''}"`,
      `"${r.createdAt ? format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm') : ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.reviewedByName || ''}"`,
      `"${r.reviewedAt ? format(new Date(r.reviewedAt), 'yyyy-MM-dd HH:mm') : ''}"`,
      `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Password_Requests_History_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('History exported successfully as CSV!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} /> Approved & Applied
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── SECURITY TOP HERO BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 p-5 sm:p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Password & Security Management
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {isSuperAdmin ? 'Super Admin Security Authority' : 'Student Security Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {isSuperAdmin
                  ? 'Manage incoming student password requests, accept or reject with notes, execute direct resets, and maintain a permanent institutional audit history.'
                  : 'Submit password change requests securely to the Super Admin. All submissions and admin approval actions are permanently tracked in your history.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-sky-400' : ''} />
              <span>Refresh</span>
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition cursor-pointer"
                title="Download CSV Audit History"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── SUMMARY KPI METRICS CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Requests</span>
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.total || requests.length}</div>
          <span className="text-[10px] text-slate-500">All submitted records</span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
            <span>Pending Review</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.pending || pendingRequests.length}</div>
          <span className="text-[10px] text-amber-400/70">Awaiting Admin Action</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span>Approved & Applied</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.approved}</div>
          <span className="text-[10px] text-emerald-400/70">Updated in system</span>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1">
          <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
            <span>Rejected</span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{stats.rejected}</div>
          <span className="text-[10px] text-rose-400/70">Declined requests</span>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock size={14} />
            <span>Pending Approvals</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History size={14} />
          <span>{isSuperAdmin ? 'Institutional History & Audit Log' : 'My Request History'}</span>
          <span className="text-[10px] text-slate-400 font-mono">({requests.length})</span>
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('direct-reset')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'direct-reset'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield size={14} />
            <span>Super Admin Direct Reset</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'request'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Send size={14} />
          <span>{isStudent ? 'Send Password Change Request' : 'Submit Personal Request'}</span>
        </button>
      </div>

      {/* ─── TAB 1: PENDING APPROVALS (SUPER ADMIN VIEW) ───────────────────────── */}
      {isSuperAdmin && activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>Pending Student Requests Requiring Super Admin Decision</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                {pendingRequests.length} Pending
              </span>
            </h3>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
              <span>Loading student password change requests...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
              <p className="text-xs text-slate-400">There are no pending password change requests awaiting approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {pendingRequests.map((req) => (
                <div
                  key={req._id || req.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 transition hover:border-slate-700 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold text-sm">
                        {req.userName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{req.userName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold uppercase">
                            {req.userRole}
                          </span>
                          {req.admissionNumber && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-bold">
                              Adm: {req.admissionNumber}
                            </span>
                          )}
                          {req.className && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                              {req.className} {req.sectionName ? `(${req.sectionName})` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{req.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {req.createdAt ? format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <MessageSquare size={11} className="text-indigo-400" /> Student Request Reason / Notes:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {req.notes || <span className="italic text-slate-500">No notes provided</span>}
                    </p>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailModal({ isOpen: true, request: req })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <History size={13} /> View Full Audit Trail
                    </button>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(req, 'reject')}
                        disabled={reviewingId === (req._id || req.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                      >
                        <X size={14} />
                        <span>Reject Request</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReview(req, 'approve')}
                        disabled={reviewingId === (req._id || req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Accept & Apply Password</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: COMPLETE AUDIT HISTORY TAB (ALL ROLES & SUPER ADMIN) ───────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Header, Search & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={16} className="text-sky-400" />
              <span>{isSuperAdmin ? 'Historical Password Request Audit Log' : 'My Password Request Records'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {filteredHistory.length} records
              </span>
            </h3>

            {/* Quick Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, email, admission..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                      statusFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Sort Order */}
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold hover:text-white transition cursor-pointer"
                title="Toggle sort order"
              >
                {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
              <span>Loading request history records...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center space-y-2">
              <FileText size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">No Matching Records Found</h4>
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? `No password request records matched "${searchQuery}".`
                  : statusFilter === 'all'
                  ? 'No password change requests have been submitted yet.'
                  : `No requests found with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((req) => (
                <div
                  key={req._id || req.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 transition hover:border-slate-700 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {req.userName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{req.userName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold uppercase">
                            {req.userRole}
                          </span>
                          {req.admissionNumber && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-bold">
                              Adm: {req.admissionNumber}
                            </span>
                          )}
                          {req.className && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                              {req.className} {req.sectionName ? `(${req.sectionName})` : ''}
                            </span>
                          )}
                          {req.actionType === 'direct_admin_reset' && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-bold">
                              Direct Admin Reset
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{req.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(req.status)}
                      <span className="text-[10px] text-slate-500 font-mono">
                        Date: {req.createdAt ? format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Student Reason */}
                  <div className="text-xs bg-slate-950/50 rounded-xl p-3 border border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Request Reason / Student Note:
                    </span>
                    <p className="text-slate-200">{req.notes || '—'}</p>
                  </div>

                  {/* Admin Remarks if reviewed */}
                  {req.status !== 'pending' && (
                    <div className="text-xs bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          Admin Review Decision Remarks:
                        </span>
                        <p className="text-slate-200 font-medium">{req.adminNotes || 'Decision rendered by Super Admin.'}</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono text-left sm:text-right">
                        <span>Reviewed By: <strong className="text-slate-300">{req.reviewedByName || 'Super Admin'}</strong></span>
                        {req.reviewedAt && <div>{format(new Date(req.reviewedAt), 'dd MMM yyyy, hh:mm a')}</div>}
                      </div>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailModal({ isOpen: true, request: req })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <History size={13} /> View Audit Timeline ({req.historyLog?.length || 1} events)
                    </button>

                    {/* Quick actions for Super Admin if pending */}
                    {isSuperAdmin && req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(req, 'reject')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(req, 'approve')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                        >
                          Accept & Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SUPER ADMIN DIRECT PASSWORD RESET ─────────────────────────── */}
      {isSuperAdmin && activeTab === 'direct-reset' && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              <span>Super Admin Direct Password Reset</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Directly reset and apply a new password for any student or user immediately without waiting for a request. An authorized record is automatically created and logged in the institutional history.
            </p>
          </div>

          <form onSubmit={handleSubmitDirectReset} className="space-y-4">
            {/* Step 1: Select Student / User */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Search & Select Student <span className="text-rose-400">*</span>
              </label>

              {directReset.targetUserId ? (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {directReset.targetUserName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{directReset.targetUserName}</span>
                        {directReset.targetAdmissionNo && (
                          <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                            {directReset.targetAdmissionNo}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {directReset.targetUserEmail || 'ID: ' + directReset.targetUserId}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDirectReset((prev) => ({ ...prev, targetUserId: '', targetUserName: '', targetUserEmail: '' }))}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                    title="Change selected student"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => handleSearchStudents(e.target.value)}
                    placeholder="Type student name, email, or admission number (e.g. STD-2026-0001)..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {searchingStudents && (
                    <RefreshCw size={14} className="animate-spin text-sky-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}

                  {/* Dropdown Results */}
                  {studentSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1">
                      {studentSearchResults.map((stu) => (
                        <button
                          key={stu._id || stu.id}
                          type="button"
                          onClick={() => handleSelectStudentForReset(stu)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-white">{stu.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {stu.email} | {stu.admissionNumber} {stu.className ? `• ${stu.className}` : ''}
                            </div>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-bold">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Assign New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd.direct ? 'text' : 'password'}
                  value={directReset.newPassword}
                  onChange={(e) => setDirectReset((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (minimum 6 characters)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => ({ ...prev, direct: !prev.direct }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd.direct ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Step 3: Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Administrative Notes & Audit Remarks
              </label>
              <textarea
                value={directReset.adminNotes}
                onChange={(e) => setDirectReset((prev) => ({ ...prev, adminNotes: e.target.value }))}
                rows={2}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                placeholder="Audit notes (e.g. Password reset requested via parent phone call, credentials forgotten...)"
              />
            </div>

            <button
              type="submit"
              disabled={directResetSubmitting || !directReset.targetUserId}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              {directResetSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Updating Password & Recording Audit...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Update Password & Save in History</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ─── TAB 4: REQUEST PASSWORD CHANGE FORM ─────────────────────────────── */}
      {activeTab === 'request' && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound size={18} className="text-indigo-400" />
              <span>{isStudent ? 'Send Password Change Request to Super Admin' : 'Request Password Change'}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your desired new password and write notes explaining why you need to update it. The Super Admin will review and authorize the change.
            </p>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Desired New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your proposed new password"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd.new ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Strength: <strong className="text-white">{pwdStrength.label}</strong></span>
                    <span className="text-slate-500 font-mono">{pwdStrength.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                      style={{ width: `${pwdStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your proposed new password"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <span className="text-[11px] text-rose-400 font-medium">Passwords do not match.</span>
              )}
            </div>

            {/* Notes / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Notes & Reason for Change <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Write notes for Super Admin (e.g. forgot password, credential security maintenance, login issue...)"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <span className="text-[10px] text-slate-500 block">
                This note will be recorded into the official audit trail and inspected by the Super Admin.
              </span>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Request to Super Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── ADMIN REVIEW CONFIRMATION MODAL ─────────────────────────────────── */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                {reviewModal.action === 'approve' ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span>Approve Password Change</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-rose-400" />
                    <span>Reject Password Request</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, request: null, action: 'approve', adminNotes: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Target Account</span>
                <div className="font-bold text-white text-sm">{reviewModal.request?.userName}</div>
                <div className="text-slate-400 font-mono text-[11px]">{reviewModal.request?.userEmail}</div>
                {reviewModal.request?.admissionNumber && (
                  <div className="text-sky-400 font-mono text-[10px]">
                    Admission: {reviewModal.request.admissionNumber}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Admin Remarks / Decision Notes to Student
                </label>
                <textarea
                  value={reviewModal.adminNotes}
                  onChange={(e) => setReviewModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Decision reason or remark..."
                />
              </div>

              {reviewModal.action === 'approve' ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                  Confirming this action will immediately hash and update the student's password in the database, allowing them to login with their new credentials.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed">
                  The request will be recorded as rejected and no changes will be made to the user's password.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, request: null, action: 'approve', adminNotes: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer ${
                  reviewModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm {reviewModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── AUDIT TRAIL TIMELINE MODAL ─────────────────────────────────────── */}
      {detailModal.isOpen && detailModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl text-white max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <History size={18} className="text-sky-400" />
                <span>Request Audit Trail & History</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal({ isOpen: false, request: null })}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Account Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{detailModal.request.userName}</span>
                  {getStatusBadge(detailModal.request.status)}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{detailModal.request.userEmail}</div>
                {detailModal.request.admissionNumber && (
                  <div className="text-sky-400 font-mono text-[11px]">
                    Admission: {detailModal.request.admissionNumber}
                  </div>
                )}
                {detailModal.request.className && (
                  <div className="text-purple-300 text-[11px]">
                    Class: {detailModal.request.className} {detailModal.request.sectionName ? `(${detailModal.request.sectionName})` : ''}
                  </div>
                )}
              </div>

              {/* Student Reason */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Student Explanation & Notes:</span>
                <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  {detailModal.request.notes || 'No notes provided'}
                </p>
              </div>

              {/* Super Admin Decision */}
              {detailModal.request.status !== 'pending' && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Super Admin Decision Notes:</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-slate-200">{detailModal.request.adminNotes || 'Decision rendered.'}</p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Decided by {detailModal.request.reviewedByName || 'Super Admin'} on{' '}
                      {detailModal.request.reviewedAt ? format(new Date(detailModal.request.reviewedAt), 'dd MMM yyyy, hh:mm a') : '—'}
                    </div>
                  </div>
                </div>
              )}

              {/* History Events Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Event Sequence & Historical Milestones:
                </span>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-800 ml-2">
                  {(detailModal.request.historyLog && detailModal.request.historyLog.length > 0
                    ? detailModal.request.historyLog
                    : [
                        {
                          action: 'REQUEST_SUBMITTED',
                          performedBy: detailModal.request.userName,
                          timestamp: detailModal.request.createdAt,
                          notes: detailModal.request.notes,
                        },
                        ...(detailModal.request.status !== 'pending'
                          ? [
                              {
                                action: detailModal.request.status === 'approved' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                                performedBy: detailModal.request.reviewedByName || 'Super Admin',
                                timestamp: detailModal.request.reviewedAt,
                                notes: detailModal.request.adminNotes,
                              },
                            ]
                          : []),
                      ]
                  ).map((event, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{event.action?.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {event.timestamp ? format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a') : '—'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">By: {event.performedBy || 'System'}</div>
                      {event.notes && <div className="text-[11px] text-slate-300 italic">{event.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailModal({ isOpen: false, request: null })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
