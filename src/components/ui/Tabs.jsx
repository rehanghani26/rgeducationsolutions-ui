import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => (
  <div className={`flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 ${className}`}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-xs font-bold transition-colors ${
            isActive ? 'text-indigo-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {tab.icon && <tab.icon size={14} className="inline mr-1.5 -mt-0.5" />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">{tab.count}</span>
          )}
          {isActive && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
            />
          )}
        </button>
      );
    })}
  </div>
);

export default Tabs;
