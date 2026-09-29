import React from "react";

const SettingsCard = ({ icon: Icon, title, description, badge, onClick, category }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
    >
      <div className="flex items-start gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-950/70 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 transition duration-200 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900/50">
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-extrabold border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
        <span>Configure Settings</span>
        <span className="group-hover:translate-x-1 transition duration-200">&rarr;</span>
      </div>
    </div>
  );
};

export default SettingsCard;
