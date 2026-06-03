import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import * as AuthContext from "@/contexts/AuthContext";

// Mock the auth context
const mockLogout = jest.fn();
const mockGetActivityLogs = jest.fn().mockResolvedValue([]);
const mockGetAllUsers = jest.fn().mockResolvedValue([]);
const mockCreateBusinessUser = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    appUser: {
      uid: "test-user-123",
      email: "test@example.com",
      role: "business_user",
      createdAt: new Date().toISOString(),
    },
    logout: mockLogout,
    createBusinessUser: mockCreateBusinessUser,
    getAllUsers: mockGetAllUsers,
    getActivityLogs: mockGetActivityLogs,
  }),
}));

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard header with logo", () => {
    renderDashboard();
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("Lloyds Banking Group")).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    renderDashboard();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout and navigates to auth page when logout is clicked", async () => {
    const user = userEvent.setup();
    renderDashboard();
    
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  it("renders the credit card product setup section for business user", () => {
    renderDashboard();
    expect(screen.getByText("Product Setup")).toBeInTheDocument();
  });

  it("renders the product stepper", () => {
    renderDashboard();
    expect(screen.getByText("Basic Info")).toBeInTheDocument();
  });

  it("renders the Back and Next navigation buttons", () => {
    renderDashboard();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("disables Back button on first step", () => {
    renderDashboard();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("disables Next button when step is not valid", () => {
    renderDashboard();
    // On step 1, product name and brands are required
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("renders My Submissions button for business user", () => {
    renderDashboard();
    expect(screen.getByRole("button", { name: /my submissions/i })).toBeInTheDocument();
  });
});

describe("Dashboard - Business Manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override mock for business manager
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      appUser: {
        uid: "manager-123",
        email: "manager@example.com",
        role: "business_manager",
        createdAt: new Date().toISOString(),
      },
      logout: mockLogout,
      createBusinessUser: mockCreateBusinessUser,
      getAllUsers: mockGetAllUsers,
      getActivityLogs: mockGetActivityLogs,
    } as any);
  });

  it("renders Product Submissions section for business manager", () => {
    renderDashboard();
    expect(screen.getByText("Product Submissions")).toBeInTheDocument();
  });

  it("does not render product setup flow for business manager", () => {
    renderDashboard();
    expect(screen.queryByText("Product Setup")).not.toBeInTheDocument();
  });

  it("shows review description for business manager", () => {
    renderDashboard();
    expect(screen.getByText("Review and approve product configurations submitted by business users")).toBeInTheDocument();
  });
});

describe("Dashboard - Admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override mock for admin
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      appUser: {
        uid: "admin-123",
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      logout: mockLogout,
      createBusinessUser: mockCreateBusinessUser,
      getAllUsers: mockGetAllUsers,
      getActivityLogs: mockGetActivityLogs,
    } as any);
  });

  it("renders Approved Submissions section for admin", () => {
    renderDashboard();
    expect(screen.getByText("Approved Submissions")).toBeInTheDocument();
  });

  it("shows admin-specific description", () => {
    renderDashboard();
    expect(screen.getByText("View approved product configurations and manage third-party system approvals")).toBeInTheDocument();
  });

  it("does not render product setup flow for admin", () => {
    renderDashboard();
    expect(screen.queryByText("Product Setup")).not.toBeInTheDocument();
  });
});
