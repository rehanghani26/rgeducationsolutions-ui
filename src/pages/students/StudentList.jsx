import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Plus,
  FolderDown,
  Copy,
  Eye,
  EyeOff,
  Check,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  Users,
  GraduationCap,
  Sparkles,
  ExternalLink,
  CreditCard,
  UserCheck,
  Search,
  School,
  Phone,
  Lock,
  FileText,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import PdfViewerModal from "../../components/ui/PdfViewerModal.jsx";
import StudentForm, {
  blankStudentForm,
  randomPassword,
} from "./StudentForm.jsx";
import {
  getStudents,
  getStudentCredentials,
  createStudent,
  bulkImportStudents,
  exportStudentsCsv,
} from "../../services";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../../constants/academicOptions.js";
import { mockStudents } from "../../data/mockData.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";

const StudentList = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: "super-admin" };
  const userRole = user?.role || (getUserFromStorage()?.role) || "";

  const isSuperAdmin = [ROLES.SUPER_ADMIN, "superadmin"].includes(userRole);
  const canSeeCredentials = isSuperAdmin || userRole === ROLES.STUDENT;

  const [activeCredentialsModal, setActiveCredentialsModal] = useState(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [activePdfDoc, setActivePdfDoc] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState(mockStudents);
  const [pagination, setPagination] = useState({ total: mockStudents.length, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk Excel/CSV Import state
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [showRefTables, setShowRefTables] = useState(true);

  const handleFetchCredentials = async (row, e) => {
    if (e) e.stopPropagation();
    setShowPasswordText(false);
    try {
      const targetId = row._id || row.id || row.admissionNumber || row.studentId;
      const res = await getStudentCredentials(targetId).catch(() => null);

      const creds = res?.credentials || res?.data?.credentials || {
        username: row.admissionNumber || row.studentId || "std-001",
        email: row.email || `${(row.admissionNumber || 'std').toLowerCase()}@school.local`,
        password: row.password || row.tempPassword || "Std@2026!pass",
        name: row.name,
      };

      setActiveCredentialsModal(creds);
    } catch (err) {
      console.error("Credentials error:", err);
    }
  };

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleCopyAll = (creds) => {
    const text = `Student: ${creds.name}\nUsername: ${creds.username}\nEmail: ${creds.email}\nPassword: ${creds.password}`;
    navigator.clipboard.writeText(text);
    setCopiedField("all");
    toast.success("Full account credentials copied to clipboard!");
    setTimeout(() => setCopiedField(""), 2000);
  };

  const getInitialStudentForm = () => {
    const pass = randomPassword();
    return {
      ...blankStudentForm,
      password: pass,
      confirmPassword: pass,
    };
  };

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(getInitialStudentForm());

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      const res = await getStudents({
        page,
        limit: 20,
        search,
        status,
        class: selectedClass,
        className: selectedClass,
        section: selectedSection,
        sectionName: selectedSection,
      });
      if (res?.students) {
        setStudents(res.students);
        if (res.pagination) setPagination(res.pagination);
      } else if (res?.data?.students) {
        setStudents(res.data.students);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else if (Array.isArray(res)) {
        setStudents(res);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("fetchStudents error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [page, search, status, selectedClass, selectedSection]);

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row) => {
        const fullName = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Student';
        const photo = row.photo || row.imagesRef?.img || '';
        const initials = (row.firstName?.[0] || fullName?.[0] || 'S') + (row.lastName?.[0] || fullName?.split(' ')?.[1]?.[0] || '');

        return (
          <div className="flex items-center gap-3">
            {/* Student Photo Avatar */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm border border-indigo-200/50 dark:border-indigo-800/40">
              {photo ? (
                <img
                  src={photo}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="uppercase tracking-wider">{initials.slice(0, 2)}</span>
              )}
            </div>

            {/* Name & Admission Number */}
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate text-xs">
                {fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-200/50 dark:border-indigo-800/40">
                  {row.admissionNumber || row.studentId || 'ADM-N/A'}
                </span>
                {row.gender && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    · {row.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "class",
      label: "Class & Section",
      render: (row) => {
        const rawCls = row.className || row.classDetails?.name || row.classId?.name || row.class;
        const rawSec = row.sectionName || row.sectionDetails?.name || row.sectionId?.name || row.section;
        const cls = (rawCls && rawCls !== "null" && rawCls !== "undefined") ? rawCls : "N/A";
        const sec = (rawSec && rawSec !== "null" && rawSec !== "undefined") ? rawSec : "N/A";

        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold w-fit">
              <School size={12} className="text-indigo-500" />
              <span>{cls}</span>
              {sec !== "N/A" && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-indigo-600 dark:text-indigo-400">{sec}</span>
                </>
              )}
            </span>
            {row.academicYear && (
              <span className="text-[10px] text-slate-400 font-mono pl-0.5">
                {row.academicYear}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "rollNumber",
      label: "Roll No",
      render: (row) => (
        <span className="inline-flex items-center justify-center font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.rollNumber != null ? `#${row.rollNumber}` : '—'}
        </span>
      ),
    },
    {
      key: "aadhaar",
      label: "Govt / Aadhaar",
      render: (row) => {
        const aadhaar = row.aadhaarNumber;
        const pdf = row.aadhaarDocument || row.AdharRef?.pdf;

        if (!aadhaar && !pdf) {
          return <span className="text-[11px] text-slate-400 italic">—</span>;
        }

        return (
          <div className="space-y-1">
            {aadhaar ? (
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
                <span>•••• {String(aadhaar).slice(-4)}</span>
              </div>
            ) : null}

            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/40"
              >
                <span>Aadhaar PDF</span>
                <ExternalLink size={9} />
              </a>
            ) : (
              <span className="text-[10px] text-amber-500 font-semibold">No PDF</span>
            )}
          </div>
        );
      },
    },
    {
      key: "parent",
      label: "Guardian & Phone",
      render: (row) => {
        const parentName = row.parentName || row.parentId?.name || '—';
        const contact = row.contactNumber || row.parentContact || row.phone || '';

        return (
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {parentName}
            </div>
            {contact && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Phone size={10} className="text-slate-400" />
                <span>{contact}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status || "active"} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (row) => {
        const targetId = row._id || row.id || row.admissionNumber;
        const pdfDoc = row.aadhaarDocument || row.AdharRef?.pdf || row.aadhaarPdf;
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {pdfDoc && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePdfDoc({
                    url: pdfDoc,
                    title: `${row.name} — UIDAI Aadhaar Document`,
                    subtitle: row.aadhaarNumber ? `Aadhaar: ${row.aadhaarNumber}` : '',
                    refId: row.AdharRef?.id || row.aadhaarDocId || '',
                  });
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                title="Preview Aadhaar PDF"
              >
                <FileText size={15} />
              </button>
            )}
            <button
              onClick={() => navigate(`/students/${targetId}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
              title="View Profile"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => navigate(`/students/${targetId}/edit`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
              title="Edit Student"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => navigate(`/id-cards?studentId=${targetId}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
              title="Print ID Card"
            >
              <CreditCard size={15} />
            </button>
            {canSeeCredentials && (
              <button
                onClick={(e) => handleFetchCredentials(row, e)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
                title="Reveal DB Password"
              >
                <Lock size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      return toast.warning("Passwords do not match");
    }

    // Manual single registration: Aadhaar Number, Photo, and Aadhaar PDF are mandatory
    if (!form.aadhaarNumber || !form.aadhaarNumber.trim()) {
      return toast.warning("Aadhaar Number is mandatory for student registration.");
    }
    if (!form.photo || !form.photo.trim()) {
      return toast.warning("Student Photo is mandatory (Max 1MB). Please upload a student photo.");
    }
    if (!form.aadhaarDocument || !form.aadhaarDocument.trim()) {
      return toast.warning("Aadhaar PDF Document is mandatory (Max 1MB). Please upload the Aadhaar PDF.");
    }

    const payloadForm = {
      ...form,
      confirmPassword: form.confirmPassword || form.password,
    };
    setSubmitting(true);
    studentService.create(payloadForm)
      .then((res) => {
        toast.success(res.data?.message || "Student registered successfully");
        setShowCreate(false);
        setForm(getInitialStudentForm());
        fetchStudentsData();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || "Failed to register student";
        toast.error(msg);
      })
      .finally(() => setSubmitting(false));
  };

  const handleExportCsv = () => {
    studentService.exportCsv()
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Students_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Student directory exported to CSV");
      })
      .catch(() => toast.error("Export failed"));
  };

  // Download Sample CSV Template — admissionNumber and rollNumber are auto-assigned by server
  const downloadSampleExcelTemplate = () => {
    const header = "firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password";
    const sampleClasses = ["cls-9", "cls-10", "cls-11", "cls-12"];
    const sampleSections = ["sec-a", "sec-b", "sec-c"];

    let csvContent = header + "\n";
    for (let i = 1; i <= 10; i++) {
      const cls = sampleClasses[i % sampleClasses.length];
      const sec = sampleSections[i % sampleSections.length];
      csvContent += `Student${i},User${i},Male,2010-05-${String(i).padStart(2,'0')},O+,+91987654${String(i).padStart(4,'0')},+91987654${String(i).padStart(4,'0')},student${i}@school.local,Building ${i} School Road,2026-06-01,${cls},${sec},Parent Of Student${i},+91987654${String(i).padStart(4,'0')},parent${i}@school.local,1234567890${String(i).padStart(2,'0')},Std@2026pass${i}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded student import template (.csv)!");
  };

  const handleCopyInstructions = () => {
    const text = `================================================
STUDENT BULK CSV / EXCEL IMPORT GUIDE
================================================

1. CSV HEADER LINE (Paste in Row 1 of your file):
firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password

NOTE: admissionNumber and rollNumber are AUTO-ASSIGNED by the server.
Do NOT include them in your CSV.

2. FIELD DESCRIPTIONS:
- firstName     (Required): First name (e.g. Rahul)
- lastName      (Required): Last name (e.g. Sharma)
- classId       (Required): Class ID from reference below (e.g. cls-10)
- sectionId     (Required): Section ID from reference below (e.g. sec-a)
- gender        (Optional): Male / Female / Other
- dob           (Optional): YYYY-MM-DD (e.g. 2011-05-15)
- bloodGroup    (Optional): e.g. O+, A+, B+
- contactNumber (Optional): Student phone number
- alternatePhone(Optional): Alternate phone
- email         (Optional): Student email (auto-provisioned if blank)
- address       (Optional): Full address
- joiningDate   (Optional): YYYY-MM-DD
- parentName    (Optional): Parent / Guardian name
- parentContact (Optional): Parent phone
- parentEmail   (Optional): Parent email
- aadhaarNumber (Optional): 12-digit Aadhaar
- password      (Optional): Login password (auto-generated if blank)

3. VALID CLASS IDs:
${CLASS_OPTIONS.map(c => `- ${c.name.padEnd(12)} => classId: "${c.id}"`).join("\n")}

4. VALID SECTION IDs:
${SECTION_OPTIONS.map(s => `- ${s.name.padEnd(12)} => sectionId: "${s.id}"`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Full CSV import instructions copied to clipboard!");
  };

  const handleCopyHeaderLine = () => {
    const header = "firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password";
    navigator.clipboard.writeText(header);
    toast.success("CSV Header line copied to clipboard!");
  };

  // Helper function to split CSV lines respecting quoted fields containing commas
  const parseCSVLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Handle CSV File Selection & Parse — admission/roll are skipped (auto-assigned by server)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) {
          return toast.error('File is empty or missing data rows');
        }

        const headers = parseCSVLine(lines[0]);
        const parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length === 0 || cols.every((c) => c === '')) continue;

          const rowObj = {};
          headers.forEach((h, idx) => {
            const val = (cols[idx] || '').trim();
            const key = h.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Skip admission number and roll number — server auto-assigns these
            if (key.includes('admission') || key.includes('roll')) return;

            if (key === 'firstname' || key === 'first') rowObj.firstName = val;
            else if (key === 'lastname' || key === 'last') rowObj.lastName = val;
            else if (key.includes('email') && !key.includes('parent')) rowObj.email = val;
            else if (key === 'password' || key === 'pass') rowObj.password = val;
            else if (key === 'gender') rowObj.gender = val;
            else if (key === 'dob' || key === 'dateofbirth' || key === 'birth') rowObj.dob = val;
            else if (key === 'bloodgroup' || key === 'blood') rowObj.bloodGroup = val;
            else if (key === 'phone' || key === 'contact' || key === 'contactnumber') rowObj.contactNumber = val;
            else if (key === 'alternatephone' || key === 'alternate') rowObj.alternatePhone = val;
            else if (key === 'address') rowObj.address = val;
            else if (key === 'joiningdate' || key === 'joining' || key === 'joined') rowObj.joiningDate = val;
            else if (key === 'classid' || key === 'class' || key === 'classname') {
              rowObj.classId = val;
              rowObj.class = val;
            } else if (key === 'sectionid' || key === 'section' || key === 'sectionname') {
              rowObj.sectionId = val;
              rowObj.section = val;
            } else if (key === 'parentname' || key === 'guardian' || key === 'parent') rowObj.parentName = val;
            else if (key === 'parentcontact' || key === "parentphone" || key === "parentnumber") rowObj.parentContact = val;
            else if (key === 'parentemail') rowObj.parentEmail = val;
            else if (key.includes('aadhaar') || key.includes('adhar')) {
              if (key.includes('pdf') || key.includes('doc')) {
                rowObj.aadhaarDocument = val;
              } else {
                rowObj.aadhaarNumber = val;
              }
            } else if (key.includes('photo') || key.includes('img') || key.includes('picture')) {
              rowObj.photo = val;
            }
          });

          if (!rowObj.firstName && cols[0]) rowObj.firstName = cols[0];
          if (!rowObj.lastName && cols[1]) rowObj.lastName = cols[1];

          if (rowObj.firstName) parsedRows.push(rowObj);
        }

        setImportedData(parsedRows);
        toast.success(`Parsed ${parsedRows.length} student records from ${file.name}`);
      } catch (err) {
        toast.error('Failed to parse file. Please verify CSV formatting.');
      }
    };
    reader.readAsText(file);
  };

  // Submit parsed rows to backend bulk import API
  const handleExecuteBulkImport = async () => {
    if (importedData.length === 0) {
      return toast.warning("Please upload a valid CSV file first");
    }
    setImporting(true);
    try {
      await bulkImportStudents(importedData);
      setShowExcelImport(false);
      setImportedData([]);
      setImportFileName("");
      fetchStudentsData();
    } catch (err) {
      console.error("Bulk import error:", err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Students Directory"
        subtitle="Manage student admissions, profiles, roll numbers, and academic records."
        breadcrumbs={[{ label: "Students" }]}
        actions={
          <div className="flex gap-2 flex-wrap">
            <CanButton id="ADD_STUDENT">
              <Button
                variant="secondary"
                size="sm"
                icon={<FileSpreadsheet size={14} />}
                onClick={() => setShowExcelImport(true)}
                className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              >
                Import Excel / CSV
              </Button>
            </CanButton>
            <CanButton id="EXPORT_STUDENTS">
              <Button
                variant="secondary"
                size="sm"
                icon={<FolderDown size={14} />}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
            </CanButton>
            <CanButton id="ADD_STUDENT">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setShowCreate(true)}
              >
                Register Student
              </Button>
            </CanButton>
          </div>
        }
      />

      {/* ── Summary Metric Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pagination.total || students.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {students.filter((s) => (s.status || 'active') === 'active').length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Verified</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {students.filter((s) => Boolean(s.aadhaarNumber)).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passout / Graduated</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
              {students.filter((s) => (s.status || '').toLowerCase().includes('passout')).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <SearchFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, admission no, roll, aadhaar, parent..."
          filters={[
            {
              key: "class",
              value: selectedClass,
              onChange: (v) => {
                setSelectedClass(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Classes" },
                ...CLASS_OPTIONS.map((c) => ({ value: c.name, label: c.name })),
              ],
            },
            {
              key: "section",
              value: selectedSection,
              onChange: (v) => {
                setSelectedSection(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All Sections" },
                ...SECTION_OPTIONS.map((s) => ({ value: s.name, label: s.name })),
              ],
            },
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
                { value: "Passout", label: "Passout" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatus("");
            setSelectedClass("");
            setSelectedSection("");
            setPage(1);
          }}
        />

        {loading ? (
          <Loader fullPage size="lg" text="Fetching students directory..." />
        ) : (
          <DataTable
            columns={columns}
            data={students}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/students/${row.id || row._id}`)}
          />
        )}
      </div>

      {/* DB Credentials Reveal Modal (Super Admin Only) */}
      {activeCredentialsModal && (
        <Modal
          open={Boolean(activeCredentialsModal)}
          onClose={() => setActiveCredentialsModal(null)}
          title="Student DB Account Credentials (Super Admin)"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Student Name</p>
                <p className="text-sm font-extrabold text-white">{activeCredentialsModal.name}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Login Username / Admission No.</p>
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
                    <span>{showPasswordText ? "Hide Password" : "Reveal Password"}</span>
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

      {/* Excel / CSV Bulk Student Import Modal */}
      {showExcelImport && (
        <Modal
          open={showExcelImport}
          onClose={() => {
            setShowExcelImport(false);
            setImportedData([]);
            setImportFileName("");
          }}
          title="Excel / CSV Bulk Student Import (100+ Students)"
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

            {/* Step 1: Column Format & Interactive Instructions */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileSpreadsheet className="text-emerald-400" size={20} />
                    <span>CSV / Excel Column Format Standard</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      100+ Rows Supported
                    </span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Copy complete instructions, copy header row, or click any Class ID / Section ID to copy value.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyInstructions}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Copy size={14} />
                    <span>Copy Full Instructions</span>
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={downloadSampleExcelTemplate}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-none shadow-md"
                  >
                    Download Template (.csv)
                  </Button>
                </div>
              </div>

              {/* Exact CSV Header Line Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={14} /> Standard CSV Header Line (Line 1):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHeaderLine}
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-md text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <Copy size={12} /> Copy Header Line
                  </button>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto select-all border border-slate-800">
                  firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password
                </div>
              </div>

              {/* Format Reference Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">FirstName &amp; LastName</span>
                  <span className="text-white font-mono text-[11px]">Required</span>
                </div>
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Admission No. &amp; Roll</span>
                  <span className="text-emerald-300 font-mono text-[11px]">Auto-Assigned ✓</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">classId &amp; sectionId</span>
                  <span className="text-slate-400 font-mono text-[11px]">Use ID from grid below</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">Email &amp; Password</span>
                  <span className="text-slate-400 font-mono text-[11px]">Auto-Provisioned</span>
                </div>
              </div>

              {/* Class & Section ID Reference Grid */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Valid Class IDs &amp; Section IDs Reference Grid</span>
                    <span className="text-[10px] text-slate-400 font-normal normal-case">(Click any badge to copy ID)</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowRefTables(!showRefTables)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline"
                  >
                    {showRefTables ? "Hide Reference Grid" : "Show Reference Grid"}
                  </button>
                </div>

                {showRefTables && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class Options Reference List */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-xs text-indigo-400">Class Name</span>
                        <span className="font-extrabold text-xs text-indigo-400 font-mono">classId</span>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {CLASS_OPTIONS.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 transition"
                          >
                            <span className="font-bold text-slate-200">{cls.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(cls.id);
                                toast.success(`Copied classId "${cls.id}" to clipboard!`);
                              }}
                              className="font-mono text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold cursor-pointer"
                              title={`Click to copy "${cls.id}"`}
                            >
                              <code>{cls.id}</code>
                              <Copy size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Options Reference List */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-xs text-emerald-400">Section Name</span>
                        <span className="font-extrabold text-xs text-emerald-400 font-mono">sectionId</span>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {SECTION_OPTIONS.map((sec) => (
                          <div
                            key={sec.id}
                            className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 transition"
                          >
                            <span className="font-bold text-slate-200">{sec.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(sec.id);
                                toast.success(`Copied sectionId "${sec.id}" to clipboard!`);
                              }}
                              className="font-mono text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold cursor-pointer"
                              title={`Click to copy "${sec.id}"`}
                            >
                              <code>{sec.id}</code>
                              <Copy size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Interactive Upload Dropzone */}
            <div className="p-8 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl bg-slate-900/40 transition-all text-center space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload size={26} />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">
                  {importFileName ? `Selected: ${importFileName}` : "Click or Drag & Drop your Excel / CSV file here"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Supports <span className="text-indigo-400 font-bold">.CSV</span>, <span className="text-indigo-400 font-bold">.XLSX</span>, <span className="text-indigo-400 font-bold">.XLS</span> format files with up to 1,000+ student rows per batch.
                </p>
              </div>

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="excelFileInput"
              />
              <label
                htmlFor="excelFileInput"
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Parsed Records</p>
                      <p className="text-lg font-black text-white">{importedData.length} Students</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target Accounts</p>
                      <p className="text-lg font-black text-indigo-400">DB Student + User + Parent</p>
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
                          <th className="p-3">Student Name</th>
                          <th className="p-3">classId / sectionId</th>
                          <th className="p-3 text-emerald-400">Adm No. (Auto)</th>
                          <th className="p-3 text-emerald-400">Roll (Auto)</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Parent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                        {importedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition">
                            <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-white font-sans">{row.firstName} {row.lastName}</td>
                            <td className="p-3 text-indigo-400">{row.classId || row.class || '—'} / {row.sectionId || row.section || '—'}</td>
                            <td className="p-3 text-emerald-400 italic text-[10px]">Auto-Assigned</td>
                            <td className="p-3 text-emerald-400 italic text-[10px]">Auto-Assigned</td>
                            <td className="p-3 text-slate-300">{row.email || <span className="text-emerald-400 italic">Auto</span>}</td>
                            <td className="p-3 font-sans text-slate-300">{row.parentName || '—'}</td>
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
                {importedData.length > 0 ? `* ${importedData.length} records will be imported into the database` : "* Select a CSV file to proceed"}
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
                  {importing ? "Importing Students..." : `Bulk Import (${importedData.length}) Students`}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Student Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Register New Student"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit}>
          <StudentForm form={form} onChange={setForm} hideButtons={true} />
          <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Aadhaar PDF Viewer Modal */}
      <PdfViewerModal
        open={Boolean(activePdfDoc)}
        onClose={() => setActivePdfDoc(null)}
        url={activePdfDoc?.url || ''}
        title={activePdfDoc?.title || 'Aadhaar Document'}
        subtitle={activePdfDoc?.subtitle || ''}
        refId={activePdfDoc?.refId || ''}
      />
    </div>
  );
};

export default StudentList;
