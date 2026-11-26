import { useState } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import useHostelData from '../../hooks/useHostelData.js';
import { hostelError, saveHostel } from '../../services/hostelService.js';
import { bg, border, text } from '../../theme/color.js';
import HostelFormDialog from './HostelFormDialog.jsx';
import { bedLabel, bedLocation, hostelDateValue } from './hostelView.js';

const roomOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export default function AssignStudentBedDialog({ student, sessionId, onClose, onSave }) {
  const path = '/students/' + encodeURIComponent(student._id) + '/available-beds';
  const { data, loading, error, reload } = useHostelData(path, { sessionId });
  const [hostelId, setHostelId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [assignedOn, setAssignedOn] = useState(() => hostelDateValue());

  const hostels = data?.hostels || [];
  const hostel = hostels.find((item) => item._id === hostelId) || (hostels.length === 1 ? hostels[0] : null);
  const rooms = [...(hostel?.rooms || [])].sort((left, right) => roomOrder.compare(left.number, right.number));
  const room = rooms.find((item) => item._id === roomId) || (rooms.length === 1 ? rooms[0] : null);
  const bed = room?.beds.find((item) => item._id === bedId);
  const hostelOptions = hostels.map((item) => ({
    value: item._id, label: item.name,
  }));
  const roomOptions = rooms.map(({ _id, number, block, roomType, beds }) => ({
    value: _id, label: [bedLocation({ block, room: number }), roomType, `${beds.length} available`].filter(Boolean).join(' · '),
  }));
  const bedNames = room?.beds.map(({ label }) => bedLabel(label)) || [];
  const bedOptions = room?.beds.map((item, index) => ({
    value: item._id,
    label: bedNames.indexOf(bedNames[index]) !== bedNames.lastIndexOf(bedNames[index])
      ? `${bedNames[index]} (label ${item.label})` : bedNames[index],
  })) || [];

  function refreshBeds() {
    setBedId('');
    reload();
  }

  async function submit() {
    try {
      await saveHostel('/occupancies', 'post', { studentId: student._id, bedId: bed._id, assignedOn }, sessionId);
      return 'Bed assigned.';
    } catch (cause) {
      if ([404, 409].includes(cause.response?.status)) refreshBeds();
      throw cause;
    }
  }

  return (
    <HostelFormDialog title="Assign a hostel bed" submitLabel="Assign bed" onClose={onClose} onSave={onSave}
      submit={submit} disabled={!bed || loading || Boolean(error)}>
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 ${bg.surfaceSubtle} ${border.default}`}>
        <div className="min-w-0">
          <p className={`break-words text-sm font-semibold ${text.primary}`}>{student.name}</p>
          {student.admissionNumber && <p className={`text-xs ${text.secondary}`}>{student.admissionNumber}</p>}
        </div>
        <Button size="xs" variant="ghost" icon={RefreshCw} onClick={refreshBeds} disabled={loading}>Refresh beds</Button>
      </div>
      {loading && <p role="status" className={`text-sm ${text.secondary}`}>Checking available beds…</p>}
      {error && <p role="alert" className={`text-sm ${text.danger}`}>{hostelError(error)}</p>}
      {data && (hostels.length ? (
        <div className="grid gap-3">
          <FormSelect name="hostel" label="Hostel" options={hostelOptions} value={hostel?._id || ''} required
            onChange={(event) => { setHostelId(event.target.value); setRoomId(''); setBedId(''); }} />
          <FormSelect name="room" label="Room" options={roomOptions} value={room?._id || ''} required disabled={!hostel}
            onChange={(event) => { setRoomId(event.target.value); setBedId(''); }} />
          <FormSelect name="bed" label="Available bed" options={bedOptions} value={bed?._id || ''} required disabled={!room}
            onChange={(event) => setBedId(event.target.value)} />
          <FormInput name="assignedOn" label="Assignment date" type="date" icon={<CalendarDays size={15} />}
            value={assignedOn} max={hostelDateValue()} onChange={(event) => setAssignedOn(event.target.value)} required />
        </div>
      ) : <p role="status" className={`text-sm ${text.secondary}`}>No eligible beds are available for this student.</p>)}
    </HostelFormDialog>
  );
}
