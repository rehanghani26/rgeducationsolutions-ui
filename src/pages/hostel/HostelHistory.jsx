import { useState } from 'react';
import { ArrowRightLeft, Building2, CalendarDays, DoorOpen, LogOut, UserCheck, Users } from 'lucide-react';
import FormSelect from '../../components/ui/FormSelect.jsx';
import ModuleHistory from '../../components/ui/ModuleHistory.jsx';
import useHostelData from '../../hooks/useHostelData.js';
import { hostelError } from '../../services/hostelService.js';
import { badge, bg, border, text } from '../../theme/color.js';
import { bedLocation, formatHostelDate, hostelStatusCode, hostelStatuses } from './hostelView.js';

const eventLabels = {
  hostelCreated: ['Hostel created', 'Created by'], hostelUpdated: ['Hostel details updated', 'Edited by'],
  roomCreated: ['Room added', 'Added by'], roomUpdated: ['Room updated', 'Edited by'],
};

const closingEvents = {
  left: ['Left hostel permanently', LogOut],
  transferred: ['Transferred out of room', ArrowRightLeft],
  continued: ['Continued in the next session', CalendarDays],
  cancelled: ['Assignment cancelled', CalendarDays],
};

const auditTime = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

export default function HostelHistory({ hostel, hostels = [], roomId = '', compact = false }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(!compact);
  const [filterHostelId, setFilterHostelId] = useState('');
  const hostelId = hostel?._id || filterHostelId;
  const query = new URLSearchParams({ page: String(page), limit: expanded ? '20' : '1', ...(roomId && { roomId }) });
  const path = hostelId ? `/hostels/${hostelId}/history` : '/hostels/history';
  const { data, error, loading, reload } = useHostelData(`${path}?${query}`);

  const filters = !hostel && hostels.length > 0 && <FormSelect label="History for" className="w-full sm:max-w-56"
    options={[{ value: '', label: 'All hostels' }, ...hostels.map((item) => ({ value: item._id, label: item.name }))]}
    value={filterHostelId} onChange={(event) => {
      setPage(1);
      setFilterHostelId(event.target.value);
    }} />;

  function toggle(nextExpanded) {
    setPage(1);
    if (!nextExpanded) setFilterHostelId('');
    setExpanded(nextExpanded);
  }

  return <ModuleHistory title={hostel && !compact ? 'Room history' : 'Hostel history'} entries={data?.data}
    pagination={data?.pagination} loading={loading} error={error && hostelError(error)} onRetry={reload}
    onPageChange={setPage} expanded={expanded} onExpandChange={compact ? toggle : undefined} filters={filters}
    renderSummary={renderLatestActivity}
    renderEntry={(entry, { cards }) => <HistoryEntry entry={entry} cards={cards} showHostel={!hostel} />} />;
}

function renderLatestActivity(entry) {
  const allocation = entry.kind === 'allocation';
  const code = hostelStatusCode(entry.status);
  const action = allocation ? closingEvents[code]?.[0] || 'Room assignment' : eventLabels[entry.event]?.[0] || 'Hostel activity';
  const actor = allocation ? (entry.endedAt ? entry.endedByName : entry.openedByName) : entry.actorName;
  const description = [allocation && entry.studentName, bedLocation(entry), actor].filter(Boolean).join(' · ');

  return <div className="flex min-w-0 items-baseline gap-2 sm:gap-4">
    <p className="min-w-0 flex-1 truncate" title={[action, description].filter(Boolean).join(' · ')}>
      <strong className={text.primary}>{action}</strong>{description && ' · ' + description}
    </p>
    {entry.date && <time dateTime={entry.date} className="shrink-0 whitespace-nowrap">
      {auditTime.format(new Date(entry.date))}
    </time>}
  </div>;
}

function HistoryEntry({ entry, cards, showHostel }) {
  const allocation = entry.kind === 'allocation';
  const code = hostelStatusCode(entry.status);
  const [status, tone] = hostelStatuses[code];
  const [eventTitle, actorLabel] = eventLabels[entry.event] || ['Hostel activity', 'Recorded by'];
  const Icon = allocation ? Users : entry.room ? DoorOpen : Building2;
  const location = bedLocation({ ...entry, hostelName: showHostel ? entry.hostelName : undefined });
  const details = [entry.admissionNumber, location, entry.sessionName].filter(Boolean).join(' · ');
  const end = closingEvents[code];
  const assignedAt = entry.assignedAt || entry.createdAt;
  return <article className={`relative w-full min-w-0 gap-3 rounded-xl border p-3 ${border.default} ${bg.card} ${cards
    ? 'flex flex-col' : 'grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center'}`}>
    <div className={`flex min-w-0 gap-2.5 ${cards ? 'flex-col items-center text-center' : 'items-center'}`}>
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${bg.brandSubtle}`}><Icon size={16} aria-hidden="true" /></span>
      <div className="min-w-0">
        <div className={`flex flex-wrap items-center gap-1.5 ${cards ? 'justify-center' : ''}`}>
          <h3 className={`break-words text-sm font-bold ${text.primary}`}>{allocation ? entry.studentName : eventTitle}</h3>
          {allocation && <span className={`${badge[tone]} px-2 py-0.5 text-[11px]`}>{status}</span>}
        </div>
        {details && <p className={`mt-0.5 break-words text-xs ${text.secondary}`}>{details}</p>}
      </div>
    </div>
    <div className={`grid min-w-0 gap-2 ${cards ? 'mt-auto' : allocation ? 'sm:grid-cols-2' : ''}`}>
      {allocation ? <>
        {assignedAt && <HistoryDate date={assignedAt} actor={entry.openedByName} actorLabel="Recorded by"
          recordedAt={entry.assignedRecordedAt}
          label={code === 'legacy' ? 'Allocation recorded' : 'Assigned to room'} icon={UserCheck} />}
        {entry.endedAt && <HistoryDate date={entry.endedAt} label={end?.[0] || 'Assignment ended'}
          icon={end?.[1] || CalendarDays} reason={entry.endReason} actor={entry.endedByName} actorLabel="Recorded by"
          recordedAt={entry.endedRecordedAt} />}
      </> : entry.date && <HistoryDate date={entry.date} icon={CalendarDays} actor={entry.actorName}
        actorLabel={actorLabel} showTime />}
    </div>
  </article>;
}

function HistoryDate({ date, label, icon: Icon, reason, actor, actorLabel, showTime, recordedAt }) {
  return <div className={`flex min-w-0 items-start gap-2 rounded-lg border px-2.5 py-1.5 ${bg.surfaceSubtle} ${border.default}`}>
    <Icon size={14} aria-hidden="true" className={`mt-0.5 shrink-0 ${text.brand}`} />
    <div className="min-w-0 text-xs">
      {label && <p className={`font-semibold ${text.primary}`}>{label}</p>}
      <time dateTime={date} className={text.secondary}>{showTime ? auditTime.format(new Date(date)) : formatHostelDate(date)}</time>
      {actor ? <p className={`mt-0.5 break-words ${text.secondary}`}>{actorLabel} <strong className={text.primary}>{actor}</strong></p>
        : showTime && <p className={`mt-0.5 ${text.secondary}`}>Actor unavailable</p>}
      {recordedAt && <p className={`mt-0.5 ${text.secondary}`}>Recorded <time dateTime={recordedAt}>{auditTime.format(new Date(recordedAt))}</time></p>}
      {reason && <p className={`mt-1 break-words ${text.secondary}`}>{reason}</p>}
    </div>
  </div>;
}
