import { useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { AcademicState } from './AcademicUI.jsx';

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export function AcademicTimetable({ slots }) {
  const [selection, select] = useState('');
  const days = weekdays.filter((day) => slots.some((slot) => slot.day?.toLowerCase() === day));
  const day = days.includes(selection) ? selection : days[0];
  if (!day) return <AcademicState icon={CalendarDays} title="No timetable available" detail="The classroom timetable will appear here when it has been set up." />;
  const periods = slots.filter((slot) => slot.day?.toLowerCase() === day)
    .sort((a, b) => (a.periodOrder || 0) - (b.periodOrder || 0));
  return <section className="academic-panel academic-compact">
    <h2>Weekly timetable</h2>
    <nav className="academic-tabs" aria-label="Timetable day">
      {days.map((value) => <button type="button" className="academic-day" key={value}
        aria-current={day === value ? 'true' : undefined} onClick={() => select(value)}>{value}</button>)}
    </nav>
    {periods.map((slot, index) => <div className="academic-row" key={slot._id || index}>
      <span><strong>{slot.subject || slot.customLabel || slot.periodType || 'Period'}</strong>
        {(slot.teacherName || slot.roomNo) && <small>{[slot.teacherName, slot.roomNo].filter(Boolean).join(' · ')}</small>}</span>
      {(slot.startTime || slot.endTime) && <span className="academic-actions"><Clock size={15} aria-hidden="true" />
        {[slot.startTime, slot.endTime].filter(Boolean).join(' – ')}</span>}
    </div>)}
  </section>;
}
