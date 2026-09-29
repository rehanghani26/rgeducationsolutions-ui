import React from "react";
import { Users } from "lucide-react";

const TeacherSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
          Faculty & Staff Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure automated employee ID series, prefix rules, and class staffing allocation limits.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="autoGenerateTeacherID"
            checked={Boolean(settings?.autoGenerateTeacherID)}
            onChange={handleChange}
            id="autoTeacherID"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="autoTeacherID" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Auto-Generate Faculty / Teacher ID
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Automatically generate sequential employee IDs for new teachers upon onboarding.
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Teacher ID Prefix
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Prefix prepended to generated IDs.
            </p>
            <input
              type="text"
              name="teacherIDPrefix"
              value={settings?.teacherIDPrefix ?? ""}
              onChange={handleChange}
              placeholder="e.g. T, FAC, TEA"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Max Teachers Per Class
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Maximum teachers assignable to a single class section.
            </p>
            <input
              type="number"
              name="maxTeachersPerClass"
              value={settings?.maxTeachersPerClass ?? ""}
              onChange={handleChange}
              min="1"
              max="20"
              placeholder="e.g. 5"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
