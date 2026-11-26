import { useState } from 'react';
import { BedDouble, CalendarDays, CheckCircle2, Phone, Plus } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import useHostelData from '../../hooks/useHostelData.js';
import { hostelError } from '../../services/hostelService.js';
import { badge, card, text } from '../../theme/color.js';
import AssignStudentBedDialog from './AssignStudentBedDialog.jsx';
import { bedLocation, formatHostelDate, hostelStatusCode, hostelStatuses } from './hostelView.js';

export function HostelPlacement({ allocation, subtitle, loading = false, error, action, emptyMessage = 'No hostel allocation recorded.' }) {
  const status = allocation && hostelStatuses[hostelStatusCode(allocation.needsRollover ? 'pendingRollover' : allocation.status)];
  return (
    <section className={`${card.base} space-y-3 p-4`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BedDouble size={18} className={text.brand} />
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>Hostel allocation</h3>
            {subtitle && <p className={`text-xs ${text.secondary}`}>{subtitle}</p>}
          </div>
        </div>
        {status && <span className={`${badge[status[1]]} px-2 py-0.5 text-xs`}>{status[0]}</span>}
        {action}
      </header>
      {loading && <p role="status" className={`text-sm ${text.secondary}`}>Loading hostel allocation…</p>}
      {error && <p role="alert" className={`text-sm ${text.danger}`}>{hostelError(error)}</p>}
      {!loading && !error && !allocation && <p className={`text-sm ${text.secondary}`}>{emptyMessage}</p>}
      {allocation && (
        <div className={`space-y-1 text-sm ${text.secondary}`}>
          <p className={`font-semibold ${text.primary}`}>{bedLocation(allocation)}</p>
          <p>{[allocation.roomType, allocation.sessionName].filter(Boolean).join(' · ')}</p>
          {allocation.assignedAt && <p className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" className={text.brand} />
            Assigned on {formatHostelDate(allocation.assignedAt)}
          </p>}
          {allocation.wardens.length > 0 && <p>Warden {allocation.wardens.join(', ')}</p>}
          {allocation.contactPhone && (
            <a href={`tel:${allocation.contactPhone}`} className={`inline-flex items-center gap-1.5 ${text.link}`}>
              <Phone size={14} /> {allocation.contactPhone}
            </a>
          )}
        </div>
      )}
    </section>
  );
}

export default function StudentHostelPlacement({ studentId = 'me' }) {
  const { sessionId, sessionsLoading } = useAcademicSession();
  const { data, error, loading, reload } = useHostelData('/students/' + encodeURIComponent(studentId), {
    sessionId, enabled: !sessionsLoading,
  });
  const [assigning, setAssigning] = useState(false);
  const [notice, setNotice] = useState('');
  const placementError = studentId !== 'me' && error?.response?.status === 404 ? undefined : error;
  const canAssign = Boolean(sessionId && data?.assignment?.canAssign && !data.allocation);

  return <div className="space-y-3">
    {notice && <p role="status" className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs ${badge.success}`}>
      <CheckCircle2 size={15} aria-hidden="true" />{notice}
    </p>}
    <HostelPlacement allocation={data?.allocation} loading={sessionsLoading || loading} error={placementError}
      emptyMessage={data?.assignment?.reason}
      action={canAssign && <Button size="sm" icon={Plus} onClick={() => setAssigning(true)}>Assign bed</Button>} />
    {assigning && canAssign && <AssignStudentBedDialog student={data.student} sessionId={sessionId}
      onClose={() => { setAssigning(false); reload(); }}
      onSave={(message) => { setAssigning(false); setNotice(message); reload(); }} />}
  </div>;
}
