import { motion } from 'framer-motion';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className = '',
  iconClassName = '',
  iconContainerClassName = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs ${className}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-lg sm:text-xl font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
          {value}
        </p>
        {trend !== undefined && (
          <p
            className={`text-[10px] sm:text-[11px] font-semibold mt-1 truncate ${
              trend >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend >= 0 ? '+' : ''}
            {trend}% {trendLabel}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            iconContainerClassName ||
            'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20'
          }`}
        >
          <Icon
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
              iconClassName || 'text-indigo-600 dark:text-indigo-400'
            }`}
          />
        </div>
      )}
    </div>
  </motion.div>
);

export default StatsCard;
