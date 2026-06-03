import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Index from "../Index";

// Mock the toast hook
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the product history hook
const mockAddAuditEntry = jest.fn();
const mockSaveVersion = jest.fn();
const mockGetVersion = jest.fn();
const mockExportAuditTrail = jest.fn();

jest.mock("@/hooks/useProductHistory", () => ({
  useProductHistory: () => ({
    auditTrail: [],
    versions: [],
    addAuditEntry: mockAddAuditEntry,
    saveVersion: mockSaveVersion,
    getVersion: mockGetVersion,
    exportAuditTrail: mockExportAuditTrail,
  }),
}));

const renderIndex = () => {
  return render(
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  );
};

describe("Index Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page header with title", () => {
    renderIndex();
    expect(screen.getByText("Product Setup")).toBeInTheDocument();
    expect(screen.getByText("Configure your credit card products")).toBeInTheDocument();
  });

  it("renders the credit card icon in header", () => {
    renderIndex();
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders the Admin link button", () => {
    renderIndex();
    expect(screen.getByRole("link", { name: /admin/i })).toBeInTheDocument();
  });

  it("renders the Save Version button", () => {
    renderIndex();
    expect(screen.getByRole("button", { name: /save version/i })).toBeInTheDocument();
  });

  it("renders the product stepper on step 1", () => {
    renderIndex();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("renders Back and Next navigation buttons", () => {
    renderIndex();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("disables Back button on first step", () => {
    renderIndex();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("disables Next button when form is not valid", () => {
    renderIndex();
    // Product name and brands are required on step 1
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("shows Save Version toast when button is clicked", async () => {
    const user = userEvent.setup();
    renderIndex();
    
    const saveButton = screen.getByRole("button", { name: /save version/i });
    await user.click(saveButton);
    
    expect(mockSaveVersion).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: "Version Saved",
      description: "Current configuration has been saved as a new version.",
    });
  });

  it("renders BasicInfoStep on step 1", () => {
    renderIndex();
    expect(screen.getByText("Product Name")).toBeInTheDocument();
  });

  it("renders CreditCardPreview component", () => {
    renderIndex();
    expect(screen.getByText("Card Preview")).toBeInTheDocument();
  });

  it("Admin link points to /admin route", () => {
    renderIndex();
    const adminLink = screen.getByRole("link", { name: /admin/i });
    expect(adminLink).toHaveAttribute("href", "/admin");
  });
});

describe("Index Page - Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enables Next button when product name and brand are filled", async () => {
    const user = userEvent.setup();
    renderIndex();
    
    // Fill in product name
    const productNameInput = screen.getByPlaceholderText(/enter product name/i);
    await user.type(productNameInput, "Test Product");
    
    // Select a brand
    const lloydsBrand = screen.getByText("Lloyds");
    await user.click(lloydsBrand);
    
    // Next button should be enabled
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });
  });
});
