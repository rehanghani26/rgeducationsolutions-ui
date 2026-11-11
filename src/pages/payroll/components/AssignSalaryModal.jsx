import React, { useState, useEffect } from 'react';
import { Save, Loader2, DollarSign, Building2, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api.js';
import Modal from '../../../components/ui/Modal.jsx';
import { CurrencyInput } from '../../../components/ui/CurrencyInput.jsx';
import { formatCurrency } from '../payrollUtils.js';

const AssignSalaryModal = ({ isOpen, onClose, staff, onSalaryAssigned }) => {
  const [formData, setFormData] = useState({
    basicPay: 0,
    hra: 0,
    da: 0,
    specialAllowance: 0,
    pfDeduction: 0,
    taxDeduction: 0,
    otherDeductions: 0,
    paymentMode: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      const s = staff.salaryStructure || {};
      setFormData({
        basicPay: s.basicPay ?? 0,
        hra: s.hra ?? 0,
        da: s.da ?? 0,
        specialAllowance: s.specialAllowance ?? 0,
        pfDeduction: s.pfDeduction ?? 0,
        taxDeduction: s.taxDeduction ?? 0,
        otherDeductions: s.otherDeductions ?? 0,
        paymentMode: s.paymentMode || 'Bank Transfer',
        bankName: s.bankName || '',
        accountNumber: s.accountNumber || '',
        ifscCode: s.ifscCode || '',
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatedGross =
    (Number(formData.basicPay) || 0) +
    (Number(formData.hra) || 0) +
    (Number(formData.da) || 0) +
    (Number(formData.specialAllowance) || 0);

  const calculatedDeductions =
    (Number(formData.pfDeduction) || 0) +
    (Number(formData.taxDeduction) || 0) +
    (Number(formData.otherDeductions) || 0);

  const calculatedNet = Math.max(0, calculatedGross - calculatedDeductions);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!staff) return;

    setSaving(true);
    try {
      const res = await api.post('/payroll/salary-structure', {
        userId: staff._id,
        basicPay: Number(formData.basicPay) || 0,
        hra: Number(formData.hra) || 0,
        da: Number(formData.da) || 0,
        specialAllowance: Number(formData.specialAllowance) || 0,
        pfDeduction: Number(formData.pfDeduction) || 0,
        taxDeduction: Number(formData.taxDeduction) || 0,
        otherDeductions: Number(formData.otherDeductions) || 0,
        paymentMode: formData.paymentMode,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      });

      if (res.data?.success) {
        toast.success(`Salary structure updated for ${staff.name}`);
        onSalaryAssigned?.();
        onClose();
      }
    } catch (err) {
      console.error('Error assigning salary:', err);
      toast.error(err.response?.data?.message || 'Failed to update salary');
    } finally {
      setSaving(false);
    }
  };

  if (!staff) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Salary Structure: ${staff.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Staff badge info */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white block">
              {staff.name} ({staff.employeeId})
            </span>
            <span className="text-[11px] text-slate-500 capitalize">
              Role: {staff.role} • Dept: {staff.department}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Calculated Net Pay</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(calculatedNet)} / mo
            </span>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Earnings & Monthly Allowances (Gross)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <CurrencyInput
              label="Basic Pay"
              name="basicPay"
              value={formData.basicPay}
              onChange={handleChange}
              required
              size="sm"
              quickPresets={[1000, 5000, 10000]}
              placeholder="0"
            />

            <CurrencyInput
              label="HRA"
              name="hra"
              value={formData.hra}
              onChange={handleChange}
              size="sm"
              quickPresets={[500, 2000, 5000]}
              placeholder="0"
            />

            <CurrencyInput
              label="DA"
              name="da"
              value={formData.da}
              onChange={handleChange}
              size="sm"
              quickPresets={[500, 2000, 5000]}
              placeholder="0"
            />

            <CurrencyInput
              label="Special Allowance"
              name="specialAllowance"
              value={formData.specialAllowance}
              onChange={handleChange}
              size="sm"
              quickPresets={[500, 1000, 3000]}
              placeholder="0"
            />
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Deductions & Withholdings
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CurrencyInput
              label="Provident Fund (PF)"
              name="pfDeduction"
              value={formData.pfDeduction}
              onChange={handleChange}
              size="sm"
              placeholder="0"
            />

            <CurrencyInput
              label="TDS / Professional Tax"
              name="taxDeduction"
              value={formData.taxDeduction}
              onChange={handleChange}
              size="sm"
              placeholder="0"
            />

            <CurrencyInput
              label="Other Deductions"
              name="otherDeductions"
              value={formData.otherDeductions}
              onChange={handleChange}
              size="sm"
              placeholder="0"
            />
          </div>
        </div>

        {/* Banking details */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Disbursement & Bank Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash Disbursal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                placeholder="e.g. State Bank of India"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Account number"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                placeholder="e.g. SBIN0001234"
                value={formData.ifscCode}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Gross: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(calculatedGross)}</strong> •
            Deductions: <strong className="text-rose-500">-{formatCurrency(calculatedDeductions)}</strong>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-60 text-center"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Structure</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AssignSalaryModal;

