import React from "react";

const PolicySettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Add Policy Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableLeavePolicy"
            checked={settings.enableLeavePolicy}
            onChange={handleChange}
            id="enableLeavePolicy"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableLeavePolicy"
            className="cursor-pointer select-none"
          >
            <strong>Enable Leave Policy</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Manage employee and student leave
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Annual Leave Days
            </label>
            <input
              type="number"
              name="annualLeaveDays"
              value={settings.annualLeaveDays}
              onChange={handleChange}
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Sick Leave Days
            </label>
            <input
              type="number"
              name="sickLeaveDays"
              value={settings.sickLeaveDays}
              onChange={handleChange}
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enablePerformanceReview"
            checked={settings.enablePerformanceReview}
            onChange={handleChange}
            id="enablePerformanceReview"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enablePerformanceReview"
            className="cursor-pointer select-none"
          >
            <strong>Enable Performance Review</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Track employee performance metrics
            </p>
          </label>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Review Frequency
          </label>
          <select
            name="reviewFrequency"
            value={settings.reviewFrequency}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="biannual">Bi-annual</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PolicySettings;
