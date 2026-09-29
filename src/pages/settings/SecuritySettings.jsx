import React from "react";
import { Shield } from "lucide-react";

const SecuritySettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          Security & Access Control Policies
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure institutional data encryption, user audit trails, two-factor authentication, and session security.
        </p>
      </div>

      <div className="space-y-4">
        {/* Core Security Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <input
              type="checkbox"
              name="enableDataEncryption"
              checked={Boolean(settings?.enableDataEncryption)}
              onChange={handleChange}
              id="enableDataEncryption"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableDataEncryption" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Data Encryption at Rest
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Encrypt sensitive student records, financial logs, and credentials.
              </p>
            </label>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <input
              type="checkbox"
              name="enableAuditLog"
              checked={Boolean(settings?.enableAuditLog)}
              onChange={handleChange}
              id="enableAuditLog"
              className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <label htmlFor="enableAuditLog" className="cursor-pointer select-none">
              <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Administrative Audit Logging
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Maintain audit trails for marks alterations and role modifications.
              </p>
            </label>
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableTwoFactor"
            checked={Boolean(settings?.enableTwoFactor)}
            onChange={handleChange}
            id="enableTwoFactor"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enableTwoFactor" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Two-Factor Authentication (2FA) for Admin & Staff
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Enforce multi-factor verification for administrative accounts upon login.
            </p>
          </label>
        </div>

        {/* Session Inactivity and Password Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Session Inactivity Timeout (minutes)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Automatically log out users after period of inactivity.
            </p>
            <div className="relative">
              <input
                type="number"
                name="sessionTimeout"
                value={settings?.sessionTimeout ?? ""}
                onChange={handleChange}
                min="5"
                max="480"
                placeholder="e.g. 30"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                mins
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <label className="block font-bold text-xs text-slate-900 dark:text-slate-200 mb-1">
              Staff Password Expiry (days)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Require staff to rotate account passwords periodically.
            </p>
            <div className="relative">
              <input
                type="number"
                name="passwordExpiry"
                value={settings?.passwordExpiry ?? ""}
                onChange={handleChange}
                min="0"
                max="365"
                placeholder="e.g. 90"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold text-sm"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400">
                days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
