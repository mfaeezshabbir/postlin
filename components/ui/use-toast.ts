import { useToasts } from "@/components/ToastProvider";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
}

export function useToast() {
  const { push } = useToasts();

  const toast = ({ title, description, variant }: ToastProps) => {
    // Map shadcn 'destructive' to our provider's 'error'
    const mappedVariant = variant === "destructive" ? "error" : variant;

    return push({
      title,
      description,
      variant: mappedVariant as "default" | "success" | "error" | "info",
    });
  };

  return { toast };
}
