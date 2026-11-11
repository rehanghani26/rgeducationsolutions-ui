import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarCheck,
  Palmtree,
  Briefcase,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import api from "../../../services/api.js";
import { getUserFromStorage } from "../../../config/access.jsx";

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString("en-IN")}`;
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || {};

  const [payrollData, setPayrollData] = useState(null);
  const [leaveStats, setLeaveStats] = useState({ approved: 0, pending: 0, total: 0 });
  const [attStats, setAttStats] = useState({ present: 0, total: 0, percentage: "N/A" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPersonalSummary = async () => {
      try {
        setLoading(true);
        const [payrollRes, leavesRes, attRes] = await Promise.all([
          api.get("/payroll/staff").catch(() => null),
          api.get("/leaves/my").catch(() => null),
          api.get("/attendance/my").catch(() => null),
        ]);

        if (isMounted) {
          // Payroll for current user
          if (payrollRes?.data?.staff) {
            const myPayroll = payrollRes.data.staff.find(
              (s) =>
                String(s._id) === String(user._id || user.id) ||
                (user.email && s.email?.toLowerCase() === user.email?.toLowerCase()) ||
                (user.employeeId && s.employeeId === user.employeeId)
            );
            if (myPayroll) setPayrollData(myPayroll);
          }

          // Leaves for current user
          if (leavesRes?.data?.leaves) {
            const myLeaves = leavesRes.data.leaves;
            const approved = myLeaves.filter((l) => l.status === "approved").length;
            const pending = myLeaves.filter((l) => l.status === "pending").length;
            setLeaveStats({ approved, pending, total: myLeaves.length });
          }

          // Attendance for current user
          if (attRes?.data?.summary) {
            const s = attRes.data.summary;
            setAttStats({
              present: s.presentDays ?? s.present ?? 0,
              total: s.totalDays ?? s.standardWorkingDays ?? 0,
              percentage: s.attendanceRate ?? s.percentage ?? "N/A",
            });
          }
        }
      } catch (err) {
        console.warn("Staff dashboard metrics warning:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPersonalSummary();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const roleLabel = (user.designation || user.role || "Staff Member")
    .replace(/-/g, " ")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* 1. Quick Personal KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div
          onClick={() => navigate("/attendance")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:border-indigo-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              My Attendance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {attStats.total > 0 ? `${attStats.present} / ${attStats.total}` : "N/A"}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> {attStats.percentage !== "N/A" ? `${attStats.percentage}% Attendance Rate` : "N/A"}
          </p>
        </div>

        {/* Leaves */}
        <div
          onClick={() => navigate("/leave")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:border-orange-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Leave Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Palmtree size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {leaveStats.approved} Approved
          </h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
            {leaveStats.pending > 0
              ? `⏳ ${leaveStats.pending} Pending Review`
              : "✓ All requests reviewed"}
          </p>
        </div>

        {/* Monthly Net Salary */}
        <div
          onClick={() => navigate("/payroll")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Net Salary
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(
              payrollData?.salaryStructure?.adjustedNetPay ||
                payrollData?.salaryStructure?.netPay ||
                user.salary ||
                0
            )}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            Status:{" "}
            <span
              className={`font-black ${
                payrollData?.paymentStatus === "Paid"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {payrollData?.paymentStatus || "Active"}
            </span>
          </p>
        </div>

        {/* Profile Status */}
        <div
          onClick={() => navigate("/profile")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:border-purple-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Employee Profile
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 truncate">
            {user.name || "Employee"}
          </h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
            {user.employeeId ? `ID: ${user.employeeId}` : roleLabel}
          </p>
        </div>
      </div>

      {/* 2. Quick Navigation Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance & Leave Hub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck size={18} className="text-indigo-500" />
              Attendance & Leave Ledger
            </h4>
            <button
              onClick={() => navigate("/attendance")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Roster <ArrowRight size={12} />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review your presence record, recorded punch logs, and submit leave requests. Approved leaves automatically sync with institutional rosters.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => navigate("/attendance")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              Check My Attendance
            </button>
            <button
              onClick={() => navigate("/leave")}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              Apply for Leave
            </button>
          </div>
        </div>

        {/* Salary & Payslip Hub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase size={18} className="text-emerald-500" />
              Compensation & Payslips
            </h4>
            <button
              onClick={() => navigate("/payroll")}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              My Payroll <ArrowRight size={12} />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your sequential salary timeline, monthly earnings breakdown (Basic, HRA, DA, Allowances), deductions, and official printable payslips.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => navigate("/payroll")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText size={13} /> View My Salary Ledger & Payslips
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

