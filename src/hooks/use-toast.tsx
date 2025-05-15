
import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

// Interface for toast options
export type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  [key: string]: any;
};

// Create a React context to store and manage toasts
const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  toast: (options: ToastOptions) => void;
  dismiss: (toastId: string) => void;
}>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

// Provider component that will wrap the application
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  
  const dismiss = React.useCallback((toastId: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
  }, []);

  const value = React.useMemo(() => {
    return {
      toasts,
      toast: (options: ToastOptions) => {
        const { variant = "default", title, description, ...props } = options;
        
        // Map our toast variants to Sonner variants
        if (variant === "destructive") {
          return sonnerToast.error(title as string, {
            description,
            ...props,
          });
        } else if (variant === "success") {
          return sonnerToast.success(title as string, {
            description,
            ...props,
          });
        } else {
          return sonnerToast(title as string, {
            description,
            ...props,
          });
        }
      },
      dismiss,
    };
  }, [toasts, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// Hook for accessing toast functionality
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

// Standalone function to create toasts (for ease of use)
export const toast = (options: ToastOptions) => {
  const { variant = "default", title, description, ...props } = options;
  
  // Map our toast variants to Sonner variants
  if (variant === "destructive") {
    return sonnerToast.error(title as string, {
      description,
      ...props,
    });
  } else if (variant === "success") {
    return sonnerToast.success(title as string, {
      description,
      ...props,
    });
  } else {
    return sonnerToast(title as string, {
      description,
      ...props,
    });
  }
};
