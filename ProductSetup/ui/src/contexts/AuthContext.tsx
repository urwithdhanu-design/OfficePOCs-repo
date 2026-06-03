import React, { createContext, useContext, useEffect, useState } from "react";
import { AppUser, UserRole } from "@/types/user";
import { mockAuthService } from "@/services/mock-auth-service";

interface AuthContextType {
  currentUser: null;
  appUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsRole: (role: UserRole) => Promise<void>;
  createBusinessUser: (email: string, password: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<AppUser[]>;
  getActivityLogs: (userId?: string) => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUser = mockAuthService.getCurrentUser();
    setAppUser(mockUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const user = await mockAuthService.login(email, password);
    setAppUser(user);
    await mockAuthService.logActivity(user.uid, email, "login", "User logged in");
  };

  const signup = async (email: string, password: string) => {
    const user = await mockAuthService.signup(email, password);
    setAppUser(user);
    await mockAuthService.logActivity(user.uid, email, "signup", `User registered as ${user.role}`);
  };

  const loginAsRole = async (role: UserRole) => {
    const user = await mockAuthService.loginAsRole(role);
    setAppUser(user);
    await mockAuthService.logActivity(user.uid, user.email, "login", `Logged in as ${role}`);
  };

  const logout = async () => {
    if (appUser) {
      await mockAuthService.logActivity(appUser.uid, appUser.email, "logout", "User logged out");
    }
    await mockAuthService.logout();
    setAppUser(null);
  };

  const createBusinessUser = async (email: string, password: string, role: UserRole) => {
    if (!appUser || (appUser.role !== "admin" && appUser.role !== "business_manager")) {
      throw new Error("Unauthorized to create users");
    }

    if (appUser.role === "business_manager" && role === "business_manager") {
      throw new Error("Business managers cannot create other business managers");
    }

    await mockAuthService.createUser(email, password, role, appUser.uid);
    await mockAuthService.logActivity(appUser.uid, appUser.email, "create_user", `Created ${role}: ${email}`);
  };

  const getAllUsers = async (): Promise<AppUser[]> => {
    return mockAuthService.getAllUsers();
  };

  const getActivityLogs = async (userId?: string) => {
    return mockAuthService.getActivityLogs(userId);
  };

  const value: AuthContextType = {
    currentUser: null,
    appUser,
    loading,
    login,
    signup,
    logout,
    loginAsRole,
    createBusinessUser,
    getAllUsers,
    getActivityLogs,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
