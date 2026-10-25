import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
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
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Loader from "../components/ui/Loader.jsx";
import {
  getAllLeaves,
  getMyLeaves,
  requestLeave,
  reviewLeave,
  cancelLeave,
} from "../services/leaveService.js";
import { getUserFromStorage, getUserRole } from "../config/access.jsx";
import { ROLES } from "../constants/roles.js";

const CATEGORY_OPTIONS = [
  "Medical Leave",
  "Casual Leave",
  "Emergency Leave",
  "Family / Personal Event",
  "Academic Duty / Olympiad",
  "Maternity / Paternity",
  "Other",
];

const LeaveManagement = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { name: "User", role: "super-admin" };
  const userRole = getUserRole(user);

  const isStudent = userRole === ROLES.STUDENT;
  const isTeacher = [
    ROLES.TEACHER,
    ROLES.HEAD_TEACHER,
    ROLES.HOD,
    ROLES.COORDINATOR,
    "tg",
  ].includes(userRole);
  const isAdmin = ["super-admin", "school-admin", "principal", "director"].includes(userRole);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters & Tabs
  const [roleTab, setRoleTab] = useState("all"); // 'all' | 'student' | 'teacher' | 'staff'
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [form, setForm] = useState({
    category: "Medical Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isHalfDay: false,
    halfDaySession: "first_half",
    reason: "",
  });

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leave: null,
    action: "approved",
    remarks: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Load leaves from unified API
  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);

      if (!isAdmin && !isTeacher) {
        // Student or individual staff: fetch their own applications
        const res = await getMyLeaves();
        if (res?.success) {
          setLeaves(res.leaves || []);
          setPagination({ total: (res.leaves || []).length, page: 1, pages: 1 });
        }
      } else {
        // Faculty / Admin: fetch authorized leaves list with filters
        const params = {
          page,
          limit: 15,
          status: statusFilter,
          search: searchQuery,
        };
        if (roleTab === "student") params.role = "student";
        else if (roleTab === "teacher") params.role = "teacher";
        else if (roleTab === "staff") params.role = "staff";

        const res = await getAllLeaves(params);
        if (res?.success) {
          setLeaves(res.leaves || []);
          setPagination({
            total: res.total || 0,
            page: res.page || 1,
            pages: res.pages || 1,
          });
        }
      }
    } catch (err) {
      console.error("loadLeaves error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isTeacher, roleTab, statusFilter, searchQuery, page]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // Handle Submit New Leave
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.reason) {
      return toast.warning("Please specify date and reason for leave");
    }

    try {
      setSubmitting(true);
      const payload = {
        category: form.category,
        startDate: form.startDate,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        isHalfDay: form.isHalfDay,
        halfDaySession: form.isHalfDay ? form.halfDaySession : "none",
        reason: form.reason,
      };

      await requestLeave(payload);
      setShowApplyModal(false);
      setForm({
        category: "Medical Leave",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        isHalfDay: false,
        halfDaySession: "first_half",
        reason: "",
      });
      loadLeaves();
    } catch (err) {
      // Toast already fired in service
    } finally {
      setSubmitting(false);
    }
  };

  // Open Review Dialog
  const handleOpenReview = (leave, action) => {
    setReviewModal({
      isOpen: true,
      leave,
      action,
      remarks: action === "approved" ? "Approved." : "Application rejected.",
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
      setReviewModal({ isOpen: false, leave: null, action: "approved", remarks: "" });
      loadLeaves();
    } catch (err) {
      // Handled
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Quick stats derived from leaves
  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="space-y-6 pb-12 text-slate-800 dark:text-slate-100 font-sans">
      <PageHeader
        title="Leave Management Hub"
        subtitle={
          isAdmin || isTeacher
            ? "Unified portal to review, manage, and synchronize student, teacher, and employee leaves with institutional attendance."
            : "Submit leave applications, track real-time approval status, and monitor your attendance history."
        }
        breadcrumbs={[{ label: "Attendance & HR" }, { label: "Leave System" }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} className={loading ? "animate-spin text-indigo-500" : ""} />}
              onClick={loadLeaves}
              loading={loading}
            >
              Refresh
            </Button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus size={15} /> Apply for Leave
            </button>
          </div>
        }
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-amber-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-amber-500">
          <div>
            <p className="text-[11px] font-bold text-amber-800/80 dark:text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </p>
            <h4 className="text-2xl font-black text-amber-950 dark:text-white mt-1">{pendingCount}</h4>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5 font-medium">Awaiting decision</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-emerald-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[11px] font-bold text-emerald-800/80 dark:text-slate-400 uppercase tracking-wider">
              Approved Applications
            </p>
            <h4 className="text-2xl font-black text-emerald-950 dark:text-white mt-1">{approvedCount}</h4>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5 font-medium">
              Synchronized with attendance
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-rose-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-rose-500">
          <div>
            <p className="text-[11px] font-bold text-rose-800/80 dark:text-slate-400 uppercase tracking-wider">
              Rejected / Cancelled
            </p>
            <h4 className="text-2xl font-black text-rose-950 dark:text-white mt-1">{rejectedCount}</h4>
            <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-0.5 font-medium">Disallowed requests</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Directory & Management View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {/* Navigation Tabs for Administrative Roles */}
        {(isAdmin || isTeacher) && (
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Requests", icon: Users },
              { id: "student", label: "Student Leaves", icon: GraduationCap },
              { id: "teacher", label: "Faculty / Teachers", icon: Briefcase },
              { id: "staff", label: "Non-Teaching Staff", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRoleTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    roleTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by applicant name, roll number, employee ID, or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter size={13} /> Status:
            </span>
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader size="md" />
            <span className="text-xs font-semibold text-slate-400">Loading leave applications...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertTriangle className="mx-auto text-slate-400" size={32} />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">No Leave Applications Found</h4>
            <p className="text-xs text-slate-400">No applications match your selected tab or filter criteria.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Ref Code & Applicant</th>
                  <th className="py-3.5 px-4">Leave Category</th>
                  <th className="py-3.5 px-4">Date Range & Duration</th>
                  <th className="py-3.5 px-4">Reason / Remarks</th>
                  <th className="py-3.5 px-4">Status</th>
                  {(isAdmin || isTeacher) && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {leaves.map((leave, idx) => {
                  const sDate = new Date(leave.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const eDate = new Date(leave.endDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={leave._id || leave.id || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                            {leave.leaveCode || `LV-${idx + 1}`}
                          </span>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {leave.applicantName || "Applicant"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                              {leave.applicantRole || "Student"}
                            </span>
                            {leave.admissionNumber && <span>Adm: {leave.admissionNumber}</span>}
                            {leave.employeeId && <span>Emp: {leave.employeeId}</span>}
                            {leave.classSection && <span>· {leave.classSection}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {leave.category}
                        </span>
                        {leave.isHalfDay && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            Half Day ({leave.halfDaySession?.replace("_", " ")})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar size={13} className="text-indigo-500 flex-shrink-0" />
                          <span>{sDate === eDate ? sDate : `${sDate} – ${eDate}`}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                          {leave.totalDays} Working Day{leave.totalDays > 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed truncate" title={leave.reason}>
                          {leave.reason}
                        </p>
                        {leave.reviewRemarks && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 italic mt-0.5">
                            Admin Note: "{leave.reviewRemarks}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            leave.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : leave.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}
                        >
                          {leave.status === "approved" && <CheckCircle size={10} />}
                          {leave.status === "rejected" && <XCircle size={10} />}
                          {leave.status === "pending" && <Clock size={10} />}
                          <span>{leave.status}</span>
                        </span>
                      </td>

                      {(isAdmin || isTeacher) && (
                        <td className="py-3.5 px-4 text-right">
                          {leave.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenReview(leave, "approved")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(leave, "rejected")}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-mono text-right">
                              Decided by {leave.reviewedBy?.name || "Admin"}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-xs font-bold transition flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-xs font-bold transition flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Apply for Leave Modal ── */}
      <Modal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        size="md"
        title="Submit Leave Application"
        subtitle="Dates will be checked against institutional working calendar and synchronized with attendance."
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
              Leave Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Half-day toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Half-Day Leave</p>
              <p className="text-[11px] text-slate-400">Apply for morning or afternoon half-day session</p>
            </div>
            <input
              type="checkbox"
              checked={form.isHalfDay}
              onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
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
                  <option value="first_half">First Half (Morning)</option>
                  <option value="second_half">Second Half (Afternoon)</option>
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader size="sm" />}
              <span>{submitting ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Review Decision Modal ── */}
      <Modal
        open={Boolean(reviewModal.isOpen && reviewModal.leave)}
        onClose={() => setReviewModal({ isOpen: false, leave: null, action: "approved", remarks: "" })}
        size="sm"
        title={
          <div className="flex items-center gap-2">
            {reviewModal.action === "approved" ? (
              <CheckCircle className="text-emerald-500" size={18} />
            ) : (
              <XCircle className="text-rose-500" size={18} />
            )}
            <span>
              {reviewModal.action === "approved" ? "Approve Leave Application" : "Reject Leave Application"}
            </span>
          </div>
        }
        subtitle={reviewModal.leave ? `Reference: ${reviewModal.leave.leaveCode} · ${reviewModal.leave.applicantName}` : ""}
      >
        {reviewModal.leave && (
          <div className="space-y-4 text-xs font-medium">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant Details:</span>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {reviewModal.leave.applicantName} ({reviewModal.leave.applicantRole})
              </p>
              <p className="text-slate-500 text-[11px]">
                {reviewModal.leave.category} · {reviewModal.leave.totalDays} Day(s)
              </p>
              <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                "{reviewModal.leave.reason}"
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">
                Reviewer Remarks / Feedback to Applicant
              </label>
              <textarea
                rows={2}
                value={reviewModal.remarks}
                onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                placeholder="Optional notes or feedback..."
              />
            </div>

            {reviewModal.action === "approved" && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0" />
                <span>
                  Confirming approval will automatically reconcile and mark institutional attendance for eligible dates.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, leave: null, action: "approved", remarks: "" })}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={handleConfirmReview}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm ${
                  reviewModal.action === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {reviewSubmitting && <Loader size="sm" />}
                <span>
                  {reviewSubmitting
                    ? "Updating..."
                    : reviewModal.action === "approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagement;
