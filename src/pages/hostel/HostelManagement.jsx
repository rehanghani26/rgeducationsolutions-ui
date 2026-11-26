import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BedDouble, Building2, CheckCircle2, ClipboardList, DoorOpen, MapPin, Phone, Plus, Settings2, Users } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import Modal from '../../components/ui/Modal.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import useHostelData from '../../hooks/useHostelData.js';
import { ROUTES } from '../../routes/routes.js';
import { hostelError } from '../../services/hostelService.js';
import { badge, bg, border, card, shadow, text } from '../../theme/color.js';
import HostelAllocationDialog from './HostelAllocationDialog.jsx';
import HostelEditor from './HostelEditor.jsx';
import HostelHistory from './HostelHistory.jsx';
import HostelRoomCards from './HostelRoomCards.jsx';
import HostelRoomEditor from './HostelRoomEditor.jsx';
import { bedLocation, hostelCategoryName } from './hostelView.js';

const roomOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function wardenNames(hostel, staff) {
  return staff.filter((user) => hostel.wardens.includes(user._id)).map((user) => user.name).join(', ');
}

function HostelCard({ hostel, rooms, staff }) {
  const { available } = countBeds(rooms);
  const wardens = wardenNames(hostel, staff);
  const category = hostelCategoryName(hostel.category);
  return (
    <Link to={`${ROUTES.HOSTEL}/${hostel._id}`}
      className={`${card.interactive} group flex min-w-0 flex-col overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${border.brand}`}>
      <div className={`h-1 ${bg.brandGradient}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl border ${bg.brandSubtle} ${border.brand}`}>
            <Building2 size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={`break-words text-lg leading-tight ${text.heading}`}>{hostel.name}</h2>
            {category && <span className={`${badge.info} mt-1.5 inline-flex px-2 py-0.5 text-[11px]`}>{category}</span>}
          </div>
          <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-lg border transition-transform group-hover:-translate-y-0.5 ${border.default} ${text.brand}`}>
            <ArrowUpRight size={15} />
          </span>
        </div>
        {(wardens || hostel.address || hostel.description) && (
          <div className={`space-y-2 text-sm ${text.secondary}`}>
            {wardens && <p className="flex items-start gap-2 break-words"><Users size={15} className={`mt-0.5 shrink-0 ${text.brand}`} aria-hidden="true" />{wardens}</p>}
            {hostel.address && <p className="flex items-start gap-2 break-words"><MapPin size={15} className={`mt-0.5 shrink-0 ${text.brand}`} aria-hidden="true" />{hostel.address}</p>}
            {hostel.description && <p className="line-clamp-2 break-words text-xs">{hostel.description}</p>}
          </div>
        )}
      </div>
      <dl className={`grid grid-cols-3 gap-2 border-t px-4 py-3 sm:px-5 ${border.default} ${bg.surfaceSubtle}`}>
        <CardMetric label="Rooms" value={rooms.length} icon={DoorOpen} />
        <CardMetric label="Capacity" value={hostel.capacity ?? '—'} icon={BedDouble} />
        <CardMetric label="Available beds" value={available} icon={CheckCircle2} />
      </dl>
    </Link>
  );
}

function CardMetric({ label, value, icon: Icon }) {
  return <div className="min-w-0">
    <dt className={`flex items-center gap-1.5 text-[11px] font-semibold leading-tight ${text.secondary}`}>
      <Icon size={13} aria-hidden="true" className={`hidden shrink-0 min-[380px]:block ${text.brand}`} />{label}
    </dt>
    <dd className={`mt-0.5 break-words text-lg font-bold tabular-nums ${text.primary}`}>{value}</dd>
  </div>;
}

function countBeds(rooms) {
  const beds = rooms.flatMap((room) => room.beds);
  return { configured: beds.length, available: beds.filter((bed) => bed.status === 'available').length };
}

function HostelOverview({ hostel, roomCount, configuredBeds, available, wardens }) {
  const category = hostelCategoryName(hostel.category);
  const capacity = hostel.capacity ? `${configuredBeds} / ${hostel.capacity}` : configuredBeds;
  return <section aria-label="Hostel overview" className={`${card.base} overflow-hidden ${shadow.sm}`}>
    <div className={`h-1 ${bg.brandGradient}`} aria-hidden="true" />
    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)] lg:items-center">
      <div className="flex min-w-0 gap-3.5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl border sm:size-12 ${bg.brandSubtle} ${border.brand}`}>
          <Building2 size={23} aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-2">
          {category && <span className={`${badge.info} inline-flex px-2 py-0.5 text-[11px]`}>{category}</span>}
          {hostel.address && <p className={`flex items-start gap-2 break-words text-sm ${text.secondary}`}>
            <MapPin size={15} className={`mt-0.5 shrink-0 ${text.brand}`} aria-hidden="true" />{hostel.address}
          </p>}
          {(wardens || hostel.contactPhone) && <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {wardens && <p className={`flex items-start gap-2 break-words ${text.secondary}`}><Users size={15} className={`mt-0.5 shrink-0 ${text.brand}`} aria-hidden="true" />{wardens}</p>}
            {hostel.contactPhone && <a href={`tel:${hostel.contactPhone}`} className={`inline-flex items-center gap-2 ${text.link}`}><Phone size={15} aria-hidden="true" />{hostel.contactPhone}</a>}
          </div>}
          {hostel.description && <p className={`whitespace-pre-line break-words text-sm ${text.secondary}`}>{hostel.description}</p>}
        </div>
      </div>
      <dl className={`grid grid-cols-3 gap-2 rounded-xl border px-2.5 py-3 sm:gap-3 sm:p-4 ${border.default} ${bg.surfaceSubtle}`}>
        <CardMetric label="Rooms" value={roomCount} icon={DoorOpen} />
        <CardMetric label="Configured beds" value={capacity} icon={BedDouble} />
        <CardMetric label="Available beds" value={available} icon={CheckCircle2} />
      </dl>
    </div>
  </section>;
}

