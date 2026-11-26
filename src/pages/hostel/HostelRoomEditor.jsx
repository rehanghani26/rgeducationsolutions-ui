import { useCallback, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import StudentDropdown from '../../components/students/StudentDropdown.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import FormTextarea from '../../components/ui/FormTextarea.jsx';
import { readHostel, saveHostel } from '../../services/hostelService.js';
import { border, text } from '../../theme/color.js';
import HostelFormDialog from './HostelFormDialog.jsx';
import { hostelDateValue, roomTypes } from './hostelView.js';

function fillBeds(beds, count) {
  const next = [...beds];
  const labels = new Set(beds.map(({ label }) => label.trim().toLowerCase()));
  let number = 1;
  while (next.length < count) {
    while (labels.has(String(number))) number += 1;
    const label = String(number++);
    labels.add(label);
    next.push({ label, outOfService: false, status: 'available' });
  }
  return next;
}

export default function HostelRoomEditor({ room, hostel, workspace, sessionId, onClose, onSave }) {
  const configure = workspace.canConfigure;
  const { canAllocate } = workspace;
  const [form, setForm] = useState(() => ({
    number: room?.number || '', block: room?.block || '', roomType: room?.roomType || '',
    features: room?.features || '', beds: room?.beds || [],
  }));
  const [count, setCount] = useState(room?.beds.length ?? '');
  const [assignedOn, setAssignedOn] = useState(() => hostelDateValue());
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const field = (name) => ({ name, value: form[name], onChange: (event) => set(name, event.target.value) });
  const loadStudents = useCallback((params) => readHostel('/students', { ...params, hostelId: hostel._id }), [hostel._id]);

  const residents = new Map(workspace.allocations.filter((row) => row.active && row.roomId === room?._id).map((row) => [row.bedId, row]));
  const beds = form.beds.slice(0, Number(count));
  const removedBeds = form.beds.slice(Number(count));
  const wouldRemove = removedBeds.some((bed) => residents.has(bed._id) || bed.student || bed.status === 'legacyHold');
  const otherBeds = workspace.rooms.filter((item) => item.hostelId === hostel._id && item._id !== room?._id)
    .reduce((total, item) => total + item.beds.length, 0);
  const maxBeds = Math.min(100, hostel.capacity ? hostel.capacity - otherBeds : 100);
  const countValid = Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= maxBeds;
  const assignments = beds.flatMap((bed) => bed.student ? [{ bedId: bed._id, ...bed.student }] : []);
  const canSave = configure ? countValid && !wouldRemove && Boolean(form.number.trim()) && roomTypes.some(({ value }) => value === form.roomType)
    : assignments.length > 0;

  function changeCount(event) {
    const value = event.target.value;
    setCount(value);
    const total = Number(value);
    if (Number.isInteger(total) && total > 0 && total <= maxBeds) set('beds', fillBeds(form.beds, total));
  }

  function changeBed(index, patch) {
    set('beds', form.beds.map((bed, i) => i === index ? { ...bed, ...patch } : bed));
  }

  async function submit() {
    if (configure) {
      const payload = {
        hostelId: hostel._id, number: form.number, block: form.block, roomType: form.roomType, features: form.features,
        updatedAt: room?.updatedAt, assignedOn, beds: beds.map(({ _id, label, outOfService, student }) => ({ _id, label, outOfService, student })),
      };
      await saveHostel(room ? '/rooms/' + room._id : '/rooms', room ? 'put' : 'post', payload, sessionId);
    } else {
      await saveHostel('/rooms/' + room._id + '/assignments', 'post', { assignments, assignedOn }, sessionId);
    }
    if (assignments.length) return assignments.length === 1 ? 'Student assigned.' : `${assignments.length} students assigned.`;
    return room ? 'Room updated.' : 'Room added.';
  }

  const title = !configure ? 'Assign students' : room ? 'Manage room ' + room.number : 'Add room';
  return <HostelFormDialog title={title} onClose={onClose} onSave={onSave} submit={submit}
    disabled={!canSave} submitLabel={configure ? (room ? 'Save room' : 'Add room') : 'Assign students'}>
    {configure && <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput label="Room number" required maxLength={40} {...field('number')} />
        <FormInput label="Block (optional)" maxLength={100} {...field('block')} />
        <FormSelect label="Room type" required options={roomTypes} {...field('roomType')} />
        <FormInput label="Total beds" name="bedCount" type="number" min={1} max={maxBeds} step={1} required
          value={count} onChange={changeCount} />
      </div>
      <FormTextarea label="Room features" rows={2} maxLength={750} {...field('features')} />
      {maxBeds < 1 && <p className={`text-sm ${text.warning}`}>This hostel has reached its configured capacity.</p>}
      {wouldRemove && countValid && <p role="alert" className={`text-sm ${text.warning}`}>
        Release occupied beds and clear student selections before reducing the bed count.
      </p>}
    </>}
    {beds.length > 0 && <fieldset className={`divide-y rounded-xl border px-3 ${border.default} ${border.divider}`}>
      <legend className={`px-1 text-sm font-semibold ${text.primary}`}>Bed assignments</legend>
      {beds.map((bed, index) => {
        const resident = residents.get(bed._id);
        const locked = Boolean(resident || bed.status === 'legacyHold');
        const excluded = assignments.filter((assignment) => assignment.studentId !== bed.student?.studentId).map(({ studentId }) => studentId);
        return <div key={bed._id || bed.label} className="grid items-center gap-2 py-2 sm:grid-cols-[minmax(7rem,0.65fr)_minmax(0,1.35fr)]">
          <div className="min-w-0">
            <p className={`break-words text-xs font-semibold ${text.primary}`}>Bed {bed.label}</p>
            {configure && !locked && <label className={`flex items-center gap-1.5 py-1 text-[11px] ${text.secondary}`}>
              <input type="checkbox" className="accent-orange-500" aria-label={`Mark bed ${bed.label} out of service`}
                checked={bed.outOfService} onChange={(event) => changeBed(index, { outOfService: event.target.checked, student: null })} />
              Out of service
            </label>}
          </div>
          {resident ? <p className={`text-xs font-medium ${text.primary}`}>{resident.studentName}</p>
            : locked ? <p className={`text-xs ${text.warning}`}>Existing allocation needs review</p>
              : bed.outOfService ? <p className={`text-xs ${text.secondary}`}>Unavailable</p>
                : canAllocate ? (
                  <StudentDropdown label={`Student for bed ${bed.label}`} value={bed.student} sessionId={sessionId}
                    loadStudents={loadStudents} excludeIds={excluded} onChange={(student) => changeBed(index, { student })} />
                ) : <p className={`text-xs ${text.secondary}`}>Select an active academic session to assign students.</p>}
        </div>;
      })}
    </fieldset>}
    {assignments.length > 0 && <FormInput name="assignedOn" label="Assignment date" type="date" icon={<CalendarDays size={15} />}
      value={assignedOn} max={hostelDateValue()} onChange={(event) => setAssignedOn(event.target.value)} required />}
  </HostelFormDialog>;
}
