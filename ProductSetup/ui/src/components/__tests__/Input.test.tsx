import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../ui/input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts different types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('shows value when controlled', () => {
    render(<Input value="controlled value" onChange={() => {}} />);
    
    expect(screen.getByRole('textbox')).toHaveValue('controlled value');
  });

  it('has correct aria attributes when passed', () => {
    render(<Input aria-label="Test input" aria-describedby="helper-text" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Test input');
    expect(input).toHaveAttribute('aria-describedby', 'helper-text');
  });
});
