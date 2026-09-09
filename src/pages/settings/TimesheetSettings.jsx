import React from "react";

const TimesheetSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Add Timesheet Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableTimesheet"
            checked={settings.enableTimesheet}
            onChange={handleChange}
            id="enableTimesheet"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableTimesheet"
            className="cursor-pointer select-none"
          >
            <strong>Enable Timesheet Module</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Track working hours and attendance
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Timesheet Frequency
            </label>
            <select
              name="timesheetFrequency"
              value={settings.timesheetFrequency}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Overtime Multiplier
            </label>
            <input
              type="number"
              name="overtimeMultiplier"
              value={settings.overtimeMultiplier}
              onChange={handleChange}
              step="0.1"
              min="1"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Minimum Attendance Requirement (%)
          </label>
          <input
            type="number"
            name="attendanceRequirement"
            value={settings.attendanceRequirement}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default TimesheetSettings;
