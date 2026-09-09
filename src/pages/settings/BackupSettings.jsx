import React from "react";

const BackupSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Backup & Data Management
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="autoBackupEnabled"
            checked={settings.autoBackupEnabled}
            onChange={handleChange}
            id="autoBackupEnabled"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="autoBackupEnabled"
            className="cursor-pointer select-none"
          >
            <strong>Enable Automatic Backups</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Automatically backup database on schedule
            </p>
          </label>
        </div>

        <div>
          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Backup Frequency
          </label>
          <select
            name="backupFrequency"
            value={settings.backupFrequency}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
