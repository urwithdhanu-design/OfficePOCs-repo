import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationMenuContextType {
  activeItem: string | null;
  setActiveItem: (item: string | null) => void;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextType | null>(null);

interface NavigationMenuItemContextType {
  id: string;
  open: boolean;
}

const NavigationMenuItemContext = React.createContext<NavigationMenuItemContextType | null>(null);

const NavigationMenu = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => {
    const [activeItem, setActiveItem] = React.useState<string | null>(null);

    return (
      <NavigationMenuContext.Provider value={{ activeItem, setActiveItem }}>
        <nav
          ref={ref}
          className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
          {...props}
        >
          {children}
          <NavigationMenuViewport />
        </nav>
      </NavigationMenuContext.Provider>
    );
  }
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
      {...props}
    />
  )
);
NavigationMenuList.displayName = "NavigationMenuList";

interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  value?: string;
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const id = React.useId();
    const itemId = value || id;
    const context = React.useContext(NavigationMenuContext);
    const open = context?.activeItem === itemId;

    return (
      <NavigationMenuItemContext.Provider value={{ id: itemId, open }}>
        <li ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </li>
      </NavigationMenuItemContext.Provider>
    );
  }
);
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext);
    const itemContext = React.useContext(NavigationMenuItemContext);

    const handleMouseEnter = () => {
      context?.setActiveItem(itemContext?.id || null);
    };

    const handleMouseLeave = () => {
      context?.setActiveItem(null);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(navigationMenuTriggerStyle(), "group", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-state={itemContext?.open ? "open" : "closed"}
        {...props}
      >
        {children}{" "}
        <ChevronDown
          className={cn(
            "relative top-[1px] ml-1 h-3 w-3 transition duration-200",
            itemContext?.open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
    );
  }
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext);
    const itemContext = React.useContext(NavigationMenuItemContext);

    if (!itemContext?.open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "left-0 top-0 w-full animate-in fade-in md:absolute md:w-auto",
          className
        )}
        onMouseEnter={() => context?.setActiveItem(itemContext.id)}
        onMouseLeave={() => context?.setActiveItem(null)}
        {...props}
      />
    );
  }
);
NavigationMenuContent.displayName = "NavigationMenuContent";

interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  asChild?: boolean;
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active, asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        className: cn(className, (children as React.ReactElement<any>).props.className),
        "data-active": active,
        ...props,
      });
    }

    return (
      <a
        ref={ref}
        className={cn(className)}
        data-active={active}
        {...props}
      >
        {children}
      </a>
    );
  }
);
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext);

    if (!context?.activeItem) return null;

    return (
      <div className={cn("absolute left-0 top-full flex justify-center")}>
        <div
          ref={ref}
          className={cn(
            "origin-top-center relative mt-1.5 h-[var(--navigation-menu-viewport-height,auto)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in zoom-in-90 md:w-[var(--navigation-menu-viewport-width,auto)]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(NavigationMenuContext);

    if (!context?.activeItem) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden animate-in fade-in",
          className
        )}
        {...props}
      >
        <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
      </div>
    );
  }
);
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
