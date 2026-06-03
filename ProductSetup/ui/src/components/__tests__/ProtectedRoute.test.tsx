import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

const mockUseAuth = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const TestComponent = () => <div>Protected Content</div>;
const AuthPage = () => <div>Auth Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;

const renderWithRouter = (initialRoute: string, allowedRoles?: ("admin" | "business_manager" | "business_user")[]) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      appUser: null,
      loading: true,
    });

    const { container } = renderWithRouter("/protected");
    
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects to auth page when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      appUser: null,
      loading: false,
    });

    renderWithRouter("/protected");
    
    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("renders protected content when authenticated", () => {
    mockUseAuth.mockReturnValue({
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "business_user",
      },
      loading: false,
    });

    renderWithRouter("/protected");
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to dashboard when user role is not allowed", () => {
    mockUseAuth.mockReturnValue({
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "business_user",
      },
      loading: false,
    });

    renderWithRouter("/protected", ["admin"]);
    
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("allows access when user role is in allowed roles", () => {
    mockUseAuth.mockReturnValue({
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "admin",
      },
      loading: false,
    });

    renderWithRouter("/protected", ["admin"]);
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("allows access when multiple roles are allowed", () => {
    mockUseAuth.mockReturnValue({
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "business_manager",
      },
      loading: false,
    });

    renderWithRouter("/protected", ["admin", "business_manager"]);
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("allows access without allowedRoles restriction", () => {
    mockUseAuth.mockReturnValue({
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "business_user",
      },
      loading: false,
    });

    renderWithRouter("/protected"); // No allowedRoles specified
    
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
