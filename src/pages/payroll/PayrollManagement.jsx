import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  ArrowUpRight,
  Wallet,
  Settings,
  Layers,
  AlertTriangle,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  Eye,
  User,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Loader from "../../components/ui/Loader.jsx";
import api from "../../services/api.js";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";

// Modular Subcomponents
import BudgetHealthWidget from "./components/BudgetHealthWidget.jsx";
import AssignSalaryModal from "./components/AssignSalaryModal.jsx";
import DisburseSalaryModal from "./components/DisburseSalaryModal.jsx";
import PayslipModal from "./components/PayslipModal.jsx";
import MyPayrollView from "./components/MyPayrollView.jsx";
import BatchDisburseModal from "./components/BatchDisburseModal.jsx";
import {
  formatCurrency,
  MONTH_NAMES as MONTH_OPTIONS,
  YEAR_OPTIONS,
  isStaffSalarySetup,
} from "./payrollUtils.js";

const PayrollManagement = () => {
  const navigate = useNavigate();
  const currentD = new Date();

  // Role-based Access Control
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser ||
    getUserFromStorage() || { role: "super-admin" };
  const userRole = getUserRole(currentUser);

  // Administrative / Finance management privileges
  const canManagePayroll = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    "admin",
    "superadmin",
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
    ROLES.ACCOUNTANT,
  ].includes(userRole);

  const canReviseBudget = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    "admin",
    "superadmin",
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
  ].includes(userRole);

  const [adminViewMode, setAdminViewMode] = useState("campus");
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_OPTIONS[currentD.getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(currentD.getFullYear());

  const [staffList, setStaffList] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Bulk selection
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Active Modals
  const [assignModalStaff, setAssignModalStaff] = useState(null);
  const [disburseModalStaff, setDisburseModalStaff] = useState(null);
  const [payslipModalStaff, setPayslipModalStaff] = useState(null);

  const fullMonthString = `${selectedMonth} ${selectedYear}`;

  // Fetch staff records (strictly excludes admin)
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll/staff", {
        params: {
          month: fullMonthString,
          year: selectedYear,
          search: searchQuery,
          role: roleFilter,
        },
      });
      if (res.data?.success) {
        const staffData =
          res.data.data?.staff ||
          res.data.staff ||
          (Array.isArray(res.data.data) ? res.data.data : []);
        setStaffList(staffData);
        setSelectedStaffIds([]); // Reset selection on data change
      }
    } catch (err) {
      console.error("Failed to load payroll staff:", err);
      toast.error("Unable to fetch staff payroll list");
    } finally {
      setLoading(false);
    }
  }, [fullMonthString, selectedYear, searchQuery, roleFilter]);

  // Fetch session budget & payroll health summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/payroll/summary", {
        params: {
          month: fullMonthString,
          year: selectedYear,
        },
      });
      if (res.data?.success) {
        setPayrollSummary(res.data.data?.summary || res.data.summary || null);
      }
    } catch (err) {
      console.error("Failed to load payroll summary:", err);
    }
  }, [fullMonthString, selectedYear]);

  useEffect(() => {
    if (canManagePayroll) {
      fetchStaffData();
      fetchSummary();
    }
  }, [canManagePayroll, fetchStaffData, fetchSummary]);

  // Filter staff by status locally for instantaneous filtering
  const filteredStaff = useMemo(() => {
    if (!statusFilter) return staffList;
    return staffList.filter(
      (s) => (s.paymentStatus || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [staffList, statusFilter]);

  // Compute monthly totals
  const stats = useMemo(() => {
    const totalStaff = staffList.length;
    const paidStaff = staffList.filter(
      (s) => s.paymentStatus === "Paid"
    ).length;
    const pendingStaff = totalStaff - paidStaff;

    const monthlyDisbursed = staffList
      .filter((s) => s.paymentStatus === "Paid")
      .reduce(
        (sum, s) =>
          sum +
          (s.disbursementDetails?.netPay ||
            s.salaryStructure?.adjustedNetPay ||
            s.salaryStructure?.netPay ||
            0),
        0
      );

    const monthlyPending = staffList
      .filter((s) => s.paymentStatus !== "Paid")
      .reduce(
        (sum, s) =>
          sum +
          (s.salaryStructure?.adjustedNetPay || s.salaryStructure?.netPay || 0),
        0
      );

    return {
      totalStaff,
      paidStaff,
      pendingStaff,
      monthlyDisbursed,
      monthlyPending,
    };
  }, [staffList]);

  // Bulk selection handlers (Only pending staff with configured salaries are selectable)
  const selectablePendingStaff = useMemo(() => {
    return filteredStaff.filter(
      (s) => s.paymentStatus !== "Paid" && isStaffSalarySetup(s)
    );
  }, [filteredStaff]);

  const handleSelectAllPending = () => {
    if (selectablePendingStaff.length === 0) {
      toast.info(
        "No pending staff with configured salary found. Please set pay first."
      );
      return;
    }
    if (
      selectedStaffIds.length === selectablePendingStaff.length &&
      selectablePendingStaff.length > 0
    ) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(selectablePendingStaff.map((s) => s._id));
    }
  };

  const handleToggleSelectStaff = (staff) => {
    if (!isStaffSalarySetup(staff)) {
      toast.warning(
        `Please configure salary for ${staff.name} before selecting for payment.`
      );
      return;
    }
    const id = staff._id;
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedStaffObjects = useMemo(
    () => staffList.filter((s) => selectedStaffIds.includes(s._id)),
    [staffList, selectedStaffIds]
  );

  // Batch Disburse Process
  const handleBatchDisburse = () => {
    if (selectedStaffIds.length === 0) {
      toast.info("Please select at least one pending staff member");
      return;
    }
    setShowBatchModal(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (staffList.length === 0) {
      toast.info("No staff records to export");
      return;
    }
    const headers = [
      "Employee ID",
      "Name",
      "Role",
      "Department",
      "Working Days",
      "Present Days",
      "Paid Leaves",
      "LOP Days",
      "Basic Pay",
      "Gross Pay",
      "LOP Deduction",
      "Net Salary",
      "Payment Status",
    ];
    const rows = staffList.map((s) => {
      const att = s.attendanceMetrics || {};
      const struct = s.salaryStructure || {};
      return [
        s.employeeId,
        `"${s.name}"`,
        s.role,
        s.department,
        att.standardWorkingDays,
        att.presentDays,
        att.paidLeaveDays || 0,
        att.lopDays || 0,
        struct.basicPay || 0,
        struct.grossPay || 0,
        att.lopDeduction || 0,
        struct.adjustedNetPay || struct.netPay || 0,
        s.paymentStatus,
      ];
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `RGES_Payroll_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If regular user (non-admin/non-manager), strictly and exclusively show their dedicated personal payroll view
  if (!canManagePayroll) {
    return <MyPayrollView currentUser={currentUser} />;
  }

  // If administrator toggled to inspect their own personal payroll profile
  if (adminViewMode === "my-payroll") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-950 dark:text-orange-200">
              Personal Payroll & Compensation Portal (Administrator Mode)
            </span>
          </div>
          <button
            onClick={() => setAdminViewMode("campus")}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition cursor-pointer shadow-xs"
          >
            ← Back to Campus Payroll Hub
          </button>
        </div>
        <MyPayrollView currentUser={currentUser} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <PageHeader
        title="Payroll & Staff Compensation"
        subtitle="Staff monthly salary disbursement, salary structure setup, live attendance & leave deductions, and session budget enforcement."
        breadcrumbs={[{ label: "Finance" }, { label: "Payroll" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar size={14} className="text-indigo-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {MONTH_OPTIONS.map((m) => (
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

            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleExportCSV}
              className="shrink-0"
            >
              Export Summary
            </Button>

            <button
              onClick={() => setAdminViewMode("my-payroll")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs shrink-0"
              title="View My Own Salary & Payslip"
            >
              <User size={14} className="text-orange-500" />
              <span>My Salary</span>
            </button>

            <button
              onClick={() => {
                fetchStaffData();
                fetchSummary();
              }}
              title="Refresh Records"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      {/* Top Session Budget Health Meter Widget */}
      <BudgetHealthWidget
        summary={payrollSummary}
        canReviseBudget={canReviseBudget}
        onRefresh={() => {
          fetchStaffData();
          fetchSummary();
        }}
      />

      {/* Monthly Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Payroll Billing Cycle
          </p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Calendar size={18} className="text-indigo-500" /> {fullMonthString}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.paidStaff} of {stats.totalStaff} staff released
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Disbursed This Month
          </p>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
            <DollarSign size={18} /> {formatCurrency(stats.monthlyDisbursed)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Transferred & documented
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Disbursement
          </p>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
            <Clock size={18} /> {formatCurrency(stats.monthlyPending)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.pendingStaff} staff awaiting release
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Eligible Staff Directory
          </p>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-1">
            <UserCheck size={18} /> {stats.totalStaff} Staff
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Faculty & Non-Teaching (Admin excluded)
          </p>
        </div>
      </div>

      {/* Staff Table & Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-3">
        {/* Filter controls & Batch actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Staff Salary Directory & Attendance Ledgers
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {filteredStaff.length} Employees
              </span>
            </div>

            {/* Batch Action Button (Only for Admins/Accountants) */}
            {canManagePayroll && selectedStaffIds.length > 0 && (
              <button
                onClick={handleBatchDisburse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Disburse Selected ({selectedStaffIds.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="teacher">Teacher</option>
                <option value="head-teacher">Head Teacher</option>
                <option value="hod">HOD</option>
                <option value="coordinator">Coordinator</option>
                <option value="principal">Principal</option>
                <option value="accountant">Accountant</option>
                <option value="librarian">Librarian</option>
                <option value="peon">Peon / Support</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View (md and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                {canManagePayroll && (
                  <th className="p-3.5 w-10 text-center">
                    <button
                      onClick={handleSelectAllPending}
                      title={
                        selectablePendingStaff.length === 0
                          ? "No pending staff with salary configured"
                          : selectedStaffIds.length === selectablePendingStaff.length
                          ? "Deselect all"
                          : `Select all eligible pending staff (${selectablePendingStaff.length})`
                      }
                      className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {selectedStaffIds.length > 0 &&
                      selectedStaffIds.length === selectablePendingStaff.length ? (
                        <CheckSquare size={16} className="text-orange-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-3.5">Emp ID</th>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Role / Dept</th>
                <th className="p-3.5 text-center">
                  Attendance & Leaves ({selectedMonth})
                </th>
                <th className="p-3.5 text-right">Gross Pay</th>
                <th className="p-3.5 text-right">LOP Deduction</th>
                <th className="p-3.5 text-right">Net Payable</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td
                    colSpan={canManagePayroll ? 10 : 9}
                    className="p-12 text-center"
                  >
                    <Loader
                      fullPage
                      size="md"
                      text="Loading staff payroll directory..."
                    />
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManagePayroll ? 10 : 9}
                    className="p-8 text-center text-slate-400"
                  >
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const struct = staff.salaryStructure || {};
                  const att = staff.attendanceMetrics || {};
                  const isPaid = staff.paymentStatus === "Paid";
                  const isSelected = selectedStaffIds.includes(staff._id);
                  const hasSalary = isStaffSalarySetup(staff);

                  const lopDeduction = att.lopDeduction || 0;
                  const finalNet = struct.adjustedNetPay ?? struct.netPay ?? 0;

                  return (
                    <tr
                      key={staff._id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition ${
                        isSelected
                          ? "bg-orange-50/40 dark:bg-orange-950/20"
                          : ""
                      }`}
                    >
                      {/* Checkbox (Only for Admins/Accountants) */}
                      {canManagePayroll && (
                        <td className="p-3.5 text-center">
                          {isPaid ? (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500 mx-auto"
                              title="Already Paid"
                            />
                          ) : hasSalary ? (
                            <button
                              onClick={() => handleToggleSelectStaff(staff)}
                              className="cursor-pointer text-slate-400 hover:text-orange-500 transition"
                              title={isSelected ? "Deselect staff" : "Select staff to pay"}
                            >
                              {isSelected ? (
                                <CheckSquare
                                  size={16}
                                  className="text-orange-500"
                                />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssignModalStaff(staff)}
                              className="inline-flex items-center justify-center cursor-pointer group"
                              title="Salary not set up yet. Click to Set Pay and enable selection."
                            >
                              <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                                <HelpCircle size={12} />
                              </div>
                            </button>
                          )}
                        </td>
                      )}

                      <td className="p-3.5 text-slate-400 font-mono text-[11px] font-bold">
                        <button
                          onClick={() => navigate(`/payroll/${staff._id}`)}
                          className="hover:text-orange-500 hover:underline cursor-pointer transition text-left"
                          title="Open Staff Payroll Profile"
                        >
                          {staff.employeeId}
                        </button>
                      </td>

                      {/* Staff Member Avatar & Name (Clickable to Details Page) */}
                      <td className="p-3.5">
                        <div
                          onClick={() => navigate(`/payroll/${staff._id}`)}
                          className="flex items-center gap-2.5 cursor-pointer group w-max"
                          title="Click to view full salary chain and records"
                        >
                          {staff.avatar ? (
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-7 h-7 rounded-full object-cover group-hover:ring-2 group-hover:ring-orange-500 transition"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition">
                              {staff.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-orange-500 transition">
                              {staff.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {staff.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block w-max">
                          {staff.designation || staff.role}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {staff.department}
                        </span>
                      </td>

                      {/* Attendance & Leaves Column */}
                      <td className="p-3.5">
                        <div className="flex flex-col items-center gap-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              {att.presentDays ?? 0}/
                              {att.standardWorkingDays ?? 25} Pres.
                            </span>
                            {att.paidLeaveDays > 0 && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                • {att.paidLeaveDays} Paid Lv
                              </span>
                            )}
                          </div>
                          {att.lopDays > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                              {att.lopDays} LOP Days (-
                              {formatCurrency(lopDeduction)})
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              ✓ 0 LOP Deductions
                            </span>
                          )}
                          {att.pendingLeavesCount > 0 && (
                            <span
                              className="text-[9px] text-amber-600 font-bold"
                              title="Pending Leave Requests"
                            >
                              ⚠️ {att.pendingLeavesCount} Pending Leave
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Gross Pay */}
                      <td className="p-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {hasSalary ? (
                          formatCurrency(
                            struct.grossPay || struct.basicPay || 0
                          )
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-slate-400">
                            <span>₹0</span>
                            <button
                              type="button"
                              onClick={() => setAssignModalStaff(staff)}
                              className="text-amber-500 hover:text-amber-400 cursor-pointer"
                              title="Salary structure not configured yet. Click to set pay."
                            >
                              <HelpCircle size={12} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* LOP Deduction */}
                      <td className="p-3.5 text-right font-extrabold text-rose-500">
                        {lopDeduction > 0
                          ? `-${formatCurrency(lopDeduction)}`
                          : "₹0"}
                      </td>

                      {/* Net Payable */}
                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                        {hasSalary ? (
                          formatCurrency(finalNet)
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500 font-bold">₹0</span>
                            <button
                              type="button"
                              onClick={() => setAssignModalStaff(staff)}
                              className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 inline-flex items-center gap-0.5 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                              title="Salary not set up yet. Click to configure salary."
                            >
                              <HelpCircle size={10} /> Not Set
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {staff.paymentStatus}
                          </span>
                        ) : hasSalary ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            {staff.paymentStatus}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignModalStaff(staff)}
                            className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 hover:bg-amber-500/30 transition cursor-pointer"
                            title="Salary structure not configured yet. Click to set pay."
                          >
                            <HelpCircle size={11} className="text-amber-500" />
                            Not Set Up
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details Page */}
                          <button
                            onClick={() => navigate(`/payroll/${staff._id}`)}
                            title="View Staff Payroll Ledger & Salary Chain"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>

                          {/* When salary is NOT setup: Show "Set Pay" first with ? icon */}
                          {!isPaid && !hasSalary ? (
                            canManagePayroll && (
                              <button
                                onClick={() => setAssignModalStaff(staff)}
                                title="Salary not configured. Click to set pay first."
                                className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <HelpCircle size={12} /> Set Pay
                              </button>
                            )
                          ) : (
                            <>
                              {/* Structure (Only for Admins/Accountants) */}
                              {canManagePayroll && (
                                <button
                                  onClick={() => setAssignModalStaff(staff)}
                                  title="Configure Salary Structure"
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                >
                                  Structure
                                </button>
                              )}

                              {/* Pay Now or Payslip */}
                              {!isPaid ? (
                                canManagePayroll ? (
                                  <button
                                    onClick={() => setDisburseModalStaff(staff)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                                  >
                                    Pay Now
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                                    Pending
                                  </span>
                                )
                              ) : (
                                <button
                                  onClick={() => setPayslipModalStaff(staff)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer flex items-center gap-1"
                                >
                                  <FileText size={12} /> Payslip
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View (Phones & Small Tablets) */}
        <div className="block md:hidden">
          {/* Mobile Select All Header */}
          {canManagePayroll && selectablePendingStaff.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleSelectAllPending}
                className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {selectedStaffIds.length > 0 &&
                selectedStaffIds.length === selectablePendingStaff.length ? (
                  <CheckSquare size={16} className="text-orange-500" />
                ) : (
                  <Square size={16} />
                )}
                <span>Select All Pending ({selectablePendingStaff.length})</span>
              </button>
              {selectedStaffIds.length > 0 && (
                <span className="text-[11px] font-black text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  {selectedStaffIds.length} Selected
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <Loader fullPage size="md" text="Loading staff records..." />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No staff records found matching your filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-3">
              {filteredStaff.map((staff) => {
                const struct = staff.salaryStructure || {};
                const att = staff.attendanceMetrics || {};
                const isPaid = staff.paymentStatus === "Paid";
                const isSelected = selectedStaffIds.includes(staff._id);
                const hasSalary = isStaffSalarySetup(staff);
                const lopDeduction = att.lopDeduction || 0;
                const finalNet = struct.adjustedNetPay ?? struct.netPay ?? 0;

                return (
                  <div
                    key={staff._id}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      isSelected
                        ? "bg-orange-50/40 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900/60 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Header: Checkbox + Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {canManagePayroll && (
                          <div className="shrink-0">
                            {isPaid ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
                            ) : hasSalary ? (
                              <button
                                type="button"
                                onClick={() => handleToggleSelectStaff(staff)}
                                className="cursor-pointer text-slate-400 hover:text-orange-500 transition"
                              >
                                {isSelected ? (
                                  <CheckSquare
                                    size={16}
                                    className="text-orange-500"
                                  />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAssignModalStaff(staff)}
                                className="inline-flex items-center justify-center cursor-pointer group"
                                title="Salary not set up yet. Click to Set Pay."
                              >
                                <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500">
                                  <HelpCircle size={12} />
                                </div>
                              </button>
                            )}
                          </div>
                        )}

                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/payroll/${staff._id}`)}
                            className="font-extrabold text-sm text-slate-900 dark:text-white truncate block text-left hover:text-orange-500"
                          >
                            {staff.name}
                          </button>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span>{staff.employeeId}</span>
                            <span>•</span>
                            <span className="uppercase text-slate-500 font-sans font-bold">
                              {staff.designation || staff.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Paid
                          </span>
                        ) : hasSalary ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Pending
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAssignModalStaff(staff)}
                            className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle size={10} className="text-amber-500" />
                            Not Set Up
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Financial Snapshot Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Gross Pay
                        </span>
                        {hasSalary ? (
                          <strong className="text-slate-800 dark:text-slate-200 text-xs">
                            {formatCurrency(
                              struct.grossPay || struct.basicPay || 0
                            )}
                          </strong>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">
                            ₹0
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          LOP Cut
                        </span>
                        <strong className="text-rose-500 text-xs">
                          {lopDeduction > 0
                            ? `-${formatCurrency(lopDeduction)}`
                            : "₹0"}
                        </strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Net Pay
                        </span>
                        {hasSalary ? (
                          <strong className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                            {formatCurrency(finalNet)}
                          </strong>
                        ) : (
                          <span className="text-amber-500 font-bold text-[10px] inline-flex items-center gap-0.5">
                            <HelpCircle size={9} /> Not Set
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attendance snippet */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {att.presentDays ?? 0}/
                          {att.standardWorkingDays ?? 25} Pres.
                        </span>
                        {att.paidLeaveDays > 0 && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            • {att.paidLeaveDays} Paid Lv
                          </span>
                        )}
                      </div>
                      {att.lopDays > 0 ? (
                        <span className="text-[10px] font-bold text-rose-600">
                          {att.lopDays} LOP Days
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ 0 LOP
                        </span>
                      )}
                    </div>

                    {/* Actions Toolbar on Mobile */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/${staff._id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:text-orange-500 transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Profile</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {!isPaid && !hasSalary ? (
                          canManagePayroll && (
                            <button
                              type="button"
                              onClick={() => setAssignModalStaff(staff)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition cursor-pointer"
                            >
                              <HelpCircle size={13} />
                              <span>Set Pay</span>
                            </button>
                          )
                        ) : (
                          <>
                            {canManagePayroll && (
                              <button
                                type="button"
                                onClick={() => setAssignModalStaff(staff)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                Structure
                              </button>
                            )}

                            {!isPaid ? (
                              canManagePayroll ? (
                                <button
                                  type="button"
                                  onClick={() => setDisburseModalStaff(staff)}
                                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
                                >
                                  Pay Now
                                </button>
                              ) : null
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPayslipModalStaff(staff)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer"
                              >
                                <FileText size={12} />
                                <span>Payslip</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assign Salary Structure Modal */}
      {assignModalStaff && (
        <AssignSalaryModal
          isOpen={!!assignModalStaff}
          onClose={() => setAssignModalStaff(null)}
          staff={assignModalStaff}
          onSalaryAssigned={() => {
            fetchStaffData();
            fetchSummary();
          }}
        />
      )}

      {/* Disburse Salary Modal (with Attendance & Budget Guard) */}
      {disburseModalStaff && (
        <DisburseSalaryModal
          isOpen={!!disburseModalStaff}
          onClose={() => setDisburseModalStaff(null)}
          staff={disburseModalStaff}
          month={selectedMonth}
          year={selectedYear}
          sessionId={payrollSummary?.sessionId}
          sessionName={payrollSummary?.sessionName}
          onDisbursementSuccess={() => {
            fetchStaffData();
            fetchSummary();
          }}
        />
      )}

      {/* Printable Payslip Modal (includes Attendance Breakdown) */}
      {payslipModalStaff && (
        <PayslipModal
          isOpen={!!payslipModalStaff}
          onClose={() => setPayslipModalStaff(null)}
          staff={payslipModalStaff}
          month={selectedMonth}
          year={selectedYear}
        />
      )}

      {/* Batch Salary Disbursement Modal */}
      {showBatchModal && (
        <BatchDisburseModal
          open={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          selectedStaff={selectedStaffObjects}
          summary={payrollSummary}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
          onSuccess={() => {
            setSelectedStaffIds([]);
            fetchStaffData();
            fetchSummary();
          }}
        />
      )}
      {/* Mobile Sticky Floating Batch Action Bar */}
      {canManagePayroll && selectedStaffIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-30">
          <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                {selectedStaffIds.length} Staff Selected
              </span>
              <span className="text-sm font-black text-emerald-400">
                Ready for Batch Payout
              </span>
            </div>
            <button
              onClick={handleBatchDisburse}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition cursor-pointer shrink-0"
            >
              <CheckCircle2 size={15} />
              <span>Disburse Batch</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PayrollManagement;
