export default function SkeletonCard({ lines = 3, className = "" }) {
  return (
    <div
      className={[
        "bg-slate-800 border border-slate-700 rounded-xl p-5",
        "animate-pulse",
        className,
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-700 rounded-md w-2/5" />
        <div className="h-5 w-16 bg-slate-700 rounded-full" />
      </div>

      {/* Body lines */}
      <div className="flex flex-col gap-2 mb-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-700 rounded-md"
            style={{ width: `${90 - i * 15}%` }}
          />
        ))}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((j) => (
            <div key={j} className="w-6 h-6 rounded-full bg-slate-700" />
          ))}
        </div>
        <div className="h-3 w-20 bg-slate-700 rounded-md" />
      </div>
    </div>
  );
}