import React from "react";
import { DollarSign } from "lucide-react";

const FinanceSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <DollarSign size={18} className="text-indigo-600 dark:text-indigo-400" />
          Finance & Fee Policy Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure currency symbol, installment payment policies, late fine percentage, and automated fee reminders.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Active Currency Symbol
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Symbol displayed on invoices, fee receipts, and financial ledgers.
            </p>
            <input
              type="text"
              name="currencySymbol"
              value={settings?.currencySymbol ?? ""}
              onChange={handleChange}
              placeholder="e.g. ₹ or $"
              className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Late Payment Fine (%)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Percentage surcharge applied automatically on overdue fee invoices.
            </p>
            <div className="relative max-w-xs">
              <input
                type="number"
                name="lateFeesPercentage"
                value={settings?.lateFeesPercentage ?? ""}
                onChange={handleChange}
                min="0"
                step="0.5"
                placeholder="e.g. 5"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableInstallmentPayment"
            checked={Boolean(settings?.enableInstallmentPayment)}
            onChange={handleChange}
            id="enableInstallmentPayment"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enableInstallmentPayment" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Allow Installment Payments
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Allow parents/students to pay tuition fees in monthly or term installments.
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <input
              type="checkbox"
              name="enableAutoReminder"
              checked={Boolean(settings?.enableAutoReminder)}
              onChange={handleChange}
              id="enableAutoReminder"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableAutoReminder" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Automated Due Date Reminders
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Automatically send notices before fee deadlines.
              </p>
            </label>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Reminder Days in Advance
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Days prior to invoice due date when the first reminder is sent.
            </p>
            <div className="relative">
              <input
                type="number"
                name="reminderDaysBefore"
                value={settings?.reminderDaysBefore ?? ""}
                onChange={handleChange}
                min="1"
                max="30"
                placeholder="e.g. 5"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSettings;
