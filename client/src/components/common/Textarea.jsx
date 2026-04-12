import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    placeholder = "",
    rows        = 3,
    disabled    = false,
    className   = "",
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          "w-full rounded-lg text-sm text-slate-100 resize-none",
          "bg-slate-800 border transition-colors duration-150",
          "px-3 py-2.5 placeholder:text-slate-600",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
          error
            ? "border-red-500/60 focus:border-red-500"
            : "border-slate-700 hover:border-slate-600",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

export default Textarea;