function LegacyReview({ workspace, sessions, sessionId, setSession, open }) {
  return <section className={`${card.base} space-y-3 p-4`}>
    <FormSelect label="Academic session" className="w-full sm:max-w-56" options={[
      ...sessions.map((session) => ({ value: session._id || session.id, label: session.sessionName })),
      { value: 'legacy', label: 'Unassigned records' },
    ]} value={sessionId || 'legacy'} onChange={(event) => setSession(event.target.value)} />
    {workspace.legacy.length ? <ul className={`divide-y ${border.divider}`}>
      {workspace.legacy.map((row) => (
        <li key={row._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <div>
            <p className={`font-semibold ${text.primary}`}>{row.studentName}</p>
            <p className={`text-xs ${text.secondary}`}>{bedLocation(row)} · {row.matchingBedIds.length} matching beds</p>
          </div>
          {workspace.session && <div className="flex gap-2">
            <Button size="xs" variant="outline" onClick={() => open('legacy', row)}>Map to a bed</Button>
            <Button size="xs" variant="ghost" onClick={() => open('dismiss', row)}>Close review</Button>
          </div>}
        </li>
      ))}
    </ul> : <p className={`text-sm ${text.secondary}`}>No existing allocations to review for this session.</p>}
  </section>;
}

export default function HostelManagement() {
  const { hostelId } = useParams();
  return <HostelWorkspace key={hostelId || 'all'} hostelId={hostelId} />;
}

function HostelWorkspace({ hostelId }) {
  const { sessionId: activeSessionId, sessions, sessionsLoading } = useAcademicSession();
  const [review, setReview] = useState(false);
  const [reviewSession, setReviewSession] = useState('');
  const [minimizedRooms, setMinimizedRooms] = useState(() => new Set());
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const sessionId = review ? reviewSession || activeSessionId || 'legacy' : activeSessionId;
  const { data: workspace, loading, error, reload } = useHostelData('/workspace', { sessionId, enabled: !sessionsLoading });
  const hostel = workspace?.hostels.find((item) => item._id === hostelId);
  const rooms = (workspace?.rooms.filter((room) => room.hostelId === hostelId) || []).sort(
    (left, right) => roomOrder.compare(left.number, right.number) || roomOrder.compare(left.block || '', right.block || ''),
  );
  const { configured: configuredBeds, available } = countBeds(rooms);
  const wardens = hostel && wardenNames(hostel, workspace.staff);

  function open(mode, row) {
    setNotice('');
    setDialog({ mode, row });
  }
  function onSave(message) {
    setDialog(null);
    setNotice(message);
    reload();
  }
  const close = () => setDialog(null);
  const title = hostel ? hostel.name : review ? 'Existing allocations' : 'Hostel Management';

  const showFooter = workspace && !review && !hostelId;

  return <section className="flex h-full min-h-0 w-full flex-col">
    <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto p-4">
    <PageHeader title={title}
      breadcrumbs={hostelId ? [{ label: 'Hostels', to: ROUTES.HOSTEL }, { label: hostel?.name || 'Hostel details' }] : []}
      actions={workspace?.canConfigure && (
        hostelId ? hostel && <>
          <Button size="sm" variant="outline" icon={Settings2} onClick={() => open('hostel', hostel)}>Edit hostel</Button>
          <Button size="sm" icon={Plus} disabled={hostel.capacity != null && configuredBeds >= hostel.capacity} onClick={() => open('room')}>Add room</Button>
        </> : <>
          <Button size="sm" variant="outline" icon={review ? ArrowLeft : ClipboardList}
            onClick={() => { setReview(!review); setReviewSession(''); setNotice(''); }}>
            {review ? 'Back to hostels' : 'Review existing allocations'}
          </Button>
          {!review && <Button size="sm" icon={Plus} onClick={() => open('hostel')}>Create hostel</Button>}
        </>
      )} />
    {notice && <p role="status" className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs ${badge.success}`}>
      <CheckCircle2 size={15} aria-hidden="true" />{notice}
    </p>}
    {(loading || sessionsLoading) && <p role="status" className={`text-sm ${text.secondary}`}>Loading hostel records…</p>}
    {error && <div className={`${card.base} flex flex-wrap items-center gap-3 p-4`}>
      <p role="alert" className={`text-sm ${text.danger}`}>{hostelError(error)}</p>
      <Button size="sm" variant="outline" onClick={reload}>Retry</Button>
    </div>}
    {workspace && (hostelId ? (hostel ? <>
      <HostelOverview hostel={hostel} roomCount={rooms.length} configuredBeds={configuredBeds} available={available} wardens={wardens} />
      <HostelRoomCards hostel={hostel} rooms={rooms} workspace={workspace} open={open}
        minimizedRooms={minimizedRooms} setMinimizedRooms={setMinimizedRooms} />
    </> : <div className={card.base}><EmptyState icon={Building2} title="Hostel unavailable" /></div>) : (
      review ? <LegacyReview workspace={workspace} sessions={sessions.filter((session) => session.isCurrent || session.status === 'completed')}
        sessionId={sessionId} setSession={setReviewSession} open={open} />
        : workspace.hostels.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {workspace.hostels.map((item) => <HostelCard key={item._id} hostel={item} staff={workspace.staff}
                rooms={workspace.rooms.filter((room) => room.hostelId === item._id)} />)}
            </div>
          ) : <div className={card.base}><EmptyState icon={Building2} title="No hostels configured" /></div>
    ))}
    </div>
    {showFooter && <footer className="min-w-0 shrink-0">
      <HostelHistory hostels={workspace.hostels} compact />
    </footer>}
    {dialog && workspace && (dialog.mode === 'hostel'
      ? <HostelEditor hostel={dialog.row} staff={workspace.staff} onClose={close} onSave={onSave} />
      : dialog.mode === 'room'
        ? <HostelRoomEditor room={dialog.row} hostel={hostel} workspace={workspace} sessionId={sessionId} onClose={close} onSave={onSave} />
        : dialog.mode === 'history' ? (
          <Modal open onClose={close} title={`Room ${dialog.row.number}`} size="4xl" bodyClassName="!p-4">
            <HostelHistory hostel={hostel} roomId={dialog.row._id} />
          </Modal>
        ) : <HostelAllocationDialog mode={dialog.mode} row={dialog.row} workspace={workspace} sessionId={sessionId} onClose={close} onSave={onSave} />
    )}
  </section>;
}
