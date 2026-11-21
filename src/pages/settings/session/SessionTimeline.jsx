import { ArrowRight, Pencil } from 'lucide-react';
import { formatSessionDate } from './sessionValues.js';

function SessionPeriod({ kind, title, session, empty, editing, onEdit, busy }) {
  return (
    <article className={`session-period session-period--${kind}`} aria-label={title}>
      <div className="session-period-header">
        <span className="session-period-label">{title}</span>
        {session && onEdit && (
          <button type="button" className="session-period-edit" onClick={onEdit} disabled={busy}
            aria-label={'Edit dates for ' + session.sessionName} aria-expanded={editing}
            aria-controls={editing ? 'session-date-form' : undefined}>
            <Pencil size={14} aria-hidden="true" /> Edit dates
          </button>
        )}
      </div>
      {session ? <>
        <h2 className="session-period-name">{session.sessionName}</h2>
        <dl className="session-period-dates">
          <div><dt>Starts</dt><dd>{formatSessionDate(session.startDate)}</dd></div>
          <div><dt>Ends</dt><dd>{formatSessionDate(session.endDate)}</dd></div>
        </dl>
      </> : <p className="session-period-empty">{empty}</p>}
    </article>
  );
}

export default function SessionTimeline({ current, upcoming, busy, loading, panel, onEdit }) {
  return (
    <section className="session-timeline" aria-label="Current and upcoming sessions" aria-busy={loading}>
      <SessionPeriod kind="current" title="Current session" session={current} editing={panel === 'current-dates'}
        onEdit={onEdit && (() => onEdit('current-dates'))} busy={busy}
        empty={loading ? 'Loading current session…' : 'No current session'} />
      {current && upcoming && <span className="session-timeline-arrow" aria-hidden="true"><ArrowRight size={16} /></span>}
      <SessionPeriod kind="upcoming" title="Upcoming session" session={upcoming} editing={panel === 'upcoming-dates'}
        onEdit={onEdit && (() => onEdit('upcoming-dates'))} busy={busy}
        empty={loading ? 'Scheduling the next session…' : 'No upcoming session yet'} />
    </section>
  );
}
