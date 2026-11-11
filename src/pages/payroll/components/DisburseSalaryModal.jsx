import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  Building,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  MinusCircle,
  PlusCircle,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api.js';
import Modal from '../../../components/ui/Modal.jsx';
import Loader from '../../../components/ui/Loader.jsx';
import {
  formatCurrency,
  MONTH_NAMES as MONTH_OPTIONS,
  YEAR_OPTIONS,
  PAYMENT_METHODS,
  calculateNetPay,
  safeNumber,
} from '../payrollUtils.js';

const DisburseSalaryModal = ({
  isOpen,
  onClose,
  staff,
  month,
  year,
  sessionId,
  sessionName,
  onDisbursementSuccess,
}) => {
  const navigate = useNavigate();
  const now = new Date();
  const defaultMonthName = MONTH_OPTIONS[now.getMonth()];
  const defaultYearNum = now.getFullYear();

  // Period Selection (Past months for backpay / Future months for advance)
  const [selectedMonth, setSelectedMonth] = useState(month || defaultMonthName);
  const [selectedYear, setSelectedYear] = useState(year ? Number(year) : defaultYearNum);

  // Financial Adjustment Inputs
  const [bonus, setBonus] = useState(0);
  const [customDeduction, setCustomDeduction] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Attendance & LOP state (initialized from staff.attendanceMetrics)
  const [customPresentDays, setCustomPresentDays] = useState(26);
  const [customLopDays, setCustomLopDays] = useState(0);

  // Over budget state if backend rejects with isOverBudget
  const [overBudgetInfo, setOverBudgetInfo] = useState(null);

  useEffect(() => {
    if (month) setSelectedMonth(month);
    if (year) setSelectedYear(Number(year));
  }, [month, year]);

  useEffect(() => {
    if (staff) {
      const att = staff.attendanceMetrics || {};
      const struct = staff.salaryStructure || {};
      setPaymentMethod(struct.paymentMode || 'Bank Transfer');
      setCustomPresentDays(att.presentDays ?? 25);
      setCustomLopDays(att.lopDays ?? 0);
      setBonus(0);
      setCustomDeduction(0);
      setTransactionReference('');
      setRemarks('');
      setOverBudgetInfo(null);
    }
  }, [staff]);

  if (!staff) return null;

  const struct = staff.salaryStructure || {};
  const att = staff.attendanceMetrics || {};

  // Base gross & adjustments
  const baseGross =
    struct.grossPay ||
    (Number(struct.basicPay || 0) +
      Number(struct.hra || 0) +
      Number(struct.da || 0) +
      Number(struct.specialAllowance || 0));
  const bonusNum = Math.max(0, Number(bonus) || 0);
  const effectiveGross = baseGross + bonusNum;

  // Deductions
  const statutoryDeductions =
    struct.statutoryDeductions ||
    (Number(struct.pfDeduction || 0) +
      Number(struct.taxDeduction || 0) +
      Number(struct.otherDeductions || 0));

  const perDayRate =
    att.perDayRate ||
    Math.round(
      (Number(struct.basicPay || 0) + Number(struct.da || 0)) /
        (att.totalDaysInMonth || 30)
    );
  const calculatedLopDeduction = Math.round((Number(customLopDays) || 0) * perDayRate);
  const extraDeductionNum = Math.max(0, Number(customDeduction) || 0);

  const totalDeductions =
    statutoryDeductions + calculatedLopDeduction + extraDeductionNum;
  const calculatedNetPay = Math.max(0, effectiveGross - totalDeductions);

  const fullMonthString = `${selectedMonth} ${selectedYear}`;

  const handleDisburse = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!staff) return;

    setProcessing(true);
    setOverBudgetInfo(null);

    try {
      const res = await api.post('/payroll/disburse', {
        userId: staff._id,
        sessionId,
        month: fullMonthString,
        year: Number(selectedYear),
        paymentMethod,
        transactionReference: transactionReference || `TXN-${Date.now()}`,
        remarks,
        customLopDays: Number(customLopDays) || 0,
        customPresentDays: Number(customPresentDays) || 0,
        bonus: bonusNum,
        customDeduction: extraDeductionNum,
      });

      if (res.data?.success) {
        toast.success(
          res.data.message || `Salary disbursed successfully to ${staff.name}`
        );
        onDisbursementSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Disbursement error:', err);
      const data = err.response?.data;
      if (data?.isOverBudget) {
        setOverBudgetInfo(data);
      } else {
        toast.error(data?.message || 'Failed to disburse salary');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        overBudgetInfo
          ? '⚠️ Salary Budget Limit Exceeded'
          : `Process Salary Disbursement: ${staff.name}`
      }
      size="lg"
    >
      {overBudgetInfo ? (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl flex items-start gap-3">
            <ShieldAlert size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-rose-800 dark:text-rose-200">
              <strong className="text-sm font-extrabold text-rose-900 dark:text-rose-100 block">
                Session Salary Pool Exhausted
              </strong>
              <p>
                This payout of{' '}
                <strong>{formatCurrency(overBudgetInfo.requiredAmount)}</strong>{' '}
                exceeds the remaining Salary Budget for session{' '}
                <strong>{sessionName || 'Current Session'}</strong>.
              </p>
              <div className="mt-2 p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span>Available Remaining Budget:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {formatCurrency(overBudgetInfo.remainingBudget)}
                  </strong>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Deficit (Deficiency):</span>
                  <span>- {formatCurrency(overBudgetInfo.deficit)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            School fiscal policy requires a <strong>Revised Budget Allocation</strong> to
            be committed in Settings before salaries exceeding approved session limits
            can be released.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/settings/budget-allocation');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            >
              <span>Allocate Revised Budget in Settings</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDisburse} className="space-y-4">
          {/* Month & Year Selection Bar (Retroactive or Advance Payout) */}
          <div className="p-3.5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-orange-200 dark:border-slate-700 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-orange-500 shrink-0" />
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Salary Billing Cycle Selection
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Pay current month, backpay past unreleased cycles, or disburse in advance.
                  </span>
                </div>
              </div>

              {/* Month & Year Dropdowns */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
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
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y} className="dark:bg-slate-800">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employee & Final Net Header Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                {staff.name} ({staff.employeeId})
              </span>
              <span className="text-[11px] text-slate-500">
                Period: <strong className="text-indigo-600 dark:text-indigo-400">{fullMonthString}</strong> • Session: {sessionName || 'Active'}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Final Take-Home Net Pay
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculatedNetPay)}
              </span>
            </div>
          </div>

          {/* Bonus & Custom Deductions Inputs */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Additional Compensation Adjustments
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Applied directly to this disbursement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bonus / Extra Allowance Input */}
              <div className="space-y-1">
                <label className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <PlusCircle size={13} className="text-emerald-600" />
                    Bonus / Extra Allowance (Incentive)
                  </span>
                  {bonusNum > 0 && <span>+{formatCurrency(bonusNum)}</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800/80 rounded-xl pl-7 pr-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Festival bonus, incentive, overtime, or performance reward.</p>
              </div>

              {/* Extra Deduction / Penalty Input */}
              <div className="space-y-1">
                <label className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400">
                  <span className="flex items-center gap-1">
                    <MinusCircle size={13} className="text-rose-600" />
                    Custom Deduction / Penalty / Advance
                  </span>
                  {extraDeductionNum > 0 && <span>-{formatCurrency(extraDeductionNum)}</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={customDeduction}
                    onChange={(e) => setCustomDeduction(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-800/80 rounded-xl pl-7 pr-3 py-1.5 text-xs font-extrabold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Advance salary recovery, disciplinary penalty, or damage deduction.</p>
              </div>
            </div>
          </div>

          {/* Attendance & Leave Integration Section */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Attendance & Leave Integration ({selectedMonth})
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Per-Day Rate: {formatCurrency(perDayRate)}/day
              </span>
            </div>

            {/* Attendance breakdown pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Calendar Days
                </span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {att.totalDaysInMonth || 30} Days
                </strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Working Days
                </span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {att.standardWorkingDays || 25} Days
                </strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">
                  Paid Leaves
                </span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {att.paidLeaveDays || 0} Days
                </strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-rose-500 uppercase font-bold block">
                  LOP / Absent
                </span>
                <strong className="text-rose-500">{customLopDays} Days</strong>
              </div>
            </div>

            {/* Editable Attendance Adjustments for Accountant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Present Days (Adjustable)
                </label>
                <input
                  type="number"
                  min="0"
                  max={att.totalDaysInMonth || 31}
                  value={customPresentDays}
                  onChange={(e) => setCustomPresentDays(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Loss of Pay (LOP / Unpaid Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    max={att.totalDaysInMonth || 31}
                    value={customLopDays}
                    onChange={(e) => setCustomLopDays(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-600 shrink-0">
                    -{formatCurrency(calculatedLopDeduction)}
                  </span>
                </div>
              </div>
            </div>

            {att.pendingLeavesCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/40 p-2 rounded-lg">
                <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                <span>
                  Notice: Staff member has <strong>{att.pendingLeavesCount}</strong> leave application(s) pending approval.
                </span>
              </div>
            )}
          </div>

          {/* Comprehensive Financial Calculation Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Base Gross</span>
              <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(baseGross)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 font-bold block">Bonus / Extra</span>
              <strong className="text-emerald-600 font-black">+{formatCurrency(bonusNum)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Statutory (PF/Tax)</span>
              <strong className="text-rose-500">-{formatCurrency(statutoryDeductions)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">LOP Deduction</span>
              <strong className="text-rose-500">-{formatCurrency(calculatedLopDeduction)}</strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-rose-600 font-bold block">Extra Deduction</span>
              <strong className="text-rose-600 font-black">-{formatCurrency(extraDeductionNum)}</strong>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash Handover</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Transaction / Cheque Reference
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-9832749823 or CHQ-00128"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Disbursement Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Regular monthly payout with leave adjustment, festival bonus, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || calculatedNetPay <= 0}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50 text-center"
            >
              {processing ? (
                <Loader size="sm" text="Disbursing..." className="text-white" />
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Confirm & Disburse {formatCurrency(calculatedNetPay)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default DisburseSalaryModal;
