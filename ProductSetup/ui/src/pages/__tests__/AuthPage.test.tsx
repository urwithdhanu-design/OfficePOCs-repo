import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AuthPage from "../AuthPage";
import * as AuthContext from "@/contexts/AuthContext";

const mockLoginAsRole = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    loginAsRole: mockLoginAsRole,
    appUser: null,
    loading: false,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderAuthPage = () => {
  return render(
    <BrowserRouter>
      <AuthPage />
    </BrowserRouter>
  );
};

describe("AuthPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Lloyds Banking Group title", () => {
    renderAuthPage();
    expect(screen.getByText("Lloyds Banking Group")).toBeInTheDocument();
  });

  it("renders the Product Setup Portal subtitle", () => {
    renderAuthPage();
    expect(screen.getByText("Product Setup Portal")).toBeInTheDocument();
  });

  it("renders the logo with L", () => {
    renderAuthPage();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("renders the role selection prompt", () => {
    renderAuthPage();
    expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
  });

  it("renders the Admin option", () => {
    renderAuthPage();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("View approved submissions and manage system approvals")).toBeInTheDocument();
  });

  it("renders the Business Manager option", () => {
    renderAuthPage();
    expect(screen.getByText("Business Manager")).toBeInTheDocument();
    expect(screen.getByText("Review and approve product submissions")).toBeInTheDocument();
  });

  it("renders the Business User option", () => {
    renderAuthPage();
    expect(screen.getByText("Business User")).toBeInTheDocument();
    expect(screen.getByText("Submit product configurations for approval")).toBeInTheDocument();
  });

  it("renders the Admin badge", () => {
    renderAuthPage();
    const badges = screen.getAllByText("Admin");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Manager badge", () => {
    renderAuthPage();
    expect(screen.getByText("Manager")).toBeInTheDocument();
  });

  it("renders the User badge", () => {
    renderAuthPage();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("calls loginAsRole with admin when clicking Admin", async () => {
    const user = userEvent.setup();
    renderAuthPage();
    
    const adminButton = screen.getByText("View approved submissions and manage system approvals").closest("button");
    await user.click(adminButton!);
    
    expect(mockLoginAsRole).toHaveBeenCalledWith("admin");
  });

  it("calls loginAsRole with business_manager when clicking Business Manager", async () => {
    const user = userEvent.setup();
    renderAuthPage();
    
    const managerButton = screen.getByText("Review and approve product submissions").closest("button");
    await user.click(managerButton!);
    
    expect(mockLoginAsRole).toHaveBeenCalledWith("business_manager");
  });

  it("calls loginAsRole with business_user when clicking Business User", async () => {
    const user = userEvent.setup();
    renderAuthPage();
    
    const userButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(userButton!);
    
    expect(mockLoginAsRole).toHaveBeenCalledWith("business_user");
  });

  it("navigates to dashboard after selecting a role", async () => {
    const user = userEvent.setup();
    renderAuthPage();
    
    const adminButton = screen.getByText("View approved submissions and manage system approvals").closest("button");
    await user.click(adminButton!);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("renders three role selection buttons", () => {
    renderAuthPage();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });
});

describe("AuthPage - Loading State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      loginAsRole: mockLoginAsRole,
      appUser: null,
      loading: true,
    } as any);
  });

  it("shows loading spinner when auth is loading", () => {
    const { container } = renderAuthPage();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not render role selection during loading", () => {
    renderAuthPage();
    expect(screen.queryByText("Select a role to continue")).not.toBeInTheDocument();
  });
});

describe("AuthPage - Already Logged In", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, "useAuth").mockReturnValue({
      loginAsRole: mockLoginAsRole,
      appUser: {
        uid: "user-123",
        email: "test@example.com",
        role: "business_user",
        createdAt: new Date().toISOString(),
      },
      loading: false,
    } as any);
  });

  it("redirects to dashboard when user is already logged in", () => {
    renderAuthPage();
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("does not render the login UI when logged in", () => {
    renderAuthPage();
    expect(screen.queryByText("Select a role to continue")).not.toBeInTheDocument();
  });
});
