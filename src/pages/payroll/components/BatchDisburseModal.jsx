import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api.js';
import Modal from '../../../components/ui/Modal.jsx';
import Table from '../../../components/Table/Table.jsx';
import Loader from '../../../components/ui/Loader.jsx';
import {
  MONTH_NAMES,
  YEAR_OPTIONS,
  PAYMENT_METHODS,
  formatCurrency,
  safeNumber,
  calculateNetPay,
} from '../payrollUtils.js';

const BatchDisburseModal = ({
  open,
  onClose,
  selectedStaff = [],
  summary = null,
  defaultMonth = '',
  defaultYear = new Date().getFullYear(),
  onSuccess,
}) => {
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState(defaultMonth || MONTH_NAMES[new Date().getMonth()]);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [remarks, setRemarks] = useState('Monthly Batch Salary Disbursement');
  const [submitting, setSubmitting] = useState(false);

  // Initialize selected staff items whenever modal opens or selection changes
  useEffect(() => {
    if (open && Array.isArray(selectedStaff)) {
      setItems(
        selectedStaff.map((staff) => {
          const base =
            staff.salaryStructure?.adjustedNetPay ??
            (staff.salaryStructure?.netPay || 0);
          return {
            _id: staff._id,
            userId: staff._id,
            name: staff.name,
            employeeId: staff.employeeId || `EMP-${String(staff._id).slice(-4)}`,
            role: staff.role || 'Staff',
            department: staff.department || 'Academics',
            basePay: Number(base) || 0,
            bonus: 0,
            customDeduction: 0,
            selected: true,
          };
        })
      );
      if (defaultMonth) setMonth(defaultMonth);
      if (defaultYear) setYear(defaultYear);
    }
  }, [open, selectedStaff, defaultMonth, defaultYear]);

  // Net pay helper for an individual row
  const getItemNet = (item) => {
    const base = Number(item.basePay) || 0;
    const extra = Math.max(0, Number(item.bonus) || 0);
    const ded = Math.max(0, Number(item.customDeduction) || 0);
    return Math.max(0, base + extra - ded);
  };

  // Computations
  const activeItems = useMemo(() => items.filter((i) => i.selected), [items]);
  const totalSelectedCount = activeItems.length;

  const totalBaseSalary = useMemo(
    () => activeItems.reduce((acc, curr) => acc + (Number(curr.basePay) || 0), 0),
    [activeItems]
  );

  const totalExtraBonus = useMemo(
    () => activeItems.reduce((acc, curr) => acc + Math.max(0, Number(curr.bonus) || 0), 0),
    [activeItems]
  );

  const totalDeductions = useMemo(
    () => activeItems.reduce((acc, curr) => acc + Math.max(0, Number(curr.customDeduction) || 0), 0),
    [activeItems]
  );

  const totalBatchAmount = useMemo(
    () => activeItems.reduce((acc, curr) => acc + getItemNet(curr), 0),
    [activeItems]
  );

  const remainingBudget = Number(summary?.salaryRemaining ?? 0);
  const isOverBudget = totalBatchAmount > remainingBudget;
  const deficit = Math.max(0, totalBatchAmount - remainingBudget);

  // Row update handlers
  const handleToggleSelectAll = (checked) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleToggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateBonus = (id, val) => {
    const num = Math.max(0, Number(val) || 0);
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, bonus: num } : item))
    );
  };

  const handleUpdateDeduction = (id, val) => {
    const num = Math.max(0, Number(val) || 0);
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, customDeduction: num } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  // Quick Apply to all active items
  const [globalExtra, setGlobalExtra] = useState('');
  const [globalDeduction, setGlobalDeduction] = useState('');

  const handleApplyGlobalExtra = () => {
    const num = Number(globalExtra);
    if (isNaN(num) || num < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, bonus: num } : item))
    );
    toast.info(`Applied +₹${num.toLocaleString('en-IN')} Extra to ${totalSelectedCount} staff members`);
    setGlobalExtra('');
  };

  const handleApplyGlobalDeduction = () => {
    const num = Number(globalDeduction);
    if (isNaN(num) || num < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, customDeduction: num } : item))
    );
    toast.info(`Applied -₹${num.toLocaleString('en-IN')} Deduction to ${totalSelectedCount} staff members`);
    setGlobalDeduction('');
  };

  // Submit batch disbursement
  const handleConfirmDisbursement = async () => {
    if (totalSelectedCount === 0) {
      toast.warning('Please select at least one staff member to disburse salary.');
      return;
    }

    if (isOverBudget) {
      toast.error(
        `Batch Total (${formatCurrency(totalBatchAmount)}) exceeds Remaining Salary Budget (${formatCurrency(remainingBudget)}) by ${formatCurrency(deficit)}. Please adjust payouts or allocate budget in Settings.`
      );
      return;
    }

    const payloadMonth = `${month} ${year}`;
    const staffItems = activeItems.map((item) => ({
      userId: item.userId || item._id,
      bonus: Number(item.bonus) || 0,
      customDeduction: Number(item.customDeduction) || 0,
      paymentMethod,
      remarks,
      month: payloadMonth,
      year: Number(year),
    }));

    setSubmitting(true);
    try {
      const res = await api.post('/payroll/disburse-batch', {
        staffItems,
        userIds: staffItems.map((s) => s.userId),
        sessionId: summary?.sessionId,
        month: payloadMonth,
        year: Number(year),
        paymentMethod,
        remarks,
      });

      if (res.data?.success) {
        toast.success(
          res.data.message || `Successfully disbursed salary to ${totalSelectedCount} staff members!`
        );
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Batch disbursement failed:', err);
      toast.error(err.response?.data?.message || 'Batch salary disbursement failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Configure Table layout for @/components/Table/Table.jsx
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const tableLayout = [
    {
      headData: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleToggleSelectAll(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
            title="Select / Deselect All in Batch"
          />
        </div>
      ),
      bodyData: (item) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={Boolean(item.selected)}
            onChange={() => handleToggleItem(item._id)}
            className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
          />
        </div>
      ),
      key: 'select',
    },
    {
      headData: 'Staff Member',
      bodyData: (item) => (
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center shrink-0 uppercase text-xs">
            {item.name ? item.name.charAt(0) : 'S'}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
              {item.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {item.employeeId} • <span className="uppercase text-[9px] font-bold text-slate-500">{item.role}</span>
            </p>
          </div>
        </div>
      ),
      key: 'staff',
    },
    {
      headData: 'Base Salary',
      bodyData: (item) => (
        <div className="flex items-center justify-center gap-1 font-bold text-slate-700 dark:text-slate-300 text-xs">
          <span>{formatCurrency(item.basePay)}</span>
          {Number(item.basePay) <= 0 && (
            <span
              className="text-amber-500 cursor-help"
              title="Base salary is 0 / not configured"
            >
              <HelpCircle size={12} />
            </span>
          )}
        </div>
      ),
      key: 'basePay',
    },
    {
      headData: 'Add / Extra (+)',
      bodyData: (item) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-emerald-500 font-bold text-xs">+₹</span>
          <input
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={item.bonus === 0 ? '' : item.bonus}
            onChange={(e) => handleUpdateBonus(item._id, e.target.value)}
            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      ),
      key: 'bonus',
    },
    {
      headData: 'Deducted (-)',
      bodyData: (item) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-rose-500 font-bold text-xs">-₹</span>
          <input
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={item.customDeduction === 0 ? '' : item.customDeduction}
            onChange={(e) => handleUpdateDeduction(item._id, e.target.value)}
            className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-rose-600 dark:text-rose-400 text-right focus:ring-1 focus:ring-rose-500 focus:outline-none"
          />
        </div>
      ),
      key: 'deduction',
    },
    {
      headData: 'Total Payable',
      bodyData: (item) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(getItemNet(item))}
        </span>
      ),
      key: 'totalPayable',
    },
    {
      headData: 'Action',
      bodyData: (item) => (
        <button
          type="button"
          onClick={() => handleRemoveItem(item._id)}
          title="Remove from this batch"
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      ),
      key: 'actions',
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
              Process Batch Salary Disbursement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and adjust individual payouts, add bonuses or deductions, and commit batch transaction.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top 4 Summary & Budget Health Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Selected Staff
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalSelectedCount} <span className="text-xs font-semibold text-slate-400">/ {items.length}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Included in payout</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Base Salaries
            </span>
            <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
              {formatCurrency(totalBaseSalary)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Before extra adjustments</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Add / Deduct Adjustments
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalExtraBonus)}
              </span>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Total custom items</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${
            isOverBudget
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
              Total Batch Payout
            </span>
            <p className={`text-xl font-black mt-0.5 ${
              isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {formatCurrency(totalBatchAmount)}
            </p>
            <p className="text-[10px] font-bold mt-1 text-slate-500">
              Pool Rem: {formatCurrency(remainingBudget)}
            </p>
          </div>
        </div>

        {/* Budget Safeguard Alert Banner */}
        {isOverBudget ? (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs">
            <ShieldAlert size={18} className="text-rose-600 shrink-0" />
            <div>
              <strong className="font-black">Budget Safeguard Triggered!</strong> Batch total ({formatCurrency(totalBatchAmount)}) exceeds remaining Salary Budget ({formatCurrency(remainingBudget)}) by <span className="font-extrabold">{formatCurrency(deficit)}</span>.
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Within approved session budget ({summary?.sessionName || 'Active Session'}). Remaining after payout: {formatCurrency(remainingBudget - totalBatchAmount)}.</span>
            </div>
          </div>
        )}

        {/* Billing Cycle, Payment Mode & Quick Adjustments Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-500" />
              <span className="font-bold text-slate-600 dark:text-slate-300">Billing Cycle:</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-3">
              <CreditCard size={14} className="text-emerald-500" />
              <span className="font-bold text-slate-600 dark:text-slate-300">Payment:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Global Apply Inputs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Apply to All:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                placeholder="+ Bonus"
                value={globalExtra}
                onChange={(e) => setGlobalExtra(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-right"
              />
              <button
                type="button"
                onClick={handleApplyGlobalExtra}
                className="p-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-[10px] cursor-pointer"
                title="Apply bonus to all selected staff"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                placeholder="- Deduct"
                value={globalDeduction}
                onChange={(e) => setGlobalDeduction(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-right"
              />
              <button
                type="button"
                onClick={handleApplyGlobalDeduction}
                className="p-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] cursor-pointer"
                title="Apply deduction to all selected staff"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table of Selected Staff Members */}
        {submitting ? (
          <div className="py-16 text-center">
            <Loader text="Processing batch salary disbursements & creating transaction vouchers..." />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-500 px-1 gap-1">
              <span>Selected Staff Records ({items.length})</span>
              <span className="text-[11px] text-slate-400">Individual adjustments update live totals</span>
            </div>

            <Table
              tableLayout={tableLayout}
              data={items}
              tableHeading=""
              tableClassName="max-h-[340px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl"
              tableHeadClassName="!bg-slate-900 !text-slate-200 uppercase text-[10px] sticky top-0 z-10"
              trClassname="dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              noScrollBar={false}
              showfilter={false}
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <FileText size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Batch remarks / transaction note..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-full sm:w-64 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDisbursement}
              disabled={submitting || totalSelectedCount === 0 || isOverBudget}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition cursor-pointer text-center"
            >
              <CheckCircle2 size={15} />
              <span>
                {submitting
                  ? 'Disbursing Batch...'
                  : `Confirm & Disburse (${totalSelectedCount} Staff • ${formatCurrency(totalBatchAmount)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BatchDisburseModal;

