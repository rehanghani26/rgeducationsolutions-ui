import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Award, BookOpen, CalendarCheck, CalendarDays, ClipboardCheck,
  ClipboardList, Clock3, CreditCard, GraduationCap, NotebookPen, TrendingUp,
} from 'lucide-react';
import useDashboardOverview from '../../../hooks/useDashboardOverview.js';
import { ROUTES } from '../../../routes/routes.js';
import { formatCurrency } from '../../../utils';
import {
  OverviewStatus, OverviewDates, OverviewEmpty, OverviewMetric, OverviewPanel,
  dashboardNumber, dashboardPercent, dateLabel, monthLabel,
} from '../components/DashboardOverview.jsx';

import StudentCharts from '../components/StudentCharts.jsx';

const attendanceLabels = { present: 'Present', late: 'Late', absent: 'Absent', halfDay: 'Half day', leave: 'Leave' };

function StudentMetrics({ attendance, homework, results, exams, library, period }) {
  const best = results.latest?.subjects.reduce((current, subject) =>
    !current || subject.percent > current.percent ? subject : current, null);
  const metrics = [
    { icon: CalendarDays, label: 'Days recorded', value: attendance.total, detail: period, tone: 'neutral' },
    { icon: Activity, label: 'Days absent', value: attendance.absent, detail: period, tone: 'danger' },
    { icon: Clock3, label: 'Late arrivals', value: attendance.late, detail: period, tone: 'brand' },
    { icon: CalendarCheck, label: 'Half days', value: attendance.halfDay, detail: period, tone: 'neutral' },
    { icon: ClipboardList, label: 'Homework due soon', value: homework.dueSoon, detail: 'Next 7 days', tone: 'brand' },
    { icon: NotebookPen, label: 'Missing homework', value: homework.overdue, detail: 'Last 30 days', tone: 'danger' },
    { icon: ClipboardCheck, label: 'Homework completion', value: dashboardPercent(homework.completion), detail: homework.due ? `${homework.completed} of ${homework.due} due submitted` : 'Nothing due in the last 30 days', tone: 'success' },
    { icon: Award, label: 'Latest exam score', value: dashboardPercent(results.latest?.score), detail: results.latest?.name || 'No published result', tone: 'neutral' },
    { icon: TrendingUp, label: 'Best subject', value: best?.name || '—', detail: best ? `${dashboardPercent(best.percent)} in the latest result` : 'No published subject marks', tone: 'success' },
    { icon: BookOpen, label: 'Overdue books', value: library.overdue, detail: `${library.borrowed} currently borrowed`, tone: 'danger' },
  ];

  return (
    <section className="space-y-3" aria-labelledby="student-progress-heading">
      <div>
        <h2 className="text-lg font-bold" id="student-progress-heading">Attendance and coursework</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5 sm:gap-3">
        {metrics.map(({ label, ...props }) => <OverviewMetric key={label} label={label} {...props} />)}
      </div>
      <p className="overview-muted text-sm">
        {dashboardNumber(exams.count)} {exams.count === 1 ? 'upcoming exam' : 'upcoming exams'} for your class.
      </p>
    </section>
  );
}

