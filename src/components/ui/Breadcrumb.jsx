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
      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium p-1"
    >
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        <Home size={14} />
      </Link>

      {data.map((item, index) => {
        const isLast = index === data.length - 1;
        const label = typeof item === "string" ? item : item.label;
        const path = typeof item === "string" ? undefined : item.path;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast || !path ? (
              <span
                className={`truncate ${
                  isLast
                    ? "font-bold text-slate-800 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {label}
              </span>
            ) : (
              <Link
                to={path}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate"
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
