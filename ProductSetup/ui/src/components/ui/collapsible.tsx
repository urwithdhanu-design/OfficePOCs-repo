import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextValue {
  isOpen: boolean;
  onToggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used within a Collapsible");
  }
  return context;
};

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Collapsible = ({ 
  open, 
  onOpenChange, 
  defaultOpen = false,
  children, 
  ...props 
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  const controlled = open !== undefined;
  const currentOpen = controlled ? open : isOpen;

  const handleToggle = React.useCallback(() => {
    if (controlled) {
      onOpenChange?.(!open);
    } else {
      setIsOpen(prev => {
        const newState = !prev;
        onOpenChange?.(newState);
        return newState;
      });
    }
  }, [controlled, open, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ isOpen: currentOpen, onToggle: handleToggle }}>
      <div data-state={currentOpen ? "open" : "closed"} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement, 
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { isOpen, onToggle } = useCollapsible();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle();
    onClick?.(e);
  };

  return (
    <button 
      ref={ref} 
      type="button" 
      onClick={handleClick} 
      data-state={isOpen ? "open" : "closed"} 
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useCollapsible();
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={ref} 
      className={cn(className)} 
      data-state={isOpen ? "open" : "closed"} 
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
