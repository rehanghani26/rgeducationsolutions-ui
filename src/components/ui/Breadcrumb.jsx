import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Standard Breadcrumb component matching enterprise format.
 * @param {Array<string | { label: string, path?: string }>} data
 */
const Breadcrumb = ({ data = ["Settings"] }) => {
  if (!data || data.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 mb-2 w-fit shadow-2xs"
    >
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition"
        title="Dashboard Home"
      >
        <Home size={13} />
      </Link>

      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        const label = typeof item === "string" ? item : item.label;
        const path = typeof item === "string" ? undefined : item.path;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast || !path ? (
              <span
                className={`truncate ${
                  isLast
                    ? "font-extrabold text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {label}
              </span>
            ) : (
              <Link
                to={path}
                className="hover:text-orange-500 dark:hover:text-orange-400 transition truncate font-medium"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

