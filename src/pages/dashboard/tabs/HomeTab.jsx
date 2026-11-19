import { Link } from 'react-router-dom';
import {
  Bell, CalendarCheck, CalendarDays, CreditCard, FileSpreadsheet, GraduationCap, School, UserPlus, Users,
} from 'lucide-react';
import useDashboardOverview from '../../../hooks/useDashboardOverview.js';
import { ROUTES } from '../../../routes/routes.js';
import { formatCurrency } from '../../../utils';
import {
  OverviewChart, OverviewDates, OverviewMetric, OverviewPanel, OverviewStatus,
  dashboardNumber, dateLabel, monthLabel,
} from '../components/DashboardOverview.jsx';

import { attendanceSeries } from '../components/InsightCharts.jsx';

const actions = [
  { label: 'Register student', to: ROUTES.STUDENTS.CREATE, icon: UserPlus },
  { label: 'Bulk import', to: ROUTES.STUDENTS.BULK_IMPORT, icon: FileSpreadsheet },
  { label: 'Student directory', to: ROUTES.STUDENTS.LIST, icon: Users },
  { label: 'Mark attendance', to: ROUTES.ATTENDANCE, icon: CalendarCheck },
  { label: 'Fee accounts', to: ROUTES.FEES.LIST, icon: CreditCard },
  { label: 'Exams', to: ROUTES.EXAMS.LIST, icon: GraduationCap },
];

function QuickActions() {
  return (
    <OverviewPanel title="Quick actions" icon={School}>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        {actions.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} className="overview-link overview-action min-h-11 gap-2 rounded-lg px-2 py-1.5">
            <Icon className="shrink-0" size={16} aria-hidden="true" /> {label}
          </Link>
        ))}
      </div>
    </OverviewPanel>
  );
}

export default function HomeTab() {
  const { data, error, loading, reload } = useDashboardOverview('/dashboard/campus-overview');
  if (loading || error) {
    return (
      <div className="dashboard-overview">
        <OverviewStatus error={error} loading={loading} onRetry={reload} label="Loading campus overview…" />
        {error && <QuickActions />}
      </div>
    );
  }
  const currentMonth = monthLabel(data.date.slice(0, 7));
  const thisMonth = data.admissionTrend.at(-1)?.count;
  const hasAttendance = data.attendance.some((day) => day.total > 0);

  return (
    <div className="dashboard-overview">
      <header className="flex flex-wrap items-baseline justify-between gap-1">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Campus overview</h2>
        <p className="overview-muted text-sm">{dateLabel(data.date, true)}</p>
      </header>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 sm:gap-3" aria-label="Campus totals">
        <OverviewMetric icon={Users} label="Student records" value={dashboardNumber(data.students)}
          detail={`${dashboardNumber(thisMonth)} admissions in ${currentMonth}`} />
        <OverviewMetric icon={GraduationCap} label="Teachers" value={dashboardNumber(data.teachers)} detail="Teacher records" tone="neutral" />
        <OverviewMetric icon={School} label="Classrooms" value={dashboardNumber(data.classes)} tone="success" />
        <OverviewMetric icon={CreditCard} label="Fees collected" value={formatCurrency(data.feesCollected)}
          detail={`Payments recorded in ${currentMonth}`} />
      </section>

      <div className="grid gap-3 lg:grid-cols-2 sm:gap-4">
        <OverviewPanel title="Student attendance" description="Last seven calendar days" icon={CalendarCheck}
          link={{ label: 'Open attendance', to: ROUTES.ATTENDANCE }}>
          <OverviewChart data={hasAttendance ? data.attendance : []} xKey="date" xLabel={dateLabel}
            series={attendanceSeries} stacked empty="No student attendance was recorded in the last seven days." />
        </OverviewPanel>

        <OverviewPanel title="Admissions" description="New admissions by month" icon={Users}
          link={{ label: 'Student directory', to: ROUTES.STUDENTS.LIST }}>
          <OverviewChart data={data.admissionTrend.some((month) => month.count) ? data.admissionTrend : []}
            xKey="month" xLabel={monthLabel} series={[{ key: 'count', label: 'Admissions', color: 'var(--insight-primary)' }]}
            empty="No admissions recorded in the last six months." />
        </OverviewPanel>

        <OverviewPanel title="Fee collections" description="Recorded transactions by month" icon={CreditCard}
          link={{ label: 'View fees', to: ROUTES.FEES.LIST }}>
          <OverviewChart data={data.feeTrend.some((month) => month.amount) ? data.feeTrend : []}
            xKey="month" xLabel={monthLabel} type="line" valueLabel={formatCurrency}
            series={[{ key: 'amount', label: 'Collected', color: 'var(--insight-success)' }]} empty="No fee transactions recorded in the last six months." />
        </OverviewPanel>

        <QuickActions />

        <OverviewPanel title="Upcoming exams" icon={CalendarDays} link={{ label: 'Exam schedule', to: ROUTES.EXAMS.LIST }}>
          <OverviewDates items={data.exams.map((item) => ({ ...item, detail: item.term }))} empty="No upcoming exams are scheduled." />
        </OverviewPanel>

        <OverviewPanel title="Recent notices" icon={Bell} link={{ label: 'View notices', to: ROUTES.NOTIFICATIONS }}>
          <OverviewDates items={data.notices.map((item) => ({ ...item, detail: item.type }))} empty="No recent notices for this account." />
        </OverviewPanel>
      </div>
    </div>
  );
}
