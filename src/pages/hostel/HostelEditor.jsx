import { useState } from 'react';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import FormTextarea from '../../components/ui/FormTextarea.jsx';
import MultiSelect from '../../components/ui/MultiSelect.jsx';
import { saveHostel } from '../../services/hostelService.js';
import HostelFormDialog from './HostelFormDialog.jsx';
import { hostelCategories } from './hostelView.js';

export default function HostelEditor({ hostel, staff, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: hostel?.name || '', wardens: hostel?.wardens || [], address: hostel?.address || '',
    category: hostel?.category || '', capacity: hostel?.capacity ?? '', description: hostel?.description || '',
    contactPhone: hostel?.contactPhone || '',
  }));
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const field = (name) => ({ name, value: form[name], onChange: (event) => set(name, event.target.value) });
  const staffOptions = staff.map(({ _id, name, employeeId }) => ({
    value: _id, label: [name, employeeId].filter(Boolean).join(' · '),
  }));

  async function submit() {
    await saveHostel(hostel ? '/hostels/' + hostel._id : '/hostels', hostel ? 'put' : 'post', { ...form, updatedAt: hostel?.updatedAt });
    return hostel ? 'Hostel updated.' : 'Hostel created.';
  }

  return <HostelFormDialog title={hostel ? 'Edit hostel' : 'Create hostel'} onClose={onClose} onSave={onSave}
    submit={submit} disabled={!form.wardens.length || !form.category || !form.name.trim() || !form.address.trim()}
    submitLabel={hostel ? 'Save changes' : 'Create hostel'}>
    <FormInput label="Hostel name" required maxLength={100} {...field('name')} />
    <MultiSelect label="Wardens" required options={staffOptions} value={form.wardens} onChange={(value) => set('wardens', value)} />
    <div className="grid grid-cols-2 gap-3">
      <FormSelect label="For" required options={hostelCategories} {...field('category')} />
      <FormInput label="Capacity" type="number" min={1} step={1} required {...field('capacity')} />
    </div>
    <FormTextarea label="Address" rows={2} required maxLength={500} {...field('address')} />
    <FormInput label="Public contact phone" type="tel" maxLength={40} {...field('contactPhone')} />
    <FormTextarea label="Description" rows={3} maxLength={1000} {...field('description')} />
  </HostelFormDialog>;
}
