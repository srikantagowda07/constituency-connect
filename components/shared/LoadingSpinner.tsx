import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
} as const;

/**
 * Accessible loading spinner using a CSS border animation.
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-current border-b-transparent animate-spin",
        SIZE_CLASSES[size],
        className,
      )}
    />
  );
}
