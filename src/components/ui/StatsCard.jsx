import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{value}</p>
        {trend !== undefined && (
          <p className={`text-[11px] font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}% {trendLabel}
          </p>
        )}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
          <Icon className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
      )}
    </div>
  </motion.div>
);

export default StatsCard;
