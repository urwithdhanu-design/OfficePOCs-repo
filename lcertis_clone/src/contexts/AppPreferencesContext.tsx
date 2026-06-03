import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppTheme = "dark" | "lloyds-light";
export type ViewMode = "multi-page" | "single-page";

interface AppPreferencesContextValue {
  theme: AppTheme;
  viewMode: ViewMode;
  setTheme: (theme: AppTheme) => void;
  setViewMode: (mode: ViewMode) => void;
}

const STORAGE_KEY = "contractiq-preferences";

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function loadPreferences(): { theme: AppTheme; viewMode: ViewMode } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        theme: parsed.theme === "lloyds-light" ? "lloyds-light" : "dark",
        viewMode: parsed.viewMode === "single-page" ? "single-page" : "multi-page",
      };
    }
  } catch {
    /* ignore */
  }
  return { theme: "dark", viewMode: "multi-page" };
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", preferences.theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setTheme = (theme: AppTheme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setViewMode = (viewMode: ViewMode) => {
    setPreferences((prev) => ({ ...prev, viewMode }));
  };

  return (
    <AppPreferencesContext.Provider
      value={{ theme: preferences.theme, viewMode: preferences.viewMode, setTheme, setViewMode }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return context;
}
