export default function EmptyState({
  icon        = null,
  title       = "Nothing here yet",
  description = "",
  action      = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 mb-5">
          {icon}
        </div>
      )}

      {/* Text */}
      <h3 className="text-base font-semibold text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
      )}

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}