import React from "react";

const FinanceSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Finance Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableInstallmentPayment"
            checked={settings.enableInstallmentPayment}
            onChange={handleChange}
            id="enableInstallmentPayment"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableInstallmentPayment"
            className="cursor-pointer select-none"
          >
            <strong>Enable Installment Payments</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Allow fee payments in installments
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Late Fees (%)
            </label>
            <input
              type="number"
              name="lateFeesPercentage"
              value={settings.lateFeesPercentage}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
            <input
              type="checkbox"
              name="enableAutoReminder"
              checked={settings.enableAutoReminder}
              onChange={handleChange}
              id="enableAutoReminder"
              className="w-4 h-4 rounded text-indigo-600"
            />
            <label
              htmlFor="enableAutoReminder"
              className="cursor-pointer select-none"
            >
              <strong>Enable Auto Reminders</strong>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Send payment reminders automatically
              </p>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Reminder Days Before Due Date
          </label>
          <input
            type="number"
            name="reminderDaysBefore"
            value={settings.reminderDaysBefore}
            onChange={handleChange}
            min="0"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default FinanceSettings;
