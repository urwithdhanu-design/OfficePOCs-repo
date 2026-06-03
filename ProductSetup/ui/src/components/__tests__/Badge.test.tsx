import { render, screen } from '@testing-library/react';
import { Badge } from '../ui/badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    
    expect(screen.getByText('Outline')).toHaveClass('border');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    
    expect(screen.getByText('Custom')).toHaveClass('custom-badge');
  });

  it('renders children correctly', () => {
    render(
      <Badge>
        <span data-testid="child">Child Content</span>
      </Badge>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
