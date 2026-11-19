import { Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { SwitchInput } from '../../components/ui/FormControls.jsx';

const channels = [
  {
    name: 'enableEmailAlerts',
    label: 'Email notifications',
    description: 'Send automated fee receipts, attendance summaries, and exam schedules by email.',
    icon: Mail,
  },
  {
    name: 'enableSmsAlerts',
    label: 'SMS alerts',
    description: 'Send emergency notices and absence alerts through the SMS gateway.',
    icon: MessageSquare,
  },
  {
    name: 'enablePushNotifications',
    label: 'Browser and app notifications',
    description: 'Deliver push alerts to active dashboard sessions.',
    icon: Send,
  },
];

export default function NotificationSettings({ settings = {}, handleChange }) {
  return <section className="max-w-3xl space-y-3">
    <h3 className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 text-base font-bold">
      <Bell size={18} className="text-[var(--brand-primary)]" aria-hidden="true" /> Notification channels
    </h3>
    <div className="grid gap-2">
      {channels.map(({ name, label, description, icon: Icon }) =>
        <SwitchInput
          key={name}
          name={name}
          label={<span className="flex items-center gap-2"><Icon size={14} aria-hidden="true" /> {label}</span>}
          description={description}
          checked={Boolean(settings[name])}
          onChange={handleChange}
          className="w-full justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)] p-3"
        />
      )}
    </div>
  </section>;
}
