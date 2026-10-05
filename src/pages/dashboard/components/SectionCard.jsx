import React from "react";

export const SectionCard = ({ title, action, onAction, icon: Icon, children }) => (
  <div className="space-y-4 rounded-2xl border border-[#EFE8DD] bg-white p-5 shadow-xs transition-all dark:border-[#2E2C2A] dark:bg-[#1C1B1A]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-orange-500" />}
        <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{title}</h3>
      </div>
      {action && (
        typeof action === "string" ? (
          <button
            onClick={onAction}
            className="text-xs font-bold text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 cursor-pointer"
          >
            {action}
          </button>
        ) : (
          action
        )
      )}
    </div>
    {children}
  </div>
);

export default SectionCard;
