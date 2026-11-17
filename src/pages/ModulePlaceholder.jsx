import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';

const ModulePlaceholder = ({ title, subtitle, breadcrumbs = [] }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-8">
    <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs.length ? breadcrumbs : [{ label: title }]} />
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 md:p-16 text-center shadow-sm">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Construction className="text-indigo-500" size={26} />
      </div>
      <h2 className="text-base sm:text-lg font-bold mb-1.5">{title} Module</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
        This module follows the enterprise ERP pattern: List → Details → Edit → Related Records → Activity Logs.
        Implementation is scheduled in the next development phase.
      </p>
    </div>
  </motion.div>
);

export default ModulePlaceholder;
