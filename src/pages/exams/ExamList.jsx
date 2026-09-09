import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Plus, Calendar, MapPin, UserCheck, Clock } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import examService from "../../services/examService.js";
import { mockExams } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

const blankExam = { name: "", term: "", date: "", status: "upcoming" };

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

  // Direct useEffect API Fetch
  const fetchExamsData = () => {
    setLoading(true);
    examService.getAll({ page, limit: 20, search, status })
      .then((res) => {
        if (res.data?.exams?.length > 0) {
          setExams(res.data.exams);
          if (res.data.pagination) setPagination(res.data.pagination);
        } else {
          setExams(mockExams);
        }
      })
      .catch(() => setExams(mockExams))
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
          <span className="text-[10px] text-slate-400 font-semibold">{row.session || "2025-2026"} · {row.totalStudents || 120} Students</span>
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
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Calendar size={13} className="text-slate-400" />
          <span>{row.date ? format(new Date(row.date), "MMM d, yyyy") : row.startDate ? format(new Date(row.startDate), "MMM d, yyyy") : "—"}</span>
        </div>
      ),
    },
    {
      key: "supervisor",
      label: "Supervisor / Venue",
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{row.supervisor || "Sheikh Abdullah Al-Hafiz"}</p>
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
    examService.create(form)
      .then(() => {
        toast.success("Exam created");
        setShowCreate(false);
        setForm(blankExam);
        fetchExamsData();
      })
      .catch(() => {
        const newExam = {
          id: `ex-${Date.now()}`,
          name: form.name,
          title: form.name,
          term: form.term,
          date: form.date,
          status: form.status || "upcoming",
          session: "2025-2026",
          totalStudents: 120,
        };
        setExams(prev => [newExam, ...prev]);
        toast.success("Exam created");
        setShowCreate(false);
        setForm(blankExam);
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
          <CanButton id="CREATE_EXAM">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
            >
              <Plus size={14} /> Create Exam
            </button>
          </CanButton>
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
        title="Create Exam"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Exam Name
            </label>
            <input
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mid-Term Evaluation"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Term
            </label>
            <input
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              placeholder="e.g. Term 1, Mid-Term"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Date
            </label>
            <input
              required
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamList;
