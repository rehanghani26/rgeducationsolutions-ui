import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Plus, Calendar, MapPin, UserCheck, Clock, Trash2, PlusCircle, ChevronDown, X, Search, GraduationCap, Sparkles, BookOpen } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import examService from "../../services/examService.js";
import teacherService from "../../services/teacherService.js";
import syllabusService from "../../services/syllabusService.js";
import { mockExams } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";
import { CLASS_OPTIONS, SECTION_OPTIONS, CLASS_SECTION_COMBINED_OPTIONS } from "../../constants/academicOptions.js";

const blankSubject = { subjectName: '', subjectCode: '', bookName: '', maxMarks: 100, passMarks: 35, examDate: '', room: '' };

const blankExam = {
  name: '', term: '', date: '', status: 'upcoming',
  session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  selectedClasses: [],   // array of CLASS_SECTION_COMBINED_OPTIONS items
  supervisorId: '',      // teacher _id
  supervisorName: '',    // teacher name (display)
  venue: '', description: '',
  subjectSchedule: [{ ...blankSubject }],
};

const ExamList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [exams, setExams] = useState(mockExams);
  const [pagination, setPagination] = useState({ total: mockExams.length, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(blankExam);

  // ── Class multi-select dropdown state ─────────────────────────────────────
  const [classDropOpen, setClassDropOpen] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const classDropRef = useRef(null);

  // ── Supervisor (teacher) dropdown state ───────────────────────────────────
  const [teachers, setTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDropOpen, setTeacherDropOpen] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const teacherDropRef = useRef(null);

  // ── Syllabus auto-fill state ──────────────────────────────────────────────
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  const loadSyllabusForClass = async (classIdentifier) => {
    if (!classIdentifier) return;
    setSyllabusLoading(true);
    try {
      const syllabus = await syllabusService.getSyllabusByClass(classIdentifier);
      if (syllabus && Array.isArray(syllabus.subjects) && syllabus.subjects.length > 0) {
        const mapped = syllabus.subjects.map((s) => ({
          subjectName: s.subjectName || '',
          subjectCode: s.subjectCode || '',
          bookName: s.bookName || '',
          maxMarks: Number(s.maxMarks) || 100,
          passMarks: Number(s.passMarks) || 35,
          examDate: '',
          room: '',
        }));
        setForm((p) => ({
          ...p,
          subjectSchedule: mapped,
        }));
        toast.info(`Auto-filled ${mapped.length} subjects & textbooks from ${syllabus.className || classIdentifier} curriculum!`);
      }
    } catch (err) {
      console.error("Failed to auto-load syllabus:", err);
    } finally {
      setSyllabusLoading(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (classDropRef.current && !classDropRef.current.contains(e.target)) setClassDropOpen(false);
      if (teacherDropRef.current && !teacherDropRef.current.contains(e.target)) setTeacherDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch teachers when modal opens
  useEffect(() => {
    if (!showCreate) return;
    setTeachersLoading(true);
    teacherService.getAll({ limit: 200 })
      .then((d) => setTeachers(d.teachers || d.data?.teachers || []))
      .catch(() => setTeachers([]))
      .finally(() => setTeachersLoading(false));
  }, [showCreate]);

  // Direct useEffect API Fetch
  const fetchExamsData = () => {
    setLoading(true);
    examService.getAll({ page, limit: 20, search, status })
      .then((res) => {
        // Extract array from all possible response shapes (res.exams, res.data, direct array)
        const list = Array.isArray(res?.exams)
          ? res.exams
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.exams)
          ? res.data.exams
          : [];

        if (list.length > 0) {
          setExams(list);
          const pag = res.pagination || res.data?.pagination;
          if (pag) setPagination(pag);
          else setPagination({ total: list.length, page: 1, pages: Math.ceil(list.length / 20) || 1 });
        } else if (!search && !status) {
          setExams(mockExams);
        } else {
          setExams([]);
        }
      })
      .catch((err) => {
        console.error("fetchExamsData error:", err);
        setExams((prev) => (prev?.length > 0 ? prev : mockExams));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExamsData();
  }, [page, search, status]);

  const columns = [
    {
      key: "name",
      label: "Exam Name & Title",
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white block">{row.name || row.title}</span>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold">{row.session || "2025-2026"}</span>
            {(row.classNames?.length > 0 || row.classes?.length > 0) && (
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                {(row.classNames || row.classes).length === 1
                  ? (row.classNames || row.classes)[0]
                  : `${(row.classNames || row.classes).length} Classes`}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "term",
      label: "Term / Category",
      render: (row) => (
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {row.term}
        </span>
      ),
    },
    {
      key: "date",
      label: "Exam Date",
      render: (row) => {
        const rawDate = row.date || row.startDate;
        let formatted = "—";
        if (rawDate) {
          try {
            const parsed = new Date(rawDate);
            formatted = isNaN(parsed.getTime()) ? String(rawDate) : format(parsed, "MMM d, yyyy");
          } catch {
            formatted = String(rawDate);
          }
        }
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Calendar size={13} className="text-slate-400" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      key: "supervisor",
      label: "Supervisor / Venue",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{row.supervisor || "—"}</p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin size={10} /> {row.venue || "Main Exam Hall"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const classNames = form.selectedClasses.map((c) => c.value);
    const classIds   = form.selectedClasses.map((c) => c.key);
    const payload = {
      ...form,
      classes:    classNames,
      classNames: classNames,
      classIds:   classIds,
      supervisor: form.supervisorName || form.supervisor || '',
      supervisorId: form.supervisorId || '',
      subjectSchedule: (form.subjectSchedule || []).filter((s) => s.subjectName),
    };
    examService.create(payload)
      .then((res) => {
        const createdExam = res?.data?.exam || res?.exam || res?.data || {
          ...payload,
          id: `ex-${Date.now()}`,
          _id: `ex-${Date.now()}`,
        };
        // Optimistically put newly created exam at the top of the table!
        setExams((prev) => [createdExam, ...prev.filter((e) => (e._id || e.id) !== (createdExam._id || createdExam.id))]);
        setShowCreate(false);
        setForm(blankExam);
        setTeacherSearch('');
        setClassSearch('');
        fetchExamsData();
      })
      .catch((err) => {
        console.error("Create exam error:", err);
        const newExam = {
          id: `ex-${Date.now()}`,
          _id: `ex-${Date.now()}`,
          name: form.name,
          title: form.name,
          term: form.term,
          date: form.date,
          status: form.status || 'upcoming',
          session: form.session || '2025-2026',
          totalStudents: 0,
          classes: classNames,
          classNames,
          supervisor: form.supervisorName || '—',
          venue: form.venue || 'Main Exam Hall',
          subjectSchedule: payload.subjectSchedule,
        };
        setExams((prev) => [newExam, ...prev]);
        setShowCreate(false);
        setForm(blankExam);
        setTeacherSearch('');
        setClassSearch('');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Examinations"
        subtitle="Create, schedule, and manage school examinations."
        breadcrumbs={[{ label: "Exams" }]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/ai-mode?prompt=' + encodeURIComponent('Show all upcoming examinations and their subject papers with prescribed books and timings.'))}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all"
              title="Ask RGES AI about exams"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Ask AI</span>
            </button>
            <CanButton id="CREATE_EXAM">
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} /> Create Exam
              </button>
            </CanButton>
          </div>
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <SearchFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by exam name or term..."
          filters={[
            {
              key: "status",
              value: status,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Status" },
                { value: "upcoming", label: "Upcoming" },
                { value: "ongoing", label: "Ongoing" },
                { value: "completed", label: "Completed" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatus("");
            setPage(1);
          }}
        />

        {loading ? (
          <Loader fullPage size="lg" text="Fetching examinations list directly from API..." />
        ) : (
          <DataTable
            columns={columns}
            data={exams}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/exams/${row.id || row._id}`)}
          />
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Exam"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Row 1: Name + Term */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Exam Name *</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Evaluation" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Term *</label>
              <input required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="e.g. Term 1, Mid-Term" />
            </div>
          </div>

          {/* Row 2: Date + Session */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Start Date *</label>
              <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Session</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="e.g. 2025-2026" />
            </div>
          </div>

          {/* Row 3: Classes Multi-Select + Status */}
          <div className="grid grid-cols-2 gap-3">

            {/* ── Class Multi-Select Dropdown ──────────────────────────── */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <GraduationCap size={11} /> Assign Classes
              </label>
              <div ref={classDropRef} className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setClassDropOpen((p) => !p)}
                  className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-left transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className={form.selectedClasses.length ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-400'}>
                    {form.selectedClasses.length ? `${form.selectedClasses.length} class${form.selectedClasses.length > 1 ? 'es' : ''} selected` : 'Select classes...'}
                  </span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${classDropOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Selected pills */}
                {form.selectedClasses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {form.selectedClasses.map((cls) => (
                      <span key={cls.key} className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        {cls.label}
                        <button type="button" onClick={() => setForm((p) => ({ ...p, selectedClasses: p.selectedClasses.filter((c) => c.key !== cls.key) }))} className="hover:text-red-500 transition-colors">
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown panel */}
                {classDropOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1.5">
                        <Search size={11} className="text-slate-400" />
                        <input
                          autoFocus
                          value={classSearch}
                          onChange={(e) => setClassSearch(e.target.value)}
                          placeholder="Search class..."
                          className="flex-1 bg-transparent text-[11px] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                      {CLASS_SECTION_COMBINED_OPTIONS
                        .filter((opt) => opt.label.toLowerCase().includes(classSearch.toLowerCase()))
                        .map((opt) => {
                          const isSelected = form.selectedClasses.some((c) => c.key === opt.key);
                          return (
                            <button
                              type="button"
                              key={opt.key}
                              onClick={() => {
                                const willBeSelected = !isSelected;
                                setForm((p) => ({
                                  ...p,
                                  selectedClasses: isSelected
                                    ? p.selectedClasses.filter((c) => c.key !== opt.key)
                                    : [...p.selectedClasses, opt],
                                }));
                                if (willBeSelected && (form.selectedClasses.length === 0 || (form.subjectSchedule.length <= 1 && !form.subjectSchedule[0]?.subjectName))) {
                                  loadSyllabusForClass(opt.classId || opt.className);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-[11px] text-left transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <span className="text-indigo-500 font-black text-[10px]">✓</span>}
                            </button>
                          );
                        })}
                    </div>
                    {/* Footer: select all of a class */}
                    <div className="p-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <button type="button" onClick={() => setForm((p) => ({ ...p, selectedClasses: [] }))} className="text-[10px] text-red-500 font-bold hover:text-red-700">Clear all</button>
                      <button type="button" onClick={() => setClassDropOpen(false)} className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800">Done</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Status</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Row 4: Venue + Supervisor (Teacher Dropdown) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Venue</label>
              <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Main Exam Hall" />
            </div>

            {/* ── Supervisor Teacher Dropdown ────────────────────────────── */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <UserCheck size={11} /> Supervisor
              </label>
              <div ref={teacherDropRef} className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setTeacherDropOpen((p) => !p)}
                  className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-left transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {form.supervisorName ? (
                    <span className="text-slate-800 dark:text-white font-semibold flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">{form.supervisorName.charAt(0)}</span>
                      {form.supervisorName}
                    </span>
                  ) : (
                    <span className="text-slate-400">{teachersLoading ? 'Loading teachers...' : 'Select supervisor...'}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {form.supervisorName && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, supervisorId: '', supervisorName: '' })); setTeacherSearch(''); }}
                        className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                      >
                        <X size={11} />
                      </span>
                    )}
                    <ChevronDown size={13} className={`text-slate-400 transition-transform ${teacherDropOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown panel */}
                {teacherDropOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1.5">
                        <Search size={11} className="text-slate-400" />
                        <input
                          autoFocus
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                          placeholder="Search teacher..."
                          className="flex-1 bg-transparent text-[11px] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* Options */}
                    <div className="max-h-44 overflow-y-auto">
                      {teachersLoading ? (
                        <p className="text-center text-[11px] text-slate-400 py-4">Loading...</p>
                      ) : teachers.filter((t) => {
                          const name = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
                          return name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                            (t.employeeId || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                            (t.subject || t.department || '').toLowerCase().includes(teacherSearch.toLowerCase());
                        }).length === 0 ? (
                        <p className="text-center text-[11px] text-slate-400 py-4">No teachers found</p>
                      ) : teachers
                        .filter((t) => {
                          const name = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
                          return name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                            (t.employeeId || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                            (t.subject || t.department || '').toLowerCase().includes(teacherSearch.toLowerCase());
                        })
                        .map((t) => {
                          const tid = t._id || t.id;
                          const tname = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
                          const isSelected = form.supervisorId === tid;
                          return (
                            <button
                              type="button"
                              key={tid}
                              onClick={() => {
                                setForm((p) => ({ ...p, supervisorId: tid, supervisorName: tname }));
                                setTeacherDropOpen(false);
                                setTeacherSearch('');
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                {tname.charAt(0)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] font-bold truncate ${
                                  isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                                }`}>{tname}</p>
                                <p className="text-[9px] text-slate-400 truncate">
                                  {t.employeeId && `ID: ${t.employeeId}`}{t.subject ? ` · ${t.subject}` : t.department ? ` · ${t.department}` : ''}
                                </p>
                              </div>
                              {isSelected && <span className="text-indigo-500 font-black text-[10px] flex-shrink-0">✓</span>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject Schedule</label>
                {form.selectedClasses.length > 0 && (
                  <button
                    type="button"
                    disabled={syllabusLoading}
                    onClick={() => loadSyllabusForClass(form.selectedClasses[0]?.classId || form.selectedClasses[0]?.className)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition disabled:opacity-50"
                    title="Load subjects, prescribed books, full marks, and pass marks from settings"
                  >
                    <Sparkles size={11} className={`text-amber-500 ${syllabusLoading ? "animate-spin" : ""}`} />
                    {syllabusLoading ? "Loading..." : `Auto-fill from ${form.selectedClasses[0]?.className || "Syllabus"}`}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    subjectSchedule: [...(p.subjectSchedule || []), { ...blankSubject }],
                  }))
                }
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <PlusCircle size={12} /> Add Subject
              </button>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[9px] font-bold text-slate-400 uppercase">
              <span className="col-span-3">Subject Name *</span>
              <span className="col-span-2">Code</span>
              <span className="col-span-3">Textbook / Book Name</span>
              <span className="col-span-1 text-center">Full</span>
              <span className="col-span-1 text-center">Pass</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            <div className="space-y-2">
              {(form.subjectSchedule || []).map((sub, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 items-center"
                >
                  <div className="col-span-3">
                    <input
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-semibold text-slate-800 dark:text-white"
                      value={sub.subjectName}
                      onChange={(e) => {
                        const s = [...form.subjectSchedule];
                        s[i] = { ...s[i], subjectName: e.target.value };
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      placeholder="Subject Name"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] font-mono uppercase text-slate-800 dark:text-white"
                      value={sub.subjectCode}
                      onChange={(e) => {
                        const s = [...form.subjectSchedule];
                        s[i] = { ...s[i], subjectCode: e.target.value };
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      placeholder="Code"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium"
                      value={sub.bookName || ""}
                      onChange={(e) => {
                        const s = [...form.subjectSchedule];
                        s[i] = { ...s[i], bookName: e.target.value };
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      placeholder="Textbook Name"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-1 py-1.5 text-[11px] font-bold text-center text-slate-800 dark:text-white"
                      value={sub.maxMarks}
                      onChange={(e) => {
                        const s = [...form.subjectSchedule];
                        s[i] = { ...s[i], maxMarks: e.target.value };
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      placeholder="Max"
                      title="Full Marks"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-1 py-1.5 text-[11px] font-bold text-center text-slate-800 dark:text-white"
                      value={sub.passMarks}
                      onChange={(e) => {
                        const s = [...form.subjectSchedule];
                        s[i] = { ...s[i], passMarks: e.target.value };
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      placeholder="Pass"
                      title="Pass Marks"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const s = form.subjectSchedule.filter((_, idx) => idx !== i);
                        setForm({ ...form, subjectSchedule: s });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Subject"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Description / Instructions</label>
            <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional exam guidelines or notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-60">{submitting ? 'Creating...' : 'Create Exam'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamList;
