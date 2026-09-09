import { Loader2 } from "lucide-react";

/**
 * Reusable Loader component — use this everywhere network data is loading.
 *
 * Props:
 *   fullPage  : boolean — renders a centered overlay that fills its parent (use inside a relative container)
 *   size      : 'sm' | 'md' | 'lg' | 'xl'   (default: 'md')
 *   text      : string — optional caption below the spinner
 *   className : string — extra wrapper classes
 */

const spinnerSizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

const Loader = ({ fullPage = false, size = "md", text, className = "" }) => {
  const spinnerSize = spinnerSizeMap[size] || 24;

  if (fullPage) {
    return (
      <div
        className={[
          "flex flex-col items-center justify-center py-20 gap-3",
          className,
        ].join(" ")}
      >
        {/* Dual-ring spinner */}
        <div
          className="relative"
          style={{ width: spinnerSize, height: spinnerSize }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-indigo-100 dark:border-slate-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
        </div>
        {text && (
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={["flex items-center gap-2 text-slate-500", className].join(
        " "
      )}
    >
      <Loader2
        size={spinnerSize}
        className="animate-spin text-indigo-500 shrink-0"
      />
      {text && (
        <span className="text-xs font-semibold text-slate-500">{text}</span>
      )}
    </div>
  );
};

export default Loader;
