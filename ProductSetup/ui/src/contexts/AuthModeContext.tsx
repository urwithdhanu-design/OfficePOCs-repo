import React, { createContext, useContext, useState, useEffect } from "react";

type AuthMode = "mock" | "firebase";

interface AuthModeContextType {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  isMockMode: boolean;
}

const AUTH_MODE_KEY = "auth_mode";

const AuthModeContext = createContext<AuthModeContextType | null>(null);

export const useAuthMode = () => {
  const context = useContext(AuthModeContext);
  if (!context) {
    throw new Error("useAuthMode must be used within an AuthModeProvider");
  }
  return context;
};

export const AuthModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authMode, setAuthModeState] = useState<AuthMode>(() => {
    const stored = localStorage.getItem(AUTH_MODE_KEY);
    return (stored as AuthMode) || "mock";
  });

  const setAuthMode = (mode: AuthMode) => {
    localStorage.setItem(AUTH_MODE_KEY, mode);
    setAuthModeState(mode);
    // Force reload to reinitialize auth with new mode
    window.location.reload();
  };

  return (
    <AuthModeContext.Provider value={{ authMode, setAuthMode, isMockMode: authMode === "mock" }}>
      {children}
    </AuthModeContext.Provider>
  );
};
