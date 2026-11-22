import { useEffect, useState } from 'react';
import { CalendarDays, Plus, RefreshCw } from 'lucide-react';
import ConfirmationBox from '../../components/ui/ConfirmationBox.jsx';
import { CheckboxInput, Input, SelectInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import { DataTable, Empty, ErrorMessage, Pending, Status } from '../../components/ui/ProcurementUI.jsx';
import { notifyApiError } from '../../services/apiErrors.js';
import { getApplicantLeaveProfile, requestLeave, reviewLeave } from '../../services/leaveService.js';
import { formatDateShort } from '../../utils/formatters.js';
import { TeacherFacts } from './TeacherProfileParts.jsx';

const categories = [
  'Casual Leave', 'Medical Leave', 'Emergency Leave', 'Academic Duty / Olympiad',
  'Family / Personal Event', 'Maternity / Paternity', 'Other',
];
const blankLeave = {
  category: categories[0], startDate: '', endDate: '', reason: '', isHalfDay: false, halfDaySession: 'first-half',
};
const dateRange = (start, end) => formatDateShort(start) + ' – ' + formatDateShort(end);

export default function TeacherLeavePanel({ teacher, canReview }) {
  const id = teacher._id || teacher.id;
  const [data, setData] = useState({ loading: true });
  const [reload, setReload] = useState(0);
  const [applying, setApplying] = useState(false);
  const [leave, setLeave] = useState(blankLeave);
  const [review, setReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let current = true;
    setData({ loading: true });
    getApplicantLeaveProfile(id).then((response) => {
      if (!current) return;
      if (response.success === false) throw new Error(response.message || 'Could not load leave records.');
      const payload = response.data || response;
      setData({
        records: payload.requests || payload.records || [...(payload.pendingRequests || []), ...(payload.history || [])],
        summary: payload.summary, active: payload.activeLeave || payload.activeLeaveNow,
      });
    }).catch((error) => { if (current) setData({ error }); });
    return () => { current = false; };
  }, [id, reload]);

  async function apply(event) {
    event.preventDefault();
    if (saving) return;
    if (!leave.reason.trim()) {
      setSaveError('Enter a reason for the leave request.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const response = await requestLeave({
        ...leave, applicantId: id, endDate: leave.isHalfDay ? leave.startDate : leave.endDate,
      });
      if (!response.success) throw new Error(response.message || 'Could not submit the request.');
      setApplying(false);
      setLeave(blankLeave);
      setReload((value) => value + 1);
    } catch (error) {
      setSaveError(error);
      notifyApiError(error);
    } finally {
      setSaving(false);
    }
  }

  async function saveReview() {
    try {
      const result = await reviewLeave(review.entry._id || review.entry.id, {
        status: review.status, reviewRemarks: review.remarks,
      });
      if (!result.success) throw new Error(result.message || 'Could not review this request.');
      setReview(null);
      setReload((value) => value + 1);
    } catch (error) {
      setReview((current) => ({ ...current, error }));
    }
  }

  const columns = [
    { key: 'category', label: 'Leave', full: true, render: (row) => <div><strong>{row.category}</strong><small>{row.leaveCode}</small></div> },
    { key: 'dates', label: 'Dates', render: (row) => <div>{dateRange(row.startDate, row.endDate)}<small>{row.totalDays} {row.totalDays === 1 ? 'day' : 'days'}</small></div> },
    { key: 'reason', label: 'Reason', render: (row) => row.reason || '—' },
    { key: 'status', label: 'Status', render: (row) => <Status value={row.status === 'approved' ? 'active' : row.status} label={row.status} /> },
    { key: 'attendance', label: 'Attendance', render: (row) => row.status === 'approved' ? (row.attendanceSync?.isSynced ? 'Synced' : 'Pending') : '—' },
    { key: 'reviewRemarks', label: 'Remarks', render: (row) => row.reviewRemarks || '—' },
    ...(canReview ? [{
      key: 'review', label: 'Review', full: true, render: (row) => row.status === 'pending' && <div className="proc-actions">
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => setReview({ entry: row, status: 'approved', remarks: '' })}>Approve</button>
        <button type="button" className="proc-btn proc-btn-sm" onClick={() => setReview({ entry: row, status: 'rejected', remarks: '' })}>Reject</button>
      </div>,
    }] : []),
  ];
  const change = (key) => (event) => setLeave((current) => ({ ...current, [key]: event.target.value }));
  const approval = review?.status === 'approved';
  return <section className="teacher-panel">
    <div className="teacher-section-bar">
      <h2 className="teacher-section-title"><CalendarDays size={17} /> Leave and attendance</h2>
      <div className="proc-actions">
        <button type="button" className="proc-btn proc-btn-sm" disabled={data.loading} onClick={() => setReload((value) => value + 1)}>
          <RefreshCw size={14} /> Refresh
        </button>
        {!applying && <button type="button" className="proc-btn proc-primary" onClick={() => setApplying(true)}><Plus size={15} /> Apply for leave</button>}
      </div>
    </div>
    {applying && <form onSubmit={apply} className="teacher-leave-form">
      <h3>New leave request</h3>
      <div className="teacher-fields">
        <SelectInput label="Leave category" value={leave.category} showPlaceholder={false}
          options={categories.map((value) => ({ value, label: value }))} onChange={change('category')} />
        <Input label="Start date" type="date" required value={leave.startDate}
          onChange={(event) => {
            const startDate = event.target.value;
            setLeave((current) => ({ ...current, startDate, endDate: current.endDate < startDate ? startDate : current.endDate }));
          }} />
        {leave.isHalfDay ?
          <SelectInput label="Half day" value={leave.halfDaySession} showPlaceholder={false}
            options={[{ value: 'first-half', label: 'First half' }, { value: 'second-half', label: 'Second half' }]}
            onChange={change('halfDaySession')} />
          : <Input label="End date" type="date" required min={leave.startDate} value={leave.endDate} onChange={change('endDate')} />}
        <CheckboxInput label="Half-day leave" checked={leave.isHalfDay}
          onChange={(event) => setLeave({ ...leave, isHalfDay: event.target.checked })} />
        <TextareaInput label="Reason" className="teacher-field-wide" required rows={3} value={leave.reason} onChange={change('reason')} />
      </div>
      <ErrorMessage error={saveError} />
      <div className="proc-actions">
        <button type="button" className="proc-btn" disabled={saving} onClick={() => { setApplying(false); setSaveError(null); }}>Cancel</button>
        <button type="submit" className="proc-btn proc-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit leave request'}</button>
      </div>
    </form>}
    {data.active && <p className="teacher-leave-active" role="status">
      On approved {data.active.category?.toLowerCase()} · {dateRange(data.active.startDate, data.active.endDate)}
    </p>}
    {data.summary && <div className="teacher-leave-summary">
      <TeacherFacts items={[
        ['Applications', data.summary.totalApplications ?? 0], ['Approved days', data.summary.approvedDays ?? 0],
        ['Awaiting review', data.summary.pendingCount ?? 0], ['Rejected', data.summary.rejectedCount ?? 0],
      ]} />
    </div>}
    {data.loading ? <Pending label="Loading leave records…" /> :
      data.error ? <ErrorMessage error={data.error} onRetry={() => setReload((value) => value + 1)} /> :
      <DataTable label="Teacher leave requests" columns={columns} rows={data.records} empty={<Empty icon={CalendarDays} title="No leave requests" />} />}
    {review && <ConfirmationBox heading={approval ? 'Approve leave?' : 'Reject leave?'}
      confirmationMessage={review.entry.category + ' · ' + dateRange(review.entry.startDate, review.entry.endDate)}
      leftButtonName="Cancel" rightButtonName={approval ? 'Approve' : 'Reject'}
      onLeftButtonClick={() => setReview(null)} onRightButtonClick={saveReview}>
      <TextareaInput label="Review remarks" rows={3} value={review.remarks}
        onChange={(event) => setReview({ ...review, remarks: event.target.value })} />
      <ErrorMessage error={review.error} />
    </ConfirmationBox>}
  </section>;
}
