import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3 } from 'lucide-react';
import Tabs from './Tabs.jsx';
import StatusBadge from './StatusBadge.jsx';
import Loader from './Loader.jsx';

const DetailPageLayout = ({
  backTo,
  backLabel = 'Back',
  title,
  subtitle,
  status,
  avatar,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  loading = false,
}) => {
  if (loading) {
    return <Loader fullPage size="lg" text="Loading..." className="py-24" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {backTo && (
            <Link to={backTo} className="mt-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <ArrowLeft size={18} />
            </Link>
          )}
          <div className="flex items-center gap-4">
            {avatar && (
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20">
                {avatar}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold">{title}</h1>
                {status && <StatusBadge status={status} />}
              </div>
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      </div>

      {tabs && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="px-4 pt-2">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
          </div>
          <div className="p-6">{children}</div>
        </div>
      )}

      {!tabs && children}
    </motion.div>
  );
};

export const EditButton = ({ to }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
  >
    <Edit3 size={14} /> Edit
  </Link>
);

export default DetailPageLayout;
