import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import SearchFilters from '../../components/ui/SearchFilters.jsx';
import { getClasses, createClass } from '../../services';
import Loader from '../../components/ui/Loader.jsx';
import { Can, CanButton } from '../../config/access.jsx';

const ClassList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', room: '', capacity: 40 });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await getClasses();
      setAllClasses(res?.classes || res?.data?.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setAllClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createClass(formData);
      const newClass = res?.class || res?.data?.class || formData;
      setAllClasses(prev => [newClass, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', room: '', capacity: 40 });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const classes = allClasses.filter(c =>
    !search || [c.name, c.code, c.room].filter(Boolean).some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    { key: 'name',     label: 'Class Name', render: (row) => <span className="font-extrabold">{row.name}</span> },
    { key: 'code',     label: 'Code',       render: (row) => <span className="font-bold text-indigo-500">{row.code}</span> },
    { key: 'room',     label: 'Room',       render: (row) => row.room || '—' },
    { key: 'capacity', label: 'Capacity',   render: (row) => row.capacity || '—' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Classes"
        subtitle="Manage class structure, students, teachers, and subjects."
        breadcrumbs={[
          { label: 'Academics', to: '/academics' },
          { label: 'Classes' },
        ]}
        actions={
          <Can module="academics" action="create">
            <CanButton id="CREATE_CLASS">
              <button
                onClick={() => { setError(''); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                <Plus size={16} />
                <span>Add Class</span>
              </button>
            </CanButton>
          </Can>
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <SearchFilters
          search={search}
          onSearchChange={setSearch}
          placeholder="Search classes..."
          onClear={() => setSearch('')}
        />

        <DataTable
          columns={columns}
          data={classes}
          loading={loading}
          onRowClick={(row) => navigate(`/academics/classes/${row.id || row._id}`)}
        />
      </div>

      {/* Quick Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Class Level</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 12"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Registry Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C12"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">Lecture Room</label>
                <input
                  type="text"
                  placeholder="e.g. Room 502"
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                >
                  {submitting && <Loader size="sm" />}
                  <span>{submitting ? 'Saving...' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
