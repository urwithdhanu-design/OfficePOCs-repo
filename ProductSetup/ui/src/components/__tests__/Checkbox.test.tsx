import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../ui/checkbox';

describe('Checkbox', () => {
  it('renders checkbox element', () => {
    render(<Checkbox aria-label="Test checkbox" />);
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles check/uncheck', () => {
    const handleChange = jest.fn();
    render(<Checkbox onCheckedChange={handleChange} aria-label="Test checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows checked state', () => {
    render(<Checkbox checked aria-label="Test checkbox" />);
    
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
  });

  it('shows unchecked state', () => {
    render(<Checkbox checked={false} aria-label="Test checkbox" />);
    
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'unchecked');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Checkbox disabled aria-label="Test checkbox" />);
    
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" aria-label="Test checkbox" />);
    
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox');
  });
});
