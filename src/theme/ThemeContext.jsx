import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export const THEME_STORAGE_KEY = "rg-educore-theme";
export const DEFAULT_THEME = THEME_MODES.DARK;

const ThemeContext = createContext(null);
const THEME_VALUES = Object.values(THEME_MODES);

const isValidTheme = (theme) => THEME_VALUES.includes(theme);

const readStoredTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

const writeStoredTheme = (theme) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Keep the in-memory theme active when storage is unavailable.
  }
};

export const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") return;

  const nextTheme = isValidTheme(theme) ? theme : DEFAULT_THEME;
  const root = document.documentElement;

  root.classList.toggle("dark", nextTheme === THEME_MODES.DARK);
  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);

  useLayoutEffect(() => {
    applyThemeToDocument(theme);
    writeStoredTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme) => {
    setThemeState(isValidTheme(nextTheme) ? nextTheme : DEFAULT_THEME);
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK
    );
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === THEME_MODES.DARK,
      isLight: theme === THEME_MODES.LIGHT,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
