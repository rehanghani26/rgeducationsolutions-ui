import React from "react";

const SettingsCard = ({ icon: Icon, title, description, badge, stepBadge, stepDone, priority, onClick, category }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
        stepBadge
          ? stepDone
            ? "border-emerald-300/60 dark:border-emerald-700/50 hover:border-emerald-500 dark:hover:border-emerald-500"
            : "border-orange-200/70 dark:border-stone-800 hover:border-orange-400 dark:hover:border-orange-500/80"
          : "border-slate-200/90 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500/80"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 sm:p-3 rounded-xl transition duration-200 shrink-0 border ${
          stepDone
            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-600"
            : "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white"
        }`}>
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
            {priority && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                priority <= 2
                  ? "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                  : priority <= 6
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}>
                P{priority}
              </span>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
              {title}
            </h3>
            {stepBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs ${
                stepDone
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60"
                  : "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300/80 dark:border-orange-700/60"
              }`}>
                {stepDone ? "✓ " : ""}{stepBadge}
              </span>
            )}
            {badge && !stepBadge && (
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

      <div className={`mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold transition ${
        stepDone
          ? "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700"
          : "text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
      }`}>
        <span>{stepDone ? "Configured ✓" : "Configure Settings"}</span>
        <span className="group-hover:translate-x-1 transition duration-200">&rarr;</span>
      </div>
    </div>
  );
};

export default SettingsCard;

