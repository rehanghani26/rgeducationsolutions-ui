const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  unpaid: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  partial: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  upcoming: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  passout: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  'pass out': 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  graduated: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
};

const StatusBadge = ({ status, className = '' }) => {
  const key = (status || 'active').toLowerCase();
  const style = STATUS_STYLES[key] || STATUS_STYLES.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style} ${className}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
