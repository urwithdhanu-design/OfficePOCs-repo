import { mockAuthService } from "../mock-auth-service";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("mockAuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("getCurrentUser", () => {
    it("returns null when no user is logged in", () => {
      const result = mockAuthService.getCurrentUser();
      expect(result).toBeNull();
    });

    it("returns the current user when logged in", async () => {
      await mockAuthService.loginAsRole("business_user");
      
      const result = mockAuthService.getCurrentUser();
      expect(result).not.toBeNull();
      expect(result?.role).toBe("business_user");
    });
  });

  describe("loginAsRole", () => {
    it("logs in as business_manager", async () => {
      const user = await mockAuthService.loginAsRole("business_manager");
      
      expect(user.role).toBe("business_manager");
      expect(user.email).toBe("manager@lloyds.com");
    });

    it("logs in as business_user", async () => {
      const user = await mockAuthService.loginAsRole("business_user");
      
      expect(user.role).toBe("business_user");
      expect(user.email).toBe("user@lloyds.com");
    });

    it("generates a unique user ID", async () => {
      const user1 = await mockAuthService.loginAsRole("business_user");
      await mockAuthService.logout();
      const user2 = await mockAuthService.loginAsRole("business_user");
      
      expect(user1.uid).not.toBe(user2.uid);
    });

    it("saves the current user", async () => {
      await mockAuthService.loginAsRole("business_manager");
      
      const currentUser = mockAuthService.getCurrentUser();
      expect(currentUser).not.toBeNull();
    });
  });

  describe("signup", () => {
    it("creates a new user with admin role for first user", async () => {
      const user = await mockAuthService.signup("admin@test.com", "password123");
      
      expect(user.role).toBe("admin");
      expect(user.email).toBe("admin@test.com");
    });

    it("creates subsequent users as business_user", async () => {
      await mockAuthService.signup("admin@test.com", "password123");
      const user2 = await mockAuthService.signup("user@test.com", "password123");
      
      expect(user2.role).toBe("business_user");
    });

    it("throws error for duplicate email", async () => {
      await mockAuthService.signup("test@test.com", "password123");
      
      await expect(mockAuthService.signup("test@test.com", "password123"))
        .rejects.toThrow("User already exists");
    });

    it("generates unique user IDs", async () => {
      const user1 = await mockAuthService.signup("user1@test.com", "password123");
      const user2 = await mockAuthService.signup("user2@test.com", "password123");
      
      expect(user1.uid).not.toBe(user2.uid);
    });
  });

  describe("login", () => {
    it("logs in an existing user", async () => {
      await mockAuthService.signup("test@test.com", "password123");
      await mockAuthService.logout();
      
      const user = await mockAuthService.login("test@test.com", "password123");
      
      expect(user.email).toBe("test@test.com");
    });

    it("throws error for non-existent user", async () => {
      await expect(mockAuthService.login("nonexistent@test.com", "password"))
        .rejects.toThrow("User not found");
    });
  });

  describe("logout", () => {
    it("clears the current user", async () => {
      await mockAuthService.loginAsRole("business_user");
      expect(mockAuthService.getCurrentUser()).not.toBeNull();
      
      await mockAuthService.logout();
      
      expect(mockAuthService.getCurrentUser()).toBeNull();
    });
  });

  describe("createUser", () => {
    it("creates a new user with specified role", async () => {
      const user = await mockAuthService.createUser(
        "newuser@test.com",
        "password123",
        "business_manager",
        "admin-123"
      );
      
      expect(user.email).toBe("newuser@test.com");
      expect(user.role).toBe("business_manager");
      expect(user.createdBy).toBe("admin-123");
    });

    it("throws error for duplicate email", async () => {
      await mockAuthService.createUser("existing@test.com", "password", "business_user", "admin");
      
      await expect(
        mockAuthService.createUser("existing@test.com", "password", "business_user", "admin")
      ).rejects.toThrow("User already exists");
    });
  });

  describe("getAllUsers", () => {
    it("returns all registered users", async () => {
      await mockAuthService.signup("user1@test.com", "password");
      await mockAuthService.signup("user2@test.com", "password");
      await mockAuthService.signup("user3@test.com", "password");
      
      const users = await mockAuthService.getAllUsers();
      
      expect(users.length).toBe(3);
    });

    it("returns empty array when no users exist", async () => {
      const users = await mockAuthService.getAllUsers();
      
      expect(users).toEqual([]);
    });
  });

  describe("logActivity", () => {
    it("logs an activity entry", async () => {
      await mockAuthService.logActivity(
        "user-123",
        "test@test.com",
        "login",
        "User logged in"
      );
      
      const logs = await mockAuthService.getActivityLogs();
      
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe("login");
      expect(logs[0].userId).toBe("user-123");
    });

    it("adds new logs at the beginning", async () => {
      await mockAuthService.logActivity("user-1", "user1@test.com", "action1");
      await mockAuthService.logActivity("user-2", "user2@test.com", "action2");
      
      const logs = await mockAuthService.getActivityLogs();
      
      expect(logs[0].action).toBe("action2");
      expect(logs[1].action).toBe("action1");
    });

    it("includes optional page parameter", async () => {
      await mockAuthService.logActivity(
        "user-123",
        "test@test.com",
        "navigation",
        "Visited dashboard",
        "/dashboard"
      );
      
      const logs = await mockAuthService.getActivityLogs();
      
      expect(logs[0].page).toBe("/dashboard");
    });
  });

  describe("getActivityLogs", () => {
    it("returns all logs when no userId specified", async () => {
      await mockAuthService.logActivity("user-1", "user1@test.com", "action1");
      await mockAuthService.logActivity("user-2", "user2@test.com", "action2");
      
      const logs = await mockAuthService.getActivityLogs();
      
      expect(logs.length).toBe(2);
    });

    it("filters logs by userId when specified", async () => {
      await mockAuthService.logActivity("user-1", "user1@test.com", "action1");
      await mockAuthService.logActivity("user-2", "user2@test.com", "action2");
      await mockAuthService.logActivity("user-1", "user1@test.com", "action3");
      
      const logs = await mockAuthService.getActivityLogs("user-1");
      
      expect(logs.length).toBe(2);
      logs.forEach((log) => {
        expect(log.userId).toBe("user-1");
      });
    });
  });
});
