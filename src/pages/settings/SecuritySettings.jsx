import React from "react";

const SecuritySettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        System Security Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableDataEncryption"
            checked={settings.enableDataEncryption}
            onChange={handleChange}
            id="enableDataEncryption"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableDataEncryption"
            className="cursor-pointer select-none"
          >
            <strong>Enable Data Encryption</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Encrypt sensitive data at rest
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableAuditLog"
            checked={settings.enableAuditLog}
            onChange={handleChange}
            id="enableAuditLog"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableAuditLog"
            className="cursor-pointer select-none"
          >
            <strong>Enable Audit Logging</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Log all user actions for security auditing
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
