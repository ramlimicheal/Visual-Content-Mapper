
import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';

// Context to share state between Tabs components
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextType | null>(null);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a Tabs component");
  }
  return context;
};

// Main Tabs container
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}
export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, ...props }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div {...props}>{children}</div>
  </TabsContext.Provider>
);

// List container for triggers
export const TabsList = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground ${className || ''}`}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

// Clickable trigger for a tab
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabs();
    const isActive = activeValue === value;
    return (
      <button
        ref={ref}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => onValueChange(value)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className || ''}`}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

// Content for a tab
interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, ...props }, ref) => {
    const { value: activeValue } = useTabs();
    if (activeValue !== value) return null;
    return <div ref={ref} className={className} {...props} />;
  }
);
TabsContent.displayName = "TabsContent";
