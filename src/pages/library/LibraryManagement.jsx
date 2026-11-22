import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routes.js';
import api from '../../services/api.js';
import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Modal from '../../components/ui/Modal.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import { formatDate } from '../../utils/formatters.js';

const idOf = (item) => item._id || item.id;
const button = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60';

export default function LibraryManagement() {
  const { readOnly, selected } = useAcademicSession();
  const role = useSelector((state) => state.auth.user?.role);
  const canBrowseLists = ['super-admin', 'school-admin', 'admin', 'principal', 'librarian', 'director'].includes(role);
  const canManage = canBrowseLists && role !== 'director' && !readOnly;
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/erp/library/books'), api.get('/erp/library/issues')]).then(([catalog, issues]) => {
      if (!mounted) return;
      setBooks(catalog.data.books || []);
      setLoans(issues.data.issues || []);
    }).catch((cause) => {
      if (mounted) setError(cause.response?.data?.message || 'Unable to load the library.');
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [revision]);

  const field = (name) => ({ name, value: form?.[name] || '',
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })) });
  const open = (mode) => { setError(''); setForm({ mode }); };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (form.mode === 'book') {
        await api.post('/erp/library/books', form);
      } else {
        const { data } = await api.get('/students', { params: { search: form.admissionNumber, limit: 20 } });
        const student = data.students?.find((row) =>
          row.admissionNumber?.toLowerCase() === form.admissionNumber.trim().toLowerCase());
        if (!student) throw new Error('Enter the admission number of a student enrolled in this session.');
        await api.post('/erp/library/issue', { bookId: form.bookId, studentId: idOf(student), dueDate: form.dueDate });
      }
      setForm(null);
      setRevision((value) => value + 1);
    } catch (cause) {
      setError(cause.response?.data?.message || cause.message || 'Unable to save library record.');
    } finally {
      setSaving(false);
    }
  };
  const matches = books.filter((book) => [book.title, book.author, book.isbn, book.category]
    .some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));
  return (
    <section className="space-y-4">
      <PageHeader title="Library" actions={canBrowseLists && <div className="flex flex-wrap gap-2">
        <Link className={button} to={ROUTES.LIBRARY_BOOK_LISTS}>Prescribed book lists</Link>
        {canManage && <>
          <button className={button} onClick={() => open('book')}>Add book</button>
          <button className={button} disabled={!selected?.isCurrent} onClick={() => open('issue')}>Issue book</button>
        </>}
      </div>} />
      {error && !form && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <FormInput name="catalog-search" label="Search catalog" value={search} onChange={(event) => setSearch(event.target.value)} />
      <section className="space-y-2">
        {loading ? <p role="status">Loading library…</p> : matches.length ? <ul className="divide-y rounded-xl border dark:border-slate-700">
          {matches.map((book) => <li key={idOf(book)} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
            <span><strong>{book.title}</strong> · {book.author}</span>
            <span>{Math.max(0, book.totalQty - book.issuedQty)} available</span>
          </li>)}
        </ul> : <p className="text-sm text-slate-500">No matching books.</p>}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Loans for this session</h2>
        {loans.length ? <ul className="divide-y rounded-xl border dark:border-slate-700">{loans.map((loan) => (
          <li className="grid gap-1 p-3 text-sm sm:grid-cols-3" key={idOf(loan)}>
            <span>{loan.book?.title || loan.bookId?.title || 'Book'}</span>
            <span>{loan.student?.name || loan.studentId?.name || 'Student'}{loan.className && ' · ' + loan.className}</span>
            <span>{loan.returnDate ? 'Returned ' + formatDate(loan.returnDate) : 'Due ' + formatDate(loan.dueDate)}</span>
          </li>
        ))}</ul> : !loading && <p className="text-sm text-slate-500">No loans for this session.</p>}
      </section>
      <Modal open={Boolean(form)} onClose={() => setForm(null)} title={form?.mode === 'book' ? 'Add book' : 'Issue book'} size="sm">
        {form && <form className="space-y-3" onSubmit={save}>
          {form.mode === 'book' ? <>
            <FormInput label="Title" {...field('title')} required />
            <FormInput label="Author" {...field('author')} required />
            <FormInput label="ISBN" {...field('isbn')} required />
            <FormInput label="Category" {...field('category')} required />
            <FormInput label="Copies" type="number" min="1" {...field('totalQty')} required />
          </> : <>
            <FormSelect label="Book" {...field('bookId')} required options={books.filter((book) => book.totalQty > book.issuedQty)
              .map((book) => ({ value: idOf(book), label: book.title }))} />
            <FormInput label="Student admission number" {...field('admissionNumber')} required />
            <FormInput label="Due date" type="date" {...field('dueDate')} />
          </>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button className={button} disabled={saving} type="submit">{saving ? 'Saving…' : 'Save'}</button>
        </form>}
      </Modal>
    </section>
  );
}
