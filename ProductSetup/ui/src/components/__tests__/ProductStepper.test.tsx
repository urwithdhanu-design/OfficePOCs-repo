import { render, screen } from '@testing-library/react';
import { ProductStepper } from '../ProductStepper';

describe('ProductStepper', () => {
  it('renders all steps', () => {
    render(<ProductStepper currentStep={1} />);
    
    expect(screen.getByText('Product Info')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('System IDs')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('shows step descriptions', () => {
    render(<ProductStepper currentStep={1} />);
    
    expect(screen.getByText('Basic details')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop configuration')).toBeInTheDocument();
    expect(screen.getByText('External mappings')).toBeInTheDocument();
    expect(screen.getByText('Confirm & export')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<ProductStepper currentStep={2} />);
    
    // Step 2 should be highlighted as current
    const stepNumbers = screen.getAllByText(/^[1-4]$/);
    expect(stepNumbers[1].closest('div')).toHaveClass('bg-primary');
  });

  it('shows checkmark for completed steps', () => {
    render(<ProductStepper currentStep={3} />);
    
    // Steps 1 and 2 should be completed (have check icon, not number)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows correct styling for completed steps', () => {
    render(<ProductStepper currentStep={4} />);
    
    // All previous steps should have success background
    const stepContainers = document.querySelectorAll('.bg-success');
    expect(stepContainers.length).toBe(3); // Steps 1, 2, 3 completed
  });

  it('displays step 1 as first step', () => {
    render(<ProductStepper currentStep={1} />);
    
    const firstStep = screen.getByText('1');
    expect(firstStep).toBeInTheDocument();
    expect(firstStep.closest('div')).toHaveClass('bg-primary');
  });

  it('displays step numbers for incomplete steps', () => {
    render(<ProductStepper currentStep={1} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders connecting lines between steps', () => {
    const { container } = render(<ProductStepper currentStep={1} />);
    
    // Should have 3 connecting lines (between 4 steps)
    const lines = container.querySelectorAll('.h-0\\.5');
    expect(lines.length).toBe(3);
  });

  it('applies success color to completed step lines', () => {
    const { container } = render(<ProductStepper currentStep={3} />);
    
    // Lines for completed steps should have success background
    const successLines = container.querySelectorAll('.bg-success');
    expect(successLines.length).toBeGreaterThan(0);
  });

  it('applies border color to incomplete step lines', () => {
    const { container } = render(<ProductStepper currentStep={1} />);
    
    // All lines should have border background (no steps completed yet)
    const borderLines = container.querySelectorAll('.bg-border');
    expect(borderLines.length).toBe(3);
  });

  it('shows mixed line states when partially complete', () => {
    const { container } = render(<ProductStepper currentStep={2} />);
    
    // First line should be success, rest should be border
    const successLines = container.querySelectorAll('.bg-success');
    const borderLines = container.querySelectorAll('.bg-border');
    
    expect(successLines.length).toBe(1);
    expect(borderLines.length).toBe(2);
  });

  it('applies muted foreground to future step text', () => {
    const { container } = render(<ProductStepper currentStep={1} />);
    
    // Future steps should have muted styling
    const mutedElements = container.querySelectorAll('.text-muted-foreground');
    expect(mutedElements.length).toBeGreaterThan(0);
  });

  it('applies foreground color to current and completed step titles', () => {
    render(<ProductStepper currentStep={2} />);
    
    // Step 1 (completed) and Step 2 (current) titles should have foreground color
    const productInfo = screen.getByText('Product Info');
    const features = screen.getByText('Features');
    
    expect(productInfo).toHaveClass('text-foreground');
    expect(features).toHaveClass('text-foreground');
  });
});
