import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  CreditCard,
  Building,
  ArrowRight,
  ExternalLink,
  Calendar,
  Clock,
  UserCheck,
  Calculator,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api.js';
import Modal from '../../../components/ui/Modal.jsx';

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `₹${n.toLocaleString('en-IN')}`;
};

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
    if (staff) {
      const att = staff.attendanceMetrics || {};
      const struct = staff.salaryStructure || {};
      setPaymentMethod(struct.paymentMode || 'Bank Transfer');
      setCustomPresentDays(att.presentDays ?? 26);
      setCustomLopDays(att.lopDays ?? 0);
      setTransactionReference('');
      setRemarks('');
      setOverBudgetInfo(null);
    }
  }, [staff]);

  if (!staff) return null;

  const struct = staff.salaryStructure || {};
  const att = staff.attendanceMetrics || {};

  const grossPay = struct.grossPay || (Number(struct.basicPay || 0) + Number(struct.hra || 0) + Number(struct.da || 0) + Number(struct.specialAllowance || 0));
  const statutoryDeductions = struct.statutoryDeductions || (Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0) + Number(struct.otherDeductions || 0));

  const perDayRate = att.perDayRate || Math.round((Number(struct.basicPay || 0) + Number(struct.da || 0)) / (att.totalDaysInMonth || 30));
  const calculatedLopDeduction = Math.round((Number(customLopDays) || 0) * perDayRate);
  const totalDeductions = statutoryDeductions + calculatedLopDeduction;
  const calculatedNetPay = Math.max(0, grossPay - totalDeductions);

  const handleDisburse = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!staff) return;

    setProcessing(true);
    setOverBudgetInfo(null);

    try {
      const res = await api.post('/payroll/disburse', {
        userId: staff._id,
        sessionId,
        month,
        year,
        paymentMethod,
        transactionReference: transactionReference || `TXN-${Date.now()}`,
        remarks,
        customLopDays: Number(customLopDays) || 0,
        customPresentDays: Number(customPresentDays) || 0,
      });

      if (res.data?.success) {
        toast.success(res.data.message || `Salary disbursed successfully to ${staff.name}`);
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
      title={overBudgetInfo ? '⚠️ Salary Budget Limit Exceeded' : `Process Salary Disbursement: ${staff.name}`}
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
                This payout of <strong>{formatCurrency(overBudgetInfo.requiredAmount)}</strong> exceeds the remaining Salary Budget for session <strong>{sessionName || 'Current Session'}</strong>.
              </p>
              <div className="mt-2 p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span>Available Remaining Budget:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(overBudgetInfo.remainingBudget)}</strong>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Deficit (Deficiency):</span>
                  <span>- {formatCurrency(overBudgetInfo.deficit)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            School fiscal policy requires a <strong>Revised Budget Allocation</strong> to be committed in Settings before salaries exceeding approved session limits can be released.
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
          {/* Header Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">
                {staff.name} ({staff.employeeId})
              </span>
              <span className="text-[11px] text-slate-500">
                Period: {month} {year} • Session: {sessionName || 'Active'}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Take-Home Net Pay</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(calculatedNetPay)}
              </span>
            </div>
          </div>

          {/* Attendance & Leave Integration Section */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Attendance & Leave Integration (Month of {month})
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Per-Day Rate: {formatCurrency(perDayRate)}/day
              </span>
            </div>

            {/* Attendance breakdown pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Calendar Days</span>
                <strong className="text-slate-800 dark:text-slate-200">{att.totalDaysInMonth || 30} Days</strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Working Days</span>
                <strong className="text-slate-800 dark:text-slate-200">{att.standardWorkingDays || 26} Days</strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">Paid Leaves (Approved)</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{att.paidLeaveDays || 0} Days</strong>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] text-rose-500 uppercase font-bold block">Unpaid / Absent (LOP)</span>
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
                <span>Notice: Staff member has <strong>{att.pendingLeavesCount}</strong> leave application(s) pending approval.</span>
              </div>
            )}
          </div>

          {/* Salary Breakdown Summary */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Gross Pay</span>
              <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(grossPay)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Statutory Deductions (PF/Tax)</span>
              <strong className="text-rose-500">-{formatCurrency(statutoryDeductions)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">LOP Deduction</span>
              <strong className="text-rose-500">-{formatCurrency(calculatedLopDeduction)}</strong>
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash Handover</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Transaction / Cheque Ref
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
              placeholder="e.g. Regular monthly payout with leave adjustment..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || calculatedNetPay <= 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Confirm & Disburse {formatCurrency(calculatedNetPay)}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default DisburseSalaryModal;
