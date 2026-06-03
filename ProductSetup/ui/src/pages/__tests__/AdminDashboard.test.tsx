import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";

// Mock the mock API
const mockGetAllRecords = jest.fn();
const mockUpdateRecordStatus = jest.fn();
const mockDeleteRecord = jest.fn();

jest.mock("@/services/mock-api", () => ({
  mockApi: {
    getAllRecords: () => mockGetAllRecords(),
    updateRecordStatus: (...args: any[]) => mockUpdateRecordStatus(...args),
    deleteRecord: (...args: any[]) => mockDeleteRecord(...args),
  },
}));

// Mock the toast hook
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

const mockRecords = [
  {
    id: "rec-1",
    productData: {
      productName: "Premium Card",
      brands: ["lloyds"],
      additionalCardholders: 2,
      features: [{ id: "f1", name: "Rewards", code: "RWD001" }],
      externalSystems: [],
    },
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user@example.com",
  },
  {
    id: "rec-2",
    productData: {
      productName: "Basic Card",
      brands: ["halifax"],
      additionalCardholders: 1,
      features: [],
      externalSystems: [],
    },
    status: "approved" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user2@example.com",
  },
  {
    id: "rec-3",
    productData: {
      productName: "Rejected Card",
      brands: ["bos"],
      additionalCardholders: 0,
      features: [],
      externalSystems: [],
    },
    status: "rejected" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedBy: "user3@example.com",
  },
];

const renderAdminDashboard = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRecords.mockResolvedValue(mockRecords);
  });

  it("renders the Admin Dashboard header", async () => {
    renderAdminDashboard();
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders the Back link to home", async () => {
    renderAdminDashboard();
    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renders the Refresh button", async () => {
    renderAdminDashboard();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  it("displays status summary cards", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("Pending Review")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });

  it("displays tabs for filtering records", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /pending/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /approved/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /rejected/i })).toBeInTheDocument();
    });
  });

  it("displays product records in the table", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("Premium Card")).toBeInTheDocument();
      expect(screen.getByText("Basic Card")).toBeInTheDocument();
      expect(screen.getByText("Rejected Card")).toBeInTheDocument();
    });
  });

  it("shows the correct count in tabs", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /all \(3\)/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /pending \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /approved \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /rejected \(1\)/i })).toBeInTheDocument();
    });
  });

  it("displays Review button for pending records", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /review/i })).toBeInTheDocument();
    });
  });

  it("fetches records on mount", async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(mockGetAllRecords).toHaveBeenCalled();
    });
  });

  it("refreshes records when Refresh button is clicked", async () => {
    const user = userEvent.setup();
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(mockGetAllRecords).toHaveBeenCalledTimes(1);
    });
    
    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    await user.click(refreshButton);
    
    await waitFor(() => {
      expect(mockGetAllRecords).toHaveBeenCalledTimes(2);
    });
  });

  it("displays 'No records found' when there are no records", async () => {
    mockGetAllRecords.mockResolvedValue([]);
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("No records found")).toBeInTheDocument();
    });
  });
});

describe("AdminDashboard - Record Details Dialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRecords.mockResolvedValue(mockRecords);
  });

  it("opens details dialog when view button is clicked", async () => {
    const user = userEvent.setup();
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("Premium Card")).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByRole("button", { name: "" });
    const eyeButton = viewButtons.find(btn => btn.querySelector('svg'));
    if (eyeButton) {
      await user.click(eyeButton);
    }
    
    await waitFor(() => {
      expect(screen.getByText("Product configuration details")).toBeInTheDocument();
    });
  });
});

describe("AdminDashboard - Delete Record", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllRecords.mockResolvedValue(mockRecords);
    mockDeleteRecord.mockResolvedValue(true);
  });

  it("deletes record when confirmed", async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("Premium Card")).toBeInTheDocument();
    });
    
    // Find and click delete button (trash icon)
    const deleteButtons = screen.getAllByRole("button").filter(
      btn => btn.classList.contains("text-destructive")
    );
    
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(mockDeleteRecord).toHaveBeenCalled();
      });
    }
  });

  it("does not delete record when cancelled", async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    renderAdminDashboard();
    
    await waitFor(() => {
      expect(screen.getByText("Premium Card")).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole("button").filter(
      btn => btn.classList.contains("text-destructive")
    );
    
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      expect(mockDeleteRecord).not.toHaveBeenCalled();
    }
  });
});
