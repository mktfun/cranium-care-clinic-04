
import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

const toasts: ToasterToast[] = [];

// Esta é a interface que usaremos para chamar o toast
interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  [key: string]: any;
}

// Esta função recebe as opções no formato simplificado e as converte para o formato Sonner
function toast(options: ToastOptions) {
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

export { toast, toasts };
