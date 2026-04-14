import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};
const variantClasses = {
  glass: "glass-card",
  default: "bg-card border border-border rounded-xl",
  elevated: "glass-card-elevated",
  outline: "border border-border rounded-xl",
};
export function Card({
  className,
  variant = "glass",
  padding = "md",
  interactive = false,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "rounded-xl transition-smooth",
        variantClasses[variant],
        paddingMap[padding],
        interactive && "card-interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, trend, className }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "glass-card-elevated rounded-xl p-6 group cursor-default relative overflow-hidden",
        "hover:border-primary/30 hover:shadow-glow-subtle transition-smooth",
        className,
      )}
    >
      {/* Subtle gradient sheen on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-smooth bg-gradient-to-br from-primary/[0.04] to-accent/[0.02] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:shadow-glow-subtle transition-smooth">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-display font-bold text-foreground">
          {value}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                trend.positive
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "text-destructive bg-destructive/10",
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
