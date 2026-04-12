"use client";

import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white border-transparent",
  outline: "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-500",
  ghost:   "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent",
  danger:  "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-400",
  success: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const SIZES = {
  xs: "px-2.5 py-1    text-xs  gap-1",
  sm: "px-3   py-1.5  text-sm  gap-1.5",
  md: "px-4   py-2    text-sm  gap-2",
  lg: "px-5   py-2.5  text-base gap-2",
};

export default function Button({
  children,
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  icon     = null,
  fullWidth = false,
  type     = "button",
  onClick,
  className = "",
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        // base
        "inline-flex items-center justify-center font-medium",
        "rounded-lg border transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        // variant + size
        VARIANTS[variant],
        SIZES[size],
        // states
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        fullWidth  ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}