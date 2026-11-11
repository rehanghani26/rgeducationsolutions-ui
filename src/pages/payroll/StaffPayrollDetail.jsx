import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  Wallet,
  CalendarCheck,
  ChevronRight,
  Layers,
  Activity,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Minus,
  Check,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";
import Button from "../../components/ui/Button.jsx";
import Loader from "../../components/ui/Loader.jsx";

// Subcomponents
import AssignSalaryModal from "./components/AssignSalaryModal.jsx";
import DisburseSalaryModal from "./components/DisburseSalaryModal.jsx";
import PayslipModal from "./components/PayslipModal.jsx";
import {
  formatCurrency,
  MONTH_NAMES,
  formatDate,
  isStaffSalarySetup,
} from "./payrollUtils.js";

const StaffPayrollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Role-based Access Control
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser ||
    getUserFromStorage() || { role: "super-admin" };
  const userRole = getUserRole(currentUser);

  const canManagePayroll = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    "admin",
    "superadmin",
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
    ROLES.ACCOUNTANT,
  ].includes(userRole);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("chain"); // 'chain' | 'ledger' | 'attendance' | 'structure'
  const [chainFilter, setChainFilter] = useState("all"); // 'all' | 'paid' | 'pending'
  const [selectedSessionFilter, setSelectedSessionFilter] = useState("all");

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [disburseModalStaff, setDisburseModalStaff] = useState(null);
  const [disburseTargetMonth, setDisburseTargetMonth] = useState({
    month: "",
    year: 2026,
    attendance: null,
  });
  const [payslipModalData, setPayslipModalData] = useState(null);

  // Fetch full details
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/payroll/staff/${id}/details`);
      if (res.data?.success) {
        setData(res.data.data || res.data);
      } else {
        toast.error("Could not load staff payroll details");
      }
    } catch (err) {
      console.error("Failed to load staff payroll details:", err);
      toast.error(err.response?.data?.message || "Error loading staff details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const currentUserId = String(currentUser?._id || currentUser?.id || "");
    if (!canManagePayroll && currentUserId && String(id) !== currentUserId) {
      toast.warning("You can only view your own payroll profile");
      navigate("/payroll", { replace: true });
      return;
    }
    fetchDetails();
  }, [fetchDetails, canManagePayroll, currentUser, id, navigate]);

  const staff = data?.staff;
  const structure = data?.salaryStructure;
  const metrics = data?.lifetimeMetrics;
  const salaryChain = data?.salaryChain || [];
  const monthWiseLedger = data?.monthWiseLedger || [];
  const sessionSummaries = data?.sessionSummaries || [];
  const staffLeaves = data?.staffLeaves || [];

  const isSalaryConfigured = useMemo(() => {
    return isStaffSalarySetup({
      ...staff,
      salaryStructure: structure,
    });
  }, [staff, structure]);

  // Identify joining month
  const joiningMonthKey = useMemo(() => {
    if (!staff?.joiningDate) return null;
    const jDate = new Date(staff.joiningDate);
    if (isNaN(jDate.getTime())) return null;
    return `${MONTH_NAMES[jDate.getMonth()]} ${jDate.getFullYear()}`;
  }, [staff?.joiningDate]);

  // Counts
  const paidMonthsCount = useMemo(
    () => monthWiseLedger.filter((item) => item.isPaid).length,
    [monthWiseLedger]
  );
  const pendingMonthsCount = useMemo(
    () => monthWiseLedger.filter((item) => !item.isPaid).length,
    [monthWiseLedger]
  );

  // Filtered chain items for Tab 1
  const filteredChain = useMemo(() => {
    if (chainFilter === "paid") {
      return monthWiseLedger.filter((item) => item.isPaid);
    }
    if (chainFilter === "pending") {
      return monthWiseLedger.filter((item) => !item.isPaid);
    }
    return monthWiseLedger;
  }, [monthWiseLedger, chainFilter]);

  // Filtered month-wise ledger for Tab 2 (table matrix)
  const filteredLedger = useMemo(() => {
    if (selectedSessionFilter === "all") return monthWiseLedger;
    return monthWiseLedger.filter((item) => {
      return (
        String(item.year) === selectedSessionFilter ||
        item.disbursement?.sessionId === selectedSessionFilter
      );
    });
  }, [monthWiseLedger, selectedSessionFilter]);

  if (loading) {
    return (
      <div className="py-24">
        <Loader
          fullPage
          size="lg"
          text="Loading comprehensive staff payroll ledger..."
        />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Staff record not found.
        </p>
        <Button
          onClick={() => navigate("/payroll")}
          icon={<ArrowLeft size={14} />}
        >
          Back to Payroll
        </Button>
      </div>
    );
  }

  const grossMonthly =
    (Number(structure?.basicPay) || 0) +
    (Number(structure?.hra) || 0) +
    (Number(structure?.da) || 0) +
    (Number(structure?.specialAllowance) || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-16"
    >
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/payroll")}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition shadow-2xs cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Payroll</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700 select-none">
            /
          </span>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs"
          >
            <Link
              to="/payroll"
              className="text-slate-500 hover:text-orange-500 font-semibold transition"
            >
              Payroll
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="font-extrabold text-slate-900 dark:text-white">
              {staff.name} ({staff.employeeId})
            </span>
          </nav>
        </div>

        <button
          onClick={fetchDetails}
          title="Refresh Data"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Staff Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Info */}
          <div className="flex items-start sm:items-center gap-4">
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {staff.name?.charAt(0) || "U"}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {staff.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                  {staff.employeeId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {staff.designation || staff.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-indigo-500" /> Dept:{" "}
                  {staff.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> {staff.email}
                </span>
                {staff.phone && staff.phone !== "—" && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" />{" "}
                      {staff.phone}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                  <Calendar size={13} className="text-emerald-500" /> Joined:{" "}
                  {staff.joiningDate
                    ? new Date(staff.joiningDate).toLocaleDateString("en-GB")
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Only for Admins/Accountants) */}
          {canManagePayroll && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setAssignModalOpen(true)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs w-full sm:w-auto ${
                  isSalaryConfigured
                    ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black ring-2 ring-amber-400/50"
                }`}
              >
                {isSalaryConfigured ? (
                  <>
                    <CreditCard size={14} /> Update Salary Structure
                  </>
                ) : (
                  <>
                    <HelpCircle size={14} /> Setup Salary Structure First
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 4 Lifetime Summary Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Lifetime Spend (Person-Wise)
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatCurrency(metrics?.totalLifetimePaid)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              All historical payments combined
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Disbursements Completed
            </span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {paidMonthsCount} / {monthWiseLedger.length} Cycles
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {pendingMonthsCount} awaiting disbursement
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Average Monthly Pay
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {formatCurrency(metrics?.averageMonthlyPay)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Historical average net take-home
            </span>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Current Base Structure (Monthly)
            </span>
            {isSalaryConfigured ? (
              <>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1 block">
                  {formatCurrency(structure?.netPay || grossMonthly)}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Gross: {formatCurrency(grossMonthly)}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-400">₹0</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 inline-flex items-center gap-1">
                    <HelpCircle size={11} /> Not Set Up
                  </span>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                  Setup salary structure to enable payment
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Responsive Horizontal Swipe on Mobile) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab("chain")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "chain"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Activity size={15} />
          <span>Month-Wise Salary Chain ({monthWiseLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "ledger"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CalendarCheck size={15} />
          <span>Month-Wise Status Matrix ({monthWiseLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "attendance"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock size={15} />
          <span>Attendance & Leaves History ({staffLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("structure")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "structure"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Wallet size={15} />
          <span>Salary Structure & Allowances</span>
        </button>
      </div>

      {/* Tab 1: Month-Wise Salary Lifecycle Chain (From Joining Date) */}
      {activeTab === "chain" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-orange-500" />
                  Month-Wise Salary Lifecycle Chain (From Joining Date)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronological lifecycle chain from joining date. View Paid
                  status, print payslips, or immediately disburse pending cycles.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setChainFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    chainFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  All ({monthWiseLedger.length})
                </button>
                <button
                  onClick={() => setChainFilter("paid")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    chainFilter === "paid"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Paid ({paidMonthsCount})
                </button>
                <button
                  onClick={() => setChainFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    chainFilter === "pending"
                      ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Pending ({pendingMonthsCount})
                </button>
              </div>
            </div>

            {filteredChain.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <AlertCircle size={24} className="mx-auto text-slate-300" />
                <p>No monthly cycles found matching filter "{chainFilter}".</p>
              </div>
            ) : (
              <div className="relative pl-7 sm:pl-9 space-y-6 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-indigo-500 before:to-emerald-500">
                {filteredChain.map((chainItem, index) => {
                  const isPaid = chainItem.isPaid;
                  const disb = chainItem.disbursement;
                  const att = chainItem.attendance || {};
                  const isJoiningMonth = chainItem.monthKey === joiningMonthKey;

                  return (
                    <div
                      key={chainItem.monthKey || index}
                      className="relative group"
                    >
                      {/* Step circle node */}
                      <div
                        className={`absolute -left-7 sm:-left-9 top-2 w-7 h-7 rounded-full text-white flex items-center justify-center font-black text-xs shadow-md ring-4 ${
                          isPaid
                            ? "bg-emerald-600 ring-emerald-100 dark:ring-emerald-950/80"
                            : "bg-amber-500 ring-amber-100 dark:ring-amber-950/80"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Clock size={15} />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`p-4 rounded-2xl border transition shadow-2xs ${
                          isPaid
                            ? "bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80"
                            : "bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {chainItem.monthKey}
                              </span>

                              {isJoiningMonth && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                  🌟 Joining Month
                                </span>
                              )}

                              {isPaid ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 size={11} /> PAID • Disbursed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                  <Clock size={11} /> NOT PAID • PENDING
                                </span>
                              )}
                            </div>

                            {isPaid && disb ? (
                              <p className="text-[11px] text-slate-500 font-mono">
                                Txn Ref: {disb.transactionReference || "—"} •
                                Channel: {disb.paymentMethod || "Bank Transfer"}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-500">
                                Attendance:{" "}
                                <strong>
                                  {att.presentDays ?? 25}/
                                  {att.standardWorkingDays ?? 25} Days
                                </strong>{" "}
                                •{" "}
                                {att.lopDeduction > 0 ? (
                                  <span className="text-rose-600 font-bold">
                                    LOP: -{formatCurrency(att.lopDeduction)} (
                                    {att.lopDays}d)
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-semibold">
                                    0 LOP Deductions
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span
                                className={`text-base font-black block ${
                                  isPaid
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {formatCurrency(
                                  isPaid
                                    ? disb?.netPay
                                    : chainItem.expectedNet
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {isPaid ? "Net Paid Out" : "Expected Net Pay"}
                              </span>
                            </div>

                            {/* Action Button: Payslip or Pay Now */}
                            {isPaid ? (
                              <button
                                onClick={() => {
                                  setPayslipModalData({
                                    staff: {
                                      ...staff,
                                      disbursementDetails: disb,
                                    },
                                    month: chainItem.monthName,
                                    year: chainItem.year,
                                    disbursementDetails: disb,
                                  });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                                title="View & Print Official Salary Slip"
                              >
                                <FileText size={14} className="text-indigo-500" />
                                <span>Payslip</span>
                              </button>
                            ) : !isSalaryConfigured ? (
                              canManagePayroll ? (
                                <button
                                  onClick={() => setAssignModalOpen(true)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition cursor-pointer"
                                  title="Salary not configured yet. Click to set up pay first."
                                >
                                  <HelpCircle size={14} />
                                  <span>Set Pay First</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md flex items-center gap-1">
                                  <HelpCircle size={11} /> Not Set Up
                                </span>
                              )
                            ) : canManagePayroll ? (
                              <button
                                onClick={() => {
                                  setDisburseTargetMonth({
                                    month: chainItem.monthName,
                                    year: chainItem.year,
                                    attendance: att,
                                  });
                                  setDisburseModalStaff(staff);
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm hover:shadow-md transition cursor-pointer"
                                title={`Disburse salary for ${chainItem.monthKey}`}
                              >
                                <DollarSign size={14} />
                                <span>Pay Now</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Breakdown footer chips */}
                        {isPaid && disb && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                            <span>
                              Basic:{" "}
                              <strong>{formatCurrency(disb.basicPay)}</strong>
                            </span>
                            <span>
                              Allowances:{" "}
                              <strong>
                                +{formatCurrency(disb.allowances)}
                              </strong>
                            </span>
                            {disb.bonus > 0 && (
                              <span className="text-emerald-600 font-bold">
                                Bonus: +{formatCurrency(disb.bonus)}
                              </span>
                            )}
                            <span>
                              Deductions:{" "}
                              <strong className="text-rose-500">
                                -{formatCurrency(disb.deductions)}
                              </strong>
                            </span>
                            {disb.lopDeduction > 0 && (
                              <span className="text-rose-600 font-bold">
                                LOP ({disb.lopDays || 0}d): -
                                {formatCurrency(disb.lopDeduction)}
                              </span>
                            )}
                            {disb.customDeduction > 0 && (
                              <span className="text-rose-600 font-bold">
                                Extra Deduction: -
                                {formatCurrency(disb.customDeduction)}
                              </span>
                            )}
                            {disb.remarks && (
                              <span className="italic text-slate-400">
                                "{disb.remarks}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Month-Wise Status Matrix (Paid vs Not Paid) */}
      {activeTab === "ledger" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck size={18} className="text-orange-500" />
                Month-Wise Status Matrix (From Joining Date)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of every billing month since employee joining date,
                showing exact Paid vs Pending states and Loss of Pay records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                Filter Year:
              </span>
              <select
                value={selectedSessionFilter}
                onChange={(e) => setSelectedSessionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Years</option>
                {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                  <option key={yr} value={String(yr)}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Billing Month</th>
                  <th className="p-3.5 text-center">Attendance (Pres/Work)</th>
                  <th className="p-3.5 text-center">Approved Leaves</th>
                  <th className="p-3.5 text-right">LOP Deduction</th>
                  <th className="p-3.5 text-right">Net Payable</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Disbursement Info / Txn</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredLedger.map((row) => {
                  const isPaid = row.isPaid;
                  const att = row.attendance || {};
                  const disb = row.disbursement;

                  return (
                    <tr
                      key={row.monthKey}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                        {row.monthKey}
                        {row.monthKey === joiningMonthKey && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-600">
                            Joined
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center text-slate-700 dark:text-slate-300">
                        {att.presentDays ?? 25} /{" "}
                        {att.standardWorkingDays ?? 25} Days
                      </td>

                      <td className="p-3.5 text-center">
                        {att.paidLeaveDays > 0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {att.paidLeaveDays} Paid
                          </span>
                        ) : (
                          <span className="text-slate-400">0 Days</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {att.lopDeduction > 0 ? (
                          <span className="text-rose-500 font-bold">
                            -{formatCurrency(att.lopDeduction)} ({att.lopDays}d)
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">
                            ₹0
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(disb ? disb.netPay : row.expectedNet)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {disb ? (
                          <div>
                            <span className="font-mono block text-slate-700 dark:text-slate-300 font-bold">
                              {disb.transactionReference || "Disbursed"}
                            </span>
                            <span className="text-[10px] block">
                              {new Date(disb.disbursedAt).toLocaleDateString(
                                "en-GB"
                              )}{" "}
                              via {disb.paymentMethod}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Not yet disbursed
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <button
                            onClick={() => {
                              setPayslipModalData({
                                staff: {
                                  ...staff,
                                  disbursementDetails: disb,
                                },
                                month: row.monthName,
                                year: row.year,
                                disbursementDetails: disb,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                          >
                            <FileText size={12} /> Payslip
                          </button>
                        ) : canManagePayroll ? (
                          <button
                            onClick={() => {
                              setDisburseTargetMonth({
                                month: row.monthName,
                                year: row.year,
                                attendance: att,
                              });
                              setDisburseModalStaff(staff);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance & Leaves History */}
      {activeTab === "attendance" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Leave Applications & Absence History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Approved and pending leave requests recorded for {staff.name}.
              Approved unpaid leaves are directly deducted as Loss of Pay (LOP)
              during payroll.
            </p>
          </div>

          {staffLeaves.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No leave records found for this staff member.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Duration (Start - End)</th>
                    <th className="p-3.5 text-center">Total Days</th>
                    <th className="p-3.5">Justification Reason</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Reviewer Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {staffLeaves.map((lv) => {
                    const isApproved = lv.status === "approved";
                    const isPending = lv.status === "pending";

                    return (
                      <tr
                        key={lv._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {lv.category || "Casual Leave"}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {lv.startDate} to {lv.endDate}
                        </td>
                        <td className="p-3.5 text-center font-extrabold text-slate-900 dark:text-white">
                          {lv.totalDays} Days
                        </td>
                        <td
                          className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate"
                          title={lv.reason}
                        >
                          {lv.reason}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : isPending
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                  : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {lv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {lv.reviewRemarks || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Salary Structure & Bank Profile */}
      {activeTab === "structure" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings & Deductions Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-orange-500" />
                Monthly Earnings Breakdown
              </h3>
              {canManagePayroll && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  Edit Components
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Basic Pay</span>
                <strong className="text-slate-900 dark:text-white">
                  {formatCurrency(structure?.basicPay)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  House Rent Allowance (HRA)
                </span>
                <strong className="text-slate-900 dark:text-white">
                  +{formatCurrency(structure?.hra)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dearness Allowance (DA)</span>
                <strong className="text-slate-900 dark:text-white">
                  +{formatCurrency(structure?.da)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Special Allowance</span>
                <strong className="text-slate-900 dark:text-white">
                  +{formatCurrency(structure?.specialAllowance)}
                </strong>
              </div>
              <div className="flex justify-between py-2 font-black text-sm text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-700">
                <span>Total Monthly Gross</span>
                <span>{formatCurrency(grossMonthly)}</span>
              </div>
            </div>

            {/* Deductions block */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Monthly Deductions
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Provident Fund (PF)</span>
                <strong className="text-rose-500">
                  -{formatCurrency(structure?.pfDeduction)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">TDS / Professional Tax</span>
                <strong className="text-rose-500">
                  -{formatCurrency(structure?.taxDeduction)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Other Policy Deductions</span>
                <strong className="text-rose-500">
                  -{formatCurrency(structure?.otherDeductions)}
                </strong>
              </div>
              <div className="flex justify-between py-2 font-black text-sm text-rose-500 border-t border-slate-200 dark:border-slate-700">
                <span>Total Policy Deductions</span>
                <span>
                  -
                  {formatCurrency(
                    (Number(structure?.pfDeduction) || 0) +
                      (Number(structure?.taxDeduction) || 0) +
                      (Number(structure?.otherDeductions) || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Banking & Disbursal Channel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-500" />
                  Banking & Account Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official account credentials for automated NEFT/RTGS salary
                  transfers.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Bank Name
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white">
                    {structure?.bankName || "Not Set"}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Account Number
                  </span>
                  <strong className="text-sm font-mono text-slate-900 dark:text-white">
                    {structure?.accountNumber || "Not Set"}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    IFSC Code
                  </span>
                  <strong className="text-sm font-mono uppercase text-slate-900 dark:text-white">
                    {structure?.ifscCode || "Not Set"}
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Payment Mode
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white">
                    {structure?.paymentMode || "Bank Transfer"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Session Summary Breakdown Card */}
            {sessionSummaries.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} className="text-orange-500" />
                  Academic Session Spend Aggregates
                </h3>
                <div className="space-y-2 text-xs">
                  {sessionSummaries.map((sess) => (
                    <div
                      key={sess.sessionId}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {sess.sessionName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sess.disbursementsCount} Monthly cycles paid
                        </span>
                      </div>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sess.totalPaid)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Salary Structure Modal */}
      {assignModalOpen && (
        <AssignSalaryModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          staff={{ ...staff, salaryStructure: structure }}
          onSalaryAssigned={fetchDetails}
        />
      )}

      {/* Disburse Salary Modal */}
      {disburseModalStaff && (
        <DisburseSalaryModal
          isOpen={!!disburseModalStaff}
          onClose={() => setDisburseModalStaff(null)}
          staff={{
            ...staff,
            salaryStructure: structure,
            attendanceMetrics:
              disburseTargetMonth?.attendance || staff.attendanceMetrics,
          }}
          month={disburseTargetMonth.month}
          year={disburseTargetMonth.year}
          onDisbursementSuccess={fetchDetails}
        />
      )}

      {/* Payslip Modal */}
      {payslipModalData && (
        <PayslipModal
          isOpen={!!payslipModalData}
          onClose={() => setPayslipModalData(null)}
          staff={{
            ...payslipModalData.staff,
            disbursementDetails:
              payslipModalData.disbursementDetails ||
              payslipModalData.staff?.disbursementDetails,
          }}
          month={payslipModalData.month}
          year={payslipModalData.year}
        />
      )}
    </motion.div>
  );
};

export default StaffPayrollDetail;
