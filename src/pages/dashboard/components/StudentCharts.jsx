import { useId, useState } from 'react';
import { Award, BookOpen, CalendarCheck, CalendarDays, ClipboardCheck, CreditCard, NotebookPen, TrendingUp } from 'lucide-react';
import { ROUTES } from '../../../routes/routes.js';
import { formatCurrency } from '../../../utils';
import { ChartCollection, CompositionChart, RankedBars, attendanceSeries } from './InsightCharts.jsx';
import { dashboardNumber, dashboardPercent, dateLabel, monthLabel, OverviewChart, OverviewEmpty, OverviewPanel } from './DashboardOverview.jsx';
import { SelectInput } from '../../../components/ui/FormControls.jsx';

const filters = [['attendance', 'Attendance'], ['coursework', 'Coursework'], ['accounts', 'Fees & library']];
const learningSeries = [
  { key: 'submitted', label: 'Submitted', color: 'var(--insight-success)' },
  { key: 'missing', label: 'Missing', color: 'var(--insight-danger)' },
];
const scoreSeries = [{ key: 'score', label: 'Score', color: 'var(--insight-primary)' }];
const compactCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 });
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const attendanceLabels = Object.fromEntries(attendanceSeries.map(({ key, label }) => [key, label]));

function AttendanceCalendar({ records, today }) {
  const [selected, setSelected] = useState('');
  const dates = new Map(records.map((row) => [row.date, row]));
  const first = new Date(today + 'T00:00:00Z');
  first.setUTCDate(first.getUTCDate() - 27);
  const offset = (first.getUTCDay() + 6) % 7;
  const cells = Array.from({ length: 7 * Math.ceil((offset + 28) / 7) }, (_, index) => {
    const day = index - offset;
    if (day < 0 || day >= 28) return '';
    const date = new Date(first);
    date.setUTCDate(first.getUTCDate() + day);
    return date.toISOString().slice(0, 10);
  });
  const highlighted = selected || today;
  const current = dates.get(highlighted);
  const currentStatus = attendanceLabels[current?.status] || 'No record';

  return (
    <div className="space-y-3">
      <div className="insight-calendar">
        {weekdays.map((day) => <span className="overview-muted text-center text-xs font-semibold" key={day}>{day}</span>)}
        {cells.map((date, index) => {
          if (!date) return <span key={index} aria-hidden="true" />;
          const status = dates.get(date)?.status;
          return (
            <button key={date} type="button" className="insight-day" data-status={status || 'unmarked'}
              aria-label={dateLabel(date, true) + ', ' + (attendanceLabels[status] || 'No record')}
              aria-pressed={date === highlighted} aria-current={date === today ? 'date' : undefined}
              onClick={() => setSelected(date)}>
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
      <p className="insight-calendar-detail" role="status">
        <strong>{dateLabel(highlighted, true)}</strong>
        <span className="overview-muted">{currentStatus}</span>
      </p>
      <ul className="overview-legend" aria-label="Attendance calendar legend">
        {attendanceSeries.map(({ key, label }) => (
          <li key={key}><span className="insight-day-swatch" data-status={key} aria-hidden="true" />{label}</li>
        ))}
        <li><span className="insight-day-swatch" data-status="unmarked" aria-hidden="true" />No record</li>
      </ul>
    </div>
  );
}

function SubjectTrend({ subjects }) {
  const [selected, setSelected] = useState('');
  const selectId = useId();
  const subject = subjects.find(({ key }) => key === selected) || subjects[0];
  if (!subject) return <OverviewEmpty>Subject trends appear once marks are published.</OverviewEmpty>;
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="overview-muted block text-sm font-medium">Subject</label>
      <SelectInput id={selectId} value={subject.key} onChange={(event) => setSelected(event.target.value)} className="overview-select sm:max-w-xs">
        {subjects.map(({ key, name }) => <option value={key} key={key}>{name}</option>)}
      </SelectInput>
      <OverviewChart data={subject.scores} series={scoreSeries} xKey="name" type="line"
        domain={[0, 100]} valueLabel={dashboardPercent} empty="No scores recorded for this subject." />
    </div>
  );
}

function SubjectScores({ result }) {
  if (!result?.subjects.length) return <OverviewEmpty>Subject marks appear after results are published.</OverviewEmpty>;
  return (
    <ul className="insight-bars">
      {result.subjects.map(({ name, obtained, total, percent }, index) => (
        <li key={name + '-' + index}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 break-words font-medium">{name}</span>
            <span className="overview-muted shrink-0 tabular-nums">{dashboardNumber(obtained)} / {dashboardNumber(total)}</span>
          </div>
          <div className="insight-bar-track" aria-hidden="true">
            <span className="bg-[var(--insight-primary)]" style={{ width: Math.min(percent, 100) + '%' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function StudentCharts({ date, attendance, homework, results, fees, library }) {
  const feeHistory = fees?.history ?? [];
  const libraryDue = library.due ?? {};
  const homeworkChart = homework.due
    ? [{ period: 'Last 30 days', submitted: homework.completed, missing: homework.due - homework.completed }]
    : [];
  const charts = [
    { id: 'calendar', group: 'attendance', panel: (
      <OverviewPanel title="Attendance calendar" description="Last 28 days. Select a date to see its status." icon={CalendarDays}>
        <AttendanceCalendar records={attendance.records} today={date} />
      </OverviewPanel>
    ) },
    { id: 'subject-progress', group: 'coursework', panel: (
      <OverviewPanel title="Progress by subject" description="Subject scores across published exams" icon={TrendingUp}>
        <SubjectTrend subjects={results.bySubject ?? []} />
      </OverviewPanel>
    ) },
    { id: 'homework-by-subject', group: 'coursework', panel: (
      <OverviewPanel title="Homework by subject" description="Assignments due in the last 30 days" icon={NotebookPen}
        link={{ label: 'Open homework', to: ROUTES.HOMEWORK }}>
        <RankedBars data={homework.bySubject ?? []} series={learningSeries} empty="No assignments were due in this period." />
      </OverviewPanel>
    ) },
    { id: 'fee-payments', group: 'accounts', panel: (
      <OverviewPanel title="Monthly fee payments" description="Recorded transactions in the last six months" icon={CreditCard}>
        <OverviewChart data={feeHistory.some((month) => month.payments > 0) ? feeHistory : []}
          xKey="month" xLabel={monthLabel} type="area" axisLabel={(amount) => compactCurrency.format(amount)}
          valueLabel={formatCurrency} series={[{ key: 'amount', label: 'Paid', color: 'var(--insight-primary)' }]}
          empty="No fee payments were recorded in this period." />
      </OverviewPanel>
    ) },
    { id: 'loans', group: 'accounts', panel: (
      <OverviewPanel title="Library return status" description="Due dates for your current loans" icon={BookOpen}>
        <CompositionChart totalLabel="Open loans" empty="No current loans with return information."
          slices={[
            { label: 'Overdue', value: libraryDue.overdue, color: 'var(--insight-danger)' },
            { label: 'Due today', value: libraryDue.today, color: 'var(--insight-accent)' },
            { label: 'Due later', value: libraryDue.later, color: 'var(--insight-success)' },
            { label: 'No due date', value: libraryDue.undated, color: 'var(--insight-neutral)' },
          ]} />
      </OverviewPanel>
    ) },
    { id: 'attendance-trend', group: 'attendance', panel: (
      <OverviewPanel title="Attendance trend" description="Last six months. Late arrivals count as present." icon={CalendarCheck}>
        <OverviewChart data={attendance.history} xKey="month" xLabel={monthLabel} type="line"
          series={[{ key: 'rate', label: 'Attendance', color: 'var(--insight-success)' }]} domain={[0, 100]}
          valueLabel={dashboardPercent} empty="Attendance appears here once the school records it." />
      </OverviewPanel>
    ) },
    { id: 'submissions', group: 'coursework', panel: (
      <OverviewPanel title="Homework submissions" description="Assignments due in the last 30 days" icon={ClipboardCheck}>
        <OverviewChart data={homeworkChart} xKey="period" stacked series={learningSeries}
          empty="No homework was due in the last 30 days." />
      </OverviewPanel>
    ) },
    { id: 'exams', group: 'coursework', panel: (
      <OverviewPanel title="Exam performance" description="Overall scores for up to six published results" icon={TrendingUp}
        link={{ label: 'View results', to: ROUTES.RESULTS }}>
        <OverviewChart data={results.history} xKey="name" type="line" series={scoreSeries}
          domain={[0, 100]} valueLabel={dashboardPercent} empty="Published exam scores will appear here." />
      </OverviewPanel>
    ) },
    { id: 'subject-scores', group: 'coursework', panel: (
      <OverviewPanel title="Latest subject marks" description={results.latest?.name} icon={Award}>
        <SubjectScores result={results.latest} />
      </OverviewPanel>
    ) },
  ];
  return <ChartCollection id="student-insights" title="Student insights" filters={filters} charts={charts} />;
}
