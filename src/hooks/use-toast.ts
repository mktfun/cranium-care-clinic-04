
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

function toast({
  variant = "default",
  title,
  description,
  ...props
}: Omit<ToasterToast, "id">) {
  // Map our toast variants to Sonner variants
  const sonnerVariant = variant === "destructive" ? "error" 
    : variant === "success" ? "success" 
    : "default";
  
  return sonnerToast[sonnerVariant](title, {
    description,
    ...props,
  })
}

export { toast, SonnerToaster as Toaster, toasts }

export function useToast() {
  return {
    toast,
    toasts,
    dismiss: sonnerToast.dismiss,
  }
}
