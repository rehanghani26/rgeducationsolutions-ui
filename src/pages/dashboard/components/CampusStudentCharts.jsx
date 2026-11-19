import { Activity, CalendarCheck, CalendarDays, History, Layers, School, UserPlus, Users } from 'lucide-react';
import { ChartCollection, CompositionChart, RankedBars, attendanceSeries } from './InsightCharts.jsx';
import { dashboardPercent, dateLabel, monthLabel, OverviewChart, OverviewPanel } from './DashboardOverview.jsx';

const filters = [['enrollment', 'Enrollment'], ['placement', 'Class placement'], ['attendance', 'Attendance']];
const admissionSeries = [{ key: 'count', label: 'Admissions', color: 'var(--insight-primary)' }];

export default function CampusStudentCharts({ data }) {
  const { students, studentMetrics: metrics, admissionTrend, attendance } = data;
  const mix = metrics.admissionMix ?? [];
  const dailyAdmissions = metrics.dailyAdmissions ?? [];
  const sections = metrics.sectionDistribution ?? [];
  const hasAttendance = attendance.some((day) => day.total > 0);
  const charts = [
    { id: 'status', group: 'enrollment', panel: (
      <OverviewPanel title="Enrollment status" description="All student records by current status" icon={Users}>
        <CompositionChart totalLabel="Students" empty="No student records are available."
          slices={[
            { label: 'Active', value: metrics.active, color: 'var(--insight-success)' },
            { label: 'Inactive', value: metrics.inactive, color: 'var(--insight-danger)' },
            { label: 'Graduated or passed out', value: metrics.completed, color: 'var(--insight-primary)' },
            { label: 'Status unrecorded', value: Math.max(0, students - metrics.active - metrics.inactive - metrics.completed), color: 'var(--insight-neutral)' },
          ]} />
      </OverviewPanel>
    ) },
    { id: 'admission-mix', group: 'enrollment', panel: (
      <OverviewPanel title="Legacy and standard admissions" description="Admission dates in the last six months" icon={History}>
        <OverviewChart data={mix.some((month) => month.legacy + month.standard > 0) ? mix : []}
          xKey="month" xLabel={monthLabel} stacked
          series={[
            { key: 'standard', label: 'Standard', color: 'var(--insight-neutral)' },
            { key: 'legacy', label: 'Legacy', color: 'var(--insight-primary)' },
          ]}
          empty="No admissions have been recorded in this period." />
      </OverviewPanel>
    ) },
    { id: 'section-sizes', group: 'placement', panel: (
      <OverviewPanel title="Largest class sections" description="Up to eight sections by student count" icon={Layers}>
        <RankedBars data={sections.slice(0, 8)}
          series={[{ key: 'count', label: 'Students', color: 'var(--insight-primary)' }]} empty="No students have a section assignment." />
      </OverviewPanel>
    ) },
    { id: 'daily-admissions', group: 'enrollment', panel: (
      <OverviewPanel title="Daily admissions" description="Last 14 calendar days" icon={UserPlus}>
        <OverviewChart data={dailyAdmissions.some((day) => day.count > 0) ? dailyAdmissions : []}
          xKey="date" xLabel={dateLabel} series={admissionSeries} empty="No admissions have been recorded in the last 14 days." />
      </OverviewPanel>
    ) },
    { id: 'attendance-mix', group: 'attendance', panel: (
      <OverviewPanel title="Attendance marks by day" description="Recorded marks in the last seven calendar days" icon={Activity}>
        <OverviewChart data={hasAttendance ? attendance : []} xKey="date" xLabel={dateLabel}
          series={attendanceSeries} stacked empty="No attendance marks were recorded in this period." />
      </OverviewPanel>
    ) },
    { id: 'admissions-by-month', group: 'enrollment', panel: (
      <OverviewPanel title="Admissions by month" description="Total admissions per month" icon={CalendarDays}>
        <OverviewChart data={admissionTrend.some((month) => month.count) ? admissionTrend : []}
          xKey="month" xLabel={monthLabel} series={admissionSeries} type="area" empty="No admissions recorded in the last six months." />
      </OverviewPanel>
    ) },
    { id: 'by-class', group: 'placement', panel: (
      <OverviewPanel title="Student records by class" icon={School}>
        <OverviewChart data={metrics.classDistribution} xKey="name"
          series={[{ key: 'count', label: 'Students', color: 'var(--insight-primary)' }]} empty="No students have a class assignment." />
      </OverviewPanel>
    ) },
    { id: 'daily-attendance', group: 'attendance', panel: (
      <OverviewPanel title="Daily attendance rate" description="Last seven calendar days. Approved leave is excluded." icon={CalendarCheck}>
        <OverviewChart data={attendance} xKey="date" xLabel={dateLabel} type="line"
          series={[{ key: 'rate', label: 'Attendance', color: 'var(--insight-success)' }]} domain={[0, 100]}
          valueLabel={dashboardPercent} empty="No eligible attendance records in the last seven days." />
      </OverviewPanel>
    ) },
  ];
  return <ChartCollection id="campus-student-insights" title="Enrollment and attendance charts" filters={filters} charts={charts} />;
}
