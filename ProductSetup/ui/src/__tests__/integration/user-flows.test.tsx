import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock toast
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const renderApp = (initialRoute: string = "/auth") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Business User Flow - Login to Submission", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("completes full flow: login as business user → fill product form → navigate steps", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Step 1: Login as Business User
    expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
    
    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    // Should redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    // Step 2: Fill Basic Info (Step 1)
    const productNameInput = screen.getByPlaceholderText(/enter product name/i);
    await user.type(productNameInput, "Premium Rewards Card");

    // Select Lloyds brand
    const lloydsBrand = screen.getByText("Lloyds");
    await user.click(lloydsBrand);

    // Next button should now be enabled
    const nextButton = screen.getByRole("button", { name: /next/i });
    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });

    // Step 3: Navigate to Features step
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Features")).toBeInTheDocument();
    });
  });

  it("shows My Submissions dialog for business user", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Business User
    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    // Click My Submissions button
    const mySubmissionsButton = screen.getByRole("button", { name: /my submissions/i });
    await user.click(mySubmissionsButton);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText("Track the status of your submitted product configurations")).toBeInTheDocument();
    });
  });

  it("validates form before allowing navigation", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Business User
    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    // Next button should be disabled without filling form
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();

    // Fill only product name (still missing brand)
    const productNameInput = screen.getByPlaceholderText(/enter product name/i);
    await user.type(productNameInput, "Test Product");

    // Still disabled
    expect(nextButton).toBeDisabled();

    // Select a brand
    const lloydsBrand = screen.getByText("Lloyds");
    await user.click(lloydsBrand);

    // Now enabled
    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });
  });
});

describe("Business Manager Flow - Review Submissions", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("completes flow: login as business manager → view submissions", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Business Manager
    const managerButton = screen.getByText("Review and approve product submissions").closest("button");
    await user.click(managerButton!);

    // Should see Product Submissions section
    await waitFor(() => {
      expect(screen.getByText("Product Submissions")).toBeInTheDocument();
      expect(screen.getByText("Review and approve product configurations submitted by business users")).toBeInTheDocument();
    });

    // Should NOT see product setup flow
    expect(screen.queryByText("Product Setup")).not.toBeInTheDocument();
  });

  it("business manager can see logout button and use it", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Business Manager
    const managerButton = screen.getByText("Review and approve product submissions").closest("button");
    await user.click(managerButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Submissions")).toBeInTheDocument();
    });

    // Find and click logout
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    // Should redirect back to auth page
    await waitFor(() => {
      expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
    });
  });
});

describe("Admin Flow - System Approvals", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("completes flow: login as admin → view approved submissions", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Admin
    const adminButton = screen.getByText("View approved submissions and manage system approvals").closest("button");
    await user.click(adminButton!);

    // Should see Approved Submissions section
    await waitFor(() => {
      expect(screen.getByText("Approved Submissions")).toBeInTheDocument();
      expect(screen.getByText("View approved product configurations and manage third-party system approvals")).toBeInTheDocument();
    });

    // Should NOT see product setup flow or manager submissions
    expect(screen.queryByText("Product Setup")).not.toBeInTheDocument();
    expect(screen.queryByText("Product Submissions")).not.toBeInTheDocument();
  });

  it("admin can logout and return to role selection", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // Login as Admin
    const adminButton = screen.getByText("View approved submissions and manage system approvals").closest("button");
    await user.click(adminButton!);

    await waitFor(() => {
      expect(screen.getByText("Approved Submissions")).toBeInTheDocument();
    });

    // Logout
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    // Should be back at auth page
    await waitFor(() => {
      expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
    });
  });
});

describe("Role Switching Flow", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("can switch between roles by logging out and back in", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    // First login as Business User
    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    // Logout
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
    });

    // Now login as Business Manager
    const managerButton = screen.getByText("Review and approve product submissions").closest("button");
    await user.click(managerButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Submissions")).toBeInTheDocument();
    });

    // Logout again
    const logoutButton2 = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton2);

    await waitFor(() => {
      expect(screen.getByText("Select a role to continue")).toBeInTheDocument();
    });

    // Finally login as Admin
    const adminButton = screen.getByText("View approved submissions and manage system approvals").closest("button");
    await user.click(adminButton!);

    await waitFor(() => {
      expect(screen.getByText("Approved Submissions")).toBeInTheDocument();
    });
  });
});

describe("Navigation Flow", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("back button is disabled on first step", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeDisabled();
  });

  it("can navigate forward and backward through steps", async () => {
    const user = userEvent.setup();
    renderApp("/auth");

    const businessUserButton = screen.getByText("Submit product configurations for approval").closest("button");
    await user.click(businessUserButton!);

    await waitFor(() => {
      expect(screen.getByText("Product Setup")).toBeInTheDocument();
    });

    // Fill form to enable next
    const productNameInput = screen.getByPlaceholderText(/enter product name/i);
    await user.type(productNameInput, "Test Product");
    await user.click(screen.getByText("Lloyds"));

    // Go to step 2
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText("Features")).toBeInTheDocument();
    });

    // Go back to step 1
    await user.click(screen.getByRole("button", { name: /back/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter product name/i)).toBeInTheDocument();
    });
  });
});
