import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { text } from '@/theme/color';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => (
  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4">
    <div className="pr-12 md:pr-0">
      {breadcrumbs.length > 0 && (
        <nav className={`flex items-center gap-1 text-[10px] sm:text-[11px] ${text.muted} mb-1.5`}>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} />}
              {crumb.to ? (
                <Link to={crumb.to} className={text.link}>{crumb.label}</Link>
              ) : (
                <span className={`${text.secondary} font-semibold`}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className={`text-lg sm:text-xl md:text-2xl ${text.heading}`}>{title}</h1>
      {subtitle && <p className={`${text.secondary} mt-0.5 text-xs sm:text-sm`}>{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
