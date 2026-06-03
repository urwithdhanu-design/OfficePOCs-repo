import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenubarContextType {
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}

const MenubarContext = React.createContext<MenubarContextType | null>(null);

interface MenubarMenuContextType {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MenubarMenuContext = React.createContext<MenubarMenuContextType | null>(null);

interface MenubarSubContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MenubarSubContext = React.createContext<MenubarSubContextType | null>(null);

interface MenubarRadioContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const MenubarRadioContext = React.createContext<MenubarRadioContextType | null>(null);

const Menubar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

    return (
      <MenubarContext.Provider value={{ activeMenu, setActiveMenu }}>
        <div
          ref={ref}
          className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
          {...props}
        />
      </MenubarContext.Provider>
    );
  }
);
Menubar.displayName = "Menubar";

interface MenubarMenuProps {
  children: React.ReactNode;
}

const MenubarMenu = ({ children }: MenubarMenuProps) => {
  const id = React.useId();
  const menubarContext = React.useContext(MenubarContext);
  const open = menubarContext?.activeMenu === id;
  const setOpen = (isOpen: boolean) => {
    menubarContext?.setActiveMenu(isOpen ? id : null);
  };

  return (
    <MenubarMenuContext.Provider value={{ id, open, setOpen }}>
      <div className="relative">{children}</div>
    </MenubarMenuContext.Provider>
  );
};

const MenubarGroup = ({ children }: { children: React.ReactNode }) => <div role="group">{children}</div>;

const MenubarPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface MenubarSubProps {
  children: React.ReactNode;
}

const MenubarSub = ({ children }: MenubarSubProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <MenubarSubContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </MenubarSubContext.Provider>
  );
};

interface MenubarRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

const MenubarRadioGroup = ({ children, value = "", onValueChange = () => {} }: MenubarRadioGroupProps) => {
  return (
    <MenubarRadioContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup">{children}</div>
    </MenubarRadioContext.Provider>
  );
};

const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const menuContext = React.useContext(MenubarMenuContext);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          menuContext?.open && "bg-accent text-accent-foreground",
          className
        )}
        onClick={() => menuContext?.setOpen(!menuContext.open)}
        data-state={menuContext?.open ? "open" : "closed"}
        {...props}
      />
    );
  }
);
MenubarTrigger.displayName = "MenubarTrigger";

interface MenubarSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const MenubarSubTrigger = React.forwardRef<HTMLDivElement, MenubarSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => {
    const subContext = React.useContext(MenubarSubContext);

    return (
      <div
        ref={ref}
        className={cn(
          "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const subContext = React.useContext(MenubarSubContext);
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
MenubarSubContent.displayName = "MenubarSubContent";

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  sideOffset?: number;
}

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => {
    const menuContext = React.useContext(MenubarMenuContext);
    const menubarContext = React.useContext(MenubarContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          if (!target.closest("[data-state]")) {
            menubarContext?.setActiveMenu(null);
          }
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          menubarContext?.setActiveMenu(null);
        }
      };

      if (menuContext?.open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [menuContext?.open, menubarContext?.setActiveMenu]);

    if (!menuContext?.open) return null;

    return (
      <div
        ref={(node) => {
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "absolute top-full z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        style={{ marginTop: sideOffset, marginLeft: alignOffset }}
        {...props}
      />
    );
  }
);
MenubarContent.displayName = "MenubarContent";

interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(
  ({ className, inset, disabled, onClick, ...props }, ref) => {
    const menubarContext = React.useContext(MenubarContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(e);
      menubarContext?.setActiveMenu(null);
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
MenubarItem.displayName = "MenubarItem";

interface MenubarCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, MenubarCheckboxItemProps>(
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
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

interface MenubarRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const MenubarRadioItem = React.forwardRef<HTMLDivElement, MenubarRadioItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const radioContext = React.useContext(MenubarRadioContext);
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
MenubarRadioItem.displayName = "MenubarRadioItem";

interface MenubarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const MenubarLabel = React.forwardRef<HTMLDivElement, MenubarLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  )
);
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  )
);
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
