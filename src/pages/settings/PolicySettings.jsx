import React from "react";
import { UserCheck } from "lucide-react";

const PolicySettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
          Staff, Attendance & HR Policies
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure minimum attendance requirements, timesheet submission frequencies, and staff leave quotas.
        </p>
      </div>

      <div className="space-y-5">
        {/* Attendance Requirement */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
            Minimum Mandatory Attendance Requirement (%)
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Threshold required for students to be eligible for final examinations.
          </p>
          <div className="relative max-w-xs">
            <input
              type="number"
              name="attendanceRequirement"
              value={settings?.attendanceRequirement ?? ""}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g. 75 or 85"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
              %
            </span>
          </div>
        </div>

        {/* Timesheet Settings */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="enableTimesheet"
              checked={Boolean(settings?.enableTimesheet)}
              onChange={handleChange}
              id="enableTimesheet"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableTimesheet" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Enable Staff Timesheet & Duty Hours Module
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Track daily faculty work hours and extra period duty logs.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                Timesheet Approval Cycle
              </label>
              <select
                name="timesheetFrequency"
                value={settings?.timesheetFrequency ?? ""}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select cycle</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                Overtime Hourly Multiplier
              </label>
              <input
                type="number"
                name="overtimeMultiplier"
                value={settings?.overtimeMultiplier ?? ""}
                onChange={handleChange}
                step="0.1"
                min="1"
                placeholder="e.g. 1.5"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Leave Policy Settings */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="enableLeavePolicy"
              checked={Boolean(settings?.enableLeavePolicy)}
              onChange={handleChange}
              id="enableLeavePolicy"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableLeavePolicy" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Enable Staff Leave Policy & Quota Allocations
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Apply standardized annual quotas and approval workflows for teacher leave requests.
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                Annual Paid Leave Days
              </label>
              <input
                type="number"
                name="annualLeaveDays"
                value={settings?.annualLeaveDays ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 15"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                Annual Sick / Medical Leave Days
              </label>
              <input
                type="number"
                name="sickLeaveDays"
                value={settings?.sickLeaveDays ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 10"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicySettings;
