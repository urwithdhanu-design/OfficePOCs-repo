import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccordionContextValue {
  type: "single" | "multiple";
  value: string[];
  onValueChange: (value: string[]) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionSingleProps {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
}

interface AccordionMultipleProps {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) &
  React.HTMLAttributes<HTMLDivElement>;

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type, value: controlledValue, defaultValue, onValueChange, children, className, ...props }, ref) => {
    const getDefaultValue = () => {
      if (type === "single") {
        return defaultValue ? [defaultValue as string] : [];
      }
      return (defaultValue as string[]) || [];
    };

    const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(getDefaultValue);

    const isControlled = controlledValue !== undefined;
    const value = isControlled
      ? type === "single"
        ? controlledValue
          ? [controlledValue as string]
          : []
        : (controlledValue as string[])
      : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (newValue: string[]) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        if (type === "single") {
          (onValueChange as ((value: string) => void) | undefined)?.(newValue[0] || "");
        } else {
          (onValueChange as ((value: string[]) => void) | undefined)?.(newValue);
        }
      },
      [isControlled, onValueChange, type]
    );

    return (
      <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionItem components must be used within an AccordionItem");
  }
  return context;
};

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: openItems } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div ref={ref} className={cn("border-b", className)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { type, value: openItems, onValueChange } = useAccordion();
  const { value, isOpen } = useAccordionItem();

  const handleClick = () => {
    if (type === "single") {
      onValueChange(isOpen ? [] : [value]);
    } else {
      onValueChange(
        isOpen ? openItems.filter((v) => v !== value) : [...openItems, value]
      );
    }
  };

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        aria-expanded={isOpen}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useAccordionItem();

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all",
          isOpen ? "animate-accordion-down" : "animate-accordion-up hidden"
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
