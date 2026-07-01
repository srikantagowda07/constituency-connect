import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

/**
 * Inline error message with accessible role.
 */
export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <p role="alert" className={cn("text-sm text-destructive", className)}>
      {message}
    </p>
  );
}
