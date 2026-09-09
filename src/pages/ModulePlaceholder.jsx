import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';

const ModulePlaceholder = ({ title, subtitle, breadcrumbs = [] }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
    <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs.length ? breadcrumbs : [{ label: title }]} />
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
        <Construction className="text-indigo-500" size={32} />
      </div>
      <h2 className="text-lg font-extrabold mb-2">{title} Module</h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        This module follows the enterprise ERP pattern: List → Details → Edit → Related Records → Activity Logs.
        Implementation is scheduled in the next development phase.
      </p>
    </div>
  </motion.div>
);

export default ModulePlaceholder;
