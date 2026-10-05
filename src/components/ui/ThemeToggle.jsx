import { Moon, Sun } from "lucide-react";
import { THEME_MODES, useTheme } from "../../theme/ThemeContext.jsx";
import { button, text } from "../../theme/color.js";

const THEME_OPTIONS = [
  { id: THEME_MODES.LIGHT, label: "Light", icon: Sun },
  { id: THEME_MODES.DARK, label: "Dark", icon: Moon },
];

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center ${button.ghost} ${text.brandHover} ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={18} className="text-stone-600 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;
