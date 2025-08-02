import React from "react";
import { cn } from "../../lib/utils";

const Select = ({ children, onValueChange, value, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { onValueChange, value })
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, value }) => (
  <span className={value ? "" : "text-muted-foreground"}>
    {value || placeholder}
  </span>
);

const SelectContent = ({ className, children, ...props }) => (
  <div
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const SelectItem = ({ className, children, value, onSelect, ...props }) => (
  <div
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => onSelect && onSelect(value)}
    {...props}
  >
    {children}
  </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
