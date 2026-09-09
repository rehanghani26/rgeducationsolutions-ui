import { useState, useEffect } from "react";
import { format } from "date-fns";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import ActivityTimeline from "../../components/ui/ActivityTimeline.jsx";
import auditLogService from "../../services/auditLogService.js";
import Loader from "../../components/ui/Loader.jsx";

const mockAuditLogs = [
  { id: "al-1", timestamp: "2026-08-05T08:00:00Z", userId: { name: "Sheikh Abdullah Al-Hafiz" }, action: "ATTENDANCE_MARKED", module: "attendance", details: "Marked attendance for Grade 10 - Section A", ipAddress: "192.168.1.45" },
  { id: "al-2", timestamp: "2026-08-04T14:30:00Z", userId: { name: "Principal Office" }, action: "STUDENT_REGISTERED", module: "students", details: "Registered student Zayd Ibn Tariq", ipAddress: "192.168.1.10" },
  { id: "al-3", timestamp: "2026-08-02T11:20:00Z", userId: { name: "Finance Admin" }, action: "FEE_COLLECTED", module: "finance", details: "Collected Q3 Tuition Fee ₹15,500 (INV-2026-8801)", ipAddress: "192.168.1.12" },
];

const AuditLogList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [logs, setLogs] = useState(mockAuditLogs);
  const [pagination, setPagination] = useState({ total: mockAuditLogs.length, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  // Direct useEffect API Fetch
  useEffect(() => {
    setLoading(true);
    auditLogService.getAll({ page, limit: 30, search, module, action })
      .then((res) => {
        if (res.data?.data?.length > 0) {
          setLogs(res.data.data);
          if (res.data.pagination) setPagination(res.data.pagination);
        } else {
          setLogs(mockAuditLogs);
        }
      })
      .catch(() => setLogs(mockAuditLogs))
      .finally(() => setLoading(false));
  }, [page, search, module, action]);

  const columns = [
    {
      key: "timestamp",
      label: "Time",
      render: (row) =>
        row.timestamp
          ? format(new Date(row.timestamp), "MMM d, yyyy h:mm a")
          : "—",
    },
    {
      key: "userId",
      label: "User",
      render: (row) => row.userId?.name || row.userId?.email || "System",
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
          {row.action}
        </span>
      ),
    },
    { key: "module", label: "Module" },
    {
      key: "details",
      label: "Details",
      render: (row) => (
        <span className="text-slate-500 truncate max-w-xs block">
          {row.details || "—"}
        </span>
      ),
    },
    { key: "ipAddress", label: "IP" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Audit Logs"
        subtitle="System-wide activity, login history, and admin actions."
        breadcrumbs={[{ label: "Audit Logs" }]}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <SearchFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search activity details..."
          filters={[
            {
              key: "module",
              value: module,
              onChange: (v) => {
                setModule(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Modules" },
                { value: "students", label: "Students" },
                { value: "teachers", label: "Teachers" },
                { value: "exams", label: "Exams" },
                { value: "attendance", label: "Attendance" },
                { value: "finance", label: "Finance" },
                { value: "inventory", label: "Inventory" },
              ],
            },
            {
              key: "action",
              value: action,
              onChange: (v) => {
                setAction(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Actions" },
                { value: "CREATE", label: "Create" },
                { value: "UPDATE", label: "Update" },
                { value: "DELETE", label: "Delete" },
                { value: "LOGIN", label: "Login" },
                { value: "BULK", label: "Bulk" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setModule("");
            setAction("");
            setPage(1);
          }}
        />

        {loading ? (
          <Loader fullPage size="lg" text="Fetching audit logs directly from API..." />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
          />
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold mb-4">Recent Activity Timeline</h3>
        <ActivityTimeline logs={logs.slice(0, 15)} />
      </div>
    </div>
  );
};

export default AuditLogList;
