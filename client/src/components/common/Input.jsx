
import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type        = "text",
    placeholder = "",
    disabled    = false,
    icon        = null,   
    className   = "",
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "w-full rounded-lg text-sm text-slate-100",
            "bg-slate-800 border transition-colors duration-150",
            "placeholder:text-slate-600",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-700 hover:border-slate-600",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "",
            icon ? "pl-9 pr-3 py-2.5" : "px-3 py-2.5",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}

      {/* Hint (no error) */}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

export default Input;