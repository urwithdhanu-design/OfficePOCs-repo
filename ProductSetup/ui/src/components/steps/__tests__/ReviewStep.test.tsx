import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewStep } from "../ReviewStep";
import { ProductData, EXTERNAL_SYSTEMS } from "@/types/product";
import * as mockApiModule from "@/services/mock-api";
import * as csvExportModule from "@/utils/csv-export";

// Mock the dependencies
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("@/services/mock-api", () => ({
  mockApi: {
    submitProduct: jest.fn().mockResolvedValue({ id: "test-id" }),
    getSubmittedRecords: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/services/mock-auth-service", () => ({
  mockAuthService: {
    logActivity: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/utils/csv-export", () => ({
  exportToCSV: jest.fn(),
}));

const mockProductData: ProductData = {
  productName: "Test Gold Card",
  brands: ["lloyds", "halifax"],
  additionalCardholders: 0,
  features: [
    {
      id: "cashback",
      code: "CASHBACK",
      name: "Cashback Rewards",
      description: "Earn cashback",
      category: "Rewards",
    },
    {
      id: "travel-ins",
      code: "TRAVEL_INS",
      name: "Travel Insurance",
      description: "Travel coverage",
      category: "Insurance",
    },
  ],
  externalSystems: EXTERNAL_SYSTEMS.map((system, index) => ({
    system,
    id: index < 3 ? `SYS${index}` : "",
    name: index < 3 ? `System ${index}` : "",
  })),
};

const defaultProps = {
  productData: mockProductData,
  userId: "user-123",
  userEmail: "test@example.com",
  userRole: "business_user" as const,
};

describe("ReviewStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the product configuration complete heading", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("Product Configuration Complete")).toBeInTheDocument();
    expect(screen.getByText("Review and submit for approval")).toBeInTheDocument();
  });

  it("displays the product summary with product name", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("Product Summary")).toBeInTheDocument();
    expect(screen.getByText("Test Gold Card")).toBeInTheDocument();
  });

  it("displays brand names correctly", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("Lloyds, Halifax")).toBeInTheDocument();
  });

  it("displays features count", () => {
    render(<ReviewStep {...defaultProps} />);
    
    // The product has 2 features
    const featuresCount = screen.getAllByText("2");
    expect(featuresCount.length).toBeGreaterThan(0);
  });

  it("displays external systems mapped count", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("3 mapped")).toBeInTheDocument();
  });

  it("renders the Submit for Review button", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: /submit for review/i })).toBeInTheDocument();
  });

  it("renders the CSV export button", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: /csv/i })).toBeInTheDocument();
  });

  it("renders the JSON export button", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: /json/i })).toBeInTheDocument();
  });

  it("renders the tabs for Review and Submissions", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByRole("tab", { name: /review/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /submissions/i })).toBeInTheDocument();
  });

  it("shows configured features section", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("Configured Features")).toBeInTheDocument();
    expect(screen.getByText("Cashback Rewards")).toBeInTheDocument();
    expect(screen.getByText("Travel Insurance")).toBeInTheDocument();
  });

  it("shows external systems section when systems are mapped", () => {
    render(<ReviewStep {...defaultProps} />);
    
    expect(screen.getByText("External Systems")).toBeInTheDocument();
  });

  it("handles submit button click", async () => {
    const user = userEvent.setup();
    const { mockApi } = mockApiModule;
    
    render(<ReviewStep {...defaultProps} />);
    
    const submitButton = screen.getByRole("button", { name: /submit for review/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockApi.submitProduct).toHaveBeenCalledWith(
        mockProductData,
        "user-123",
        "test@example.com"
      );
    });
  });

  it("disables submit button after submission", async () => {
    const user = userEvent.setup();
    render(<ReviewStep {...defaultProps} />);
    
    const submitButton = screen.getByRole("button", { name: /submit for review/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submitted for review/i })).toBeDisabled();
    });
  });

  it("shows View button after successful submission", async () => {
    const user = userEvent.setup();
    render(<ReviewStep {...defaultProps} />);
    
    const submitButton = screen.getByRole("button", { name: /submit for review/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
    });
  });

  it("handles Export CSV button click", async () => {
    const user = userEvent.setup();
    const { exportToCSV } = csvExportModule;
    
    render(<ReviewStep {...defaultProps} />);
    
    const exportButton = screen.getByRole("button", { name: /csv/i });
    await user.click(exportButton);
    
    expect(exportToCSV).toHaveBeenCalledWith(mockProductData);
  });

  it("does not show configured features section when no features", () => {
    const emptyFeaturesData = { ...mockProductData, features: [] };
    render(<ReviewStep {...defaultProps} productData={emptyFeaturesData} />);
    
    expect(screen.queryByText("Configured Features")).not.toBeInTheDocument();
  });

  it("does not show external systems section when none mapped", () => {
    const noSystemsData = {
      ...mockProductData,
      externalSystems: EXTERNAL_SYSTEMS.map((system) => ({ system, id: "", name: "" })),
    };
    render(<ReviewStep {...defaultProps} productData={noSystemsData} />);
    
    // Should show "0 mapped" in summary
    expect(screen.getByText("0 mapped")).toBeInTheDocument();
  });
});
