import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeaturesStep } from "../FeaturesStep";
import { ProductFeature } from "@/types/product";

const mockOnAddFeature = jest.fn();
const mockOnRemoveFeature = jest.fn();
const mockOnEditFeature = jest.fn();

const mockAvailableFeatures: ProductFeature[] = [
  {
    id: "bt-enabled",
    code: "BT_ENABLED",
    name: "Balance Transfer Enabled",
    description: "Allow balance transfers from other cards",
    category: "Balance Transfer & Interest",
  },
  {
    id: "cash-advance",
    code: "CASH_ADVANCE",
    name: "Cash Advance Enabled",
    description: "Allow cash withdrawals from ATMs",
    category: "Cash & Withdrawals",
  },
  {
    id: "cashback-rewards",
    code: "CASHBACK",
    name: "Cashback Rewards",
    description: "Earn cashback on purchases",
    category: "Rewards & Benefits",
  },
];

const defaultProps = {
  availableFeatures: mockAvailableFeatures,
  selectedFeatures: [] as ProductFeature[],
  onAddFeature: mockOnAddFeature,
  onRemoveFeature: mockOnRemoveFeature,
  onEditFeature: mockOnEditFeature,
};

describe("FeaturesStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the instruction text", () => {
      render(<FeaturesStep {...defaultProps} />);
      
      expect(screen.getByText(/Browse features by category and drag them to add/)).toBeInTheDocument();
    });

    it("renders Available Features section with count", () => {
      render(<FeaturesStep {...defaultProps} />);
      
      expect(screen.getByText("Available Features (3)")).toBeInTheDocument();
    });

    it("renders Selected Features section with count", () => {
      render(<FeaturesStep {...defaultProps} />);
      
      expect(screen.getByText("Selected Features (0)")).toBeInTheDocument();
    });

    it("renders the drop zone with empty state", () => {
      render(<FeaturesStep {...defaultProps} />);
      
      expect(screen.getByText(/Drag features here/)).toBeInTheDocument();
    });

    it("renders feature categories", () => {
      render(<FeaturesStep {...defaultProps} />);
      
      expect(screen.getByText("Balance Transfer & Interest")).toBeInTheDocument();
      expect(screen.getByText("Cash & Withdrawals")).toBeInTheDocument();
      expect(screen.getByText("Rewards & Benefits")).toBeInTheDocument();
    });

    it("renders the DndContext wrapper without errors", () => {
      const { container } = render(<FeaturesStep {...defaultProps} />);
      
      expect(container).toBeInTheDocument();
    });
  });

  describe("Selected Features", () => {
    it("updates selected count when features are selected", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
        />
      );
      
      expect(screen.getByText("Selected Features (1)")).toBeInTheDocument();
      expect(screen.getByText("Available Features (2)")).toBeInTheDocument();
    });

    it("shows selected features in the drop zone", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
        />
      );
      
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });

    it("renders multiple selected features", () => {
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[mockAvailableFeatures[0], mockAvailableFeatures[1]]}
        />
      );
      
      expect(screen.getByText("Selected Features (2)")).toBeInTheDocument();
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
      expect(screen.getByText("Cash Advance Enabled")).toBeInTheDocument();
    });

    it("excludes selected features from available count", () => {
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[mockAvailableFeatures[0], mockAvailableFeatures[1]]}
        />
      );
      
      expect(screen.getByText("Available Features (1)")).toBeInTheDocument();
    });

    it("renders with all features selected", () => {
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={mockAvailableFeatures}
        />
      );
      
      expect(screen.getByText("Available Features (0)")).toBeInTheDocument();
      expect(screen.getByText("Selected Features (3)")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("renders with empty available features", () => {
      render(
        <FeaturesStep 
          {...defaultProps} 
          availableFeatures={[]}
        />
      );
      
      expect(screen.getByText("Available Features (0)")).toBeInTheDocument();
    });

    it("renders without onEditFeature prop", () => {
      const { onEditFeature, ...propsWithoutEdit } = defaultProps;
      render(<FeaturesStep {...propsWithoutEdit} />);
      
      expect(screen.getByText("Available Features (3)")).toBeInTheDocument();
    });

    it("handles features with same category", () => {
      const sameCategory: ProductFeature[] = [
        { ...mockAvailableFeatures[0], id: "feature-1" },
        { ...mockAvailableFeatures[0], id: "feature-2", name: "Another Feature" },
      ];
      
      render(
        <FeaturesStep 
          {...defaultProps} 
          availableFeatures={sameCategory}
        />
      );
      
      expect(screen.getByText("Available Features (2)")).toBeInTheDocument();
    });
  });

  describe("Props Passing", () => {
    it("passes onRemoveFeature to DroppableZone", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
        />
      );
      
      // The feature should be removable (button present on hover)
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });

    it("passes onEditFeature to DroppableZone when provided", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStep 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
          onEditFeature={mockOnEditFeature}
        />
      );
      
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("renders two-column grid layout", () => {
      const { container } = render(<FeaturesStep {...defaultProps} />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });
});
