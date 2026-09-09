import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Mail, MessageSquare, Plus, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockNotifications } from '../../data/mockData.js';

const NotificationsManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Broadcast Notifications & Communications"
        subtitle="Send instant SMS, Email, and App push notifications to parents, teachers, and students"
        breadcrumbs={[{ label: 'Communication' }, { label: 'Notifications' }]}
        actions={<Button icon={<Send size={16} />}>Send Announcement</Button>}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Sent Announcements & Delivery History</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell size={18} className="text-indigo-500" /> {notif.title}
                </h4>
                <span className="text-xs text-slate-400 font-medium">{notif.sentAt}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <span>Target Audience: <strong className="text-slate-700 dark:text-slate-300">{notif.recipientGroup}</strong></span>
                  <span>Channel: <strong className="text-slate-700 dark:text-slate-300">{notif.channel}</strong></span>
                </div>
                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md">
                  <CheckCircle2 size={13} /> {notif.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsManagement;
