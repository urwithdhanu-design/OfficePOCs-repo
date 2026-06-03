import { AppUser, UserRole, ActivityLog } from "@/types/user";

const MOCK_USERS_KEY = "mock_users";
const MOCK_CURRENT_USER_KEY = "mock_current_user";
const MOCK_ACTIVITY_KEY = "mock_activity_logs";

const getStoredUsers = (): AppUser[] => {
  const data = localStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: AppUser[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getStoredCurrentUser = (): AppUser | null => {
  const data = localStorage.getItem(MOCK_CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

const saveCurrentUser = (user: AppUser | null) => {
  if (user) {
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  }
};

const getStoredActivityLogs = (): ActivityLog[] => {
  const data = localStorage.getItem(MOCK_ACTIVITY_KEY);
  return data ? JSON.parse(data) : [];
};

const saveActivityLogs = (logs: ActivityLog[]) => {
  localStorage.setItem(MOCK_ACTIVITY_KEY, JSON.stringify(logs));
};

const generateId = () => `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const mockAuthService = {
  getCurrentUser: (): AppUser | null => {
    return getStoredCurrentUser();
  },

  loginAsRole: async (role: UserRole): Promise<AppUser> => {
    await new Promise((r) => setTimeout(r, 100));
    
    const email = role === "business_manager" ? "manager@lloyds.com" : "user@lloyds.com";
    const user: AppUser = {
      uid: `mock_${role}_${Date.now()}`,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    
    saveCurrentUser(user);
    return user;
  },

  login: async (email: string, password: string): Promise<AppUser> => {
    await new Promise((r) => setTimeout(r, 300));
    const users = getStoredUsers();
    const user = users.find((u) => u.email === email);
    
    if (!user) {
      throw new Error("User not found. Please sign up first.");
    }
    
    saveCurrentUser(user);
    return user;
  },

  signup: async (email: string, password: string): Promise<AppUser> => {
    await new Promise((r) => setTimeout(r, 300));
    const users = getStoredUsers();
    
    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const isFirst = users.length === 0;
    const role: UserRole = isFirst ? "admin" : "business_user";
    
    const newUser: AppUser = {
      uid: generateId(),
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser);
    
    return newUser;
  },

  logout: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 100));
    saveCurrentUser(null);
  },

  createUser: async (email: string, password: string, role: UserRole, createdBy: string): Promise<AppUser> => {
    await new Promise((r) => setTimeout(r, 300));
    const users = getStoredUsers();
    
    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser: AppUser = {
      uid: generateId(),
      email,
      role,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    users.push(newUser);
    saveUsers(users);
    
    return newUser;
  },

  getAllUsers: async (): Promise<AppUser[]> => {
    await new Promise((r) => setTimeout(r, 100));
    return getStoredUsers();
  },

  logActivity: async (userId: string, userEmail: string, action: string, details?: string, page?: string): Promise<void> => {
    const logs = getStoredActivityLogs();
    const newLog: ActivityLog = {
      id: generateId(),
      userId,
      userEmail,
      action,
      details,
      page,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    saveActivityLogs(logs.slice(0, 1000)); // Keep last 1000 logs
  },

  getActivityLogs: async (userId?: string): Promise<ActivityLog[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const logs = getStoredActivityLogs();
    if (userId) {
      return logs.filter((log) => log.userId === userId);
    }
    return logs;
  },
};
