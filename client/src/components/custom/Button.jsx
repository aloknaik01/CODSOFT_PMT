import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97] transition-spring",
  {
    variants: {
      variant: {
        default: "btn-primary",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        outline:
          "border border-border text-foreground hover:bg-muted/50 hover:-translate-y-0.5 active:translate-y-0 transition-spring",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-spring",
        glass:
          "glass-card text-foreground hover:bg-white/15 dark:hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-spring",
        hero: "bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-glow-subtle transition-spring",
        accent:
          "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 hover:-translate-y-0.5 active:translate-y-0 transition-spring",
        success:
          "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-spring",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-lg",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <Spinner
            size="sm"
            className="text-current border-current/30 border-t-current"
          />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";
