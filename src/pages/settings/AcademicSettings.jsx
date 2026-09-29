import React from "react";
import { Award } from "lucide-react";

const AcademicSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
          Academic & Grading Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure institutional passing percentage, GPA grading scale, and grade distribution tracking.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Default Passing Percentage (%)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Minimum aggregate percentage required for a student to pass an examination.
            </p>
            <div className="relative">
              <input
                type="number"
                name="defaultPassingPercentage"
                value={settings?.defaultPassingPercentage ?? ""}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g. 40"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-bold"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                %
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Grade Point Scale (GPA)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Maximum GPA scale used for report card grade point averages (e.g. 4.0 or 10.0).
            </p>
            <input
              type="number"
              name="gradePointScale"
              value={settings?.gradePointScale ?? ""}
              onChange={handleChange}
              step="0.1"
              min="1"
              max="10"
              placeholder="e.g. 4.0 or 10.0"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-bold"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-850/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableGradeDistribution"
            checked={Boolean(settings?.enableGradeDistribution)}
            onChange={handleChange}
            id="enableGradeDistribution"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enableGradeDistribution" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Enable Grade Distribution Tracking
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Calculate grade distribution analytics across examination results.
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AcademicSettings;
