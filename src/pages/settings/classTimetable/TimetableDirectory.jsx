import { useMemo, useState } from 'react';
import { CalendarDays, Eye, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import Table from '../../../components/Table/Table.jsx';
import { Empty, ErrorMessage, Pagination, Pending, SearchField } from '../../../components/ui/ProcurementUI.jsx';
import { formatDate } from '../../../utils/formatters.js';
import { recordId } from '../../../utils/procurement.js';
import { masterScheduleForTimetable } from '../../timetable/timetableUtils.js';
import { classLabel, readAllocations, textKey, timetableClass, timetableDays, timetableProgress } from './timetableValues.js';
import { SelectInput } from '../../../components/ui/FormControls.jsx';

const pageSize = 10;
const collator = new Intl.Collator(undefined, { numeric: true });

export default function TimetableDirectory({
  directory, schedules, classes, canEdit, canCreate, onReload, onOpen, onDelete,
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);
  const entries = useMemo(() => directory.rows.map((row) => {
    const identity = timetableClass(row, classes);
    const assignments = row.allocations || [];
    const days = timetableDays(masterScheduleForTimetable(schedules, row));
    const { total, assigned } = timetableProgress(days, readAllocations(row));
    const subjects = new Set(assignments.map((slot) => textKey(slot.subject)).filter(Boolean));
    const teachers = new Set(assignments.map((slot) => slot.teacherId || textKey(slot.teacherName)).filter(Boolean));
    const name = classLabel(identity);
    return {
      id: recordId(row), row, identity, name, total, assigned, subjects: subjects.size, teachers: teachers.size,
      updated: row.updatedAt || row.createdAt,
      search: [name, row.classSectionKey, ...subjects, ...assignments.map((slot) => slot.teacherName)].join(' ').toLowerCase(),
    };
  }), [directory.rows, classes, schedules]);

  const filtered = entries.filter((entry) => entry.search.includes(textKey(search)));
  filtered.sort((left, right) => {
    if (sort === 'class') return collator.compare(left.name, right.name);
    if (sort === 'periods') return right.assigned - left.assigned || collator.compare(left.name, right.name);
    return String(right.updated || '').localeCompare(String(left.updated || '')) || collator.compare(left.name, right.name);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      headData: 'Class and section', showOnMobile: true,
      bodyData: ({ identity, assigned, total }) => (
        <div className="ct-class-cell">
          <strong>{identity.className}</strong>
          {identity.sectionName && <span>{identity.sectionName}</span>}
          {total > 0 && <span className="ct-mobile-summary">{assigned} of {total} assigned</span>}
        </div>
      ),
    },
    {
      headData: 'Teaching periods', showOnMobile: false,
      bodyData: ({ assigned, total }) => total > 0 ? (
        <div className="ct-coverage">
          <span><strong>{assigned}</strong> of {total} assigned</span>
          <progress value={assigned} max={total} aria-label={assigned + ' of ' + total + ' teaching periods assigned'} />
        </div>
      ) : <span className="ct-muted">Unavailable</span>,
    },
    {
      headData: 'Assignments', showOnMobile: false,
      bodyData: ({ subjects, teachers }) => (
        <div className="ct-class-cell">
          <strong>{subjects} {subjects === 1 ? 'subject' : 'subjects'}</strong>
          <span>{teachers} {teachers === 1 ? 'teacher' : 'teachers'}</span>
        </div>
      ),
    },
    {
      headData: 'Updated', showOnMobile: false,
      bodyData: ({ updated }) => <span className="ct-muted ct-date">{formatDate(updated)}</span>,
    },
    {
      headData: 'Actions', showOnMobile: true,
      bodyData: ({ row, name }) => (
        <div className="ct-row-actions">
          <button type="button" className="proc-btn proc-btn-sm" onClick={() => onOpen(row, false)} aria-label={'View ' + name} title="View timetable">
            <Eye size={15} /><span>View</span>
          </button>
          {canEdit && <>
            <button type="button" className="proc-btn proc-btn-sm" onClick={() => onOpen(row, true)} aria-label={'Edit ' + name} title="Edit timetable">
              <Pencil size={14} /><span>Edit</span>
            </button>
            <button type="button" className="proc-btn proc-btn-sm ct-danger ct-icon-action" onClick={() => onDelete(row)} aria-label={'Delete ' + name} title="Delete timetable">
              <Trash2 size={14} />
            </button>
          </>}
        </div>
      ),
    },
  ];

  return (
    <section className="ct-panel ct-directory" aria-labelledby="ct-directory-title" aria-busy={directory.loading}>
      <div className="ct-toolbar">
        <h2 id="ct-directory-title">Saved timetables{entries.length > 0 && <span className="ct-count">{entries.length}</span>}</h2>
        {!directory.loading && !directory.error && <div className="proc-actions">
          {entries.length > 0 && <>
            <SearchField label="Search class, subject or teacher" value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
            <SelectInput className="ct-control ct-sort" aria-label="Sort timetables" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="updated">Recently updated</option>
              <option value="class">Class name</option>
              <option value="periods">Periods assigned</option>
            </SelectInput>
          </>}
          <button type="button" className="proc-btn ct-icon-action" onClick={onReload} aria-label="Refresh timetables" title="Refresh timetables">
            <RefreshCw size={15} />
          </button>
        </div>}
      </div>
      {directory.loading && <Pending label="Loading class timetables…" />}
      {directory.error && <div className="ct-inset"><ErrorMessage error={directory.error} onRetry={onReload} /></div>}
      {!directory.loading && !directory.error && (visible.length > 0 ? <>
        <Table
          data={visible} tableLayout={columns} tableLabel="Saved class timetables"
          showToolbar={false} tableClassName="ct-directory-table" tableHeadClassName="ct-table-head"
          trClassname="ct-table-row" noScrollBar={false}
        />
        <Pagination pagination={{ page: currentPage, pages, limit: pageSize, total: filtered.length }} onPage={setPage} />
      </> : entries.length > 0 ? <Empty icon={Search} title="No matching timetables" description="Try another class, subject or teacher." />
        : <Empty
          icon={CalendarDays}
          title="No timetables yet"
          description={canCreate ? 'Use New timetable to choose a class and section, then assign subjects to their periods.' : undefined}
        />)}
    </section>
  );
}
