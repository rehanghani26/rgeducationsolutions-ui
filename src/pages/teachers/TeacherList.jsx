import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileSpreadsheet, KeyRound, Plus, UsersRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { DataTable, Empty, ErrorMessage, Pagination, Pending, SearchField, Status } from '../../components/ui/ProcurementUI.jsx';
import { getUserRole } from '../../config/access.jsx';
import { ROUTES } from '../../routes/routes.js';
import { exportTeachersCsv, getTeacherCredentials, getTeachers } from '../../services/teacherService.js';
import { notifyApiError } from '../../services/apiErrors.js';
import { downloadSpreadsheetFile } from '../../utils/spreadsheet.js';
import { teacherManagerRoles } from '../../utils/teacherForm.js';
import { TeacherCredentialsDialog } from './TeacherProfileParts.jsx';
import './teacher.css';
import { SelectInput } from '../../components/ui/FormControls.jsx';

export default function TeacherList() {
  const role = useSelector((state) => getUserRole(state.auth?.user));
  const canManage = teacherManagerRoles.includes(role);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [reload, setReload] = useState(0);
  const [directory, setDirectory] = useState({ rows: [], loading: true });
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const request = new AbortController();
    setDirectory((current) => ({ ...current, loading: true, error: null }));
    getTeachers({ page, limit: 20, search, status }, request.signal).then((data) => {
      if (request.signal.aborted) return;
      const result = data.data?.teachers ? data.data : data;
      setDirectory({ rows: result.teachers || [], pagination: result.pagination, loading: false });
    }).catch((error) => {
      if (!request.signal.aborted) setDirectory({ rows: [], error, loading: false });
    });
    return () => request.abort();
  }, [page, search, status, reload]);

  async function exportDirectory() {
    try {
      downloadSpreadsheetFile(await exportTeachersCsv(), 'teachers.csv');
    } catch (error) { notifyApiError(error); }
  }

  async function credentials(id) {
    try {
      const data = await getTeacherCredentials(id);
      if (data.credentials) setAccount(data.credentials);
    } catch (error) { notifyApiError(error); }
  }

  const columns = [
    {
      key: 'name', label: 'Teacher', full: true,
      render: (row) => <div>
        <Link className="proc-link" to={ROUTES.TEACHERS.detail(row._id || row.id)}>{row.name || [row.firstName, row.lastName].join(' ')}</Link>
        {row.employeeId && <small>{row.employeeId}</small>}
      </div>,
    },
    {
      key: 'employment', label: 'Employment',
      render: (row) => <div><strong>{row.designation || '—'}</strong>{row.department && <small>{row.department}</small>}</div>,
    },
    {
      key: 'contact', label: 'Contact',
      render: (row) => <div>{row.email || '—'}{row.phone && <small>{row.phone}</small>}</div>,
    },
    { key: 'status', label: 'Status', render: (row) => row.status ? <Status value={row.status} /> : '—' },
    {
      key: 'actions', label: 'Actions', full: true,
      render: (row) => <div className="proc-actions">
        <Link className="proc-btn proc-btn-sm" to={ROUTES.TEACHERS.detail(row._id || row.id)}>View profile</Link>
        {canManage && <Link className="proc-btn proc-btn-sm" to={ROUTES.TEACHERS.edit(row._id || row.id)}>Edit</Link>}
        {role === 'super-admin' && <button type="button" className="proc-btn proc-btn-sm" onClick={() => credentials(row._id || row.id)}
          aria-label={'Login details for ' + row.name} title="Login details"><KeyRound size={15} /></button>}
      </div>,
    },
  ];

  return <main className="teacher-page">
    <PageHeader title="Teachers" actions={canManage && <div className="proc-actions">
      <button type="button" className="proc-btn" onClick={exportDirectory}><Download size={15} /> Export CSV</button>
      <Link className="proc-btn" to={ROUTES.TEACHERS.BULK_IMPORT}><FileSpreadsheet size={15} /> Bulk import</Link>
      <Link className="proc-btn proc-primary" to={ROUTES.TEACHERS.CREATE}><Plus size={16} /> Register teacher</Link>
    </div>} />
    <section className="teacher-panel teacher-directory" aria-label="Teacher directory">
      <div className="proc-toolbar">
        <SearchField label="Search by name, employee ID, or department" value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
        <SelectInput className="proc-input" aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </SelectInput>
      </div>
      {directory.loading ? <Pending label="Loading teachers…" />
        : directory.error ? <ErrorMessage error={directory.error} onRetry={() => setReload((value) => value + 1)} />
        : <>
          <DataTable label="Teachers" columns={columns} rows={directory.rows}
            empty={<Empty icon={UsersRound} title={search || status ? 'No matching teachers' : 'No teachers registered'} />} />
          <Pagination pagination={directory.pagination} onPage={setPage} />
        </>}
    </section>
    {account && <TeacherCredentialsDialog account={account} onClose={() => setAccount(null)} />}
  </main>;
}
