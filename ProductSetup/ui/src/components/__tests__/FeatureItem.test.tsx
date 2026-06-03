import React from "react";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { FeatureItem } from "../FeatureItem";
import { ProductFeature } from "@/types/product";

const mockFeature: ProductFeature = {
  id: "test-feature",
  code: "TEST_CODE",
  name: "Test Feature",
  description: "This is a test feature description",
  category: "Test Category",
};

const renderWithDnd = (ui: React.ReactNode) => {
  return render(<DndContext>{ui}</DndContext>);
};

describe("FeatureItem", () => {
  describe("Standard View", () => {
    it("renders feature name", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      expect(screen.getByText("Test Feature")).toBeInTheDocument();
    });

    it("renders feature category", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      expect(screen.getByText("Test Category")).toBeInTheDocument();
    });

    it("renders feature description", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      expect(screen.getByText("This is a test feature description")).toBeInTheDocument();
    });

    it("renders feature code", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      expect(screen.getByText("TEST_CODE")).toBeInTheDocument();
    });

    it("renders grip icon for drag handle", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      const gripIcon = container.querySelector('svg');
      expect(gripIcon).toBeInTheDocument();
    });

    it("applies correct styling for standard view", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveClass('rounded-lg');
      expect(itemContainer).toHaveClass('p-4');
    });

    it("has touch-none class for mobile drag support", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveClass('touch-none');
    });

    it("has cursor-grab class", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveClass('cursor-grab');
    });
  });

  describe("Compact View", () => {
    it("renders feature name in compact mode", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      expect(screen.getByText("Test Feature")).toBeInTheDocument();
    });

    it("renders feature category in compact mode", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      expect(screen.getByText("Test Category")).toBeInTheDocument();
    });

    it("renders feature code in compact mode", () => {
      renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      expect(screen.getByText("TEST_CODE")).toBeInTheDocument();
    });

    it("applies correct styling for compact view", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveClass('rounded-md');
      expect(itemContainer).toHaveClass('p-2');
    });

    it("has touch-none class in compact mode", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveClass('touch-none');
    });

    it("applies smaller icon size in compact mode", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} compact />);
      
      const gripIcon = container.querySelector('svg');
      expect(gripIcon).toHaveClass('h-4');
      expect(gripIcon).toHaveClass('w-4');
    });
  });

  describe("Feature Variations", () => {
    it("handles feature with long name", () => {
      const longNameFeature: ProductFeature = {
        ...mockFeature,
        name: "This is a very long feature name that might overflow the container",
      };
      
      renderWithDnd(<FeatureItem feature={longNameFeature} />);
      
      expect(screen.getByText(longNameFeature.name)).toBeInTheDocument();
    });

    it("handles feature with long description", () => {
      const longDescFeature: ProductFeature = {
        ...mockFeature,
        description: "This is a very long description that provides detailed information about the feature and what it does for the user.",
      };
      
      renderWithDnd(<FeatureItem feature={longDescFeature} />);
      
      expect(screen.getByText(longDescFeature.description)).toBeInTheDocument();
    });

    it("handles feature with special characters in name", () => {
      const specialFeature: ProductFeature = {
        ...mockFeature,
        name: "Feature & More (Special)",
      };
      
      renderWithDnd(<FeatureItem feature={specialFeature} />);
      
      expect(screen.getByText("Feature & More (Special)")).toBeInTheDocument();
    });
  });

  describe("Drag and Drop Integration", () => {
    it("renders with DndContext wrapper", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      expect(container).toBeInTheDocument();
    });

    it("has draggable attributes", () => {
      const { container } = renderWithDnd(<FeatureItem feature={mockFeature} />);
      
      const itemContainer = container.firstChild as HTMLElement;
      expect(itemContainer).toHaveAttribute('data-dnd-kit-draggable-id');
    });
  });
});
