import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No records found', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <Icon className="text-slate-400" size={28} />
    </div>
    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
    {description && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
