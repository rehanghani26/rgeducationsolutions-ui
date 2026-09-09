import React from "react";

const NotificationSettings = ({ settings, handleChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
        Notification Settings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableSmsAlerts"
            checked={settings.enableSmsAlerts}
            onChange={handleChange}
            id="enableSms"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label htmlFor="enableSms" className="cursor-pointer select-none">
            <strong>Enable SMS Alerts</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Send alerts via SMS for important events
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enableEmailAlerts"
            checked={settings.enableEmailAlerts}
            onChange={handleChange}
            id="enableEmailAlerts"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enableEmailAlerts"
            className="cursor-pointer select-none"
          >
            <strong>Enable Email Alerts</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Send notifications via email
            </p>
          </label>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
          <input
            type="checkbox"
            name="enablePushNotifications"
            checked={settings.enablePushNotifications}
            onChange={handleChange}
            id="enablePushNotifications"
            className="w-4 h-4 rounded text-indigo-600"
          />
          <label
            htmlFor="enablePushNotifications"
            className="cursor-pointer select-none"
          >
            <strong>Enable Push Notifications</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Send push notifications to mobile/desktop
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
