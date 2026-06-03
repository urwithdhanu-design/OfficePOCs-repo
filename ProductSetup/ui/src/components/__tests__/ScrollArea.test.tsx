import { render, screen } from '@testing-library/react';
import { ScrollArea } from '../ui/scroll-area';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <div>Scroll content</div>
      </ScrollArea>
    );
    
    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <div>Content</div>
      </ScrollArea>
    );
    
    expect(container.firstChild).toHaveClass('custom-scroll');
  });

  it('has overflow hidden on container', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    
    expect(container.firstChild).toHaveClass('overflow-hidden');
  });

  it('renders multiple children', () => {
    render(
      <ScrollArea>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ScrollArea>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
