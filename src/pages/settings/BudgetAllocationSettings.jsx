import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, CircleDollarSign, ClipboardList, History, LineChart, Pencil, Plus, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { DataTable, Empty, ErrorMessage, Field, Metric, Pending, Status } from '../../components/ui/ProcurementUI.jsx';
import { useProcurementAccess, useProcurementResource } from '../../hooks/useProcurement.js';
import { getAcademicSessions, getSessionBudget, reviseBudget, saveBudget } from '../../services/budgetService.js';
import { formatCurrency, formatDate } from '../../utils';
import { dateInput, defaultSession, recordId, roundMoney } from '../../utils/procurement.js';
import { ROUTES } from '../../routes/routes.js';

const buckets = [
  { key: 'salary', label: 'Staff salaries', budget: 'salaryBudget', spent: 'salarySpent' },
  { key: 'schoolRequirements', label: 'School requirements', budget: 'schoolRequirementsBudget', spent: 'schoolRequirementsSpent' },
  { key: 'operationalBuffer', label: 'Operational buffer', budget: 'operationalBufferBudget', spent: 'operationalBufferSpent' },
];
const categoryLabels = Object.fromEntries([...buckets, { key: 'total', label: 'Approved total' }].map(({ key, label }) => [key, label]));
const revisionColumns = [
  { key: 'category', label: 'Category', full: true, render: (row) => <strong>{categoryLabels[row.category] || row.category}</strong> },
  { key: 'previousAmount', label: 'Previous', render: (row) => formatCurrency(row.previousAmount) },
  { key: 'newAmount', label: 'Revised', render: (row) => formatCurrency(row.newAmount) },
  { key: 'deltaAmount', label: 'Change', render: (row) => <span className={row.deltaAmount < 0 ? 'proc-danger' : 'proc-good'}>{row.deltaAmount > 0 ? '+' : ''}{formatCurrency(row.deltaAmount)}</span> },
  { key: 'reason', label: 'Reason', render: (row) => <>{row.reason}<small>{row.revisedByName} · {formatDate(row.revisedAt)}</small></> },
];

