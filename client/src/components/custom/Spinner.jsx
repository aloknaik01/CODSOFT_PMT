import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

export function Spinner({ size = "md", className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizeMap[size],
        className,
      )}
    />
  );
}

export function SpinnerOverlay({ children, loading }) {
  if (!loading) return <>{children}</>;
  return (
    <div className="relative min-h-[120px]">
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
