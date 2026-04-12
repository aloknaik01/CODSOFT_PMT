const SIZES = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
  xl: "w-12 h-12 border-4",
};

const COLORS = {
  primary: "border-primary-500/30 border-t-primary-500",
  white:   "border-white/30 border-t-white",
  slate:   "border-slate-600   border-t-slate-300",
};

export default function Spinner({
  size     = "md",
  color    = "primary",
  fullPage = false,
}) {
  const spinner = (
    <span
      role="status"
      aria-label="Loading"
      className={[
        "inline-block rounded-full animate-spin",
        SIZES[size],
        COLORS[color],
      ].join(" ")}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50">
        <Spinner size="xl" />
      </div>
    );
  }

  return spinner;
}