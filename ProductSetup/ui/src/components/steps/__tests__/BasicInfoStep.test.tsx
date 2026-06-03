import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BasicInfoStep } from "../BasicInfoStep";

const mockOnProductNameChange = jest.fn();
const mockOnBrandsChange = jest.fn();

const defaultProps = {
  productName: "",
  brands: [] as ("lloyds" | "halifax" | "bos" | "mbna")[],
  onProductNameChange: mockOnProductNameChange,
  onBrandsChange: mockOnBrandsChange,
};

describe("BasicInfoStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the product name input", () => {
    render(<BasicInfoStep {...defaultProps} />);
    
    expect(screen.getByLabelText("Product Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter product name")).toBeInTheDocument();
  });

  it("renders all brand checkboxes", () => {
    render(<BasicInfoStep {...defaultProps} />);
    
    expect(screen.getByText("Lloyds")).toBeInTheDocument();
    expect(screen.getByText("Halifax")).toBeInTheDocument();
    expect(screen.getByText("Bank of Scotland")).toBeInTheDocument();
    expect(screen.getByText("MBNA")).toBeInTheDocument();
  });

  it("calls onProductNameChange when typing in product name input", async () => {
    const user = userEvent.setup();
    render(<BasicInfoStep {...defaultProps} />);
    
    const input = screen.getByPlaceholderText("Enter product name");
    await user.type(input, "T");
    
    expect(mockOnProductNameChange).toHaveBeenCalledWith("T");
  });

  it("displays the current product name value", () => {
    render(<BasicInfoStep {...defaultProps} productName="Test Product" />);
    
    expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
  });

  it("shows validation message when no brands are selected", () => {
    render(<BasicInfoStep {...defaultProps} brands={[]} />);
    
    expect(screen.getByText("Please select at least one brand")).toBeInTheDocument();
  });

  it("does not show validation message when brands are selected", () => {
    render(<BasicInfoStep {...defaultProps} brands={["lloyds"]} />);
    
    expect(screen.queryByText("Please select at least one brand")).not.toBeInTheDocument();
  });

  it("calls onBrandsChange when checking a brand", async () => {
    const user = userEvent.setup();
    render(<BasicInfoStep {...defaultProps} brands={[]} />);
    
    // Click on Lloyds checkbox (the label contains the checkbox)
    const lloydsLabel = screen.getByText("Lloyds").closest("label");
    const checkbox = lloydsLabel?.querySelector('[role="checkbox"]');
    
    if (checkbox) {
      await user.click(checkbox);
      expect(mockOnBrandsChange).toHaveBeenCalledWith(["lloyds"]);
    }
  });

  it("calls onBrandsChange with removed brand when unchecking", async () => {
    const user = userEvent.setup();
    render(<BasicInfoStep {...defaultProps} brands={["lloyds", "halifax"]} />);
    
    const lloydsLabel = screen.getByText("Lloyds").closest("label");
    const checkbox = lloydsLabel?.querySelector('[role="checkbox"]');
    
    if (checkbox) {
      await user.click(checkbox);
      expect(mockOnBrandsChange).toHaveBeenCalledWith(["halifax"]);
    }
  });

  it("renders brands section with label", () => {
    render(<BasicInfoStep {...defaultProps} />);
    
    expect(screen.getByText("Product Brands")).toBeInTheDocument();
  });

  it("shows checked state for selected brands", () => {
    render(<BasicInfoStep {...defaultProps} brands={["lloyds", "mbna"]} />);
    
    const lloydsCheckbox = screen.getByText("Lloyds").closest("label")?.querySelector('[role="checkbox"]');
    const mbnaCheckbox = screen.getByText("MBNA").closest("label")?.querySelector('[role="checkbox"]');
    const halifaxCheckbox = screen.getByText("Halifax").closest("label")?.querySelector('[role="checkbox"]');
    
    expect(lloydsCheckbox).toHaveAttribute("data-state", "checked");
    expect(mbnaCheckbox).toHaveAttribute("data-state", "checked");
    expect(halifaxCheckbox).toHaveAttribute("data-state", "unchecked");
  });
});
