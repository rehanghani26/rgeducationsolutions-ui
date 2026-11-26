import {
  ArrowRightLeft, BedDouble, CalendarDays, Check, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp,
  DoorOpen, History, LogOut, Settings2, UserPlus,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { badge, bg, border, card, shadow, text } from '../../theme/color.js';
import { bedLabel, formatHostelDate, hostelStatusCode, hostelStatuses } from './hostelView.js';

export default function HostelRoomCards({ hostel, rooms, workspace, open, minimizedRooms, setMinimizedRooms }) {
  if (!rooms.length) {
    return <div className={card.base}><EmptyState icon={DoorOpen} title="No rooms in this hostel" /></div>;
  }
  const residentByBed = new Map(workspace.allocations.filter((row) => row.active && row.hostelId === hostel._id).map((row) => [row.bedId, row]));
  const canTransfer = workspace.rooms.some((room) => room.beds.some((bed) => bed.status === 'available'));
  const minimizedCount = rooms.filter((room) => minimizedRooms.has(room._id)).length;

  function toggleRoom(id) {
    setMinimizedRooms((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return <>
    <div className="mb-3 flex flex-wrap justify-end gap-2" role="group" aria-label="Room display">
      <Button size="sm" variant="outline" icon={ChevronsDown} disabled={minimizedCount === 0}
        onClick={() => setMinimizedRooms(new Set())}>Expand all</Button>
      <Button size="sm" variant="outline" icon={ChevronsUp} disabled={minimizedCount === rooms.length}
        onClick={() => setMinimizedRooms(new Set(rooms.map((room) => room._id)))}>Minimize all</Button>
    </div>
    <ol aria-label="Hostel rooms">
    {rooms.map((room, index) => {
      const expanded = !minimizedRooms.has(room._id);
      const panelId = `hostel-room-${room._id}-beds`;
      const available = room.beds.filter((bed) => bed.status === 'available').length;
      const manage = workspace.canConfigure || (workspace.canAllocate && available > 0);
      const details = [room.block && 'Block ' + room.block, room.roomType].filter(Boolean).join(' · ');
      const usedLabels = new Set();
      const duplicateLabels = new Set();
      for (const bed of expanded ? room.beds : []) {
        const label = bedLabel(bed.label);
        if (usedLabels.has(label)) duplicateLabels.add(label);
        usedLabels.add(label);
      }

      return <li key={room._id} className="relative pl-10 pb-4 last:pb-0 sm:pl-16 sm:pb-6">
        {index < rooms.length - 1 && (
          <span aria-hidden="true" className={`absolute left-4 top-8 h-full -translate-x-1/2 border-l-2 sm:left-5 sm:top-9 ${border.brand}`} />
        )}
        <span aria-hidden="true" className={`absolute left-4 top-8 w-6 border-t-2 sm:left-5 sm:top-9 sm:w-11 ${border.brand}`} />
        <span aria-hidden="true" className={`absolute left-0 top-4 grid size-8 place-items-center rounded-xl border sm:size-10 ${bg.card} ${border.brand} ${text.brand} ${shadow.sm}`}>
          <DoorOpen size={17} />
        </span>
        <section className={`${card.base} relative overflow-hidden`}>
          <header className={`flex flex-wrap items-start justify-between gap-3 px-3 py-3.5 sm:px-5 sm:py-4 ${bg.surfaceSubtle} ${expanded ? `border-b ${border.default}` : ''}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`break-words text-base ${text.heading}`}>Room {room.number}</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] ${available ? badge.success : badge.neutral}`}>
                  <BedDouble size={13} aria-hidden="true" /> {available} of {room.beds.length} available
                </span>
              </div>
              {details && <p className={`mt-1 text-xs ${text.secondary}`}>{details}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button size="sm" variant="ghost" icon={History} onClick={() => open('history', room)}>Room history</Button>
              {manage && (
                <Button size="sm" variant="outline" icon={workspace.canConfigure ? Settings2 : UserPlus} onClick={() => open('room', room)}>
                  {workspace.canConfigure ? 'Manage room' : 'Assign students'}
                </Button>
              )}
              <Button size="sm" variant="ghost" icon={expanded ? ChevronUp : ChevronDown}
                aria-label={`${expanded ? 'Minimize' : 'Expand'} room ${room.number}`}
                aria-expanded={expanded} aria-controls={panelId} onClick={() => toggleRoom(room._id)}>
                {expanded ? 'Minimize' : 'Expand'}
              </Button>
            </div>
          </header>
          <div id={panelId} hidden={!expanded}>
            {expanded && <>
              {room.features && <p className={`break-words whitespace-pre-line px-3 pt-3 text-sm sm:px-4 ${text.secondary}`}>{room.features}</p>}
              <ul className="grid gap-2 p-2.5 sm:gap-3 sm:p-4 md:grid-cols-2">
                {room.beds.map((bed) => (
                  <BedCard key={bed._id} bed={bed} resident={residentByBed.get(bed._id)}
                    showStoredLabel={duplicateLabels.has(bedLabel(bed.label))}
                    canAllocate={workspace.canAllocate} canTransfer={canTransfer} open={open} />
                ))}
              </ul>
            </>}
          </div>
        </section>
      </li>;
    })}
    </ol>
  </>;
}

function BedCard({ bed, resident, showStoredLabel, canAllocate, canTransfer, open }) {
  const [label, color] = hostelStatuses[hostelStatusCode(bed.status)];
  const assignedAt = resident?.assignedAt || resident?.createdAt;
  return <li className={`min-w-0 rounded-xl border p-3 sm:p-4 ${resident ? border.brand : border.default} ${bg.card}`}>
    <div className="flex flex-wrap items-start justify-between gap-1.5">
      <div className="flex min-w-0 gap-2.5">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${resident ? bg.brandSubtle : bg.surface}`}>
          <BedDouble aria-hidden="true" size={15} className={resident ? text.brand : text.secondary} />
        </span>
        <div className="min-w-0">
          <p className={`break-words text-xs font-bold ${resident ? text.secondary : text.primary}`}>{bedLabel(bed.label)}</p>
          {showStoredLabel && <p className={`break-words text-[11px] ${text.secondary}`}>Bed label: {bed.label}</p>}
          {resident && <p className={`break-words text-sm font-bold ${text.primary}`}>{resident.studentName}</p>}
          {resident?.admissionNumber && <p className={`mt-0.5 break-words text-[11px] ${text.secondary}`}>{resident.admissionNumber}</p>}
          {resident && canAllocate && !resident.eligible &&
            <p className={`mt-0.5 text-[11px] ${text.warning}`}>No active enrollment</p>}
        </div>
      </div>
      <span className={`inline-flex px-2 py-0.5 text-[11px] ${badge[color]}`}>{label}</span>
    </div>
    {assignedAt && <p className={`mt-3 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${bg.brandSubtle}`}>
      <CalendarDays size={14} aria-hidden="true" /> Assigned on {formatHostelDate(assignedAt)}
    </p>}
    {resident && canAllocate && <div className={`mt-2.5 flex flex-wrap items-center gap-1 border-t pt-2 ${border.subtle}`}>
      <AllocationActions row={resident} canTransfer={canTransfer} open={open} />
    </div>}
  </li>;
}

function AllocationActions({ row, canTransfer, open }) {
  return <>
    {row.eligible && row.needsRollover && <Button size="xs" variant="outline" icon={Check} onClick={() => open('continue', row)}>Confirm renewal</Button>}
    {/* Temporarily disabled with the attendance-style hostel workflow.
    {row.eligible && !row.needsRollover && row.status === 'reserved' &&
      <Button size="xs" variant="outline" icon={Check} onClick={() => open('check-in', row)}>Check in</Button>}
    <Button size="xs" variant="ghost" icon={LogOut} onClick={() => open('release', row)}>
      {row.status === 'reserved' ? 'Cancel reservation' : 'Check out'}
    </Button>
    */}
    {row.eligible && !row.needsRollover && canTransfer &&
      <Button size="xs" variant="ghost" icon={ArrowRightLeft} onClick={() => open('transfer', row)}>Transfer</Button>}
    <Button size="xs" variant="outline" icon={LogOut} onClick={() => open('leave', row)}>Record departure</Button>
  </>;
}
