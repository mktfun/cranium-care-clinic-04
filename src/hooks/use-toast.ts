
// Re-export from the hooks/use-toast.tsx file
import { toast } from "@/hooks/use-toast.tsx";
import { useToast } from "@/hooks/use-toast.tsx";
import { ToastProvider } from "@/hooks/use-toast.tsx";
import type { ToastOptions } from "@/hooks/use-toast.tsx";

export { toast, useToast, ToastProvider };
export type { ToastOptions };
