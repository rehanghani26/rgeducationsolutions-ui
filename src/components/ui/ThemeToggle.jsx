import { Moon, Sun } from "lucide-react";
import { THEME_MODES, useTheme } from "../../theme/ThemeContext.jsx";

const THEME_OPTIONS = [
  { id: THEME_MODES.LIGHT, label: "Light", icon: Sun },
  { id: THEME_MODES.DARK, label: "Dark", icon: Moon },
];

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="tablist"
      aria-label="Color mode"
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = theme === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setTheme(option.id)}
            className={`inline-flex h-8 min-w-20 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-bold transition-all ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Icon size={14} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
