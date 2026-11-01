import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  Wallet,
  CalendarCheck,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Check,
  Activity,
  History,
  Briefcase,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api.js';
import { useSelector } from 'react-redux';
import { getUserFromStorage, getUserRole } from '../../config/access.jsx';
import { ROLES } from '../../constants/roles.js';
import Button from '../../components/ui/Button.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

// Subcomponents
import AssignSalaryModal from './components/AssignSalaryModal.jsx';
import DisburseSalaryModal from './components/DisburseSalaryModal.jsx';
import PayslipModal from './components/PayslipModal.jsx';

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
};

const StaffPayrollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Role-based Access Control
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser || getUserFromStorage() || { role: 'super-admin' };
  const userRole = getUserRole(currentUser);

  const canManagePayroll = [
    ROLES.SUPER_ADMIN,
    ROLES.SCHOOL_ADMIN,
    'admin',
    'superadmin',
    ROLES.DIRECTOR,
    ROLES.PRINCIPAL,
    ROLES.ACCOUNTANT,
  ].includes(userRole);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('chain'); // 'chain' | 'ledger' | 'attendance' | 'structure'
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [disburseModalStaff, setDisburseModalStaff] = useState(null);
  const [disburseTargetMonth, setDisburseTargetMonth] = useState({ month: '', year: 2026 });
  const [payslipModalData, setPayslipModalData] = useState(null);

  // Fetch full details
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/payroll/staff/${id}/details`);
      if (res.data?.success) {
        setData(res.data);
      } else {
        toast.error('Could not load staff payroll details');
      }
    } catch (err) {
      console.error('Failed to load staff payroll details:', err);
      toast.error(err.response?.data?.message || 'Error loading staff details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    if (!canManagePayroll && currentUserId && String(id) !== currentUserId) {
      toast.warning('You can only view your own payroll profile');
      navigate('/payroll', { replace: true });
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

  // Filtered month-wise ledger
  const filteredLedger = useMemo(() => {
    if (selectedSessionFilter === 'all') return monthWiseLedger;
    return monthWiseLedger.filter((item) => {
      // Filter by year or session name if matched
      return String(item.year) === selectedSessionFilter || (item.disbursement?.sessionId === selectedSessionFilter);
    });
  }, [monthWiseLedger, selectedSessionFilter]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw size={28} className="animate-spin text-orange-500 mx-auto" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading comprehensive staff payroll ledger...</p>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Staff record not found.</p>
        <Button onClick={() => navigate('/payroll')} icon={<ArrowLeft size={14} />}>
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-16">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition shadow-2xs cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Payroll</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700 select-none">/</span>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
            <Link to="/payroll" className="text-slate-500 hover:text-orange-500 font-semibold transition">
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
              <img src={staff.avatar} alt={staff.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {staff.name.charAt(0)}
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
                  <Briefcase size={13} className="text-indigo-500" /> Dept: {staff.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> {staff.email}
                </span>
                {staff.phone && staff.phone !== '—' && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" /> {staff.phone}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                  <Calendar size={13} className="text-emerald-500" /> Joined: {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString('en-GB') : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Only for Admins/Accountants) */}
          {canManagePayroll && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <CreditCard size={14} /> Update Salary Structure
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
              {metrics?.totalDisbursementsCount} Months
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Successfully paid salary cycles
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
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1 block">
              {formatCurrency(structure?.netPay || grossMonthly)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Gross: {formatCurrency(grossMonthly)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('chain')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer ${
            activeTab === 'chain'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity size={15} />
          <span>Salary Chain Timeline ({salaryChain.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck size={15} />
          <span>Month-Wise Status Matrix ({monthWiseLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock size={15} />
          <span>Attendance & Leaves History ({staffLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black border-b-2 transition cursor-pointer ${
            activeTab === 'structure'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wallet size={15} />
          <span>Salary Structure & Allowances</span>
        </button>
      </div>

      {/* Tab 1: Salary Chain Timeline */}
      {activeTab === 'chain' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-orange-500" />
                  Date-Wise Salary Disbursement Chain
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sequential chronological chain of all monthly salary disbursements released to {staff.name}.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Total Chain Value: <strong className="text-emerald-600">{formatCurrency(metrics?.totalLifetimePaid)}</strong>
              </span>
            </div>

            {salaryChain.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No salary disbursements have been released to this employee yet. Switch to the <strong>Month-Wise Status Matrix</strong> tab to disburse pending months.
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-indigo-500 before:to-emerald-500">
                {salaryChain.map((chainItem, index) => {
                  return (
                    <div key={chainItem._id || index} className="relative group">
                      {/* Step circle node */}
                      <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-orange-500 text-[10px] font-black text-orange-600 flex items-center justify-center shadow-xs">
                        {chainItem.stepNumber}
                      </div>

                      {/* Content Card */}
                      <div className="bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 transition shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {chainItem.month} {chainItem.year}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                Disbursed on {chainItem.formattedDisbursedDate}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Session: {chainItem.sessionName || 'Active'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-mono">
                              Txn Ref: {chainItem.transactionReference || '—'} • Channel: {chainItem.paymentMethod}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                                {formatCurrency(chainItem.netPay)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Gross: {formatCurrency(chainItem.grossPay || chainItem.basicPay)} • Deductions: -{formatCurrency(chainItem.deductions)}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setPayslipModalData({
                                  staff,
                                  month: chainItem.month.split(' ')[0],
                                  year: chainItem.year,
                                  disbursementDetails: chainItem,
                                });
                              }}
                              className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                              title="View & Print Payslip"
                            >
                              <FileText size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Breakdown pill */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-4 text-[10px] text-slate-500">
                          <span>Basic Pay: <strong>{formatCurrency(chainItem.basicPay)}</strong></span>
                          <span>Allowances: <strong>+{formatCurrency(chainItem.allowances)}</strong></span>
                          <span>Statutory Deductions: <strong>-{formatCurrency(chainItem.statutoryDeductions || (chainItem.deductions - (chainItem.lopDeduction || 0)))}</strong></span>
                          {chainItem.lopDeduction > 0 && (
                            <span className="text-rose-600 font-bold">
                              LOP ({chainItem.lopDays || 0} days): -{formatCurrency(chainItem.lopDeduction)}
                            </span>
                          )}
                          {chainItem.remarks && (
                            <span className="italic text-slate-400">"{chainItem.remarks}"</span>
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
      )}

      {/* Tab 2: Month-Wise Status Matrix (Paid vs Not Paid) */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck size={18} className="text-orange-500" />
                Month-Wise Status Matrix (From Joining Date)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of every billing month since employee joining date, showing exact Paid vs Pending states and Loss of Pay records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter Year:</span>
              <select
                value={selectedSessionFilter}
                onChange={(e) => setSelectedSessionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Years</option>
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={String(yr)}>Year {yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                    <tr key={row.monthKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                        {row.monthKey}
                      </td>

                      <td className="p-3.5 text-center text-slate-700 dark:text-slate-300">
                        {att.presentDays || 26} / {att.standardWorkingDays || 26} Days
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
                          <span className="text-emerald-600 font-semibold">₹0</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(disb ? disb.netPay : row.expectedNet)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {disb ? (
                          <div>
                            <span className="font-mono block text-slate-700 dark:text-slate-300">
                              {disb.transactionReference || 'Disbursed'}
                            </span>
                            <span className="text-[10px] block">
                              {new Date(disb.disbursedAt).toLocaleDateString('en-GB')} via {disb.paymentMethod}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not yet disbursed</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <button
                            onClick={() => {
                              setPayslipModalData({
                                staff,
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
                              setDisburseTargetMonth({ month: row.monthName, year: row.year });
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
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Leave Applications & Absence History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Approved and pending leave requests recorded for {staff.name}. Approved unpaid leaves are directly deducted as Loss of Pay (LOP) during payroll.
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
                    const isApproved = lv.status === 'approved';
                    const isPending = lv.status === 'pending';

                    return (
                      <tr key={lv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {lv.category || 'Casual Leave'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {lv.startDate} to {lv.endDate}
                        </td>
                        <td className="p-3.5 text-center font-extrabold text-slate-900 dark:text-white">
                          {lv.totalDays} Days
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={lv.reason}>
                          {lv.reason}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : isPending
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {lv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {lv.reviewRemarks || '—'}
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
      {activeTab === 'structure' && (
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
                <strong className="text-slate-900 dark:text-white">{formatCurrency(structure?.basicPay)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">House Rent Allowance (HRA)</span>
                <strong className="text-slate-900 dark:text-white">+{formatCurrency(structure?.hra)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dearness Allowance (DA)</span>
                <strong className="text-slate-900 dark:text-white">+{formatCurrency(structure?.da)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Special Allowance</span>
                <strong className="text-slate-900 dark:text-white">+{formatCurrency(structure?.specialAllowance)}</strong>
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
                <strong className="text-rose-500">-{formatCurrency(structure?.pfDeduction)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">TDS / Professional Tax</span>
                <strong className="text-rose-500">-{formatCurrency(structure?.taxDeduction)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Other Policy Deductions</span>
                <strong className="text-rose-500">-{formatCurrency(structure?.otherDeductions)}</strong>
              </div>
              <div className="flex justify-between py-2 font-black text-sm text-rose-500 border-t border-slate-200 dark:border-slate-700">
                <span>Total Policy Deductions</span>
                <span>
                  -{formatCurrency(
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
                  Official account credentials for automated NEFT/RTGS salary transfers.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{structure?.bankName || 'Not Set'}</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                  <strong className="text-sm font-mono text-slate-900 dark:text-white">{structure?.accountNumber || 'Not Set'}</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">IFSC Code</span>
                  <strong className="text-sm font-mono uppercase text-slate-900 dark:text-white">{structure?.ifscCode || 'Not Set'}</strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
                  <strong className="text-sm text-slate-900 dark:text-white">{structure?.paymentMode || 'Bank Transfer'}</strong>
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
                    <div key={sess.sessionId} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white block">{sess.sessionName}</span>
                        <span className="text-[10px] text-slate-500">{sess.disbursementsCount} Monthly cycles paid</span>
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
          staff={{ ...staff, salaryStructure: structure }}
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
          staff={payslipModalData.staff}
          month={payslipModalData.month}
          year={payslipModalData.year}
        />
      )}
    </motion.div>
  );
};

export default StaffPayrollDetail;

