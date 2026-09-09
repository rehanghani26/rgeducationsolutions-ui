import React from "react";

const AccessSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        User Access & Permissions
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableTwoFactor"
            checked={settings.enableTwoFactor}
            onChange={handleChange}
            id="enableTwoFactor"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableTwoFactor"
            className="cursor-pointer select-none"
          >
            <strong>Enable Two-Factor Authentication</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Require 2FA for sensitive operations
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
              min="5"
              max="480"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Password Expiry (days)
            </label>
            <input
              type="number"
              name="passwordExpiry"
              value={settings.passwordExpiry}
              onChange={handleChange}
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessSettings;
