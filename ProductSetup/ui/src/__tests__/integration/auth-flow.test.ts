import { mockAuthService } from "@/services/mock-auth-service";

beforeEach(() => {
  localStorage.clear();
});

describe("Authentication Flow", () => {
  it("completes signup → login → logout flow", async () => {
    // Signup
    const newUser = await mockAuthService.signup("newuser@example.com", "password123");
    expect(newUser.email).toBe("newuser@example.com");
    expect(newUser.uid).toBeDefined();

    // Logout
    await mockAuthService.logout();
    expect(mockAuthService.getCurrentUser()).toBeNull();

    // Login
    const loggedInUser = await mockAuthService.login("newuser@example.com", "password123");
    expect(loggedInUser.email).toBe("newuser@example.com");

    // Verify current user
    expect(mockAuthService.getCurrentUser()?.email).toBe("newuser@example.com");

    // Logout again
    await mockAuthService.logout();
    expect(mockAuthService.getCurrentUser()).toBeNull();
  });

  it("handles role-based login", async () => {
    // Login as admin
    const admin = await mockAuthService.loginAsRole("admin");
    expect(admin.role).toBe("admin");
    expect(admin.email).toBe("admin@lloyds.com");

    await mockAuthService.logout();

    // Login as business manager
    const manager = await mockAuthService.loginAsRole("business_manager");
    expect(manager.role).toBe("business_manager");
    expect(manager.email).toBe("manager@lloyds.com");

    await mockAuthService.logout();

    // Login as business user
    const user = await mockAuthService.loginAsRole("business_user");
    expect(user.role).toBe("business_user");
    expect(user.email).toBe("user@lloyds.com");
  });

  it("prevents duplicate signup", async () => {
    await mockAuthService.signup("duplicate@example.com", "password123");
    
    await expect(
      mockAuthService.signup("duplicate@example.com", "password456")
    ).rejects.toThrow("User already exists");
  });

  it("prevents login with wrong password", async () => {
    await mockAuthService.signup("user@example.com", "correctpassword");
    
    await expect(
      mockAuthService.login("user@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid credentials");
  });

  it("prevents login for non-existent user", async () => {
    await expect(
      mockAuthService.login("nonexistent@example.com", "password")
    ).rejects.toThrow("Invalid credentials");
  });
});

describe("User Management Flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("admin can create business users", async () => {
    // Login as admin
    const admin = await mockAuthService.loginAsRole("admin");
    
    // Create a business user
    const newUser = await mockAuthService.createUser(
      "newbusinessuser@lloyds.com",
      "password123",
      "business_user",
      admin.uid
    );

    expect(newUser.email).toBe("newbusinessuser@lloyds.com");
    expect(newUser.role).toBe("business_user");
    expect(newUser.createdBy).toBe(admin.uid);

    // Verify user appears in all users list
    const allUsers = await mockAuthService.getAllUsers();
    expect(allUsers.some((u) => u.email === "newbusinessuser@lloyds.com")).toBe(true);
  });

  it("prevents creating duplicate users", async () => {
    await mockAuthService.loginAsRole("admin");
    
    await mockAuthService.createUser(
      "duplicate@lloyds.com",
      "password123",
      "business_user",
      "admin-uid"
    );

    await expect(
      mockAuthService.createUser(
        "duplicate@lloyds.com",
        "password456",
        "business_user",
        "admin-uid"
      )
    ).rejects.toThrow("User already exists");
  });
});

describe("Activity Logging Flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("logs user activities", async () => {
    const user = await mockAuthService.loginAsRole("business_user");

    // Log some activities
    await mockAuthService.logActivity(
      user.uid,
      user.email,
      "submit_product",
      "Submitted Premium Card for review",
      "/dashboard"
    );

    await mockAuthService.logActivity(
      user.uid,
      user.email,
      "view_submissions",
      "Viewed my submissions",
      "/dashboard"
    );

    // Get all logs
    const allLogs = await mockAuthService.getActivityLogs();
    expect(allLogs.length).toBe(2);

    // Get logs for specific user
    const userLogs = await mockAuthService.getActivityLogs(user.uid);
    expect(userLogs.every((log) => log.userId === user.uid)).toBe(true);
  });

  it("orders activity logs by newest first", async () => {
    const user = await mockAuthService.loginAsRole("business_user");

    await mockAuthService.logActivity(user.uid, user.email, "action1", "First action");
    await new Promise((r) => setTimeout(r, 10));
    await mockAuthService.logActivity(user.uid, user.email, "action2", "Second action");
    await new Promise((r) => setTimeout(r, 10));
    await mockAuthService.logActivity(user.uid, user.email, "action3", "Third action");

    const logs = await mockAuthService.getActivityLogs();
    
    expect(logs[0].action).toBe("action3");
    expect(logs[1].action).toBe("action2");
    expect(logs[2].action).toBe("action1");
  });
});

describe("First User Admin Role", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("first user to signup becomes admin", async () => {
    const firstUser = await mockAuthService.signup("first@example.com", "password");
    expect(firstUser.role).toBe("admin");
  });

  it("subsequent users become business users", async () => {
    await mockAuthService.signup("first@example.com", "password");
    const secondUser = await mockAuthService.signup("second@example.com", "password");
    
    expect(secondUser.role).toBe("business_user");
  });
});
