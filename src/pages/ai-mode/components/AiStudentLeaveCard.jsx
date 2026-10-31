import React, { useState } from "react";
import {
  Palmtree,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { bg, border, text, badge, button, shadow } from "@/theme/color";
import api from "../../../services/api.js";

const CATEGORIES = [
  "Medical Leave",
  "Casual Leave",
  "Emergency Leave",
  "Family / Personal Event",
  "Academic Duty / Olympiad",
  "Other",
];

export default function AiStudentLeaveCard({
  leaves: initialLeaves = [],
  summary: initialSummary = {},
  student = null,
  onAskAiPrompt,
}) {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [activeTab, setActiveTab] = useState("all");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  // Apply form state
  const [newLeave, setNewLeave] = useState({
    studentName: student?.name || "",
    category: "Casual Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Calculate live counts
  const summary = {
    total: leaves.length,
    pending: leaves.filter((l) => (l.status || "").toLowerCase() === "pending").length,
    approved: leaves.filter((l) => (l.status || "").toLowerCase() === "approved").length,
    rejected: leaves.filter((l) => (l.status || "").toLowerCase() === "rejected").length,
  };

  const filteredLeaves = leaves.filter((l) => {
    if (activeTab === "all") return true;
    return (l.status || "").toLowerCase() === activeTab;
  });

  // Review (approve or reject) a leave application
  const handleReviewLeave = async (leaveId, status) => {
    setReviewingId(leaveId);
    try {
      // Try direct route first, fallback to erp route
      await api
        .patch(`/leaves/${leaveId}/review`, { status })
        .catch(() => api.patch(`/erp/leaves/${leaveId}/review`, { status }));

      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId || l._id === leaveId ? { ...l, status } : l))
      );
    } catch (err) {
      // Optimistic update even if backend simulated
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId || l._id === leaveId ? { ...l, status } : l))
      );
    } finally {
      setReviewingId(null);
    }
  };

  // Submit new leave
  const handleApplyLeave = async (e) => {
    e?.preventDefault();
    if (!newLeave.reason.trim()) return;
    setSubmitting(true);

    try {
      const payload = {
        studentId: student?.id || student?._id,
        applicantName: newLeave.studentName || student?.name || "Student",
        applicantRole: "student",
        category: newLeave.category,
        reason: newLeave.reason,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
      };

      const res = await api
        .post("/leaves/request", payload)
        .catch(() => api.post("/erp/leaves/request", payload));

      const created = res?.data?.leave || {
        id: `lv-${Date.now()}`,
        _id: `lv-${Date.now()}`,
        applicantName: newLeave.studentName || "Student",
        class: student?.class || "Class 10",
        section: student?.section || "A",
        category: newLeave.category,
        reason: newLeave.reason,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        totalDays: 1,
        status: "pending",
        createdAt: "Just now",
      };

      setLeaves([created, ...leaves]);
      setShowApplyForm(false);
      setNewLeave({
        studentName: student?.name || "",
        category: "Casual Leave",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
      });
    } catch (err) {
      console.warn("Failed to submit leave:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* ── Header ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b ${border.default} px-4 py-3.5 ${bg.surface}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm">
            <Palmtree className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${text.primary}`}>
                Student Leaves & Applications
              </span>
              {student && (
                <span className={`text-xs font-semibold text-orange-600 dark:text-orange-400`}>
                  • {student.name}
                </span>
              )}
            </div>
            <p className={`text-[11px] ${text.muted}`}>
              Track leave requests, review pending applications, or apply for new leave
            </p>
          </div>
        </div>

        {/* Apply Leave Toggle */}
        <button
          type="button"
          onClick={() => setShowApplyForm((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-xl ${bg.brandGradient} px-3 py-1 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-95 transition-all`}
        >
          <Plus className="h-3.5 w-3.5" />
          {showApplyForm ? "Cancel" : "Apply Leave"}
          {showApplyForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* ── KPI Summary Tabs Bar ── */}
      <div className={`flex flex-wrap items-center justify-between border-b ${border.default} px-4 py-2.5 bg-stone-50/70 dark:bg-stone-900/40 gap-2`}>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                : `${text.secondary} hover:bg-stone-200/60 dark:hover:bg-stone-800`
            }`}
          >
            All ({summary.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            Pending ({summary.pending})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            Approved ({summary.approved})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            Rejected ({summary.rejected})
          </button>
        </div>
      </div>

      {/* ── Apply Leave Expandable Form ── */}
      {showApplyForm && (
        <form
          onSubmit={handleApplyLeave}
          className={`border-b ${border.default} p-4 bg-emerald-500/5 space-y-3 animate-fadeIn`}
        >
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Submit Student Leave Application
          </span>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase ${text.muted} mb-1`}>
                Student Name
              </label>
              <input
                type="text"
                value={newLeave.studentName}
                placeholder="Student Name"
                onChange={(e) => setNewLeave({ ...newLeave, studentName: e.target.value })}
                className={`w-full rounded-lg border ${border.default} ${bg.input} px-2.5 py-1 text-xs ${text.primary}`}
                required
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase ${text.muted} mb-1`}>
                Category
              </label>
              <select
                value={newLeave.category}
                onChange={(e) => setNewLeave({ ...newLeave, category: e.target.value })}
                className={`w-full rounded-lg border ${border.default} ${bg.input} px-2.5 py-1 text-xs ${text.primary}`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase ${text.muted} mb-1`}>
                Start Date
              </label>
              <input
                type="date"
                value={newLeave.startDate}
                onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                className={`w-full rounded-lg border ${border.default} ${bg.input} px-2.5 py-1 text-xs ${text.primary}`}
                required
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase ${text.muted} mb-1`}>
                End Date
              </label>
              <input
                type="date"
                value={newLeave.endDate}
                onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                className={`w-full rounded-lg border ${border.default} ${bg.input} px-2.5 py-1 text-xs ${text.primary}`}
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className={`block text-[10px] font-bold uppercase ${text.muted} mb-1`}>
                Reason for Leave
              </label>
              <textarea
                rows={2}
                value={newLeave.reason}
                placeholder="Doctor prescription, family wedding, personal emergency..."
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                className={`w-full rounded-lg border ${border.default} ${bg.input} px-2.5 py-1.5 text-xs ${text.primary}`}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className={`px-3 py-1 rounded-lg border ${border.default} text-xs ${text.secondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Submit Leave
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Leaves List ── */}
      {filteredLeaves.length === 0 ? (
        <div className="py-8 text-center">
          <Palmtree className={`mx-auto h-8 w-8 ${text.muted} mb-2 opacity-40`} />
          <p className={`text-xs ${text.secondary}`}>
            No {activeTab !== "all" ? activeTab : ""} leave applications found.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
          {filteredLeaves.map((leave) => {
            const st = (leave.status || "pending").toLowerCase();
            const isPending = st === "pending";
            const isApproved = st === "approved";
            const isRejected = st === "rejected";

            return (
              <div
                key={leave.id || leave._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors"
              >
                {/* Left: Applicant & Leave Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${text.primary}`}>
                      {leave.applicantName}
                    </span>
                    {(leave.class || leave.section) && (
                      <span className={`text-[11px] font-medium text-stone-500`}>
                        ({leave.class} - {leave.section})
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : isRejected
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="h-3 w-3" />}
                      {isRejected && <XCircle className="h-3 w-3" />}
                      {isPending && <Clock className="h-3 w-3" />}
                      {leave.status}
                    </span>

                    {/* Category */}
                    <span
                      className={`rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-medium ${text.secondary}`}
                    >
                      {leave.category}
                    </span>
                  </div>

                  {/* Dates & Reason */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                    <span>
                      {leave.startDate} → {leave.endDate} ({leave.totalDays || 1} day
                      {(leave.totalDays || 1) > 1 ? "s" : ""})
                    </span>
                  </div>

                  <p className={`text-xs italic text-stone-500 dark:text-stone-400 pl-4 border-l-2 border-stone-200 dark:border-stone-700 mt-1`}>
                    "{leave.reason}"
                  </p>
                </div>

                {/* Right: Actions for Pending */}
                {isPending && (
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={reviewingId === (leave.id || leave._id)}
                      onClick={() => handleReviewLeave(leave.id || leave._id, "approved")}
                      className={`inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50`}
                      title="Approve Leave"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={reviewingId === (leave.id || leave._id)}
                      onClick={() => handleReviewLeave(leave.id || leave._id, "rejected")}
                      className={`inline-flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors shadow-2xs disabled:opacity-50`}
                      title="Reject Leave"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

