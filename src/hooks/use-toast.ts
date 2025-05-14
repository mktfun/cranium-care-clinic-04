
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import { 
  toast as sonnerToast,
  Toaster as SonnerToaster,
} from "sonner"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const toasts: ToasterToast[] = []

// Esta é a interface que usaremos para chamar o toast
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  [key: string]: any;
}

// Esta função recebe as opções no formato simplificado e as converte para o formato Sonner
function toast(options: ToastOptions) {
  const { variant = "default", title, description, ...props } = options;
  
  // Map our toast variants to Sonner variants
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props,
    });
  } else if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      ...props,
    });
  } else {
    return sonnerToast(title, {
      description,
      ...props,
    });
  }
}

export { toast, SonnerToaster as Toaster, toasts }

export function useToast() {
  return {
    toast,
    toasts,
    dismiss: sonnerToast.dismiss,
  }
}
