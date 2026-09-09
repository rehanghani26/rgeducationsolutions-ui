import React from "react";

const TeacherSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Add Teacher Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="autoGenerateTeacherID"
            checked={settings.autoGenerateTeacherID}
            onChange={handleChange}
            id="autoTeacherID"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label htmlFor="autoTeacherID" className="cursor-pointer select-none">
            <strong>Auto-Generate Teacher ID</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Automatically generate unique IDs for new teachers
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Teacher ID Prefix
            </label>
            <input
              name="teacherIDPrefix"
              value={settings.teacherIDPrefix}
              onChange={handleChange}
              placeholder="e.g., T, TEACHER, TSF"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Max Teachers Per Class
            </label>
            <input
              type="number"
              name="maxTeachersPerClass"
              value={settings.maxTeachersPerClass}
              onChange={handleChange}
              min="1"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
