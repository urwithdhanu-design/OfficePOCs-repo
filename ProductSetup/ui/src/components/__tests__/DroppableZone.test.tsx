import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { DroppableZone } from "../DroppableZone";
import { ProductFeature } from "@/types/product";

const mockOnRemoveFeature = jest.fn();
const mockOnEditFeature = jest.fn();

const mockFeatures: ProductFeature[] = [
  {
    id: "feature-1",
    code: "FEAT_1",
    name: "Feature One",
    description: "Description for feature one",
    category: "Category A",
  },
  {
    id: "feature-2",
    code: "FEAT_2",
    name: "Feature Two",
    description: "Description for feature two",
    category: "Category B",
    value: "10%",
  },
];

const featureWithDetails: ProductFeature = {
  id: "feature-3",
  code: "FEAT_3",
  name: "Feature Three",
  description: "Description for feature three",
  category: "Category C",
  value: "5%",
  effectiveDate: "2024-01-01",
  priority: 1,
  notes: "Important feature",
};

const renderWithDnd = (ui: React.ReactNode) => {
  return render(<DndContext>{ui}</DndContext>);
};

describe("DroppableZone", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Empty State", () => {
    it("shows empty state message when no features", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Drop features here")).toBeInTheDocument();
    });

    it("shows drag instruction in standard mode", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Drag features from the left panel to add them")).toBeInTheDocument();
    });

    it("shows compact drag instruction in compact mode", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
          compact
        />
      );
      
      expect(screen.getByText("Drag to add")).toBeInTheDocument();
    });

    it("renders package icon in empty state", () => {
      const { container } = renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("With Features", () => {
    it("renders feature names", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Feature One")).toBeInTheDocument();
      expect(screen.getByText("Feature Two")).toBeInTheDocument();
    });

    it("renders feature categories", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Category A")).toBeInTheDocument();
      expect(screen.getByText("Category B")).toBeInTheDocument();
    });

    it("renders feature codes", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("FEAT_1")).toBeInTheDocument();
      expect(screen.getByText("FEAT_2")).toBeInTheDocument();
    });

    it("renders feature value when present", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("10%")).toBeInTheDocument();
    });

    it("renders feature description in standard mode", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Description for feature one")).toBeInTheDocument();
    });

    it("does not render description in compact mode", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
          compact
        />
      );
      
      expect(screen.queryByText("Description for feature one")).not.toBeInTheDocument();
    });
  });

  describe("Feature Details", () => {
    it("renders effective date when present", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[featureWithDetails]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Effective:")).toBeInTheDocument();
      expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    });

    it("renders priority when present", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[featureWithDetails]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Priority:")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("renders notes when present", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[featureWithDetails]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Notes:")).toBeInTheDocument();
      expect(screen.getByText("Important feature")).toBeInTheDocument();
    });

    it("does not render details in compact mode", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[featureWithDetails]}
          onRemoveFeature={mockOnRemoveFeature}
          compact
        />
      );
      
      expect(screen.queryByText("Effective:")).not.toBeInTheDocument();
      expect(screen.queryByText("Priority:")).not.toBeInTheDocument();
      expect(screen.queryByText("Notes:")).not.toBeInTheDocument();
    });
  });

  describe("Remove Feature", () => {
    it("renders remove button for each feature", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={mockFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const removeButtons = screen.getAllByRole("button");
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it("calls onRemoveFeature when remove button is clicked", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[mockFeatures[0]]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const removeButton = screen.getByRole("button");
      await user.click(removeButton);
      
      expect(mockOnRemoveFeature).toHaveBeenCalledWith("feature-1");
    });
  });

  describe("Edit Feature", () => {
    it("renders edit button when onEditFeature is provided", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[mockFeatures[0]]}
          onRemoveFeature={mockOnRemoveFeature}
          onEditFeature={mockOnEditFeature}
        />
      );
      
      const buttons = screen.getAllByRole("button");
      // Should have both edit and remove buttons
      expect(buttons.length).toBe(2);
    });

    it("does not render edit button when onEditFeature is not provided", () => {
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[mockFeatures[0]]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const buttons = screen.getAllByRole("button");
      // Should only have remove button
      expect(buttons.length).toBe(1);
    });

    it("calls onEditFeature when edit button is clicked", async () => {
      const user = userEvent.setup();
      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[mockFeatures[0]]}
          onRemoveFeature={mockOnRemoveFeature}
          onEditFeature={mockOnEditFeature}
        />
      );
      
      const buttons = screen.getAllByRole("button");
      // Edit button should be first
      await user.click(buttons[0]);
      
      expect(mockOnEditFeature).toHaveBeenCalledWith(mockFeatures[0]);
    });
  });

  describe("Compact Mode Styling", () => {
    it("applies compact styling when compact prop is true", () => {
      const { container } = renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
          compact
        />
      );
      
      const zone = container.firstChild as HTMLElement;
      expect(zone).toHaveClass('p-3');
    });

    it("applies standard styling when compact prop is false", () => {
      const { container } = renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const zone = container.firstChild as HTMLElement;
      expect(zone).toHaveClass('p-4');
    });
  });

  describe("Droppable Integration", () => {
    it("renders with DndContext wrapper", () => {
      const { container } = renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(container).toBeInTheDocument();
    });

    it("has border-dashed class for drop indication", () => {
      const { container } = renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={[]}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      const zone = container.firstChild as HTMLElement;
      expect(zone).toHaveClass('border-dashed');
    });
  });

  describe("Multiple Features", () => {
    it("renders all features in a scrollable area", () => {
      const manyFeatures: ProductFeature[] = Array.from({ length: 10 }, (_, i) => ({
        id: `feature-${i}`,
        code: `FEAT_${i}`,
        name: `Feature ${i}`,
        description: `Description for feature ${i}`,
        category: "Test Category",
      }));

      renderWithDnd(
        <DroppableZone
          id="test-zone"
          features={manyFeatures}
          onRemoveFeature={mockOnRemoveFeature}
        />
      );
      
      expect(screen.getByText("Feature 0")).toBeInTheDocument();
      expect(screen.getByText("Feature 9")).toBeInTheDocument();
    });
  });
});
