import { render } from '@testing-library/react';
import { Separator } from '../ui/separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    
    const separator = container.firstChild;
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('has decorative role by default', () => {
    const { container } = render(<Separator />);
    
    expect(container.firstChild).toHaveAttribute('role', 'none');
  });

  it('has separator role when not decorative', () => {
    const { container } = render(<Separator decorative={false} />);
    
    expect(container.firstChild).toHaveAttribute('role', 'separator');
  });

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-separator" />);
    
    expect(container.firstChild).toHaveClass('custom-separator');
  });

  it('sets aria-orientation for non-decorative separator', () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    
    expect(container.firstChild).toHaveAttribute('aria-orientation', 'vertical');
  });
});
