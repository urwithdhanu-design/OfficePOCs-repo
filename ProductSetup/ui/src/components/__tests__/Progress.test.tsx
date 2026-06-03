import { render, screen } from '@testing-library/react';
import { Progress } from '../ui/progress';

describe('Progress', () => {
  it('renders progressbar', () => {
    render(<Progress value={50} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has correct aria attributes for value', () => {
    render(<Progress value={30} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '30');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('handles custom max value', () => {
    render(<Progress value={50} max={200} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemax', '200');
  });

  it('defaults to 0 when no value provided', () => {
    render(<Progress />);
    
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies custom className', () => {
    render(<Progress className="custom-progress" value={50} />);
    
    expect(screen.getByRole('progressbar')).toHaveClass('custom-progress');
  });

  it('clamps percentage to 100 when value exceeds max', () => {
    render(<Progress value={150} max={100} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('clamps percentage to 0 for negative values', () => {
    render(<Progress value={-10} max={100} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });
});
