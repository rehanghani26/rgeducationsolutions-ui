import React from "react";

export const SectionCard = ({ title, action, onAction, children }) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#111827]">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {action}
        </button>
      )}
    </div>
    {children}
  </div>
);

export default SectionCard;
