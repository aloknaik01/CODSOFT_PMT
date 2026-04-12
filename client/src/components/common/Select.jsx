import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  { label, error, children, disabled = false, className = "", ...rest },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}

      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={[
            "w-full appearance-none rounded-lg text-sm text-slate-100",
            "bg-slate-800 border transition-colors duration-150",
            "pr-8 pl-3 py-2.5",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-slate-700 hover:border-slate-600",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        >
          {children}
        </select>

        {/* Chevron icon */}
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

export default Select;