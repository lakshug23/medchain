import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

const Select = ({ children, onValueChange, value, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setIsOpen(!isOpen),
            selectedValue,
            isOpen
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { 
            isOpen,
            onSelect: handleSelect,
            selectedValue
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, onClick, selectedValue, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <svg 
      className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, value }) => (
  <span className={value ? "" : "text-muted-foreground"}>
    {value || placeholder}
  </span>
);

const SelectContent = ({ className, children, isOpen, onSelect, selectedValue, ...props }) => {
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => 
        React.cloneElement(child, { onSelect, selectedValue })
      )}
    </div>
  );
};

const SelectItem = React.forwardRef(({ className, children, value, onSelect, selectedValue, ...props }, ref) => (
  <div
    ref={ref}
    onClick={() => onSelect && onSelect(value)}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
      selectedValue === value && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
