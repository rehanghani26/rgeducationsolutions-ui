import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function NotificationsManagement() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    api.get('/erp/notifications').then(({ data }) => {
      if (mounted) setItems(data.notifications || []);
    }).catch(() => {
      if (mounted) setError('Unable to load notifications.');
    });
    return () => { mounted = false; };
  }, []);
  return (
    <section className="space-y-4">
      <PageHeader title="Notifications" />
      {error ? <p role="alert">{error}</p>
        : items === null ? <p role="status">Loading notifications…</p>
        : items.length === 0 ? <p className="text-sm text-slate-500">No notifications for this session.</p>
        : <ul className="divide-y rounded-xl border dark:border-slate-700">
          {items.map((item) => (
            <li key={item._id || item.id} className="space-y-1 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <span className="text-xs text-slate-500">{formatDate(item.date || item.createdAt)}</span>
              </div>
              <p className="text-sm">{item.message}</p>
            </li>
          ))}
        </ul>}
    </section>
  );
}
