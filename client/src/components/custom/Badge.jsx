import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-smooth",
  {
    variants: {
      variant: {
        default: "bg-muted/80 text-muted-foreground border-border",
        primary:
          "bg-primary/10 text-primary border-primary/25 hover:bg-primary/15 hover:border-primary/40",
        secondary:
          "bg-secondary/10 text-secondary border-secondary/25 hover:bg-secondary/15",
        success:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
        warning:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
        outline: "bg-transparent border-border text-foreground",
        // Priority
        critical:
          "bg-destructive/12 text-destructive border-destructive/30 hover:bg-destructive/18 hover:border-destructive/50 hover:shadow-[0_0_12px_oklch(0.63_0.22_27/0.2)]",
        high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25 hover:bg-orange-500/15 hover:border-orange-500/40",
        medium:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/40",
        low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
        // Status
        active:
          "bg-primary/10 text-primary border-primary/25 hover:bg-primary/15 hover:border-primary/40 hover:shadow-glow-subtle",
        completed:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
        archived: "bg-muted/80 text-muted-foreground border-border",
        on_hold:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15",
        todo: "bg-muted/80 text-muted-foreground border-border/60",
        in_progress:
          "bg-secondary/10 text-secondary border-secondary/25 hover:bg-secondary/15",
        done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        backlog: "bg-muted/50 text-muted-foreground/80 border-border/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({ className, variant, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const labels = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  const dotClasses = {
    critical: "bg-destructive shadow-[0_0_4px_oklch(0.63_0.22_27/0.6)]",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };
  return (
    <Badge
      variant={priority}
      className={priority === "critical" ? "animate-pulse-subtle" : ""}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          dotClasses[priority],
        )}
      />
      {labels[priority]}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    backlog: "Backlog",
    active: "Active",
    completed: "Completed",
    archived: "Archived",
    on_hold: "On Hold",
  };
  const statusDot = {
    active: "bg-primary",
    in_progress: "bg-secondary",
    done: "bg-emerald-500",
    completed: "bg-emerald-500",
    todo: "bg-muted-foreground/40",
    backlog: "bg-muted-foreground/30",
    archived: "bg-muted-foreground/30",
    on_hold: "bg-amber-500",
  };
  const dot = statusDot[status];

  return (
    <Badge variant={status}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />}
      {labels[status] ?? status}
    </Badge>
  );
}
