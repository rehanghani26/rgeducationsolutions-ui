import { BookOpen, Copy, MapPin, Pencil, Plus, User } from 'lucide-react';
import { Empty, Field } from '../../../components/ui/ProcurementUI.jsx';
import { timeRange } from '../masterPeriods/masterPeriodValues.js';
import { hasAssignment, textKey } from './timetableValues.js';
import { SelectInput } from '../../../components/ui/FormControls.jsx';

function PeriodDetails({ slot, assignment, editing }) {
  return (
    <>
      <span className="ct-period-time">{timeRange(slot.startTime, slot.endTime)}</span>
      <span className="ct-period-label">{slot.label}</span>
      {slot.number && <>
        <strong>{assignment?.subject || (editing && !hasAssignment(assignment) ? 'Assign period' : 'Unassigned')}</strong>
        {assignment?.teacherName && <span className="ct-period-detail"><User size={12} aria-hidden="true" />{assignment.teacherName}</span>}
        {assignment?.roomNo && <span className="ct-period-detail"><MapPin size={12} aria-hidden="true" />{assignment.roomNo}</span>}
        {assignment?.bookName && <span className="ct-period-detail"><BookOpen size={12} aria-hidden="true" />{assignment.bookName}</span>}
      </>}
    </>
  );
}

function Period({ day, slot, assignment, editing, disabled, onAssign }) {
  const tone = slot.number ? (hasAssignment(assignment) ? 'assigned' : 'open')
    : ['lunch', 'recess', 'break'].includes(slot.type) ? 'break' : 'activity';
  const editable = slot.number && editing;
  const className = 'ct-period ct-period-' + tone;
  if (!editable) return <div className={className}><PeriodDetails slot={slot} assignment={assignment} /></div>;

  const filled = hasAssignment(assignment);
  const action = filled ? 'Edit' : 'Assign';
  return <button
    type="button"
    className={className}
    disabled={disabled}
    aria-label={action + ' ' + day.label + ' ' + slot.label}
    onClick={() => onAssign(day, slot)}
  >
    <PeriodDetails slot={slot} assignment={assignment} editing />
    <span className="ct-period-action">{filled ? <Pencil size={13} /> : <Plus size={14} />}</span>
  </button>;
}

export function WeekSchedule({ days, assignments, editing, disabled, onAssign }) {
  const count = Math.max(0, ...days.map((day) => day.slots.length));
  return (
    <>
      <p className="ct-scroll-hint">Scroll across to see more days, or use Day view.</p>
      <div className="ct-week-scroll" role="region" aria-label="Weekly timetable" tabIndex={0}>
        <table className="ct-week-table" style={{ '--ct-days': days.length }}>
          <thead>
            <tr>{days.map((day) => (
              <th scope="col" key={day.id}>
                {day.label}
                {day.halfDay && <span>Half day</span>}
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {Array.from({ length: count }, (_, index) => <tr key={index}>
              {days.map((day) => {
                const slot = day.slots[index];
                return <td key={day.id}>
                  {slot ? <Period day={day} slot={slot} assignment={assignments[slot.key]} editing={editing} disabled={disabled} onAssign={onAssign} />
                    : <span className="ct-period-ended" aria-label="School day ended">&mdash;</span>}
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function DaySchedule({ days, day, assignments, editing, disabled, onDayChange, onAssign, onCopy }) {
  const canCopy = days.length > 1 && day.slots.some((slot) => slot.number && hasAssignment(assignments[slot.key]));
  return (
    <div className="ct-day">
      <div className="ct-day-toolbar">
        <div className="ct-tabs" role="group" aria-label="School day">
          {days.map((item) => <button type="button" key={item.id} aria-label={item.label} aria-pressed={item.id === day.id} onClick={() => onDayChange(item.id)}>
            {item.short}
          </button>)}
        </div>
        {editing && days.length > 1 && <button type="button" className="proc-btn" onClick={onCopy} disabled={disabled || !canCopy}>
          <Copy size={15} /> Copy {day.label} to other days
        </button>}
      </div>
      <div className="ct-day-title">
        <h3>{day.label}</h3>
        <span>{timeRange(day.start, day.end)}{day.halfDay && ' · Half day'}</span>
      </div>
      <ul className="ct-day-periods">
        {day.slots.map((slot) => <li key={slot.key}>
          <Period day={day} slot={slot} assignment={assignments[slot.key]} editing={editing} disabled={disabled} onAssign={onAssign} />
        </li>)}
      </ul>
    </div>
  );
}

export function TeacherSchedule({ days, assignments, teacher, onTeacherChange }) {
  const rows = days.flatMap((day) => day.slots.flatMap((slot) => {
    const value = assignments[slot.key];
    if (!slot.number || !(value?.teacherName || value?.teacherId)) return [];
    const teacherKey = value.teacherId ? 'id-' + value.teacherId : 'name-' + textKey(value.teacherName);
    return [{ day, slot, value, teacherKey }];
  }));
  const teachers = [...new Map(rows.map(({ teacherKey, value }) => [teacherKey, value.teacherName || 'Teacher']))]
    .sort((left, right) => left[1].localeCompare(right[1]));
  const selected = teachers.some(([key]) => key === teacher) ? teacher : '';
  if (!rows.length) return <Empty icon={User} title="No teachers assigned" description="Add teachers to teaching periods to see their schedule here." />;

  return (
    <div className="ct-teachers">
      <Field label="Teacher">
        <SelectInput className="ct-control" value={selected} onChange={(event) => onTeacherChange(event.target.value)}>
          <option value="">All assigned teachers</option>
          {teachers.map(([key, name]) => <option value={key} key={key}>{name}</option>)}
        </SelectInput>
      </Field>
      <ul className="ct-day-periods" aria-label="Teacher assignments">
        {rows.filter((row) => !selected || row.teacherKey === selected).map(({ day, slot, value }) => <li key={slot.key}>
          <div className="ct-period ct-period-assigned">
            <span className="ct-teacher-day">{day.label}</span>
            <PeriodDetails slot={slot} assignment={value} />
          </div>
        </li>)}
      </ul>
    </div>
  );
}
