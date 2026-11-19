import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { dashboardNumber, OverviewEmpty } from './DashboardOverview.jsx';

export const attendanceSeries = [
  { key: 'present', label: 'Present', color: 'var(--insight-success)' },
  { key: 'late', label: 'Late', color: 'var(--insight-accent)' },
  { key: 'halfDay', label: 'Half day', color: 'var(--insight-primary)' },
  { key: 'absent', label: 'Absent', color: 'var(--insight-danger)' },
  { key: 'leave', label: 'Leave', color: 'var(--insight-neutral)' },
];

export function ChartCollection({ id, title, filters, charts }) {
  const [active, setActive] = useState('all');
  const visible = active === 'all' ? charts : charts.filter((chart) => chart.group === active);
  return (
    <section className="insight-section" aria-labelledby={id + '-title'} id={id}>
      <header className="insight-heading">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="overview-icon"><BarChart3 size={19} aria-hidden="true" /></span>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl" id={id + '-title'}>{title}</h2>
        </div>
        <div className="insight-filters" role="group" aria-label={title + ' categories'}>
          {[['all', 'All charts'], ...filters].map(([key, label]) => (
            <button key={key} type="button" aria-pressed={active === key} aria-controls={id + '-charts'}
              onClick={() => setActive(key)}>
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="insight-grid" id={id + '-charts'}>
        {visible.map(({ id: chartId, panel }) => <div key={chartId} className="min-w-0">{panel}</div>)}
      </div>
    </section>
  );
}

export function CompositionChart({ slices, totalLabel, empty }) {
  const visible = slices.filter(({ value }) => value > 0);
  if (!visible.length) return <OverviewEmpty>{empty}</OverviewEmpty>;
  const total = visible.reduce((sum, { value }) => sum + value, 0);
  let end = 0;
  const gradient = visible.map(({ value, color }) => {
    const start = end;
    end += value / total * 100;
    return color + ' ' + start + '% ' + Math.min(end, 100) + '%';
  }).join(', ');

  return (
    <figure className="insight-composition">
      <div className="insight-ring" style={{ backgroundImage: 'conic-gradient(' + gradient + ')' }} aria-hidden="true">
        <div className="insight-ring-center">
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">{dashboardNumber(total)}</span>
          <span className="overview-muted text-xs">{totalLabel}</span>
        </div>
      </div>
      <figcaption className="min-w-0">
        <p className="sr-only">{dashboardNumber(total)} {totalLabel}</p>
        <ul className="space-y-2">
          {visible.map(({ label, color, value }) => (
            <li key={label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 text-sm">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              <span className="overview-muted break-words">{label}</span>
              <strong className="tabular-nums">{dashboardNumber(value)}</strong>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export function RankedBars({ data, series, empty }) {
  if (!data.length) return <OverviewEmpty>{empty}</OverviewEmpty>;
  const rows = data.map((row) => ({ ...row, total: series.reduce((sum, item) => sum + (row[item.key] || 0), 0) }));
  const max = Math.max(1, ...rows.map(({ total }) => total));
  return (
    <>
      {series.length > 1 && (
        <ul className="overview-legend" aria-label="Chart legend">
          {series.map(({ key, label, color }) => (
            <li key={key}><span style={{ backgroundColor: color }} aria-hidden="true" />{label}</li>
          ))}
        </ul>
      )}
      <ul className="insight-bars">
        {rows.map((row) => (
          <li key={row.name}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 break-words font-medium">{row.name}</span>
              <span className="shrink-0 tabular-nums">
                {series.length > 1
                  ? series.map(({ key, label, color }) => (
                    <span className="ml-2 inline-flex items-center gap-1" key={key}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                      <span className="sr-only">{label} </span>{dashboardNumber(row[key])}
                    </span>
                  ))
                  : dashboardNumber(row.total)}
              </span>
            </div>
            <div className="insight-bar-track" aria-hidden="true">
              {series.map(({ key, color }) => (
                <span key={key} style={{ backgroundColor: color, width: ((row[key] || 0) / max * 100) + '%' }} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
