const VARIANTS = {
  default: "text-slate-400  bg-slate-400/10  border-slate-400/20",
  primary: "text-primary-400 bg-primary-400/10 border-primary-400/20",
  success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  warning: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  danger:  "text-red-400     bg-red-400/10     border-red-400/20",
  info:    "text-blue-400    bg-blue-400/10    border-blue-400/20",
};

export default function Badge({
  children,
  variant   = "default",
  className = "",         
  size      = "sm",       
}) {
  const sizeClass = size === "xs"
    ? "text-[10px] px-1.5 py-0.5"
    : "text-xs px-2 py-0.5";

  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full border",
        sizeClass,
        className || VARIANTS[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}