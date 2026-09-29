import React from "react";
import { Database } from "lucide-react";

const BackupSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database size={18} className="text-indigo-600 dark:text-indigo-400" />
          System Backup & Disaster Recovery
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure automated database snapshots, cloud backup frequencies, and archival cycles.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="autoBackupEnabled"
            checked={Boolean(settings?.autoBackupEnabled)}
            onChange={handleChange}
            id="autoBackupEnabled"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="autoBackupEnabled" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Enable Scheduled Automated Database Backups
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Periodically dump and compress MongoDB collections to secure cloud storage.
            </p>
          </label>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 max-w-md">
          <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
            Automated Backup Frequency
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Schedule on which database snapshots will be generated.
          </p>
          <select
            name="backupFrequency"
            value={settings?.backupFrequency ?? ""}
            onChange={handleChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily Automated Snapshot</option>
            <option value="weekly">Weekly Snapshot Cycle</option>
            <option value="monthly">Monthly Snapshot Cycle</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
