import React, { useState, useEffect } from 'react';
import { Coins, CheckCircle2, ArrowRight, Loader2, Sparkles, Receipt, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import setupService from '../../../services/setupService.js';
import api from '../../../services/api.js';

export default function Step5FinancePolicies({ onComplete, onFinish }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    currencySymbol: '₹',
    lateFeePolicy: 'Flat Fee',
    lateFeeAmount: 50,
    invoiceGraceDays: 7,
    feePaymentCycle: 'Quarterly',
  });

  useEffect(() => {
    let mounted = true;
    api.get('/erp/settings')
      .then((res) => {
        if (!mounted) return;
        const s = res.data?.settings || {};
        setForm((prev) => ({
          ...prev,
          currencySymbol: s.currencySymbol || '₹',
          lateFeePolicy: s.lateFeePolicy || 'Flat Fee',
          lateFeeAmount: s.lateFeeAmount !== undefined ? s.lateFeeAmount : 50,
          invoiceGraceDays: s.invoiceGraceDays || 7,
        }));
      })
      .catch((err) => console.warn('Could not load finance settings:', err))
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currencySymbol?.trim()) {
      toast.error('Currency symbol is required');
      return;
    }

    try {
      setLoading(true);
      await setupService.saveFinancePolicies(form);
      toast.success('Finance & Fee policies configured successfully!');
      if (onComplete) await onComplete('financePolicies');
      if (onFinish) onFinish();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save finance policies');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-slate-800/80 dark:to-cyan-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-cyan-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Step 5: Finance & Fee Billing Policies
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              These settings dictate currency formatting on all fee challans, late fine calculations, and billing intervals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Active School Currency <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.currencySymbol}
            onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          >
            <option value="₹">₹ — Indian Rupee (INR)</option>
            <option value="$">$ — US Dollar / CAD / AUD (USD)</option>
            <option value="£">£ — British Pound (GBP)</option>
            <option value="€">€ — Euro (EUR)</option>
            <option value="AED">AED — United Arab Emirates Dirham</option>
            <option value="SAR">SAR — Saudi Riyal</option>
            <option value="৳">৳ — Bangladeshi Taka (BDT)</option>
            <option value="₨">₨ — Pakistani / Nepalese Rupee</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Standard Fee Payment Cycle
          </label>
          <select
            value={form.feePaymentCycle}
            onChange={(e) => setForm({ ...form, feePaymentCycle: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Monthly">Monthly Invoicing (12 Cycles)</option>
            <option value="Quarterly">Quarterly Invoicing (4 Cycles: Q1–Q4)</option>
            <option value="Bi-Annual">Bi-Annual (2 Semesters)</option>
            <option value="Annual">Annual Full Payment Upfront</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Invoice Due Grace Period (Days)
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={form.invoiceGraceDays}
            onChange={(e) => setForm({ ...form, invoiceGraceDays: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">Number of days after invoice generation before fee is overdue.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Late Payment Fine Amount ({form.currencySymbol})
          </label>
          <input
            type="number"
            min="0"
            value={form.lateFeeAmount}
            onChange={(e) => setForm({ ...form, lateFeeAmount: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">Applied automatically when fee is paid after due date.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finalizing Setup...
            </>
          ) : (
            <>
              Complete Initial Setup & Unlock ERP 🎉
              <ShieldCheck className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
