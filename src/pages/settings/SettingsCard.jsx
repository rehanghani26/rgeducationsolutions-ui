import React from "react";

const SettingsCard = ({ icon: Icon, title, description, badge, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition">
          <Icon size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
