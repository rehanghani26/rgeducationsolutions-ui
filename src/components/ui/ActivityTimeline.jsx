import { format } from 'date-fns';
import { Clock, LogIn, Edit3, Plus, Trash2, Download } from 'lucide-react';

const ACTION_ICONS = {
  CREATE: Plus,
  UPDATE: Edit3,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogIn,
  EXPORT: Download,
  BULK: Edit3,
  READ: Clock,
};

const ActivityTimeline = ({ logs = [], loginHistory = [] }) => {
  const combined = [
    ...logs.map((log) => ({ ...log, type: 'activity' })),
    ...loginHistory.map((entry, i) => ({
      id: `login-${i}`,
      action: 'LOGIN',
      details: 'User logged in',
      timestamp: entry.timestamp,
      ipAddress: entry.ip,
      userAgent: entry.userAgent,
      type: 'login',
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (!combined.length) {
    return <p className="text-xs text-slate-500 font-semibold py-8 text-center">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-0">
      {combined.map((entry, index) => {
        const Icon = ACTION_ICONS[entry.action] || Clock;
        const userName = entry.userId?.name || entry.userId?.email || 'System';
        const time = entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a') : '—';

        return (
          <div key={entry.id || entry._id || index} className="flex gap-4 pb-6 relative">
            {index < combined.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            )}
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 z-10">
              <Icon className="text-indigo-500" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{entry.details || entry.action}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{entry.action}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {userName} · {time}
                {entry.ipAddress && ` · ${entry.ipAddress}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
