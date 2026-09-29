import React from "react";
import { GraduationCap } from "lucide-react";

const StudentSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
          Students & Admission Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure admission number formatting, prefix conventions, default student portal password, and section caps.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="autoGenerateAdmissionNumber"
            checked={Boolean(settings?.autoGenerateAdmissionNumber)}
            onChange={handleChange}
            id="autoAdmission"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="autoAdmission" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Auto-Generate Admission Number
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Automatically assign sequential admission numbers to new students upon enrollment.
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Admission Number Prefix
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Prefix prepended to student roll / admission numbers.
            </p>
            <input
              type="text"
              name="admissionNumberPrefix"
              value={settings?.admissionNumberPrefix ?? ""}
              onChange={handleChange}
              placeholder="e.g. STU, ADM, S"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Default Student Portal Password
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Initial password assigned to newly enrolled students for student portal login.
            </p>
            <input
              type="text"
              name="defaultStudentPassword"
              value={settings?.defaultStudentPassword ?? ""}
              onChange={handleChange}
              placeholder="e.g. password"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
            Maximum Students Per Class Section
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Section capacity threshold.
          </p>
          <input
            type="number"
            name="maxStudentsPerSection"
            value={settings?.maxStudentsPerSection ?? ""}
            onChange={handleChange}
            min="1"
            max="120"
            placeholder="e.g. 50"
            className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
