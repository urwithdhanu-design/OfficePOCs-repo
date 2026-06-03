import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip");
  }
  return context;
};

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider = ({ children, delayDuration }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

const Tooltip = ({ children, open: controlledOpen, defaultOpen = false, onOpenChange, delayDuration = 300 }: TooltipProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  );
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { setOpen, triggerRef } = useTooltip();
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => setOpen(true), 300);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setOpen(false);
    };

    const combinedRef = (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: combinedRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...props,
      });
    }

    return (
      <span
        ref={combinedRef as React.Ref<HTMLSpanElement>}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, children, ...props }, ref) => {
    const { open, triggerRef } = useTooltip();
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (side) {
          case "top":
            top = rect.top + window.scrollY - sideOffset;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case "bottom":
            top = rect.bottom + window.scrollY + sideOffset;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case "left":
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - sideOffset;
            break;
          case "right":
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + sideOffset;
            break;
        }

        setCoords({ top, left });
      }
    }, [open, side, sideOffset, triggerRef]);

    if (!mounted || !open) return null;

    const transformOrigin = {
      top: "translateX(-50%) translateY(-100%)",
      bottom: "translateX(-50%)",
      left: "translateX(-100%) translateY(-50%)",
      right: "translateY(-50%)",
    };

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          transform: transformOrigin[side],
        }}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
