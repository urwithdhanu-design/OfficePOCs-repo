import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../ui/switch';

describe('Switch', () => {
  it('renders switch element', () => {
    render(<Switch aria-label="Test switch" />);
    
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('handles toggle', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} aria-label="Test switch" />);
    
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows checked state', () => {
    render(<Switch checked aria-label="Test switch" />);
    
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
  });

  it('shows unchecked state', () => {
    render(<Switch checked={false} aria-label="Test switch" />);
    
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Switch disabled aria-label="Test switch" />);
    
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-switch" aria-label="Test switch" />);
    
    expect(screen.getByRole('switch')).toHaveClass('custom-switch');
  });
});
