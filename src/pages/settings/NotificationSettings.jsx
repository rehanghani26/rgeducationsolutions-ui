import React from "react";
import { Bell, Mail, MessageSquare, Send } from "lucide-react";

const NotificationSettings = ({ settings = {}, handleChange }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell size={18} className="text-indigo-600 dark:text-indigo-400" />
          Notifications & Multi-Channel Alerts
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure institutional alert dispatching across email, SMS gateways, and browser push notifications.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableEmailAlerts"
            checked={Boolean(settings?.enableEmailAlerts)}
            onChange={handleChange}
            id="enableEmailAlerts"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enableEmailAlerts" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail size={14} className="text-indigo-500" /> Enable Email Notifications
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Send automated fee receipts, attendance summaries, and exam schedules via email.
            </p>
          </label>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enableSmsAlerts"
            checked={Boolean(settings?.enableSmsAlerts)}
            onChange={handleChange}
            id="enableSms"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enableSms" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-500" /> Enable SMS Gateway Alerts
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Dispatch emergency notices and daily absent alerts via SMS gateway.
            </p>
          </label>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <input
            type="checkbox"
            name="enablePushNotifications"
            checked={Boolean(settings?.enablePushNotifications)}
            onChange={handleChange}
            id="enablePushNotifications"
            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="enablePushNotifications" className="cursor-pointer select-none">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Send size={14} className="text-blue-500" /> Enable Browser & App Push Notifications
            </strong>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Deliver real-time web push alerts to active dashboard sessions.
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
