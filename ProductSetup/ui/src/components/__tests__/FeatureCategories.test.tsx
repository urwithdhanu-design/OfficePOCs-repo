import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { FeatureCategories } from "../FeatureCategories";
import { ProductFeature } from "@/types/product";

const mockFeatures: ProductFeature[] = [
  {
    id: "bt-enabled",
    code: "BT_ENABLED",
    name: "Balance Transfer Enabled",
    description: "Allow balance transfers from other cards",
    category: "Balance Transfer & Interest",
  },
  {
    id: "bt-fee",
    code: "BT_FEE",
    name: "Balance Transfer Fee",
    description: "Fee applied to balance transfers",
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

const renderWithDnd = (ui: React.ReactNode) => {
  return render(<DndContext>{ui}</DndContext>);
};

describe("FeatureCategories", () => {
  describe("Rendering", () => {
    it("renders search input", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      expect(screen.getByPlaceholderText("Search features...")).toBeInTheDocument();
    });

    it("renders all unique categories as tabs", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      expect(screen.getByText(/Balance Transfer & Interest/)).toBeInTheDocument();
      expect(screen.getByText(/Cash & Withdrawals/)).toBeInTheDocument();
      expect(screen.getByText(/Rewards & Benefits/)).toBeInTheDocument();
    });

    it("shows count for each category", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      // Balance Transfer & Interest has 2 features
      expect(screen.getByText("Balance Transfer & Interest (2)")).toBeInTheDocument();
      // Cash & Withdrawals has 1 feature
      expect(screen.getByText("Cash & Withdrawals (1)")).toBeInTheDocument();
      // Rewards & Benefits has 1 feature
      expect(screen.getByText("Rewards & Benefits (1)")).toBeInTheDocument();
    });

    it("renders with default first tab active", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      // First category's features should be visible
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("switches to different category when tab is clicked", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const rewardsTab = screen.getByText("Rewards & Benefits (1)");
      await user.click(rewardsTab);
      
      expect(screen.getByText("Cashback Rewards")).toBeInTheDocument();
    });

    it("hides features from inactive categories", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const rewardsTab = screen.getByText("Rewards & Benefits (1)");
      await user.click(rewardsTab);
      
      // Features from Balance Transfer category should not be visible
      expect(screen.queryByText("Balance Transfer Enabled")).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters features by name", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "Fee");
      
      // Balance Transfer Fee should be findable, count should update
      expect(screen.getByText("Balance Transfer & Interest (1)")).toBeInTheDocument();
    });

    it("filters features by description", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "ATM");
      
      expect(screen.getByText("Cash & Withdrawals (1)")).toBeInTheDocument();
    });

    it("filters features by code", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "CASHBACK");
      
      expect(screen.getByText("Rewards & Benefits (1)")).toBeInTheDocument();
    });

    it("shows empty state when no features match search", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "nonexistent");
      
      expect(screen.getByText("No features match your search")).toBeInTheDocument();
    });

    it("is case insensitive", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "BALANCE");
      
      expect(screen.getByText("Balance Transfer & Interest (2)")).toBeInTheDocument();
    });

    it("updates category counts based on search", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      const searchInput = screen.getByPlaceholderText("Search features...");
      await user.type(searchInput, "Balance");
      
      // Only Balance Transfer category features should match
      expect(screen.getByText("Balance Transfer & Interest (2)")).toBeInTheDocument();
      expect(screen.getByText("Cash & Withdrawals (0)")).toBeInTheDocument();
      expect(screen.getByText("Rewards & Benefits (0)")).toBeInTheDocument();
    });
  });

  describe("Selected Features Exclusion", () => {
    it("excludes selected features from available list", () => {
      const selectedFeature = mockFeatures[0];
      renderWithDnd(
        <FeatureCategories 
          features={mockFeatures} 
          selectedFeatures={[selectedFeature]} 
        />
      );
      
      // Balance Transfer category should show 1 instead of 2
      expect(screen.getByText("Balance Transfer & Interest (1)")).toBeInTheDocument();
    });

    it("shows empty message when all features in category are selected", () => {
      const selectedFeatures = mockFeatures.filter(
        f => f.category === "Rewards & Benefits"
      );
      renderWithDnd(
        <FeatureCategories 
          features={mockFeatures} 
          selectedFeatures={selectedFeatures} 
        />
      );
      
      expect(screen.getByText("Rewards & Benefits (0)")).toBeInTheDocument();
    });

    it("updates counts when selected features change", () => {
      const { rerender } = renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      expect(screen.getByText("Balance Transfer & Interest (2)")).toBeInTheDocument();
      
      rerender(
        <DndContext>
          <FeatureCategories 
            features={mockFeatures} 
            selectedFeatures={[mockFeatures[0]]} 
          />
        </DndContext>
      );
      
      expect(screen.getByText("Balance Transfer & Interest (1)")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("handles empty features array", () => {
      renderWithDnd(
        <FeatureCategories features={[]} selectedFeatures={[]} />
      );
      
      expect(screen.getByPlaceholderText("Search features...")).toBeInTheDocument();
    });

    it("shows all added message when all category features selected", async () => {
      const user = userEvent.setup();
      const allBtSelected = mockFeatures.filter(
        f => f.category === "Balance Transfer & Interest"
      );
      
      renderWithDnd(
        <FeatureCategories 
          features={mockFeatures} 
          selectedFeatures={allBtSelected} 
        />
      );
      
      // Category should show 0 available
      expect(screen.getByText("Balance Transfer & Interest (0)")).toBeInTheDocument();
      expect(screen.getByText("All features from this category have been added")).toBeInTheDocument();
    });
  });

  describe("Feature Item Rendering", () => {
    it("renders FeatureItem for each available feature", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      // First tab's features should be visible
      expect(screen.getByText("Balance Transfer Enabled")).toBeInTheDocument();
      expect(screen.getByText("Balance Transfer Fee")).toBeInTheDocument();
    });

    it("renders feature codes", () => {
      renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      expect(screen.getByText("BT_ENABLED")).toBeInTheDocument();
      expect(screen.getByText("BT_FEE")).toBeInTheDocument();
    });
  });

  describe("Scroll Area", () => {
    it("renders within a scroll area", () => {
      const { container } = renderWithDnd(
        <FeatureCategories features={mockFeatures} selectedFeatures={[]} />
      );
      
      // ScrollArea component should be present
      const scrollArea = container.querySelector('[data-radix-scroll-area-viewport]');
      expect(scrollArea).toBeInTheDocument();
    });
  });
});
