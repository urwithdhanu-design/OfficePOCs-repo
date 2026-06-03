import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeaturesStepCompact } from "../FeaturesStepCompact";
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
  {
    id: "bt-fee",
    code: "BT_FEE",
    name: "Balance Transfer Fee",
    description: "Fee for balance transfers",
    category: "Balance Transfer & Interest",
  },
];

const defaultProps = {
  availableFeatures: mockAvailableFeatures,
  selectedFeatures: [] as ProductFeature[],
  productData: {
    productName: "Test Product",
    brands: ["lloyds" as const],
    additionalCardholders: 0,
    features: [] as ProductFeature[],
    externalSystems: [],
  },
  onAddFeature: mockOnAddFeature,
  onRemoveFeature: mockOnRemoveFeature,
  onEditFeature: mockOnEditFeature,
};

describe("FeaturesStepCompact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url: string) => {
      const path = typeof url === "string" ? url : "";
      const body =
        path.includes("benchmark")
          ? {
              summary: "Test benchmark",
              overallScore: 50,
              competitors: [],
              commonGaps: [],
              engine: "rules",
            }
          : { recommendations: [], summary: "", engine: "rules" };
      return Promise.resolve({ ok: true, json: async () => body });
    }) as jest.Mock;
  });

  describe("Rendering", () => {
    it("renders Available Features header with count", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      expect(screen.getByText("Available Features (4)")).toBeInTheDocument();
    });

    it("renders Selected Features header with count", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      expect(screen.getByText("Selected Features (0)")).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      expect(screen.getByPlaceholderText("Search features...")).toBeInTheDocument();
    });

    it("renders accordion for categories", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      expect(screen.getByText("Balance Transfer & Interest")).toBeInTheDocument();
      expect(screen.getByText("Cash & Withdrawals")).toBeInTheDocument();
      expect(screen.getByText("Rewards & Benefits")).toBeInTheDocument();
    });

    it("shows category count badges", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      // Balance Transfer & Interest has 2 features
      const btCategory = screen.getByText("Balance Transfer & Interest").closest('button');
      expect(btCategory).toBeInTheDocument();
    });

    it("renders the DndContext wrapper without errors", () => {
      const { container } = render(<FeaturesStepCompact {...defaultProps} />);
      
      expect(container).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters features by name when searching", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "Balance");
      
      // Count should update to show only matching features
      expect(screen.getByText("Available Features (2)")).toBeInTheDocument();
    });

    it("filters features by description when searching", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "ATM");
      
      expect(screen.getByText("Available Features (1)")).toBeInTheDocument();
    });

    it("filters features by code when searching", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "CASHBACK");
      
      expect(screen.getByText("Available Features (1)")).toBeInTheDocument();
    });

    it("shows no results message when search has no matches", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "nonexistent");
      
      expect(screen.getByText("Available Features (0)")).toBeInTheDocument();
    });

    it("clears search and shows all features", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "Balance");
      expect(screen.getByText("Available Features (2)")).toBeInTheDocument();
      
      await user.clear(searchInput);
      expect(screen.getByText("Available Features (4)")).toBeInTheDocument();
    });
  });

  describe("Selected Features", () => {
    it("updates selected count when features are selected", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
        />
      );
      
      expect(screen.getByText("Selected Features (1)")).toBeInTheDocument();
      expect(screen.getByText("Available Features (3)")).toBeInTheDocument();
    });

    it("shows selected features in the drop zone", () => {
      const selectedFeature = mockAvailableFeatures[0];
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          selectedFeatures={[selectedFeature]}
        />
      );
      
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });

    it("renders multiple selected features", () => {
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          selectedFeatures={[mockAvailableFeatures[0], mockAvailableFeatures[1]]}
        />
      );
      
      expect(screen.getByText("Selected Features (2)")).toBeInTheDocument();
    });

    it("excludes selected features from available count", () => {
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          selectedFeatures={mockAvailableFeatures.slice(0, 2)}
        />
      );
      
      expect(screen.getByText("Available Features (2)")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("renders with empty available features", () => {
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          availableFeatures={[]}
        />
      );
      
      expect(screen.getByText("Available Features (0)")).toBeInTheDocument();
    });

    it("renders without onEditFeature prop", () => {
      const { onEditFeature, ...propsWithoutEdit } = defaultProps;
      render(<FeaturesStepCompact {...propsWithoutEdit} />);
      
      expect(screen.getByText("Available Features (4)")).toBeInTheDocument();
    });

    it("handles all features selected", () => {
      render(
        <FeaturesStepCompact 
          {...defaultProps} 
          selectedFeatures={mockAvailableFeatures}
        />
      );
      
      expect(screen.getByText("Available Features (0)")).toBeInTheDocument();
      expect(screen.getByText("Selected Features (4)")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("renders two-column grid layout", () => {
      const { container } = render(<FeaturesStepCompact {...defaultProps} />);
      
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-2');
    });

    it("renders compact DroppableZone", () => {
      render(<FeaturesStepCompact {...defaultProps} />);
      
      // Empty state should show "Drag to add" for compact mode
      expect(screen.getByText("Drag to add")).toBeInTheDocument();
    });
  });

  describe("Accordion Behavior", () => {
    it("allows expanding accordion items", async () => {
      const user = userEvent.setup();
      render(<FeaturesStepCompact {...defaultProps} />);
      
      const categoryTrigger = screen.getByText("Balance Transfer & Interest");
      await user.click(categoryTrigger);
      
      // After expanding, feature should be visible
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });
  });
});
