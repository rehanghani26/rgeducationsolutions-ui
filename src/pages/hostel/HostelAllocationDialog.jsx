import { useState } from 'react';
import { BedDouble, CalendarDays } from 'lucide-react';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import { saveHostel } from '../../services/hostelService.js';
import { bg, border, text } from '../../theme/color.js';
import HostelFormDialog from './HostelFormDialog.jsx';
import { bedLocation, formatHostelDate, hostelDateValue } from './hostelView.js';

const titles = {
  transfer: 'Transfer to another bed', leave: 'Record permanent departure', continue: 'Confirm renewal',
  legacy: 'Map existing allocation', dismiss: 'Close allocation review',
};

export default function HostelAllocationDialog({ mode, row, workspace, sessionId, onClose, onSave }) {
  const [bedId, setBedId] = useState('');
  const [reason, setReason] = useState('');
  const [leftOn, setLeftOn] = useState(() => hostelDateValue());
  const choosingBed = mode === 'transfer' || mode === 'legacy';
  const leaving = mode === 'leave';
  const title = titles[mode];
  const suggested = new Set(row.matchingBedIds);
  const hostels = new Map(workspace.hostels.map((hostel) => [hostel._id, hostel.name]));
  const options = choosingBed ? workspace.rooms.flatMap((room) =>
    room.beds.filter((bed) => bed.status === 'available' || (
      mode === 'legacy' && (!workspace.canAllocate || (bed.status === 'legacyHold' && suggested.has(bed._id)))
    )).map((bed) => ({
      value: bed._id,
      label: bedLocation({ hostelName: hostels.get(room.hostelId), block: room.block, room: room.number, bed: bed.label }) +
        (suggested.has(bed._id) ? ' (matching location)' : ''),
    }))) : [];

  async function submit() {
    const legacy = mode === 'legacy' || mode === 'dismiss';
    await saveHostel(legacy ? '/legacy/' + row._id : `/occupancies/${row._id}/${mode}`,
      'patch', { bedId: bedId || undefined, reason, expectedStatus: row.status, ...(leaving && { leftOn }) }, sessionId);
    return leaving ? 'Departure recorded. The bed is available.' : 'Allocation updated.';
  }

  return <HostelFormDialog title={title} submitLabel={leaving ? 'Record departure' : title} onClose={onClose} onSave={onSave} submit={submit}
    disabled={(choosingBed && !bedId) || (mode === 'dismiss' && !reason.trim())}>
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${bg.surfaceSubtle} ${border.default}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${bg.brandSubtle}`}><BedDouble size={17} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className={`break-words text-sm font-semibold ${text.primary}`}>{row.studentName}</p>
        <p className={`break-words text-xs ${text.secondary}`}>{bedLocation(row)}</p>
        {leaving && row.assignedAt && <p className={`mt-1 text-xs ${text.secondary}`}>Assigned on {formatHostelDate(row.assignedAt)}</p>}
      </div>
    </div>
    {leaving && <FormInput name="leftOn" label="Departure date" type="date" icon={<CalendarDays size={15} />}
      value={leftOn} min={row.assignedAt ? hostelDateValue(row.assignedAt) : undefined} max={hostelDateValue()}
      onChange={(event) => setLeftOn(event.target.value)} required />}
    {choosingBed && <FormSelect label="Bed" options={options} value={bedId} required
      onChange={(event) => setBedId(event.target.value)} />}
    {choosingBed && !options.length && <p className={`text-xs ${text.secondary}`}>No beds can be selected.</p>}
    {['leave', 'transfer', 'legacy', 'dismiss'].includes(mode) && (
      <FormInput label={mode === 'dismiss' ? 'Reason for closing the review' : 'Reason (optional)'} maxLength={300}
        required={mode === 'dismiss'} value={reason} onChange={(event) => setReason(event.target.value)} />
    )}
    {leaving && <p className={`text-xs ${text.secondary}`}>Recording the departure makes this bed available for another student.</p>}
  </HostelFormDialog>;
}
