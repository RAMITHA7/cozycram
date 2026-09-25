import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ThemeContext from "./ThemeContext.js";

const THEME_STORAGE_KEY = "cozycram-theme";

const VALID_THEMES = [
  "light",
  "dark",
  "system",
];

function getStoredTheme() {
  const storedTheme =
    localStorage.getItem(THEME_STORAGE_KEY);

  if (VALID_THEMES.includes(storedTheme)) {
    return storedTheme;
  }

  return "system";
}

function getSystemTheme() {
  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  const [systemTheme, setSystemTheme] =
    useState(getSystemTheme);

  const resolvedTheme =
    theme === "system"
      ? systemTheme
      : theme;

  useEffect(() => {
    document.documentElement.dataset.theme =
      resolvedTheme;

    localStorage.setItem(
      THEME_STORAGE_KEY,
      theme
    );
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const systemThemeQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleSystemThemeChange = (
      event
    ) => {
      setSystemTheme(
        event.matches
          ? "dark"
          : "light"
      );
    };

    systemThemeQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      systemThemeQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [
      theme,
      resolvedTheme,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;