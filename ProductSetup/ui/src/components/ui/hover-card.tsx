import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard components must be used within a HoverCard");
  }
  return context;
};

interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCard = ({ open: controlledOpen, defaultOpen = false, onOpenChange, children, openDelay = 200, closeDelay = 300 }: HoverCardProps) => {
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
    <HoverCardContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </HoverCardContext.Provider>
  );
};

interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { setOpen, triggerRef } = useHoverCard();
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const combinedRef = (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setOpen(true), 200);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setOpen(false), 300);
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
HoverCardTrigger.displayName = "HoverCardTrigger";

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useHoverCard();
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0 });
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let left = rect.left + window.scrollX;

        if (align === "center") {
          left = rect.left + window.scrollX + rect.width / 2;
        } else if (align === "end") {
          left = rect.right + window.scrollX;
        }

        setCoords({
          top: rect.bottom + window.scrollY + sideOffset,
          left,
        });
      }
    }, [open, align, sideOffset, triggerRef]);

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => setOpen(false), 300);
    };

    if (!mounted || !open) return null;

    const transform = {
      start: "translateX(0)",
      center: "translateX(-50%)",
      end: "translateX(-100%)",
    };

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          transform: transform[align],
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
