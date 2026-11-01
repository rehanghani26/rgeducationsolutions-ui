import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  AlertTriangle,
  User,
  Filter,
  Check,
  X,
  Palmtree,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Eye,
  CalendarDays,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Loader from '../components/ui/Loader.jsx';
import {
  getAllLeaves,
  getMyLeaves,
  requestLeave,
  reviewLeave,
  cancelLeave,
  getApplicantLeaveProfile,
} from '../services/leaveService.js';
import { getStudents } from '../services/studentService.js';
import { userService } from '../services/userService.js';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';
import { getUserFromStorage, getUserRole } from '../config/access.jsx';
import { ROLES } from '../constants/roles.js';

const CATEGORY_OPTIONS = [
  'Medical Leave',
  'Casual Leave',
  'Emergency Leave',
  'Family / Personal Event',
  'Academic Duty / Olympiad',
  'Maternity / Paternity',
  'Duty Leave (Official)',
  'Other',
];

const LeaveManagement = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { name: 'User', role: 'super-admin' };
  const userRole = getUserRole(user);

  const isStudent = userRole === ROLES.STUDENT;
  const isTeacher = [
    ROLES.TEACHER,
    ROLES.HEAD_TEACHER,
    ROLES.HOD,
    ROLES.COORDINATOR,
    'tg',
  ].includes(userRole);
  const isAdmin = ['super-admin', 'school-admin', 'principal', 'director'].includes(userRole);
  const isElevated = isAdmin || isTeacher;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters & Tabs
  const [roleTab, setRoleTab] = useState('all'); // 'all' | 'student' | 'teacher' | 'staff'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'this_week' | 'this_month'
  const [page, setPage] = useState(1);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTargetType, setApplyTargetType] = useState('self'); // 'self' | 'student' | 'staff'
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [candidateList, setCandidateList] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');

  const [form, setForm] = useState({
    category: 'Medical Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    halfDaySession: 'first_half',
    reason: '',
  });

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leave: null,
    action: 'approved',
    remarks: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Applicant Profile Drawer State
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [inspectApplicantId, setInspectApplicantId] = useState(null);
  const [applicantProfileData, setApplicantProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load leaves with filters
  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);

      if (!isElevated) {
        // Individual Student / Staff: fetch their own applications
        const res = await getMyLeaves();
        if (res?.success) {
          let list = res.leaves || [];
          if (statusFilter !== 'all') {
            list = list.filter((l) => l.status === statusFilter);
          }
          if (searchQuery) {
            const s = searchQuery.toLowerCase();
            list = list.filter(
              (l) =>
                (l.reason && l.reason.toLowerCase().includes(s)) ||
                (l.category && l.category.toLowerCase().includes(s)) ||
                (l.leaveCode && l.leaveCode.toLowerCase().includes(s))
            );
          }
          setLeaves(list);
          setPagination({ total: list.length, page: 1, pages: 1 });
        }
      } else {
        // Elevated Admin / Teacher: query comprehensive leaves
        const params = {
          page,
          limit: 15,
          status: statusFilter,
          search: searchQuery,
        };
        if (roleTab === 'student') params.role = 'student';
        else if (roleTab === 'teacher') params.role = 'teacher';
        else if (roleTab === 'staff') params.role = 'staff';

        if (selectedClass) params.className = selectedClass;

        const res = await getAllLeaves(params);
        if (res?.success) {
          let list = res.leaves || [];

          // Local date filtering
          if (dateFilter === 'today') {
            const todayStr = new Date().toISOString().split('T')[0];
            list = list.filter((l) => {
              const s = new Date(l.startDate).toISOString().split('T')[0];
              const e = new Date(l.endDate).toISOString().split('T')[0];
              return todayStr >= s && todayStr <= e;
            });
          }

          setLeaves(list);
          setPagination({
            total: res.total || list.length,
            page: res.page || 1,
            pages: res.pages || 1,
          });
        }
      }
    } catch (err) {
      console.error('loadLeaves error:', err);
    } finally {
      setLoading(false);
    }
  }, [isElevated, roleTab, statusFilter, selectedClass, searchQuery, dateFilter, page]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Load dynamic candidate list (Students or Staff) when Admin/Teacher creates leave on behalf
  useEffect(() => {
    if (!showApplyModal || applyTargetType === 'self') {
      setCandidateList([]);
      return;
    }

    const fetchCandidates = async () => {
      setCandidateLoading(true);
      try {
        if (applyTargetType === 'student') {
          const params = { limit: 100 };
          if (selectedClass) params.class = selectedClass;
          if (selectedSection) params.section = selectedSection;
          const res = await getStudents(params);
          const rawStudents = res?.data?.students || res?.students || [];
          setCandidateList(
            rawStudents.map((s) => ({
              _id: s._id || s.id,
              name: s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : s.name,
              identifier: s.admissionNumber || s.rollNo || s.studentId || `STU-${String(s._id).slice(-4)}`,
              role: 'student',
              classSection: s.class ? `${s.class} - ${s.section || 'A'}` : s.className || '',
              avatar: s.avatar || s.photo || '',
            }))
          );
        } else if (applyTargetType === 'staff') {
          const res = await userService.getUsers({ limit: 100 });
          const rawUsers = res?.users || res?.data?.users || [];
          setCandidateList(
            rawUsers
              .filter((u) => !['student', 'parent'].includes((u.role || '').toLowerCase()))
              .map((u) => ({
                _id: u._id,
                name: u.name,
                identifier: u.employeeId || `EMP-${String(u._id).slice(-4)}`,
                role: u.role,
                department: u.department || 'Academics',
                avatar: u.avatar || u.photo || '',
              }))
          );
        }
      } catch (err) {
        console.error('Failed to load candidate list:', err);
      } finally {
        setCandidateLoading(false);
      }
    };

    fetchCandidates();
  }, [showApplyModal, applyTargetType, selectedClass, selectedSection]);

  // Filtered candidate list based on search in modal
  const filteredCandidates = useMemo(() => {
    if (!candidateSearch) return candidateList;
    const s = candidateSearch.toLowerCase();
    return candidateList.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.identifier.toLowerCase().includes(s) ||
        (c.classSection && c.classSection.toLowerCase().includes(s)) ||
        (c.department && c.department.toLowerCase().includes(s))
    );
  }, [candidateList, candidateSearch]);

  // Handle Submit New Leave
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.reason) {
      return toast.warning('Please specify dates and reason for leave');
    }

    if (applyTargetType !== 'self' && !selectedApplicant) {
      return toast.warning(`Please select a ${applyTargetType} to apply on their behalf.`);
    }

    try {
      setSubmitting(true);
      const payload = {
        applicantId: applyTargetType === 'self' ? undefined : selectedApplicant._id,
        category: form.category,
        startDate: form.startDate,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        isHalfDay: form.isHalfDay,
        halfDaySession: form.isHalfDay ? form.halfDaySession : 'none',
        reason: form.reason,
      };

      await requestLeave(payload);
      setShowApplyModal(false);
      setSelectedApplicant(null);
      setForm({
        category: 'Medical Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isHalfDay: false,
        halfDaySession: 'first_half',
        reason: '',
      });
      loadLeaves();
    } catch (err) {
      // Handled in leaveService
    } finally {
      setSubmitting(false);
    }
  };

  // Inspect Applicant Profile Drawer
  const handleInspectApplicant = async (applicantId) => {
    if (!applicantId) return;
    setInspectApplicantId(applicantId);
    setProfileDrawerOpen(true);
    setProfileLoading(true);
    try {
      const data = await getApplicantLeaveProfile(applicantId);
      if (data?.success) {
        setApplicantProfileData(data);
      } else {
        toast.error('Unable to fetch detailed applicant leave history');
      }
    } catch (err) {
      console.error('getApplicantLeaveProfile error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Open Review Dialog
  const handleOpenReview = (leave, action) => {
    setReviewModal({
      isOpen: true,
      leave,
      action,
      remarks: action === 'approved' ? 'Approved & Synced with Attendance.' : 'Application disallowed.',
    });
  };

  // Confirm Review Decision
  const handleConfirmReview = async () => {
    if (!reviewModal.leave) return;
    try {
      setReviewSubmitting(true);
      await reviewLeave(reviewModal.leave._id || reviewModal.leave.id, {
        status: reviewModal.action,
        reviewRemarks: reviewModal.remarks,
      });
      setReviewModal({ isOpen: false, leave: null, action: 'approved', remarks: '' });
      loadLeaves();
    } catch (err) {
      // Handled
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Cancel Leave
  const handleCancelApplication = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await cancelLeave(leaveId);
      loadLeaves();
    } catch (err) {
      // Handled
    }
  };

  // Dynamic KPI Stats derived from current list
  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTodayCount = leaves.filter((l) => {
    if (l.status !== 'approved') return false;
    const s = new Date(l.startDate).toISOString().split('T')[0];
    const e = new Date(l.endDate).toISOString().split('T')[0];
    return todayStr >= s && todayStr <= e;
  }).length;

  return (
    <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-100 font-sans">
      <PageHeader
        title="Institutional Leave Management Hub"
        subtitle={
          isElevated
            ? 'Unified system to review, apply, and synchronize student, faculty, and employee leaves with daily institutional attendance.'
            : 'Submit official leave applications, monitor approval milestones, and view synchronized attendance records.'
        }
        breadcrumbs={[{ label: 'Attendance & HR' }, { label: 'Leave Hub' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} className={loading ? 'animate-spin text-orange-500' : ''} />}
              onClick={loadLeaves}
              loading={loading}
            >
              Refresh
            </Button>
            <button
              onClick={() => {
                setShowApplyModal(true);
                setApplyTargetType('self');
                setSelectedApplicant(null);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus size={16} /> Apply for Leave
            </button>
          </div>
        }
      />

      {/* 4 Dynamic Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-amber-500">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              {pendingCount}
              {pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </h4>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-bold">
              Awaiting review decision
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        {/* Approved & Synced */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Approved Applications
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{approvedCount}</h4>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> Synced with Attendance
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Active on Leave Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-indigo-500">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              On Leave Today
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeTodayCount}</h4>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">
              Marked "L" in daily rosters
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CalendarDays size={22} />
          </div>
        </div>

        {/* Disallowed Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-rose-500">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rejected / Cancelled
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{rejectedCount}</h4>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-bold">
              Unexcused absences
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Directory & Management View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        {/* Navigation Tabs for Administrative Roles */}
        {isElevated && (
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Requests', icon: Users },
              { id: 'student', label: 'Student Leaves', icon: GraduationCap },
              { id: 'teacher', label: 'Faculty / Teachers', icon: Briefcase },
              { id: 'staff', label: 'Support / Staff', icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = roleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRoleTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Filters Row: Search, Class, Section, Date & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicant name, roll no, employee ID, ref code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dynamic Class & Section selector (When Student tab is active) */}
            {isElevated && (roleTab === 'student' || roleTab === 'all') && (
              <>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">All Sections</option>
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Date Quick Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Active</option>
            </select>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {['all', 'pending', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-orange-500" />
            <span className="text-xs font-semibold text-slate-400">Loading leave applications...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertTriangle className="mx-auto text-slate-400" size={32} />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">No Leave Applications Found</h4>
            <p className="text-xs text-slate-400">No applications match your selected criteria or filters.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Applicant & Role</th>
                  <th className="py-3.5 px-4">Leave Category</th>
                  <th className="py-3.5 px-4">Duration & Calendar</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4 text-center">Attendance Sync Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {leaves.map((leave, idx) => {
                  const sDate = new Date(leave.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const eDate = new Date(leave.endDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  const isApproved = leave.status === 'approved';
                  const isPending = leave.status === 'pending';
                  const isRejected = leave.status === 'rejected';

                  return (
                    <tr
                      key={leave._id || leave.id || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Applicant & Role (Clickable to inspect drawer) */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => handleInspectApplicant(leave.applicantId || leave.user)}
                          className="flex items-center gap-2.5 cursor-pointer group w-max"
                          title="Click to view full leave history & profile"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition shadow-2xs">
                            {leave.applicantName ? leave.applicantName.charAt(0) : 'A'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-orange-500 transition">
                              {leave.applicantName || 'Applicant'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span className="uppercase font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-200 dark:border-orange-900">
                                {leave.applicantRole || 'Student'}
                              </span>
                              {leave.admissionNumber && <span>Adm: {leave.admissionNumber}</span>}
                              {leave.employeeId && <span>Emp: {leave.employeeId}</span>}
                              {leave.classSection && <span>• {leave.classSection}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {leave.category}
                        </span>
                        {leave.isHalfDay ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                            ⚡ Half Day ({leave.halfDaySession?.replace('_', ' ')})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Full Day Application
                          </span>
                        )}
                      </td>

                      {/* Duration & Calendar */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar size={13} className="text-orange-500 flex-shrink-0" />
                          <span>{sDate === eDate ? sDate : `${sDate} – ${eDate}`}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">
                          {leave.totalDays} Working Day{leave.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed truncate" title={leave.reason}>
                          {leave.reason}
                        </p>
                        {leave.reviewRemarks && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 italic mt-0.5">
                            Note: "{leave.reviewRemarks}"
                          </div>
                        )}
                      </td>

                      {/* Attendance Sync Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isApproved ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 inline-flex items-center gap-1">
                              <CheckCircle size={11} /> Synced with Attendance
                            </span>
                            <span className="text-[9px] text-slate-400">Rosters marked "L"</span>
                          </div>
                        ) : isPending ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40 inline-flex items-center gap-1">
                              <Clock size={11} /> Awaiting Approval
                            </span>
                            <span className="text-[9px] text-amber-600 dark:text-amber-400">Not synced yet</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/40 inline-flex items-center gap-1">
                            <XCircle size={11} /> Disallowed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Profile Button */}
                          <button
                            onClick={() => handleInspectApplicant(leave.applicantId || leave.user)}
                            title="Inspect Applicant Leave Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Elevated Review Actions */}
                          {isElevated && isPending && (
                            <>
                              <button
                                onClick={() => handleOpenReview(leave, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(leave, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                              >
                                <X size={12} /> Reject
                              </button>
                            </>
                          )}

                          {/* Cancel Application (for owner if pending) */}
                          {isPending && !isElevated && (
                            <button
                              onClick={() => handleCancelApplication(leave._id || leave.id)}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dynamic Apply for Leave Modal with On-Behalf Picker ── */}
      <Modal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        size="lg"
        title="Submit Leave Application"
        subtitle="Dates will be automatically validated and synchronized with institutional attendance rosters."
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs font-medium">
          {/* On-Behalf Switcher for Teachers and Admins */}
          {isElevated && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Applying on behalf of:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: 'self', label: 'Myself' },
                  { id: 'student', label: 'Enrolled Student' },
                  { id: 'staff', label: 'Faculty / Staff Member' },
                ].map((tgt) => (
                  <button
                    key={tgt.id}
                    type="button"
                    onClick={() => {
                      setApplyTargetType(tgt.id);
                      setSelectedApplicant(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      applyTargetType === tgt.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {tgt.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Student / Staff Picker */}
              {applyTargetType !== 'self' && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Search & Select {applyTargetType === 'student' ? 'Student' : 'Staff Member'}:
                    </span>
                    {selectedApplicant && (
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                        Selected: {selectedApplicant.name} ({selectedApplicant.identifier})
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder={`Type name or ID to filter ${applyTargetType}...`}
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />

                  {candidateLoading ? (
                    <div className="p-4 text-center text-slate-400">
                      <RefreshCw size={16} className="animate-spin mx-auto text-orange-500" />
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                      {filteredCandidates.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-[11px]">
                          No {applyTargetType} records found.
                        </div>
                      ) : (
                        filteredCandidates.map((c) => (
                          <div
                            key={c._id}
                            onClick={() => setSelectedApplicant(c)}
                            className={`p-2 flex items-center justify-between cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition ${
                              selectedApplicant?._id === c._id
                                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                                : ''
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {c.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {c.identifier} {c.classSection ? `• ${c.classSection}` : ''} {c.department ? `• ${c.department}` : ''}
                              </span>
                            </div>
                            {selectedApplicant?._id === c._id && (
                              <CheckCircle size={14} className="text-orange-500" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              Leave Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Half-Day Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Half-Day Session</p>
              <p className="text-[11px] text-slate-400">Apply for morning or afternoon half-day</p>
            </div>
            <input
              type="checkbox"
              checked={form.isHalfDay}
              onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
          </div>

          {form.isHalfDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Leave Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  Session
                </label>
                <select
                  value={form.halfDaySession}
                  onChange={(e) => setForm({ ...form, halfDaySession: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="first_half">First Half (Morning Session)</option>
                  <option value="second_half">Second Half (Afternoon Session)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  From Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                  To Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              Reason Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detailed reason for applying for leave..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader size="sm" />}
              <span>{submitting ? 'Submitting...' : 'Submit Leave Application'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Review Decision Modal ── */}
      <Modal
        open={Boolean(reviewModal.isOpen && reviewModal.leave)}
        onClose={() => setReviewModal({ isOpen: false, leave: null, action: 'approved', remarks: '' })}
        size="sm"
        title={
          <div className="flex items-center gap-2">
            {reviewModal.action === 'approved' ? (
              <CheckCircle className="text-emerald-500" size={18} />
            ) : (
              <XCircle className="text-rose-500" size={18} />
            )}
            <span>
              {reviewModal.action === 'approved' ? 'Approve Leave Application' : 'Reject Leave Application'}
            </span>
          </div>
        }
        subtitle={reviewModal.leave ? `Ref: ${reviewModal.leave.leaveCode} • ${reviewModal.leave.applicantName}` : ''}
      >
        {reviewModal.leave && (
          <div className="space-y-4 text-xs font-medium">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant Details:</span>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {reviewModal.leave.applicantName} ({reviewModal.leave.applicantRole})
              </p>
              <p className="text-slate-500 text-[11px]">
                {reviewModal.leave.category} • {reviewModal.leave.totalDays} Day(s)
              </p>
              <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                "{reviewModal.leave.reason}"
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                Feedback Notes to Applicant:
              </label>
              <textarea
                rows={2}
                value={reviewModal.remarks}
                onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                placeholder="Optional notes or feedback..."
              />
            </div>

            {reviewModal.action === 'approved' && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0" />
                <span>
                  Confirming approval will automatically synchronize institutional attendance rosters on these dates.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, leave: null, action: 'approved', remarks: '' })}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={handleConfirmReview}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer ${
                  reviewModal.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {reviewSubmitting && <Loader size="sm" />}
                <span>
                  {reviewSubmitting
                    ? 'Updating...'
                    : reviewModal.action === 'approved'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Dynamic Applicant Leave & Attendance Inspection Drawer ── */}
      <Modal
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        size="lg"
        title="Applicant Leave History & Attendance Status"
        subtitle="Comprehensive record of historical leaves and current active institutional attendance sync."
      >
        {profileLoading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading applicant history profile...</p>
          </div>
        ) : !applicantProfileData ? (
          <div className="p-8 text-center text-slate-400 text-xs">Applicant profile could not be loaded.</div>
        ) : (
          <div className="space-y-4 text-xs font-medium">
            {/* Profile Identity Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {applicantProfileData.applicant?.applicantName?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {applicantProfileData.applicant?.applicantName}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className="uppercase font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded">
                      {applicantProfileData.applicant?.applicantRole || 'Student'}
                    </span>
                    <span>ID: {applicantProfileData.applicant?.admissionNumber || applicantProfileData.applicant?.employeeId || inspectApplicantId}</span>
                  </div>
                </div>
              </div>

              {/* Active Leave Badge */}
              {applicantProfileData.activeLeaveNow ? (
                <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-right">
                  <span className="font-black text-xs block">Currently on Active Leave</span>
                  <span className="text-[10px]">Until {new Date(applicantProfileData.activeLeaveNow.endDate).toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-right">
                  <span className="font-black text-xs block">Active in Institution</span>
                  <span className="text-[10px]">No active leave today</span>
                </div>
              )}
            </div>

            {/* Lifetime Leave Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Applications</span>
                <strong className="text-sm font-black text-slate-900 dark:text-white">
                  {applicantProfileData.summary?.totalApplications || 0}
                </strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">Approved Days</span>
                <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {applicantProfileData.summary?.approvedDays || 0}
                </strong>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900">
                <span className="text-[10px] text-amber-600 uppercase font-bold block">Pending Days</span>
                <strong className="text-sm font-black text-amber-600 dark:text-amber-400">
                  {applicantProfileData.summary?.pendingDays || 0}
                </strong>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900">
                <span className="text-[10px] text-rose-600 uppercase font-bold block">Rejected Days</span>
                <strong className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {applicantProfileData.summary?.rejectedDays || 0}
                </strong>
              </div>
            </div>

            {/* Historical Applications List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Historical Applications & Approval Ledger
              </span>

              {(!applicantProfileData.history || applicantProfileData.history.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                  No previous leave requests found for this applicant.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {applicantProfileData.history.map((h, i) => (
                    <div
                      key={h._id || i}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">{h.category}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                              h.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : h.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {h.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.startDate).toLocaleDateString()} – {new Date(h.endDate).toLocaleDateString()} ({h.totalDays} Days)
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">"{h.reason}"</p>
                      </div>

                      {h.reviewRemarks && (
                        <div className="text-[10px] text-slate-400 text-right">
                          <span className="block font-bold">Feedback:</span>
                          <span>"{h.reviewRemarks}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagement;
