import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import { useAcademicSession } from '../context/AcademicSessionContext.jsx';
import FormInput from './ui/FormInput.jsx';
import FormSelect from './ui/FormSelect.jsx';
import Modal from './ui/Modal.jsx';
import PageHeader from './ui/PageHeader.jsx';

const adminRoles = ['super-admin', 'school-admin', 'admin', 'principal'];
const idOf = (record) => record._id || record.id;
const button = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60';

export default function SessionAssignments() {
  const endpoint = '/erp/transport/assignments';
  const { readOnly, selected } = useAcademicSession();
  const role = useSelector((state) => state.auth.user?.role);
  const canEdit = adminRoles.includes(role) && selected?.isCurrent && !readOnly;
  const [records, setRecords] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get(endpoint),
      api.get('/erp/transport'),
    ]).then(([response, transport]) => {
      if (!mounted) return;
      setRecords(response.data.data?.assignments || []);
      setRoutes(transport?.data?.transport || []);
    }).catch((cause) => {
      if (mounted) setError(cause.response?.data?.message || 'Unable to load session assignments.');
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [endpoint, reload]);

  const field = (name) => ({
    name, value: form?.[name] || '',
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })),
  });
  const open = (mode) => { setError(''); setForm({ mode }); };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (form.mode === 'route') {
        await api.post('/erp/transport', form);
      } else {
        const { data } = await api.get('/students', { params: { search: form.admissionNumber, limit: 20 } });
        const student = (data.students || []).find((row) =>
          String(row.admissionNumber || '').toLowerCase() === form.admissionNumber.trim().toLowerCase());
        if (!student) throw new Error('Enter the admission number of a student enrolled in this session.');
        await api.post(endpoint, { ...form, studentId: idOf(student) });
      }
      setForm(null);
      setReload((value) => value + 1);
    } catch (cause) {
      setError(cause.response?.data?.message || cause.message || 'Unable to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader title="School Transport" actions={canEdit && (
        <div className="flex flex-wrap gap-2">
          <button className={button} onClick={() => open('route')}>Add route</button>
          <button className={button} onClick={() => open('assignment')}>
            Assign student
          </button>
        </div>
      )} />
      {routes.length > 0 && <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <li key={idOf(route)} className="rounded-xl border p-4 dark:border-slate-700">
            <p className="font-semibold">{route.routeName}</p>
            <p className="text-sm">{route.busNumber} · {route.driverName}</p>
            {route.driverContact && <p className="text-xs text-slate-500">{route.driverContact}</p>}
          </li>
        ))}
      </ul>}
      {error && !form && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading ? <p role="status">Loading assignments…</p> : records.length ? (
        <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-slate-100 dark:bg-slate-800">
              <th className="p-3">Student</th><th className="p-3">Class</th>
              <th className="p-3">Route / pickup stop</th>
            </tr></thead>
            <tbody>{records.map((row) => <tr key={idOf(row)} className="border-t dark:border-slate-700">
              <td className="p-3">{row.studentName}</td><td className="p-3">{row.className}</td>
              <td className="p-3">{[row.routeName, row.pickupStop].filter(Boolean).join(' / ')}</td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="text-sm text-slate-500">No assignments for this session.</p>}
      <Modal open={Boolean(form)} onClose={() => setForm(null)}
        title={form?.mode === 'route' ? 'Add transport route' : 'Assign a transport route'} size="sm">
        {form && <form onSubmit={save} className="space-y-3">
          {form.mode === 'route' ? <>
            <FormInput label="Route name" {...field('routeName')} required />
            <FormInput label="Bus number" {...field('busNumber')} required />
            <FormInput label="Driver name" {...field('driverName')} required />
            <FormInput label="Driver phone" {...field('driverContact')} required />
            <FormInput label="Fare" type="number" min="0" {...field('fare')} required />
          </> : <>
            <FormInput label="Student admission number" {...field('admissionNumber')} required />
            <FormSelect label="Route" options={routes.map((route) => ({ value: idOf(route), label: route.routeName }))} {...field('routeId')} required />
            <FormInput label="Pickup stop" {...field('pickupStop')} />
          </>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button className={button} type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </form>}
      </Modal>
    </section>
  );
}
