
import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

// State to store all active toasts
const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

// Interface for toast options
export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  [key: string]: any;
}

// Hook for accessing toast functionality
export function useToast() {
  return {
    toasts,
    toast,
    dismiss: (toastId: string) => {
      setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
    },
  };
}

// Function to create toasts
export function toast(options: ToastOptions) {
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
}
