import { Link } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import Loader from '../../../components/ui/Loader.jsx';
import './dashboardOverview.css';

const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const shortMonth = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' });
export const dateLabel = (key, long = false) => key ? (long ? fullDate : shortDate).format(new Date(key + 'T00:00:00Z')) : '';
export const monthLabel = (key) => shortMonth.format(new Date(key + '-01T00:00:00Z'));
export const dashboardNumber = (value) => value == null ? '—' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
export const dashboardPercent = (value) => value == null ? '—' : dashboardNumber(value) + '%';

const chartTooltip = {
  background: 'var(--surface-1)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  fontSize: 13,
};

export function OverviewStatus({ loading, error, onRetry, label }) {
  if (loading) {
    return <div className="overview-panel"><Loader size="md" text={label} /></div>;
  }
  if (!error) return null;
  return (
    <div className="overview-panel space-y-2" role="alert">
      <p className="font-semibold">Dashboard unavailable</p>
      <p className="overview-muted text-sm">{error}</p>
      {onRetry && <button type="button" onClick={onRetry} className="overview-link">Try again</button>}
    </div>
  );
}

export function OverviewPanel({ title, description, icon: Icon, link, children, className = '' }) {
  return (
    <section className={`overview-panel ${className}`}>
      <header className="overview-panel-header">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && <span className="overview-icon"><Icon size={17} aria-hidden="true" /></span>}
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight">{title}</h3>
            {description && <p className="overview-muted mt-0.5 text-sm">{description}</p>}
          </div>
        </div>
        {link && <Link className="overview-link" to={link.to}>{link.label}</Link>}
      </header>
      {children}
    </section>
  );
}

export function OverviewMetric({ icon: Icon, label, value, detail, tone = 'brand' }) {
  return (
    <article className="overview-metric">
      <span className="overview-icon" data-tone={tone}><Icon size={17} aria-hidden="true" /></span>
      <div className="min-w-0">
        <h3 className="overview-muted text-sm font-medium leading-snug">{label}</h3>
        <p className="mt-0.5 break-words text-lg font-extrabold leading-tight tracking-tight sm:text-2xl">{value}</p>
        {detail && <p className="overview-muted mt-1 break-words text-sm leading-tight">{detail}</p>}
      </div>
    </article>
  );
}

export function OverviewEmpty({ children }) {
  return <p className="overview-empty">{children}</p>;
}

export function OverviewChart({
  data, series, xKey, empty, type = 'bar', stacked = false, domain,
  valueLabel = dashboardNumber, xLabel, axisLabel,
}) {
  if (!data.length || !data.some((item) => series.some(({ key }) => item[key] != null))) {
    return <OverviewEmpty>{empty}</OverviewEmpty>;
  }
  const Chart = { area: AreaChart, line: LineChart, bar: BarChart }[type];
  return (
    <>
      {series.length > 1 && (
        <ul className="overview-legend" aria-label="Chart legend">
          {series.map(({ key, label, color }) => (
            <li key={key}><span style={{ backgroundColor: color }} aria-hidden="true" />{label}</li>
          ))}
        </ul>
      )}
      <div className="overview-chart">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ top: 8, right: 14, bottom: 0, left: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--border-color)" strokeDasharray="4 4" />
            <XAxis dataKey={xKey} tickFormatter={(value) => {
              const label = String(xLabel ? xLabel(value) : value);
              return label.length > 17 ? label.slice(0, 15) + '…' : label;
            }}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} minTickGap={14} tickLine={false} axisLine={false} />
            <YAxis width={50} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} domain={domain}
              tickCount={5} allowDecimals={false} tickLine={false} axisLine={false}
              tickFormatter={axisLabel || (domain ? (value) => value + '%' : undefined)} />
            <Tooltip contentStyle={chartTooltip} labelStyle={{ color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }} cursor={{ stroke: 'var(--border-color)', fill: 'var(--surface-2)' }}
              formatter={(value) => valueLabel(value)} labelFormatter={xLabel ? (value) => xLabel(value) : undefined} />
            {series.map(({ key, label, color }) => {
              const props = { dataKey: key, name: label, isAnimationActive: false };
              if (type === 'line') return <Line key={key} {...props} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />;
              if (type === 'area') return <Area key={key} {...props} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />;
              return <Bar key={key} {...props} fill={color} stackId={stacked ? 'total' : undefined}
                radius={stacked ? undefined : [4, 4, 0, 0]} maxBarSize={42} />;
            })}
          </Chart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function OverviewDates({ items, empty }) {
  if (!items.length) return <OverviewEmpty>{empty}</OverviewEmpty>;
  return (
    <ul className="overview-list">
      {items.map(({ id, title, date, detail, overdue }) => (
        <li key={id} className="flex items-start justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold">{title}</p>
            {detail && <p className="overview-muted mt-0.5 break-words text-sm">{detail}</p>}
          </div>
          {(date || overdue) && (
            <span className={`shrink-0 text-right text-sm font-medium tabular-nums ${overdue ? 'text-rose-700 dark:text-rose-300' : 'overview-muted'}`}>
              {dateLabel(date)}
              {overdue && <span className="block">Overdue</span>}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
