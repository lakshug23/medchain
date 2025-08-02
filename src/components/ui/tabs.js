import React from "react";
import { cn } from "../../lib/utils";

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={cn("", className)} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { 
          activeTab, 
          onValueChange: handleValueChange 
        })
      )}
    </div>
  );
};

const TabsList = React.forwardRef(({ className, children, activeTab, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, onValueChange })
    )}
  </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, children, value, activeTab, onValueChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value 
        ? "bg-background text-foreground shadow-sm" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
      className
    )}
    onClick={() => onValueChange && onValueChange(value)}
    {...props}
  >
    {children}
  </button>
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, children, value, activeTab, ...props }, ref) => {
  if (activeTab !== value) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
