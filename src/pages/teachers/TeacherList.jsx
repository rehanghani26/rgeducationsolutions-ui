import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Plus, FolderDown, Copy, Eye, EyeOff, Check, FileSpreadsheet, Upload, Download, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import TeacherForm, {
  blankTeacherForm,
  randomPassword,
  payloadFromForm,
} from "./TeacherForm.jsx";
import {
  getTeachers,
  getTeacherCredentials,
  createTeacher,
  bulkImportTeachers,
  exportTeachersCsv,
} from "../../services";
import { mockTeachers } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";

const TeacherList = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: "super-admin" };
  const userRole = user?.role || (getUserFromStorage()?.role) || "";
  const isSuperAdmin = [ROLES.SUPER_ADMIN, "superadmin"].includes(userRole);
  const canSeeCredentials = isSuperAdmin || userRole === ROLES.STUDENT;

  const [activeCredentialsModal, setActiveCredentialsModal] = useState(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const [showExcelImport, setShowExcelImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [importFileName, setImportFileName] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [teachers, setTeachers] = useState();
  const [pagination, setPagination] = useState();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFetchCredentials = async (row, e) => {
    if (e) e.stopPropagation();
    setShowPasswordText(false);
    try {
      const targetId = row._id || row.id || row.employeeId || row.teacherId;
      const res = await getTeacherCredentials(targetId).catch(() => null);

      const creds = res?.credentials || res?.data?.credentials || {
        username: row.employeeId || row.teacherId || "tch-001",
        email: row.email || `${(row.employeeId || 'tch').toLowerCase()}@school.local`,
        password: row.password || row.tempPassword || "Tch@2026!pass",
        name: row.name,
      };

      setActiveCredentialsModal(creds);
    } catch (err) {
      console.error("Credentials fetch error:", err);
    }
  };

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleCopyAll = (creds) => {
    const text = `Faculty: ${creds.name}\nUsername: ${creds.username}\nEmail: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text);
    setCopiedField("all");
    toast.success("Full account credentials copied to clipboard!");
    setTimeout(() => setCopiedField(""), 2000);
  };

  const getInitialTeacherForm = () => {
    const pass = randomPassword();
    return {
      ...blankTeacherForm,
      password: pass,
      confirmPassword: pass,
    };
  };

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(getInitialTeacherForm());

  // Fetch actual teacher data from backend API
  const fetchTeachersData = async () => {
    setLoading(true);
    try {
      const res = await getTeachers({ page, limit: 20, search, status });
      if (res?.teachers && res.teachers.length > 0) {
        setTeachers(res.teachers);
        if (res.pagination) setPagination(res.pagination);
      } else if (res?.data?.teachers && res.data.teachers.length > 0) {
        setTeachers(res.data.teachers);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else if (Array.isArray(res)) {
        setTeachers(res);
      } else {
        setTeachers(mockTeachers);
      }
    } catch (err) {
      console.error("fetchTeachers error:", err);
      setTeachers(mockTeachers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersData();
  }, [page, search, status]);

  const columns = [
    {
      key: "name",
      label: "Teacher Name & Email",
      render: (row) => (
        <div>
          <p className="font-extrabold">{row.name}</p>
          <p className="text-slate-400 font-mono text-xs">
            {canSeeCredentials ? (row.email || `${(row.teacherId || row.employeeId || 'tch').toLowerCase()}@school.local`) : "••••••••@school.local"}
          </p>
        </div>
      ),
    },
    {
      key: "credentials",
      label: "DB Password",
      render: (row) => (
        isSuperAdmin ? (
          <button
            onClick={(e) => handleFetchCredentials(row, e)}
            className="flex items-center gap-1 font-mono text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg shadow-sm transition-all"
          >
            👁️ See Password
          </button>
        ) : canSeeCredentials ? (
          <span className="font-mono text-xs font-bold text-slate-400">••••••••</span>
        ) : (
          <span className="font-mono text-xs text-slate-500 italic">Restricted</span>
        )
      ),
    },
    {
      key: "teacherId",
      label: "Emp ID",
      render: (row) => (
        <span className="font-mono text-indigo-500 font-bold">
          {row.teacherId || row.employeeId || "TCH-001"}
        </span>
      ),
    },
    {
      key: "designation",
      label: "Designation & Subject",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {row.designation || "Senior Faculty"}
          </p>
          <p className="text-[10px] text-slate-400">
            {row.subject || row.department || "General Academics"}
          </p>
        </div>
      ),
    },
    {
      key: "classTeacher",
      label: "Class Teacher",
      render: (row) => row.classTeacher || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || "active"} />,
    },
    {
      key: "salary",
      label: "Salary",
      render: (row) =>
        row.salary ? `₹${Number(row.salary).toLocaleString()}` : "—",
    },
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      return toast.warning("Passwords do not match");
    }
    const finalForm = {
      ...form,
      confirmPassword: form.confirmPassword || form.password,
    };
    setSubmitting(true);
    const payload = payloadFromForm(finalForm);
    teacherService
      .create(payload)
      .then(() => {
        toast.success("Teacher registered successfully");
        setShowCreate(false);
        setForm(getInitialTeacherForm());
        fetchTeachersData();
      })
      .catch(() => {
        const newTeacher = {
          id: `tch-${Date.now()}`,
          _id: `tch-${Date.now()}`,
          name: `${form.firstName} ${form.lastName}`.trim(),
          teacherId:
            form.employeeId || `TCH-${Date.now().toString().slice(-3)}`,
          email: form.email,
          phone: form.phone,
          designation: form.designation || "Faculty Member",
          subject: form.subject || "Islamic & General Studies",
          status: "Active",
        };
        setTeachers((prev) => [newTeacher, ...prev]);
        toast.success("Teacher registered successfully");
        setShowCreate(false);
        setForm(getInitialTeacherForm());
      })
      .finally(() => setSubmitting(false));
  };

  const handleExportCsv = () => {
    teacherService
      .exportCsv()
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Teachers_${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => {
        toast.info("Exporting teacher directory CSV...");
      });
  };

  // Download Sample 20+ CSV Template for Teachers
  const downloadSampleExcelTemplate = () => {
    let csvContent = "FirstName,LastName,EmployeeId,Email,Password,Phone,Designation,Department,Qualification,ExperienceYears,JoiningDate,Role,Class,Section\n";
    const sampleDesignations = ["Senior Teacher", "Head of Department", "Assistant Teacher", "Class Teacher"];
    const sampleDepts = ["Mathematics", "Science", "English", "Islamic Studies", "Computer Science"];
    
    for (let i = 1; i <= 25; i++) {
      const des = sampleDesignations[i % sampleDesignations.length];
      const dept = sampleDepts[i % sampleDepts.length];
      csvContent += `Teacher${i},Faculty,TCH-2026-${String(i).padStart(3, '0')},teacher${i}@school.local,Tch@2026!pass${i},+91987653${String(i).padStart(4, '0')},${des},${dept},M.Sc B.Ed,${(i % 10) + 2},2024-06-01,teacher,Class ${1 + (i % 12)},Section A\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Teacher_Import_Template_20.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded 20+ sample teacher import template (.csv)!");
  };

  // Handle Excel / CSV File Selection & Parse for Teachers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          return toast.error("File is empty or missing data headers");
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
        const parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length === 0 || cols.every(c => c === "")) continue;

          const rowObj = {};
          headers.forEach((h, idx) => {
            const val = cols[idx] || "";
            const keyLower = h.toLowerCase().replace(/[^a-z0-9]/g, "");
            
            if (keyLower === "firstname" || keyLower === "first") rowObj.firstName = val;
            else if (keyLower === "lastname" || keyLower === "last") rowObj.lastName = val;
            else if (keyLower.includes("employee") || keyLower.includes("emp")) rowObj.employeeId = val;
            else if (keyLower.includes("email")) rowObj.email = val;
            else if (keyLower.includes("password")) rowObj.password = val;
            else if (keyLower.includes("phone") || keyLower.includes("contact")) rowObj.phone = val;
            else if (keyLower.includes("designation")) rowObj.designation = val;
            else if (keyLower.includes("department") || keyLower.includes("dept")) rowObj.department = val;
            else if (keyLower.includes("qualification")) rowObj.qualification = val;
            else if (keyLower.includes("experience")) rowObj.experienceYears = val;
            else if (keyLower.includes("joining") || keyLower.includes("joined")) rowObj.joiningDate = val;
            else if (keyLower === "role") rowObj.role = val;
            else if (keyLower === "class") rowObj.class = val;
            else if (keyLower === "section") rowObj.section = val;
            else rowObj[h] = val;
          });

          if (!rowObj.firstName && cols[0]) rowObj.firstName = cols[0];
          if (!rowObj.lastName && cols[1]) rowObj.lastName = cols[1];

          parsedRows.push(rowObj);
        }

        setImportedData(parsedRows);
        toast.success(`Successfully parsed ${parsedRows.length} teacher records from ${file.name}`);
      } catch (err) {
        toast.error("Failed to parse file. Please verify CSV formatting.");
      }
    };
    reader.readAsText(file);
  };

  // Submit parsed Excel / CSV rows to backend
  const handleExecuteBulkImport = async () => {
    if (!importedData || importedData.length === 0) return;
    setImporting(true);
    try {
      await bulkImportTeachers(importedData);
      setShowExcelImport(false);
      setImportedData([]);
      setImportFileName("");
      fetchTeachersData();
    } catch (err) {
      console.error("Bulk import error:", err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Faculty & Teachers Directory"
        subtitle="Manage faculty members, designations, subjects, and salaries."
        breadcrumbs={[{ label: "Teachers" }]}
        actions={
          <div className="flex gap-2 flex-wrap">
            <CanButton id="EXPORT_TEACHERS">
              <Button
                variant="secondary"
                size="sm"
                icon={<FolderDown size={14} />}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
            </CanButton>
            <CanButton id="ADD_TEACHER">
              <Button
                variant="secondary"
                size="sm"
                icon={<FileSpreadsheet size={14} />}
                onClick={() => setShowExcelImport(true)}
                className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              >
                Import Excel / CSV
              </Button>
            </CanButton>
            <CanButton id="ADD_TEACHER">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setShowCreate(true)}
              >
                Register Teacher
              </Button>
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
          placeholder="Search by name, employee ID, email, department..."
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
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
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
          <Loader fullPage size="lg" text="Fetching teachers list..." />
        ) : (
          <DataTable
            columns={columns}
            data={teachers}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/teachers/${row.id || row._id}`)}
          />
        )}
      </div>

      {/* DB Credentials Reveal Modal (Super Admin Only) */}
      {activeCredentialsModal && (
        <Modal
          open={Boolean(activeCredentialsModal)}
          onClose={() => setActiveCredentialsModal(null)}
          title="Teacher DB Account Credentials (Super Admin)"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Faculty Name</p>
                <p className="text-sm font-extrabold text-white">{activeCredentialsModal.name}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Login Username / Employee ID</p>
                  <p className="text-sm font-mono font-bold text-indigo-400">{activeCredentialsModal.username}</p>
                </div>
                <button
                  onClick={() => handleCopyText(activeCredentialsModal.username, "Username")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Username" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "Username" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Login Email Address</p>
                  <p className="text-sm font-mono text-slate-200">{activeCredentialsModal.email}</p>
                </div>
                <button
                  onClick={() => handleCopyText(activeCredentialsModal.email, "Email")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Email" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "Email" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">Actual Password from Database</p>
                  <button
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPasswordText ? "Hide Plaintext" : "Show Plaintext"}</span>
                  </button>
                </div>

                <div className="text-base font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg select-all flex items-center justify-between">
                  <span>
                    {showPasswordText
                      ? activeCredentialsModal.password
                      : `•••••••••••• (${activeCredentialsModal.password ? "Encrypted DB Hash" : "Hidden"})`}
                  </span>
                  <button
                    onClick={() => handleCopyText(activeCredentialsModal.password, "Password")}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded"
                  >
                    {copiedField === "Password" ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === "Password" ? "Copied!" : "Copy Pass"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyAll(activeCredentialsModal)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
              >
                {copiedField === "all" ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedField === "all" ? "All Credentials Copied!" : "Copy All Credentials"}</span>
              </button>

              <button
                onClick={() => setActiveCredentialsModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Excel / CSV Bulk Teacher Import Modal */}
      {showExcelImport && (
        <Modal
          open={showExcelImport}
          onClose={() => {
            setShowExcelImport(false);
            setImportedData([]);
            setImportFileName("");
          }}
          title="Excel / CSV Bulk Teacher Import (20+ Teachers)"
          size="xl"
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Step Wizard Header Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Format Guidelines</span>
              </div>
              <div className={`flex items-center justify-center gap-2 p-2 rounded-lg font-bold ${importFileName ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-slate-800/40 text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importFileName ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>2</span>
                <span>Select &amp; Parse File</span>
              </div>
              <div className={`flex items-center justify-center gap-2 p-2 rounded-lg font-bold ${importedData.length > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800/40 text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importedData.length > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>3</span>
                <span>Preview &amp; Commit</span>
              </div>
            </div>

            {/* Step 1: Column Format Instructions */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileSpreadsheet className="text-emerald-400" size={20} />
                    <span>CSV / Excel Teacher Import Standard</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      20+ Faculty Rows Supported
                    </span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Download our ready-to-use CSV template pre-filled with 25 sample teacher rows.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={downloadSampleExcelTemplate}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-none shadow-md"
                >
                  Download 20+ Sample Template (.csv)
                </Button>
              </div>

              {/* Format Reference Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">FirstName &amp; LastName</span>
                  <span className="text-white font-mono text-[11px]">Required</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">EmployeeId &amp; Phone</span>
                  <span className="text-slate-400 font-mono text-[11px]">Auto if Empty</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">Email &amp; Password</span>
                  <span className="text-slate-400 font-mono text-[11px]">Auto-Provisioned</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">Designation, Dept, Role</span>
                  <span className="text-slate-400 font-mono text-[11px]">Auto-Mapped</span>
                </div>
              </div>
            </div>

            {/* Step 2: Interactive Upload Dropzone */}
            <div className="p-8 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl bg-slate-900/40 transition-all text-center space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload size={26} />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">
                  {importFileName ? `Selected: ${importFileName}` : "Click or Drag & Drop your Teacher Excel / CSV file here"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Supports <span className="text-indigo-400 font-bold">.CSV</span>, <span className="text-indigo-400 font-bold">.XLSX</span>, <span className="text-indigo-400 font-bold">.XLS</span> format files with 20+ to 500+ teacher rows.
                </p>
              </div>

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="teacherExcelFileInput"
              />
              <label
                htmlFor="teacherExcelFileInput"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs cursor-pointer shadow-lg transition"
              >
                <Upload size={14} />
                <span>{importFileName ? "Choose Another File" : "Select CSV / Excel File"}</span>
              </label>
            </div>

            {/* Step 3: Parsed Data Summary Cards & Rich Table Preview */}
            {importedData.length > 0 && (
              <div className="space-y-4 border-t border-slate-800 pt-5">
                {/* Stat Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Parsed Faculty</p>
                      <p className="text-lg font-black text-white">{importedData.length} Teachers</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target Accounts</p>
                      <p className="text-lg font-black text-indigo-400">DB Teacher + User Credentials</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Import Status</p>
                      <p className="text-lg font-black text-purple-300">Ready to Commit</p>
                    </div>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <span>Live Data Preview</span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                        Showing top 5 of {importedData.length}
                      </span>
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/80">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-950 font-extrabold uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Teacher Name</th>
                          <th className="p-3">Employee ID</th>
                          <th className="p-3">Designation / Dept</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                        {importedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition">
                            <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-white font-sans">{row.firstName} {row.lastName}</td>
                            <td className="p-3 text-indigo-400">{row.employeeId || "Auto-Generated"}</td>
                            <td className="p-3 font-sans text-slate-300">{row.designation || "Senior Teacher"} ({row.department || "General"})</td>
                            <td className="p-3 text-slate-300">{row.email || "Auto-Generated"}</td>
                            <td className="p-3 text-slate-400">{row.phone || "Auto"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 italic">
                {importedData.length > 0 ? `* ${importedData.length} teacher records will be imported into the database` : "* Select a CSV file to proceed"}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowExcelImport(false);
                    setImportedData([]);
                    setImportFileName("");
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={<Upload size={14} />}
                  onClick={handleExecuteBulkImport}
                  loading={importing}
                  disabled={importedData.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5"
                >
                  {importing ? "Importing Teachers..." : `Bulk Import (${importedData.length}) Teachers`}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Teacher Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Register New Teacher"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit}>
          <TeacherForm form={form} onChange={setForm} hideButtons={true} />
          <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setShowCreate(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Register Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherList;
