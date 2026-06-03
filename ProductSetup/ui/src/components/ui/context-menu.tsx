import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextType | null>(null);

interface ContextMenuSubContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ContextMenuSubContext = React.createContext<ContextMenuSubContextType | null>(null);

interface ContextMenuRadioContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const ContextMenuRadioContext = React.createContext<ContextMenuRadioContextType | null>(null);

interface ContextMenuProps {
  children: React.ReactNode;
}

const ContextMenu = ({ children }: ContextMenuProps) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    if (!context) throw new Error("ContextMenuTrigger must be used within ContextMenu");

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      context.setPosition({ x: e.clientX, y: e.clientY });
      context.setOpen(true);
    };

    return (
      <div ref={ref} className={className} onContextMenu={handleContextMenu} {...props}>
        {children}
      </div>
    );
  }
);
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => <div role="group">{children}</div>;

const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface ContextMenuSubProps {
  children: React.ReactNode;
}

const ContextMenuSub = ({ children }: ContextMenuSubProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <ContextMenuSubContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </ContextMenuSubContext.Provider>
  );
};

interface ContextMenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const ContextMenuRadioGroup = ({ children, value = "", onValueChange = () => {} }: ContextMenuRadioGroupProps) => {
  return (
    <ContextMenuRadioContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup">{children}</div>
    </ContextMenuRadioContext.Provider>
  );
};

interface ContextMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const ContextMenuSubTrigger = React.forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => {
    const subContext = React.useContext(ContextMenuSubContext);

    return (
      <div
        ref={ref}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
          inset && "pl-8",
          subContext?.open && "bg-accent text-accent-foreground",
          className
        )}
        onMouseEnter={() => subContext?.setOpen(true)}
        onMouseLeave={() => subContext?.setOpen(false)}
        {...props}
      >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
      </div>
    );
  }
);
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const subContext = React.useContext(ContextMenuSubContext);
    if (!subContext?.open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        onMouseEnter={() => subContext.setOpen(true)}
        onMouseLeave={() => subContext.setOpen(false)}
        {...props}
      />
    );
  }
);
ContextMenuSubContent.displayName = "ContextMenuSubContent";

const ContextMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          context?.setOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          context?.setOpen(false);
        }
      };

      if (context?.open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [context?.open, context?.setOpen]);

    if (!context?.open) return null;

    return (
      <div
        ref={(node) => {
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
          className
        )}
        style={{ left: context.position.x, top: context.position.y }}
        {...props}
      />
    );
  }
);
ContextMenuContent.displayName = "ContextMenuContent";

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, inset, disabled, onClick, ...props }, ref) => {
    const context = React.useContext(ContextMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(e);
      context?.setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          inset && "pl-8",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        data-disabled={disabled}
        {...props}
      />
    );
  }
);
ContextMenuItem.displayName = "ContextMenuItem";

interface ContextMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

interface ContextMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const ContextMenuRadioItem = React.forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const radioContext = React.useContext(ContextMenuRadioContext);
    const checked = radioContext?.value === value;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => !disabled && radioContext?.onValueChange(value)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </span>
        {children}
      </div>
    );
  }
);
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
      {...props}
    />
  )
);
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  )
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
