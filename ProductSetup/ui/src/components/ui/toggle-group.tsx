import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

interface ToggleGroupContextValue {
  type: "single" | "multiple";
  value: string | string[];
  onValueChange: (value: string) => void;
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  type: "single",
  value: "",
  onValueChange: () => {},
  size: "default",
  variant: "default",
});

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toggleVariants> {
  type: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, children, type, value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue ?? (type === "single" ? "" : [])
    );

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        let newValue: string | string[];

        if (type === "single") {
          newValue = value === itemValue ? "" : itemValue;
        } else {
          const currentArray = Array.isArray(value) ? value : [];
          newValue = currentArray.includes(itemValue)
            ? currentArray.filter((v) => v !== itemValue)
            : [...currentArray, itemValue];
        }

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [type, value, isControlled, onValueChange]
    );

    return (
      <ToggleGroupContext.Provider value={{ type, value, onValueChange: handleValueChange, variant, size }}>
        <div ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);

ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, value, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);

    const isPressed = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          className
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
