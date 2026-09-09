import React from "react";

const AcademicSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Academic Settings
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Default Passing Percentage
          </label>
          <input
            type="number"
            name="defaultPassingPercentage"
            value={settings.defaultPassingPercentage}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Grade Point Scale
          </label>
          <input
            type="number"
            name="gradePointScale"
            value={settings.gradePointScale}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableGradeDistribution"
            checked={settings.enableGradeDistribution}
            onChange={handleChange}
            id="enableGradeDistribution"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableGradeDistribution"
            className="cursor-pointer select-none"
          >
            <strong>Enable Grade Distribution</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Track and analyze grade distribution
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AcademicSettings;
