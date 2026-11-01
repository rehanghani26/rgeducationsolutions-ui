import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Search,
  Filter,
  Plus,
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
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import api from '../../services/api.js';
import { getUserFromStorage, getUserRole } from '../../config/access.jsx';
import { ROLES } from '../../constants/roles.js';

// Modular Subcomponents
import BudgetHealthWidget from './components/BudgetHealthWidget.jsx';
import AssignSalaryModal from './components/AssignSalaryModal.jsx';
import DisburseSalaryModal from './components/DisburseSalaryModal.jsx';
import PayslipModal from './components/PayslipModal.jsx';
import MyPayrollView from './components/MyPayrollView.jsx';

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
};

const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollManagement = () => {
  const navigate = useNavigate();
  const currentD = new Date();

  // Role-based Access Control
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser || getUserFromStorage() || { role: 'super-admin' };
  const userRole = getUserRole(currentUser);

  // Administrative / Finance management privileges
  const canManagePayroll = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    'admin',
    'superadmin',
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
    ROLES.ACCOUNTANT,
  ].includes(userRole);

  const canReviseBudget = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    'admin',
    'superadmin',
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
  ].includes(userRole);

  const [adminViewMode, setAdminViewMode] = useState('campus');
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_OPTIONS[currentD.getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(currentD.getFullYear());

  const [staffList, setStaffList] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Bulk selection
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Active Modals
  const [assignModalStaff, setAssignModalStaff] = useState(null);
  const [disburseModalStaff, setDisburseModalStaff] = useState(null);
  const [payslipModalStaff, setPayslipModalStaff] = useState(null);

  const fullMonthString = `${selectedMonth} ${selectedYear}`;

  // Fetch staff records (strictly excludes admin)
  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/staff', {
        params: {
          month: fullMonthString,
          year: selectedYear,
          search: searchQuery,
          role: roleFilter,
        },
      });
      if (res.data?.success) {
        setStaffList(res.data.staff || []);
        setSelectedStaffIds([]); // Reset selection on data change
      }
    } catch (err) {
      console.error('Failed to load payroll staff:', err);
      toast.error('Unable to fetch staff payroll list');
    } finally {
      setLoading(false);
    }
  }, [fullMonthString, selectedYear, searchQuery, roleFilter]);

  // Fetch session budget & payroll health summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/payroll/summary', {
        params: {
          month: fullMonthString,
          year: selectedYear,
        },
      });
      if (res.data?.success) {
        setPayrollSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load payroll summary:', err);
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
    return staffList.filter((s) => s.paymentStatus.toLowerCase() === statusFilter.toLowerCase());
  }, [staffList, statusFilter]);

  // Compute monthly totals
  const stats = useMemo(() => {
    const totalStaff = staffList.length;
    const paidStaff = staffList.filter((s) => s.paymentStatus === 'Paid').length;
    const pendingStaff = totalStaff - paidStaff;

    const monthlyDisbursed = staffList
      .filter((s) => s.paymentStatus === 'Paid')
      .reduce((sum, s) => sum + (s.disbursementDetails?.netPay || s.salaryStructure?.adjustedNetPay || s.salaryStructure?.netPay || 0), 0);

    const monthlyPending = staffList
      .filter((s) => s.paymentStatus !== 'Paid')
      .reduce((sum, s) => sum + (s.salaryStructure?.adjustedNetPay || s.salaryStructure?.netPay || 0), 0);

    return { totalStaff, paidStaff, pendingStaff, monthlyDisbursed, monthlyPending };
  }, [staffList]);

  // Bulk selection handlers
  const pendingStaffList = useMemo(() => {
    return filteredStaff.filter((s) => s.paymentStatus !== 'Paid');
  }, [filteredStaff]);

  const handleSelectAllPending = () => {
    if (selectedStaffIds.length === pendingStaffList.length && pendingStaffList.length > 0) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(pendingStaffList.map((s) => s._id));
    }
  };

  const handleToggleSelectStaff = (id) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch Disburse Process
  const handleBatchDisburse = async () => {
    if (selectedStaffIds.length === 0) {
      toast.info('Please select at least one pending staff member');
      return;
    }

    // Calculate total batch cost
    const selectedStaffObjects = staffList.filter((s) => selectedStaffIds.includes(s._id));
    const totalBatchCost = selectedStaffObjects.reduce(
      (sum, s) => sum + (s.salaryStructure?.adjustedNetPay || s.salaryStructure?.netPay || 0),
      0
    );

    const remainingBudget = payrollSummary?.salaryRemaining ?? 0;

    if (totalBatchCost > remainingBudget) {
      toast.error(
        `Batch total (${formatCurrency(totalBatchCost)}) exceeds remaining Salary Budget (${formatCurrency(remainingBudget)}) by ${formatCurrency(totalBatchCost - remainingBudget)}. Allocate a Revised Budget in Settings first!`
      );
      return;
    }

    if (!window.confirm(`Disburse salary for ${selectedStaffIds.length} staff members (Total: ${formatCurrency(totalBatchCost)})?`)) {
      return;
    }

    setBatchProcessing(true);
    try {
      const res = await api.post('/payroll/disburse-batch', {
        userIds: selectedStaffIds,
        sessionId: payrollSummary?.sessionId,
        month: fullMonthString,
        year: selectedYear,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Batch disbursement completed!');
        setSelectedStaffIds([]);
        fetchStaffData();
        fetchSummary();
      }
    } catch (err) {
      console.error('Batch disburse error:', err);
      toast.error(err.response?.data?.message || 'Failed to complete batch disbursement');
    } finally {
      setBatchProcessing(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (staffList.length === 0) {
      toast.info('No staff records to export');
      return;
    }
    const headers = [
      'Employee ID', 'Name', 'Role', 'Department', 'Working Days', 'Present Days',
      'Paid Leaves', 'LOP Days', 'Basic Pay', 'Gross Pay', 'LOP Deduction', 'Net Salary', 'Payment Status'
    ];
    const rows = staffList.map((s) => {
      const att = s.attendanceMetrics || {};
      const struct = s.salaryStructure || {};
      return [
        s.employeeId,
        `"${s.name}"`,
        s.role,
        s.department,
        att.standardWorkingDays || 26,
        att.presentDays || 26,
        att.paidLeaveDays || 0,
        att.lopDays || 0,
        struct.basicPay || 0,
        struct.grossPay || 0,
        att.lopDeduction || 0,
        struct.adjustedNetPay || struct.netPay || 0,
        s.paymentStatus,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RGES_Payroll_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If regular user (non-admin/non-manager), strictly and exclusively show their dedicated personal payroll view
  if (!canManagePayroll) {
    return <MyPayrollView currentUser={currentUser} />;
  }

  // If administrator toggled to inspect their own personal payroll profile
  if (adminViewMode === 'my-payroll') {
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
            onClick={() => setAdminViewMode('campus')}
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Payroll & Staff Compensation"
        subtitle="Staff monthly salary disbursement, salary structure setup, live attendance & leave deductions, and session budget enforcement."
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payroll' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
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

            <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportCSV}>
              Export Summary
            </Button>

            <button
              onClick={() => setAdminViewMode('my-payroll')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
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
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payroll Billing Cycle</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Calendar size={18} className="text-indigo-500" /> {fullMonthString}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.paidStaff} of {stats.totalStaff} staff released
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Disbursed This Month</p>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
            <DollarSign size={18} /> {formatCurrency(stats.monthlyDisbursed)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Transferred & documented
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Disbursement</p>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
            <Clock size={18} /> {formatCurrency(stats.monthlyPending)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.pendingStaff} staff awaiting release
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligible Staff Directory</p>
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
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              Staff Salary Directory & Attendance Ledgers
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredStaff.length} Employees
            </span>

            {/* Batch Action Button (Only for Admins/Accountants) */}
            {canManagePayroll && selectedStaffIds.length > 0 && (
              <button
                onClick={handleBatchDisburse}
                disabled={batchProcessing}
                className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Disburse Selected ({selectedStaffIds.length})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                {canManagePayroll && (
                  <th className="p-3.5 w-10 text-center">
                    <button
                      onClick={handleSelectAllPending}
                      title="Select all pending"
                      className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {selectedStaffIds.length > 0 && selectedStaffIds.length === pendingStaffList.length ? (
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
                <th className="p-3.5 text-center">Attendance & Leaves ({selectedMonth})</th>
                <th className="p-3.5 text-right">Gross Pay</th>
                <th className="p-3.5 text-right">LOP Deduction</th>
                <th className="p-3.5 text-right">Net Payable</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={canManagePayroll ? 10 : 9} className="p-8 text-center text-slate-400">
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const struct = staff.salaryStructure || {};
                  const att = staff.attendanceMetrics || {};
                  const isPaid = staff.paymentStatus === 'Paid';
                  const isSelected = selectedStaffIds.includes(staff._id);

                  const lopDeduction = att.lopDeduction || 0;
                  const finalNet = struct.adjustedNetPay ?? struct.netPay ?? 0;

                  return (
                    <tr
                      key={staff._id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
                      }`}
                    >
                      {/* Checkbox (Only for Admins/Accountants) */}
                      {canManagePayroll && (
                        <td className="p-3.5 text-center">
                          {!isPaid ? (
                            <button
                              onClick={() => handleToggleSelectStaff(staff._id)}
                              className="cursor-pointer text-slate-400 hover:text-orange-500"
                            >
                              {isSelected ? (
                                <CheckSquare size={16} className="text-orange-500" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          ) : (
                            <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
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
                            <img src={staff.avatar} alt={staff.name} className="w-7 h-7 rounded-full object-cover group-hover:ring-2 group-hover:ring-orange-500 transition" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition">
                              {staff.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block group-hover:text-orange-500 transition">
                              {staff.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{staff.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Dept */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block w-max">
                          {staff.designation || staff.role}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{staff.department}</span>
                      </td>

                      {/* Attendance & Leaves Column */}
                      <td className="p-3.5">
                        <div className="flex flex-col items-center gap-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              {att.presentDays || 26}/{att.standardWorkingDays || 26} Pres.
                            </span>
                            {att.paidLeaveDays > 0 && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                • {att.paidLeaveDays} Paid Lv
                              </span>
                            )}
                          </div>
                          {att.lopDays > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                              {att.lopDays} LOP Days (-{formatCurrency(lopDeduction)})
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              ✓ 0 LOP Deductions
                            </span>
                          )}
                          {att.pendingLeavesCount > 0 && (
                            <span className="text-[9px] text-amber-600 font-bold" title="Pending Leave Requests">
                              ⚠️ {att.pendingLeavesCount} Pending Leave
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Gross Pay */}
                      <td className="p-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(struct.grossPay || struct.basicPay || 0)}
                      </td>

                      {/* LOP Deduction */}
                      <td className="p-3.5 text-right font-extrabold text-rose-500">
                        {lopDeduction > 0 ? `-${formatCurrency(lopDeduction)}` : '₹0'}
                      </td>

                      {/* Net Payable */}
                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(finalNet)}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {staff.paymentStatus}
                        </span>
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
    </motion.div>
  );
};

export default PayrollManagement;
