import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function ReportsManagement() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    api.get('/erp/reports/academic').then(({ data }) => {
      if (mounted) setRows(data.data?.classes || []);
    }).catch((cause) => { if (mounted) setError(cause.response?.data?.message || 'Unable to load reports.'); });
    return () => { mounted = false; };
  }, []);
  return (
    <section className="space-y-4">
      <PageHeader title="Class-wise Academic Reports" />
      {error ? <p role="alert">{error}</p>
        : rows === null ? <p role="status">Loading reports…</p>
        : rows.length === 0 ? <p className="text-sm text-slate-500">No class reports for this session.</p>
        : <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-slate-100 dark:bg-slate-800">
              {['Class', 'Students', 'Passout', 'Attendance', 'Fees paid', 'Passed results'].map((label) =>
                <th className="p-3" key={label}>{label}</th>)}
            </tr></thead>
            <tbody>{rows.map((row) =>
              <tr className="border-t dark:border-slate-700" key={row.classId}>
                <th className="p-3 font-semibold">{row.className}</th>
                <td className="p-3">{row.students}</td>
                <td className="p-3">{row.passout}</td>
                <td className="p-3">{row.attendanceTotal ? Math.round(100 * row.present / row.attendanceTotal) + '%' : '—'}</td>
                <td className="p-3">{formatCurrency(row.amountPaid)}</td>
                <td className="p-3">{row.passed} / {row.graded}</td>
              </tr>
            )}</tbody>
          </table>
        </div>}
    </section>
  );
}