function AttendanceHistory({ records }) {
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(12);
  const months = [...new Set(records.map((row) => row.date.slice(0, 7)))];
  const filtered = records.filter((row) => (!month || row.date.startsWith(month)) && (!status || row.status === status));
  const asItem = ({ date, status: mark, remarks, checkIn, checkOut }) => ({
    id: date, date, title: attendanceLabels[mark],
    detail: [[checkIn, checkOut].filter(Boolean).join(' – '), remarks].filter(Boolean).join(' · '),
  });
  if (!records.length) return <OverviewEmpty>No attendance entries have been recorded.</OverviewEmpty>;
  return (
    <>
      <OverviewDates items={records.slice(0, 5).map(asItem)} />
      <details className="mt-2 border-t border-[var(--border-color)] pt-2">
        <summary className="cursor-pointer text-sm font-semibold">View attendance history</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="space-y-1 text-sm">
            <span className="overview-muted">Month</span>
            <select className="overview-select" value={month} onChange={(event) => { setMonth(event.target.value); setLimit(12); }}>
              <option value="">All months</option>
              {months.map((key) => <option key={key} value={key}>{monthLabel(key)} {key.slice(0, 4)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="overview-muted">Status</span>
            <select className="overview-select" value={status} onChange={(event) => { setStatus(event.target.value); setLimit(12); }}>
              <option value="">All statuses</option>
              {Object.entries(attendanceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-2">
          <OverviewDates items={filtered.slice(0, limit).map(asItem)} empty="No attendance records match these filters." />
          {filtered.length > limit && <button type="button" className="overview-link" onClick={() => setLimit(limit + 12)}>Show more</button>}
        </div>
      </details>
    </>
  );
}

export default function StudentDashboard() {
  const { data, loading, error, reload } = useDashboardOverview('/dashboard/student-overview');
  if (loading || error) {
    return <div className="dashboard-overview"><OverviewStatus loading={loading} error={error} onRetry={reload} label="Loading your student dashboard…" /></div>;
  }

  const { date, student, attendance, homework, results, fees, library, exams, schedule, notices } = data;
  const placement = [student.className, student.sectionName].filter(Boolean).join(' · ');
  const period = monthLabel(date.slice(0, 7));
  return (
    <div className="dashboard-overview">
      <section className="overview-panel student-day-header" aria-labelledby="student-overview-heading">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 gap-3">
            <span className="overview-icon"><GraduationCap size={19} aria-hidden="true" /></span>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl" id="student-overview-heading">My school day</h2>
              <p className="overview-muted mt-1 text-sm">{dateLabel(date, true)}{placement ? ` · ${placement}` : ''}</p>
              {[student.session, student.rollNumber, student.admissionNumber].some((value) => value != null && value !== '') && (
                <p className="overview-muted mt-1 break-words text-sm">
                  {[student.session, student.rollNumber != null && `Roll ${student.rollNumber}`, student.admissionNumber].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="student-dashboard-actions">
            <a className="overview-link" href="#student-insights">View charts</a>
            <Link className="overview-link" to={ROUTES.STUDENTS.LIST}>My profile</Link>
            <Link className="overview-link" to={ROUTES.CERTIFICATES + '?tab=id-cards'}>My ID card</Link>
            <Link className="overview-link" to={ROUTES.CERTIFICATES + '?tab=certificates'}>My certificates</Link>
          </div>
        </div>
      </section>

      <div className="student-summary-grid" aria-label="Student summary">
        <OverviewMetric icon={Activity} label="Attendance rate" value={dashboardPercent(attendance.rate)}
          detail={attendance.rate == null ? 'No eligible days recorded this month' : `${period} · approved leave excluded`} tone="success" />
        <OverviewMetric icon={CreditCard} label="Fee balance" value={fees ? formatCurrency(fees.due) : '—'}
          detail={fees ? fees.dueDate ? `Due ${dateLabel(fees.dueDate)} · ${formatCurrency(fees.paid)} paid` : `${formatCurrency(fees.paid)} paid` : 'No fee account recorded'} />
        <OverviewMetric icon={BookOpen} label="Library loans" value={library.borrowed} detail="Books currently borrowed" tone="neutral" />
      </div>

      <StudentMetrics attendance={attendance} homework={homework} results={results} exams={exams} library={library} period={period} />

      <StudentCharts date={date} attendance={attendance} homework={homework} results={results} fees={fees} library={library} />

      <div className="grid gap-3 lg:grid-cols-2 sm:gap-4">
        <OverviewPanel title="Today's timetable" icon={CalendarDays}>
          {schedule.length ? (
            <ul className="overview-list">
              {schedule.map(({ period: number, subject, starts, ends, teacher, room }, index) => (
                <li key={`${number}-${index}`} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{subject}</p>
                    {(teacher || room) && <p className="overview-muted mt-0.5 break-words text-sm">{[teacher, room].filter(Boolean).join(' · ')}</p>}
                  </div>
                  <span className="overview-muted shrink-0 text-right text-sm tabular-nums">
                    {[starts, ends].filter(Boolean).join(' – ') || `Period ${number}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : <OverviewEmpty>No timetable periods are scheduled for today.</OverviewEmpty>}
        </OverviewPanel>

        <OverviewPanel title="Homework deadlines" description="Outstanding work due this week or recently overdue" icon={NotebookPen}>
          <OverviewDates items={homework.upcoming.map((item) => ({ ...item, detail: item.subject }))} empty="No outstanding homework in this window." />
        </OverviewPanel>

        <OverviewPanel title="Upcoming exams" icon={GraduationCap}>
          <OverviewDates items={exams.upcoming.map((item) => ({ ...item, detail: item.term }))} empty="No exams are scheduled for your class." />
        </OverviewPanel>

        <OverviewPanel title="Recent attendance" icon={CalendarCheck}>
          <AttendanceHistory records={attendance.records} />
        </OverviewPanel>
      </div>

      <OverviewPanel title="School notices" icon={ClipboardList}>
        <OverviewDates items={notices.map((item) => ({ ...item, detail: item.message }))} empty="No notices for students." />
      </OverviewPanel>
    </div>
  );
}
