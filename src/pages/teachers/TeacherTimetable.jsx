import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ChevronDown, Clock3, MapPin } from 'lucide-react';
import { Empty, ErrorMessage } from '../../components/ui/ProcurementUI.jsx';
import { DAYS_OF_WEEK } from '../../constants/dateTime.js';
import { timeLabel, validTime } from '../settings/masterPeriods/masterPeriodValues.js';

function groupByDay(periods) {
  const days = new Map(DAYS_OF_WEEK.map(({ id, label, short }) => [id, { id, label, short, periods: [] }]));
  for (const period of periods) {
    const { day } = period;
    if (!days.has(day)) {
      const label = day || 'Day not recorded';
      days.set(day, { id: day, label, short: label, periods: [] });
    }
    days.get(day).periods.push(period);
  }
  return [...days.values()];
}

const periodCount = (count) => count + (count === 1 ? ' period' : ' periods');
const hasTime = ({ startTime, endTime }) => validTime(startTime) && validTime(endTime) && startTime < endTime;

function AssignmentSummary({ teacher }) {
  const groups = [
    ['Classes', teacher.classesAssigned],
    ['Sections', teacher.sectionsAssigned],
    ['Subjects', teacher.subjectsAssigned],
  ];
  return <details className="teacher-assignment-details">
    <summary>Weekly assignments <ChevronDown size={15} aria-hidden="true" /></summary>
    <dl className="teacher-assignment-summary">
      {groups.map(([label, values]) => <div key={label}>
        <dt>{label}</dt>
        <dd>{values?.length ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : '—'}</dd>
      </div>)}
    </dl>
  </details>;
}

function TimelineBoundary({ label, time }) {
  return <div className="teacher-timeline-boundary">
    <span className="teacher-timeline-dot" aria-hidden="true" />
    <span>{label}</span>
    {time && <time dateTime={time}>{timeLabel(time)}</time>}
  </div>;
}

function TimetablePeriod({ period }) {
  const classroom = [period.className, period.sectionName].filter(Boolean).join(' · ');
  return <li className="teacher-timeline-period">
    <span className="teacher-timeline-dot" aria-hidden="true" />
    <article className="teacher-period-card">
      <strong className="teacher-period-label">{period.periodLabel}</strong>
      <p className="teacher-period-range">
        {hasTime(period) ? <>
          <time dateTime={period.startTime}>{timeLabel(period.startTime)}</time>
          <span>–</span>
          <time dateTime={period.endTime}>{timeLabel(period.endTime)}</time>
        </> : 'Time not recorded'}
      </p>
      <h4>{period.subject || 'Subject pending'}</h4>
      <p className="teacher-period-classroom">{classroom || 'Class not recorded'}</p>
      {period.roomNo && <p className="teacher-period-room"><MapPin size={13} aria-hidden="true" /> Room {period.roomNo}</p>}
    </article>
  </li>;
}

function DailyTimeline({ day }) {
  const { label, periods } = day;
  const fullyTimed = periods.every(hasTime);
  const start = fullyTimed ? periods[0].startTime : '';
  const end = fullyTimed ? periods.reduce((latest, { endTime }) => endTime > latest ? endTime : latest, '') : '';
  return <div className="teacher-timeline-scroll" role="region" tabIndex={0} aria-label={label + ' timeline'}>
    <div className="teacher-timeline-track">
      <TimelineBoundary label="Start" time={start} />
      <ol aria-label={label + ' periods'}>
        {periods.map((period) => <TimetablePeriod period={period} key={period.id} />)}
      </ol>
      <TimelineBoundary label="End" time={end} />
    </div>
  </div>;
}

export default function TeacherTimetable({ teacher, timetable, canManage, onRetry }) {
  const [selectedDayId, setSelectedDayId] = useState(null);
  const periods = timetable?.periods || [];
  const days = groupByDay(periods);
  const weekday = new Date().getDay();
  const today = DAYS_OF_WEEK.find(({ index }) => index === weekday);
  const day = days.find(({ id }) => id === selectedDayId) || days.find(({ id }) => id === today.id);
  const dayIndex = days.indexOf(day);
  const nextDay = [...days.slice(dayIndex + 1), ...days.slice(0, dayIndex)].find((entry) => entry.periods.length > 0);
  const sessionLabel = timetable?.sessionName ? 'Academic session ' + timetable.sessionName
    : timetable?.sessionId === 'legacy' ? 'Unassigned academic records' : '';

  return <section className="teacher-panel teacher-timetable" aria-labelledby="teacher-timetable-heading">
    <header className="teacher-section-bar">
      <div>
        <h2 id="teacher-timetable-heading" className="teacher-section-title"><CalendarDays size={18} aria-hidden="true" /> Teaching timetable</h2>
        {sessionLabel && <p className="teacher-note mt-1">{sessionLabel}</p>}
      </div>
      {canManage && <Link className="proc-btn" to="/settings/class-timetable">
        Class Timetable <ArrowUpRight size={14} aria-hidden="true" />
      </Link>}
    </header>
    {!timetable ? <ErrorMessage error="The teacher timetable could not be loaded." onRetry={onRetry} /> : <>
      <nav className="teacher-timetable-days" aria-label="Timetable days">
        {days.map(({ id, label, short, periods: slots }) => <button type="button" key={id} aria-label={label + ', ' + periodCount(slots.length)}
          aria-current={id === today.id ? 'date' : undefined} aria-pressed={day.id === id} onClick={() => setSelectedDayId(id)}>
          <span>{short}</span><span className="teacher-day-count">{slots.length}</span>
        </button>)}
      </nav>
      <section className="teacher-timetable-day" aria-labelledby="teacher-timetable-day-heading">
        <header className="teacher-timetable-day-heading">
          <h3 id="teacher-timetable-day-heading">{day.label}</h3>
          {day.id === today.id && <span className="teacher-timetable-today">Today</span>}
          {day.periods.length > 0 && <p>{periodCount(day.periods.length)}</p>}
        </header>
        {day.periods.length ? <DailyTimeline day={day} key={day.id} /> : <Empty icon={Clock3}
          title={periods.length ? 'No periods on ' + day.label : 'No teaching periods assigned'}
          description={!periods.length && canManage ? 'Assign teaching periods in the Class Timetable Builder.' : undefined}>
          {nextDay && <button type="button" className="proc-btn proc-btn-sm" onClick={() => setSelectedDayId(nextDay.id)}>
            View {nextDay.label}
          </button>}
        </Empty>}
      </section>
      {periods.length > 0 && <AssignmentSummary teacher={teacher} />}
    </>}
  </section>;
}
