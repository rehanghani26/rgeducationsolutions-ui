import { Link } from 'react-router-dom';
import {
  Activity, CalendarCheck, GraduationCap, History, Layers, School, UserCheck, UserMinus, UserPlus, Users,
} from 'lucide-react';
import useDashboardOverview from '../../../hooks/useDashboardOverview.js';
import { ROUTES } from '../../../routes/routes.js';
import {
  OverviewDates, OverviewMetric, OverviewPanel, OverviewStatus,
  dashboardNumber, dashboardPercent, dateLabel,
} from '../components/DashboardOverview.jsx';

import CampusStudentCharts from '../components/CampusStudentCharts.jsx';

export default function StudentsTab() {
  const { data, error, loading, reload } = useDashboardOverview('/dashboard/campus-overview?view=students');
  if (loading || error) {
    return (
      <div className="dashboard-overview">
        <OverviewStatus error={error} loading={loading} onRetry={reload} label="Loading student analytics…" />
      </div>
    );
  }

  const { studentMetrics, students, date } = data;
  const { active, inactive, completed, legacy, unassigned, sections, admissions, attendanceRate, absences, recent } = studentMetrics;
  const stats = [
    { label: 'Student records', value: students, icon: Users },
    { label: 'Active status', value: active, icon: UserCheck, tone: 'success' },
    { label: 'Inactive status', value: inactive, icon: UserMinus, tone: 'danger' },
    { label: 'Graduated or passed out', value: completed, icon: GraduationCap, tone: 'neutral' },
    { label: 'Legacy students', value: legacy, icon: History },
    { label: 'Unassigned class', value: unassigned, icon: School, tone: 'danger' },
    { label: 'Sections represented', value: sections, icon: Layers, tone: 'neutral' },
    { label: 'New admissions', value: admissions, detail: 'Last 30 days', icon: UserPlus, tone: 'success' },
    { label: 'Attendance rate', value: dashboardPercent(attendanceRate), detail: 'Last seven days', icon: CalendarCheck, tone: 'success' },
    { label: 'Absences recorded', value: absences, detail: 'Last seven days', icon: Activity, tone: 'danger' },
  ];
  return (
    <div className="dashboard-overview">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Student analytics</h2>
          <p className="overview-muted mt-1 text-sm">{dateLabel(date, true)}</p>
        </div>
        <Link to={ROUTES.STUDENTS.LIST} className="overview-link">Student directory</Link>
      </header>

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5 sm:gap-3" aria-label="Student analytics totals">
        {stats.map(({ value, label, ...props }) => (
          <OverviewMetric key={label} label={label} value={typeof value === 'number' ? dashboardNumber(value) : value} {...props} />
        ))}
      </section>

      <CampusStudentCharts data={data} />

      <OverviewPanel title="Recent admissions" icon={UserPlus}>
        <OverviewDates items={recent} empty="No student admissions have been recorded." />
      </OverviewPanel>
    </div>
  );
}
