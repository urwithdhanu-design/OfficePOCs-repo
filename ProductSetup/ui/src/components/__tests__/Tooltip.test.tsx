import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

describe('Tooltip', () => {
  const TooltipExample = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  it('renders trigger element', () => {
    render(<TooltipExample />);
    
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders with custom trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Custom Button</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    
    expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
  });

  it('applies custom className to trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="custom-trigger">Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    
    expect(screen.getByText('Trigger')).toHaveClass('custom-trigger');
  });
});
