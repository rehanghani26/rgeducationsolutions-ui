import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Calendar,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Palmtree,
  CalendarCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpRight,
  DollarSign,
  Briefcase,
  User,
  Info,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api.js";
import Button from "../../../components/ui/Button.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import PayslipModal from "./PayslipModal.jsx";
import {
  formatCurrency,
  maskAccountNumber,
  MONTH_NAMES,
  formatDate,
} from "../payrollUtils.js";

const MyPayrollView = ({ currentUser }) => {
  const currentD = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_NAMES[currentD.getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(currentD.getFullYear());

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("breakdown"); // 'breakdown' | 'attendance' | 'bank' | 'history'
  const [payslipModalData, setPayslipModalData] = useState(null);

  const userId = currentUser?._id || currentUser?.id;
  const fullMonthString = `${selectedMonth} ${selectedYear}`;

  const fetchMyPayrollData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/payroll/staff/${userId}/details`);
      if (res.data?.success) {
        setData(res.data.data || res.data);
      }
    } catch (err) {
      console.error("Failed to load personal payroll details:", err);
      toast.error("Unable to fetch your personal payroll records");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyPayrollData();
  }, [fetchMyPayrollData]);

  const staff = data?.staff || currentUser;
  const struct = data?.salaryStructure || {};
  const lifetime = data?.lifetimeMetrics || {};
  const salaryChain = data?.salaryChain || [];
  const monthWiseLedger = data?.monthWiseLedger || [];

  // Match ledger record for currently selected month & year
  const currentMonthLedger = useMemo(() => {
    if (!monthWiseLedger.length) return null;
    return monthWiseLedger.find(
      (m) =>
        m.monthName?.toLowerCase() === selectedMonth.toLowerCase() &&
        Number(m.year) === Number(selectedYear)
    );
  }, [monthWiseLedger, selectedMonth, selectedYear]);

  // Match actual disbursement details if available
  const disbursement = currentMonthLedger?.disbursement;
  const isPaidThisMonth = !!disbursement || currentMonthLedger?.isPaid;

  // Real-time financial numbers
  const basicPay = Number(disbursement?.basicPay ?? struct.basicPay ?? 0);
  const hra = Number(disbursement?.hra ?? struct.hra ?? 0);
  const da = Number(disbursement?.da ?? struct.da ?? 0);
  const specialAllowance = Number(
    disbursement?.specialAllowance ?? struct.specialAllowance ?? 0
  );
  const grossPay = basicPay + hra + da + specialAllowance;

  const pfDeduction = Number(
    disbursement?.pfDeduction ?? struct.pfDeduction ?? 0
  );
  const taxDeduction = Number(
    disbursement?.taxDeduction ?? struct.taxDeduction ?? 0
  );
  const otherDeductions = Number(
    disbursement?.otherDeductions ?? struct.otherDeductions ?? 0
  );
  const statutoryDeductions = pfDeduction + taxDeduction + otherDeductions;

  // Attendance metrics for selected month
  const att = currentMonthLedger?.attendance || disbursement || {};
  const workingDays = att.standardWorkingDays ?? att.workingDays;
  const presentDays = att.presentDays;
  const paidLeaves = att.paidLeaveDays ?? 0;
  const unpaidLeaves = att.unpaidLeaveDays ?? att.lopDays ?? 0;
  const lopDeduction = Number(
    disbursement?.lopDeduction ?? att.lopDeduction ?? 0
  );
  const perDayRate =
    att.perDayRate ??
    (workingDays > 0 ? Math.round((basicPay + da) / workingDays) : 0);

  const totalDeductions = statutoryDeductions + lopDeduction;
  const netTakeHome = Math.max(
    0,
    disbursement?.netPay ?? grossPay - totalDeductions
  );

  // Payslip helper
  const openPayslip = (disbItem = null) => {
    const targetMonth = disbItem?.month || selectedMonth;
    const targetYear = disbItem?.year || selectedYear;
    const targetDisb = disbItem ||
      disbursement || {
        month: targetMonth,
        year: targetYear,
        basicPay,
        hra,
        da,
        specialAllowance,
        allowances: hra + da + specialAllowance,
        statutoryDeductions,
        lopDeduction,
        deductions: totalDeductions,
        netPay: netTakeHome,
        workingDays,
        presentDays,
        paidLeaveDays: paidLeaves,
        lopDays: unpaidLeaves,
        paymentStatus: isPaidThisMonth ? "Paid" : "Pending",
        paymentMethod: struct.paymentMode || "Bank Transfer",
        bankName: struct.bankName,
        accountNumber: struct.accountNumber,
      };

    setPayslipModalData({
      staff: {
        ...staff,
        salaryStructure: struct,
        disbursementDetails: targetDisb,
        attendanceMetrics: {
          standardWorkingDays: workingDays,
          presentDays,
          paidLeaveDays: paidLeaves,
          lopDays: unpaidLeaves,
          lopDeduction,
        },
      },
      month: targetMonth,
      year: targetYear,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="My Salary & Compensation"
        subtitle="View your approved monthly salary structure, attendance-linked deductions, bank transfer status, and official printable payslips."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Payroll", href: "/payroll" },
          { label: "My Compensation" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar size={14} className="text-orange-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m} className="dark:bg-slate-800">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer border-l border-slate-200 dark:border-slate-700 pl-1.5"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="dark:bg-slate-800">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchMyPayrollData}
              title="Refresh Salary Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
          <Loader
            fullPage
            size="lg"
            text="Loading your salary structure & compensation details..."
          />
        </div>
      ) : (
        <>
          {/* Hero Personal Salary Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Subtle Decorative Elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Staff Info */}
              <div className="flex items-center gap-4">
                {staff?.avatar ? (
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center ring-2 ring-orange-400/30 shadow-md">
                    {(staff?.name || "U").charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-white">
                      {staff?.name || "Staff Member"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {staff?.employeeId || "EMP-001"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-2">
                    <span>{staff?.designation || staff?.role || "Staff"}</span>
                    <span>•</span>
                    <span>{staff?.department || "Academics"}</span>
                    {staff?.joiningDate && (
                      <>
                        <span>•</span>
                        <span>
                          Joined{" "}
                          {new Date(staff.joiningDate).toLocaleDateString(
                            "en-IN",
                            { month: "short", year: "numeric" }
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Current Month Net Pay & Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-700/80 shadow-inner w-full lg:w-auto justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {fullMonthString} Net Salary
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPaidThisMonth
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isPaidThisMonth ? "✓ Disbursed" : "⏱️ Pending Release"}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
                    <span className="text-orange-400 text-xl font-bold">₹</span>
                    <span>{netTakeHome.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {isPaidThisMonth
                      ? `Transferred via ${disbursement?.paymentMethod || struct.paymentMode || "Bank Transfer"}`
                      : "Estimated take-home after attendance deductions"}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Printer size={14} />}
                  onClick={() => openPayslip(null)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 border-none shrink-0"
                >
                  {isPaidThisMonth
                    ? "View Official Payslip"
                    : "Preview Salary Slip"}
                </Button>
              </div>
            </div>
          </div>

          {/* 4 Financial Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Earnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gross Monthly Earnings
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(grossPay)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Basic Pay + HRA + DA + Allowances
              </p>
            </div>

            {/* Total Deductions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Monthly Deductions
                </p>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
              </div>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                -{formatCurrency(totalDeductions)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Statutory ({formatCurrency(statutoryDeductions)}) + LOP (
                {formatCurrency(lopDeduction)})
              </p>
            </div>

            {/* Attendance Days */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Attendance In {selectedMonth}
                </p>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarCheck size={16} />
                </div>
              </div>
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {presentDays} / {workingDays} Days
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {unpaidLeaves > 0
                  ? `${unpaidLeaves} LOP Days Cut`
                  : "✓ 100% Full Attendance (0 LOP)"}
              </p>
            </div>

            {/* Lifetime Earnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Lifetime Paid
                </p>
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(lifetime.totalLifetimePaid || 0)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Across {lifetime.totalDisbursementsCount || salaryChain.length}{" "}
                completed monthly payrolls
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
            {[
              {
                id: "breakdown",
                label: "Salary Structure & Breakdown",
                icon: Layers,
              },
              {
                id: "attendance",
                label: "Attendance & Leave Synchronization",
                icon: CalendarCheck,
              },
              { id: "bank", label: "Bank & Payout Profile", icon: CreditCard },
              {
                id: "history",
                label: "Payout History & Past Payslips",
                icon: Clock,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Salary Breakdown (Earnings vs Deductions) */}
          {activeTab === "breakdown" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Column */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Earnings Breakdown
                  </h4>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Gross: {formatCurrency(grossPay)}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Basic Pay (Core Wage)
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(basicPay)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      House Rent Allowance (HRA)
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(hra)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Dearness Allowance (DA)
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(da)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Special / Performance Allowance
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(specialAllowance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span>Total Monthly Gross Pay</span>
                    <span>{formatCurrency(grossPay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Deductions Breakdown
                  </h4>
                  <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    Total: -{formatCurrency(totalDeductions)}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Provident Fund (PF Contribution)
                    </span>
                    <span className="font-extrabold text-rose-500">
                      -{formatCurrency(pfDeduction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Income Tax (TDS Deduction)
                    </span>
                    <span className="font-extrabold text-rose-500">
                      -{formatCurrency(taxDeduction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      Other Scheduled Deductions
                    </span>
                    <span className="font-extrabold text-rose-500">
                      -{formatCurrency(otherDeductions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 dark:text-slate-400 font-bold">
                        Attendance Loss of Pay (LOP)
                      </span>
                      {unpaidLeaves > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                          {unpaidLeaves} Days
                        </span>
                      )}
                    </div>
                    <span className="font-extrabold text-rose-500">
                      {lopDeduction > 0
                        ? `-${formatCurrency(lopDeduction)}`
                        : "₹0 (Zero LOP)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                    <span>Total Monthly Deductions</span>
                    <span>-{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance & Leave Synchronization */}
          {activeTab === "attendance" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarCheck className="text-indigo-600" size={18} />
                    Live Attendance & Salary Impact ({fullMonthString})
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your daily biometric punch and approved leaves directly
                    synchronize with your monthly take-home compensation.
                  </p>
                </div>
                <Link
                  to="/leave"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                >
                  <Palmtree size={14} /> Apply for Leave
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Total Working Days
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {workingDays} Days
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Standard monthly benchmark
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                    Days Present
                  </span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {presentDays} Days
                  </p>
                  <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
                    Recorded biometric check-ins
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-center">
                  <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300">
                    Approved Paid Leaves
                  </span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {paidLeaves} Days
                  </p>
                  <span className="text-[10px] text-indigo-600/80 mt-0.5 block">
                    Full salary protected (0 deduction)
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-center">
                  <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300">
                    Unpaid / LOP Days
                  </span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {unpaidLeaves} Days
                  </p>
                  <span className="text-[10px] text-rose-600/80 mt-0.5 block">
                    {lopDeduction > 0
                      ? `-${formatCurrency(lopDeduction)} deducted`
                      : "No deduction applied"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Info size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Loss of Pay (LOP) Computation Formula:
                  </p>
                  <p>
                    Per-Day Rate = (Basic Pay + DA) / Standard Working Days = (
                    {formatCurrency(basicPay)} + {formatCurrency(da)}) /{" "}
                    {workingDays} ={" "}
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatCurrency(perDayRate)} / day
                    </span>
                  </p>
                  <p>
                    Total LOP Deduction = {unpaidLeaves} LOP Days ×{" "}
                    {formatCurrency(perDayRate)} ={" "}
                    <span className="font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(lopDeduction)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Bank & Payout Profile */}
          {activeTab === "bank" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="text-orange-500" size={18} />
                  Bank Account & Direct Deposit Profile
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Monthly disbursements are routed directly to this verified
                  bank account. Contact administration to update account
                  details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Payment Method
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={16} className="text-orange-500" />
                    {struct.paymentMode || "Direct Bank Transfer"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Bank Name
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {struct.bankName ||
                      "State Bank of India (Designated Campus Bank)"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Account Number
                  </span>
                  <p className="text-sm font-mono font-black text-slate-900 dark:text-white tracking-wider">
                    {maskAccountNumber(struct.accountNumber)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    IFSC / Branch Code
                  </span>
                  <p className="text-sm font-mono font-black text-slate-900 dark:text-white">
                    {struct.ifscCode || "SBIN0001423"}
                  </p>
                </div>
              </div>

              {disbursement?.transactionReference && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                      Latest Transaction Reference ({fullMonthString})
                    </span>
                    <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">
                      {disbursement.transactionReference}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    ✓ Bank Cleared
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Payout History & Past Payslips */}
          {activeTab === "history" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} />
                  Chronological Salary Payout History & Downloadable Payslips
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Access your lifetime salary slips and payment records. Click
                  on any month to view or print the official slip.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Billing Month</th>
                      <th className="p-3.5">Disbursement Date</th>
                      <th className="p-3.5">Working Days</th>
                      <th className="p-3.5 text-right">Gross Pay</th>
                      <th className="p-3.5 text-right">Deductions</th>
                      <th className="p-3.5 text-right">Net Take-Home</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {salaryChain.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-slate-400 font-bold"
                        >
                          No past salary disbursements recorded yet.
                        </td>
                      </tr>
                    ) : (
                      salaryChain.map((item, idx) => (
                        <tr
                          key={item._id || idx}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="p-3.5 font-black text-slate-900 dark:text-white">
                            {item.month} {item.year}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                            {item.formattedDisbursedDate || "Completed"}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 font-bold">
                            {item.presentDays ?? 26} / {item.workingDays ?? 26}{" "}
                            Pres.
                          </td>
                          <td className="p-3.5 text-right text-slate-700 dark:text-slate-300 font-bold">
                            {formatCurrency(
                              item.grossPay ||
                                Number(item.basicPay || 0) +
                                  Number(item.allowances || 0)
                            )}
                          </td>
                          <td className="p-3.5 text-right text-rose-500 font-extrabold">
                            -{formatCurrency(item.deductions || 0)}
                          </td>
                          <td className="p-3.5 text-right font-black text-slate-900 dark:text-white text-sm">
                            {formatCurrency(item.netPay)}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {item.paymentStatus || "Paid"}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => openPayslip(item)}
                              title="View / Print Salary Slip"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-300 font-extrabold text-[11px] transition cursor-pointer border border-orange-200 dark:border-orange-800"
                            >
                              <Printer size={12} /> Slip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Printable Payslip Modal */}
      {payslipModalData && (
        <PayslipModal
          isOpen={!!payslipModalData}
          onClose={() => setPayslipModalData(null)}
          staff={payslipModalData.staff}
          month={payslipModalData.month}
          year={payslipModalData.year}
        />
      )}
    </motion.div>
  );
};

export default MyPayrollView;
