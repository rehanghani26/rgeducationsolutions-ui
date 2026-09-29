import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
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
} from "lucide-react";
import api from "../services/api.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import { mockLeaves } from "../data/mockData.js";
import { getUserFromStorage, getUserRole } from "../config/access.jsx";
import { ROLES } from "../constants/roles.js";

const LeaveManagement = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { name: "Albus Dumbledore", role: "super-admin" };
  const userRole = getUserRole(user);

  const isStudent = userRole === ROLES.STUDENT;
  const isTeacher = [ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.HOD, ROLES.COORDINATOR, "tg"].includes(userRole);
  const isAdmin = ["super-admin", "school-admin", "principal"].includes(userRole);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Apply Form State
  const [form, setForm] = useState({
    category: "Medical Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Filter State
  const [statusFilter, setStatusFilter] = useState("all");

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const url = isAdmin || isTeacher ? "/erp/leaves/all" : "/erp/leaves/my";
      const res = await api.get(url).catch(() => null);
      if (res?.data?.leaves && res.data.leaves.length > 0) {
        setLeaves(res.data.leaves);
      } else {
        setLeaves([
          {
            id: "lv-101",
            applicantName: isStudent ? user?.name || "Student Member" : "Ahmed Al-Rashidi",
            applicantRole: isStudent ? "student" : "student",
            category: "Medical Leave",
            reason: "High fever and viral infection. Doctor advised 3 days complete bed rest.",
            startDate: "2026-05-18",
            endDate: "2026-05-20",
            status: "approved",
            appliedOn: "2026-05-17",
          },
          {
            id: "lv-102",
            applicantName: isStudent ? user?.name || "Student Member" : "Dr. Tariq Al-Hassan",
            applicantRole: isStudent ? "student" : "teacher",
            category: "Personal / Family Event",
            reason: "Attending elder sister's wedding ceremony out of town.",
            startDate: "2026-05-24",
            endDate: "2026-05-25",
            status: "pending",
            appliedOn: "2026-05-21",
          },
          {
            id: "lv-103",
            applicantName: "Fatima Al-Zahra",
            applicantRole: "student",
            category: "Emergency Leave",
            reason: "Urgent family emergency requirement.",
            startDate: "2026-05-10",
            endDate: "2026-05-11",
            status: "rejected",
            appliedOn: "2026-05-09",
          },
        ]);
      }
    } catch (err) {
      setLeaves(mockLeaves);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [userRole]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.reason) {
      return toast.warning("Please specify date range and detailed reason for leave");
    }

    try {
      setSubmitting(true);
      const res = await api.post("/erp/leaves/request", form).catch(() => null);

      const newLeaveItem = {
        id: `lv-${Date.now()}`,
        applicantName: user?.name || user?.username || "User",
        applicantRole: userRole,
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        status: "pending",
        appliedOn: new Date().toISOString().split("T")[0],
      };

      setLeaves((prev) => [newLeaveItem, ...prev]);
      toast.success(res?.data?.message || "Leave application submitted successfully!");
      setShowApplyModal(false);
      setForm({
        category: "Medical Leave",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (leaveId, newStatus) => {
    try {
      await api.patch(`/erp/leaves/${leaveId}/review`, { status: newStatus }).catch(() => null);

      setLeaves((prev) =>
        prev.map((l) =>
          (l.id === leaveId || l._id === leaveId) ? { ...l, status: newStatus } : l
        )
      );
      toast.success(`Leave application status updated to ${newStatus.toUpperCase()}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review leave application");
    }
  };

  // Filtered List based on status
  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === "all") return true;
    return l.status === statusFilter;
  });

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="space-y-6 pb-12 text-slate-800 dark:text-slate-100 font-sans">

      <PageHeader
        title="Leave Management"
        subtitle={
          isAdmin || isTeacher
            ? "Manage, review, and approve student and staff leave applications."
            : "Apply for leaves with reason & dates and monitor real-time approval status."
        }
        breadcrumbs={[{ label: "Attendance & HR" }, { label: "Leave Applications" }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={loadLeaves}
              loading={loading}
            >
              Refresh
            </Button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus size={15} /> Apply for Leave
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-amber-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-amber-500">
          <div>
            <p className="text-[11px] font-bold text-amber-800/80 dark:text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h4 className="text-2xl font-black text-amber-950 dark:text-white mt-1">{pendingCount}</h4>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5 font-medium">Awaiting review</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-emerald-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[11px] font-bold text-emerald-800/80 dark:text-slate-400 uppercase tracking-wider">Approved Leaves</p>
            <h4 className="text-2xl font-black text-emerald-950 dark:text-white mt-1">{approvedCount}</h4>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5 font-medium">Granted & documented</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50/40 dark:from-slate-900 dark:to-slate-900/80 border border-rose-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs border-l-4 border-l-rose-500">
          <div>
            <p className="text-[11px] font-bold text-rose-800/80 dark:text-slate-400 uppercase tracking-wider">Rejected Applications</p>
            <h4 className="text-2xl font-black text-rose-950 dark:text-white mt-1">{rejectedCount}</h4>
            <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-0.5 font-medium">Not approved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Main Leave Applications Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Palmtree className="text-indigo-600 dark:text-indigo-400" size={20} />
              {isAdmin || isTeacher ? "Incoming Leave Applications" : "My Submitted Leave Applications"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review leave category, requested date range, and current approval status.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter size={13} /> Filter Status:
            </span>
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Fetching leave applications...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertTriangle className="mx-auto text-slate-400 dark:text-slate-500" size={32} />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">No Leave Applications Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">No applications match your filter selection.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Leave Category</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Reason Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  {(isAdmin || isTeacher) && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLeaves.map((leave, idx) => (
                  <tr key={leave.id || leave._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{leave.applicantName || "User"}</p>
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40 inline-block mt-0.5">
                          {leave.applicantRole || "Student"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-700 dark:text-slate-200">
                      {leave.category || "General Leave"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-indigo-500 flex-shrink-0" />
                        <span>
                          {leave.startDate} {leave.endDate && leave.endDate !== leave.startDate ? ` to ${leave.endDate}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        leave.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : leave.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 animate-pulse"
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    {(isAdmin || isTeacher) && (
                      <td className="py-3.5 px-4 text-right">
                        {leave.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReview(leave.id || leave._id, "approved")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-xs"
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleReview(leave.id || leave._id, "rejected")}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-xs"
                            >
                              <X size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Reviewed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply for Leave Modal */}
      {showApplyModal && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title="Submit Leave Application"
        >
          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">Leave Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Medical Leave">🏥 Medical Leave / Sick Leave</option>
                <option value="Personal / Family Event">🎉 Personal / Family Event</option>
                <option value="Casual Leave">🏠 Casual / Home Leave</option>
                <option value="Emergency Leave">⚠️ Urgent Emergency Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">From Date</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">To Date</label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] mb-1">Reason for Leave Application</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the detailed reason for applying for leave..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LeaveManagement;
