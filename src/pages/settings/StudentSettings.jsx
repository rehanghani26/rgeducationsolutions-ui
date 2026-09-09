import React from "react";

const StudentSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Add Student Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="autoGenerateAdmissionNumber"
            checked={settings.autoGenerateAdmissionNumber}
            onChange={handleChange}
            id="autoAdmission"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label htmlFor="autoAdmission" className="cursor-pointer select-none">
            <strong>Auto-Generate Admission Number</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Automatically generate unique admission numbers
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Admission Number Prefix
            </label>
            <input
              name="admissionNumberPrefix"
              value={settings.admissionNumberPrefix}
              onChange={handleChange}
              placeholder="e.g., STU, ADM, S"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Default Student Password
            </label>
            <input
              type="password"
              name="defaultStudentPassword"
              value={settings.defaultStudentPassword}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Max Students Per Section
          </label>
          <input
            type="number"
            name="maxStudentsPerSection"
            value={settings.maxStudentsPerSection}
            onChange={handleChange}
            min="1"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