function AllocationForm({ budget, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState({
    totalBudget: budget?.totalBudget ?? '',
    salaryBudget: budget?.salaryBudget ?? 0,
    schoolRequirementsBudget: budget?.schoolRequirementsBudget ?? 0,
    operationalBufferBudget: budget?.operationalBufferBudget ?? 0,
    budgetOwner: budget?.budgetOwner || '',
    approvalReference: budget?.approvalReference || '',
    approvedDate: dateInput(budget?.approvedDate),
    notes: budget?.notes || '',
    revisionReason: '',
  });
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const allocated = roundMoney(buckets.reduce((total, bucket) => total + Number(form[bucket.budget] || 0), 0));
  const unallocated = roundMoney(Number(form.totalBudget === '' ? allocated : form.totalBudget) - allocated);

  return <form className="proc-panel proc-pad proc-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
    <div className="proc-heading">
      <span className="proc-icon"><Wallet size={17} /></span>
      <div><h2>{budget ? 'Edit allocation' : 'Allocate session budget'}</h2><p>Enter the approved amounts in INR.</p></div>
    </div>
    <div className="proc-fields">
      <Field label="Approved total" hint="Leave blank to use the sum of the categories.">
        <input type="number" min="0" step="0.01" value={form.totalBudget} onChange={set('totalBudget')} />
      </Field>
      {buckets.map(({ key, budget: field, label }) => <Field key={key} label={label}>
        <input type="number" min="0" step="0.01" value={form[field]} onChange={set(field)} required />
      </Field>)}
    </div>
    <dl className="proc-amounts">
      <div><dt>Allocated to categories</dt><dd>{formatCurrency(allocated)}</dd></div>
      <div><dt>{unallocated < 0 ? 'Above approved total' : 'Unallocated reserve'}</dt><dd className={unallocated < 0 ? 'proc-danger' : ''}>{formatCurrency(Math.abs(unallocated))}</dd></div>
    </dl>
    <div className="proc-form-section">
      <h3 className="proc-title">Approval details</h3>
      <div className="proc-fields proc-fields-3">
        <Field label="Budget owner"><input value={form.budgetOwner} onChange={set('budgetOwner')} /></Field>
        <Field label="Approval reference"><input value={form.approvalReference} onChange={set('approvalReference')} /></Field>
        <Field label="Approval date"><input type="date" value={form.approvedDate} onChange={set('approvedDate')} /></Field>
        <Field label="Notes" wide><textarea rows={2} value={form.notes} onChange={set('notes')} /></Field>
        {budget && <Field label="Reason for this change" wide><input value={form.revisionReason} onChange={set('revisionReason')} /></Field>}
      </div>
    </div>
    <ErrorMessage error={error} />
    <div className="proc-form-footer">
      <button type="button" className="proc-btn" onClick={onCancel} disabled={saving}>Cancel</button>
      <button type="submit" className="proc-btn proc-primary" disabled={saving || unallocated < 0}>{saving ? 'Saving…' : 'Save allocation'}</button>
    </div>
  </form>;
}

function RevisionForm({ onSave, onCancel, saving, error }) {
  const [category, setCategory] = useState('schoolRequirements');
  const [additionalAmount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  return <form className="proc-panel proc-pad proc-form" onSubmit={(event) => { event.preventDefault(); onSave({ category, additionalAmount, reason }); }}>
    <div className="proc-heading">
      <span className="proc-icon"><LineChart size={18} /></span>
      <div><h2>Increase budget</h2><p>A category increase also increases the approved total.</p></div>
    </div>
    <div className="proc-fields">
      <Field label="Category">
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Additional amount"><input type="number" value={additionalAmount} onChange={(event) => setAmount(event.target.value)} min="0.01" step="0.01" required /></Field>
      <Field label="Reason for the increase" wide><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} required /></Field>
    </div>
    <ErrorMessage error={error} />
    <div className="proc-form-footer">
      <button type="button" className="proc-btn" onClick={onCancel} disabled={saving}>Cancel</button>
      <button className="proc-btn proc-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Record increase'}</button>
    </div>
  </form>;
}

function BudgetOverview({ budget }) {
  return <>
    <div className="proc-metrics">
      <Metric icon={Wallet} label="Approved total" value={formatCurrency(budget.totalBudget)} />
      <Metric icon={CircleDollarSign} label="Committed" value={formatCurrency(budget.totalSpent)} />
      <Metric icon={LineChart} label="Remaining" value={formatCurrency(budget.remaining)} tone={budget.remaining < 0 ? 'danger' : 'good'} />
      <Metric icon={ClipboardList} label="Unallocated reserve" value={formatCurrency(budget.unallocated)} tone={budget.unallocated < 0 ? 'danger' : undefined} />
    </div>
    <div className="proc-split">
      <section className="proc-panel proc-pad proc-stack" aria-label="Category balances">
        <h2 className="proc-title">Category balances</h2>
        {buckets.map(({ key, label, budget: field, spent }) => {
          const limit = Number(budget[field] || 0);
          const used = Number(budget[spent] || 0);
          const remaining = roundMoney(limit - used);
          const percent = limit > 0 ? Math.min(100, used / limit * 100) : used ? 100 : 0;
          return <div className="proc-stack" key={key}>
            <div className="proc-line-title"><span>{label}</span><span className={remaining < 0 ? 'proc-danger' : 'proc-neutral'}>{formatCurrency(Math.abs(remaining))} {remaining < 0 ? 'over budget' : 'available'}</span></div>
            <progress aria-label={label + ' budget used'} className={'proc-progress' + (remaining < 0 ? ' proc-danger' : '')} max="100" value={percent} />
            <p className="proc-hint">{formatCurrency(used)} committed · {formatCurrency(limit)} allocated</p>
          </div>;
        })}
      </section>
      <section className="proc-panel proc-pad proc-stack">
        <div className="proc-line-title"><h2 className="proc-title">Approval details</h2><Status value={budget.status} /></div>
        <dl className="proc-details">
          <div><dt>Owner</dt><dd>{budget.budgetOwner || '—'}</dd></div>
          <div><dt>Reference</dt><dd>{budget.approvalReference || '—'}</dd></div>
          <div><dt>Approved on</dt><dd>{formatDate(budget.approvedDate)}</dd></div>
          <div><dt>Last saved</dt><dd>{formatDate(budget.updatedAt)}</dd></div>
          {budget.notes && <div className="col-span-2"><dt>Notes</dt><dd>{budget.notes}</dd></div>}
        </dl>
        <Link className="proc-link text-xs" to={ROUTES.INVENTORY.LIST + '?tab=purchases&session=' + encodeURIComponent(budget.sessionId)}>View inventory purchases for this session</Link>
      </section>
    </div>
    <section className="proc-panel proc-pad proc-stack">
      <div className="proc-heading"><span className="proc-icon"><History size={17} /></span><h2>Revision history</h2></div>
      <DataTable label="Budget revision history" columns={revisionColumns} rows={budget.revisionLogs || []} empty={<Empty title="No revisions recorded" />} />
    </section>
  </>;
}

export default function BudgetAllocationSettings() {
  const [params, setParams] = useSearchParams();
  const sessions = useProcurementResource(getAcademicSessions);
  const list = sessions.data || [];
  const session = list.find((entry) => recordId(entry) === params.get('session')) || defaultSession(list) || list[0];
  const sessionId = recordId(session);
  const loadBudget = useCallback(() => getSessionBudget(sessionId), [sessionId]);
  const { canAllocate, canReadBudget } = useProcurementAccess();
  const current = useProcurementResource(loadBudget, Boolean(sessionId) && canReadBudget);
  const [mode, setMode] = useState('view');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const closeForm = () => { setMode('view'); setError(null); };
  const budget = current.data;

  async function save(fields) {
    setSaving(true);
    setError(null);
    try {
      if (mode === 'increase') await reviseBudget(sessionId, fields);
      else await saveBudget({ ...fields, sessionId });
      toast.success(mode === 'increase' ? 'Budget increase recorded.' : 'Budget saved.');
      closeForm();
      current.refresh();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return <div className="proc-page">
    <PageHeader title="Budget allocation" subtitle="Manage session allocations, commitments, and approval history." />
    {!canReadBudget ? <Empty title="Budget access is restricted to administrators, principals, and accountants." /> : <>
      {sessions.loading && <Pending label="Loading academic sessions" />}
      <ErrorMessage error={sessions.error} onRetry={sessions.refresh} />
      {!sessions.loading && !sessions.error && !session && <div className="proc-panel"><Empty icon={CalendarDays} title="No academic sessions" description="Create an academic session to allocate its budget." /></div>}
      {session && <div className="proc-panel proc-pad proc-toolbar justify-between">
        <Field label="Academic session">
          <select value={sessionId} disabled={saving} onChange={(event) => {
            closeForm();
            setParams({ session: event.target.value }, { replace: true });
          }}>
            {list.map((entry) => <option key={recordId(entry)} value={recordId(entry)}>{entry.sessionName}{entry.isCurrent ? ' (current)' : ''}</option>)}
          </select>
        </Field>
        {canAllocate && mode === 'view' && !current.loading && !current.error && budget?.status !== 'closed' &&
          <div className="proc-actions">
            {budget && <button type="button" className="proc-btn" onClick={() => setMode('increase')}><Plus size={15} /> Increase budget</button>}
            <button type="button" className="proc-btn proc-primary" onClick={() => setMode('edit')}>
              {budget ? <Pencil size={14} /> : <Plus size={15} />} {budget ? 'Edit allocation' : 'Allocate budget'}
            </button>
          </div>}
      </div>}
      {current.loading && <Pending label="Loading session budget" />}
      <ErrorMessage error={current.error} onRetry={current.refresh} />
      {session && !current.loading && !current.error && mode === 'edit' && <AllocationForm key={sessionId} budget={budget} onSave={save} onCancel={closeForm} saving={saving} error={error} />}
      {mode === 'increase' && <RevisionForm key={sessionId} onSave={save} onCancel={closeForm} saving={saving} error={error} />}
      {mode === 'view' && budget && <BudgetOverview budget={budget} />}
      {mode === 'view' && session && !current.loading && !current.error && !budget &&
        <div className="proc-panel"><Empty icon={Wallet} title="No budget allocated" description={'There is no approved allocation for ' + session.sessionName + '.'} /></div>}
    </>}
  </div>;
}
