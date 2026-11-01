import React from "react";
import {
  LayoutDashboard,
  Megaphone,
  GraduationCap,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react";

export const DASHBOARD_TABS = [
  {
    id: "home",
    label: "Home",
    shortLabel: "Home",
    description: "Executive Overview & Statistics",
    icon: LayoutDashboard,
  },
  {
    id: "notices",
    label: "Notice Board",
    shortLabel: "Notices",
    description: "Official Campus Circulars",
    icon: Megaphone,
  },
  {
    id: "students",
    label: "Students",
    shortLabel: "Students",
    description: "Directory & Enrollment Analytics",
    icon: GraduationCap,
  },
  {
    id: "staff",
    label: "Teachers & Staff",
    shortLabel: "Staff",
    description: "Faculty & Staff Management",
    icon: Users,
  },
  {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    description: "Fee Collection & Accounts",
    icon: Wallet,
  },
];

const DashboardTabBar = ({ activeTab = "home", onTabChange }) => {
  const activeItem =
    DASHBOARD_TABS.find((t) => t.id === activeTab) || DASHBOARD_TABS[0];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#EFE8DD] bg-white/90 p-1.5 shadow-sm backdrop-blur-md dark:border-[#2C2927] dark:bg-[#181615]/90 transition-all">
        {/* Tab Buttons Row */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 min-w-0">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`group relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 scale-[1.01]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800/60"
                }`}
                title={tab.description}
              >
                <Icon
                  size={15}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-white"
                      : "text-orange-500 dark:text-orange-400"
                  }`}
                />
                <span className="truncate">{tab.label}</span>

                {isActive && (
                  <span className="hidden lg:inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side active status indicator badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400 border-l border-stone-200 dark:border-stone-800 shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[220px]">
            {activeItem.description}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardTabBar;

