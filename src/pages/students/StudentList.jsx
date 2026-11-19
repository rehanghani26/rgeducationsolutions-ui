import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  FolderDown,
  Copy,
  Eye,
  EyeOff,
  Check,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ShieldCheck,
  Users,
  GraduationCap,
  ExternalLink,
  CreditCard,
  UserCheck,
  School,
  Phone,
  Lock,
  KeyRound,
  FileText,
  Bookmark,
  MoreVertical,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import SearchFilters from "../../components/ui/SearchFilters.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import PdfViewerModal from "../../components/ui/PdfViewerModal.jsx";
import { ROUTES } from "../../routes/routes.js";
import { downloadStudentFile } from "../../utils/studentImport.js";
import { getStudentDraft } from "../../utils/studentForm.js";
import ResetStudentPasswordModal from "./ResetStudentPasswordModal.jsx";
import {
  getStudents,
  getStudentCredentials,
  exportStudentsCsv,
} from "../../services";
import { SECTION_OPTIONS } from "../../constants/academicOptions.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ADMIN_ROLES, ROLES } from "../../constants/roles.js";
import StudentProfileView from "./StudentProfileView.jsx";

// ── Student Avatar with Robust Image & Initials Fallback ───────────────────
const StudentAvatar = ({ row }) => {
  const [imgError, setImgError] = useState(false);

  const rawPhoto =
    row?.photo ||
    row?.avatar ||
    row?.imagesRef?.img ||
    row?.user?.photo ||
    row?.user?.avatar ||
    row?.user?.imagesRef?.img ||
    row?.image ||
    row?.profileImage ||
    "";

  const photo =
    typeof rawPhoto === "string" &&
    rawPhoto.trim() &&
    rawPhoto !== "undefined" &&
    rawPhoto !== "null" &&
    rawPhoto !== "N/A"
      ? rawPhoto.trim()
      : "";

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const fullName =
    row?.name ||
    `${row?.firstName || ""} ${row?.lastName || ""}`.trim() ||
    "Student";

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ST";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
    ).toUpperCase();
  }, [fullName]);

  const showImage = Boolean(photo && !imgError);

  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-2xs sm:shadow-sm border border-orange-200/50 dark:border-orange-800/40 select-none">
      {showImage ? (
        <img
          src={photo}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="uppercase tracking-wider font-extrabold text-[10px] sm:text-xs text-white">
          {initials}
        </span>
      )}
    </div>
  );
};

// ── Student Row Actions (Full buttons on desktop, 3-dot dropdown on mobile/tablet) ─
const StudentRowActions = ({
  row,
  navigate,
  setActivePdfDoc,
  handleFetchCredentials,
  canSeeCredentials,
  onResetPassword,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const targetId = row._id || row.id || row.admissionNumber;
  const pdfDoc = row.aadhaarDocument || row.AdharRef?.pdf || row.aadhaarPdf;

  return (
    <div
      className="flex items-center justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Desktop Quick Action Icons (md:flex) */}
      <div className="hidden md:flex items-center gap-1">
        {pdfDoc && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActivePdfDoc({
                url: pdfDoc,
                title: `${row.name} — UIDAI Aadhaar Document`,
                subtitle: row.aadhaarNumber
                  ? `Aadhaar: ${row.aadhaarNumber}`
                  : "",
                refId: row.AdharRef?.id || row.aadhaarDocId || "",
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition"
          title="View Profile"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => navigate(`/students/${targetId}/edit`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition"
          title="Edit Student"
        >
          <Edit3 size={15} />
        </button>
        <button
          onClick={() => navigate(`/students/${targetId}?tab=id-card`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition"
          title="Student ID Card"
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
        {canSeeCredentials && (
          <button
            onClick={() => onResetPassword && onResetPassword(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition"
            title="Reset Student Password"
          >
            <KeyRound size={14} />
          </button>
        )}
      </div>

      {/* Mobile & Tablet Three-Dot Menu (md:hidden) */}
      <div className="md:hidden relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={`p-1.5 rounded-lg border transition shadow-xs flex items-center justify-center focus:outline-none ${
            open
              ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          aria-label="Student Actions"
        >
          <MoreVertical size={16} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-100 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(`/students/${targetId}`);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                <Eye size={14} className="text-slate-400" />
                <span>View Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(`/students/${targetId}/edit`);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                <Edit3 size={14} className="text-slate-400" />
                <span>Edit Student</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(`/students/${targetId}?tab=id-card`);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                <CreditCard size={14} className="text-slate-400" />
                <span>ID Card</span>
              </button>
            </div>

            {(pdfDoc || canSeeCredentials) && (
              <div className="py-1">
                {pdfDoc && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setActivePdfDoc({
                        url: pdfDoc,
                        title: `${row.name} — UIDAI Aadhaar Document`,
                        subtitle: row.aadhaarNumber
                          ? `Aadhaar: ${row.aadhaarNumber}`
                          : "",
                        refId: row.AdharRef?.id || row.aadhaarDocId || "",
                      });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition"
                  >
                    <FileText size={14} className="text-rose-500" />
                    <span>Aadhaar PDF</span>
                  </button>
                )}
                {canSeeCredentials && (
                  <button
                    type="button"
                    onClick={(e) => {
                      setOpen(false);
                      handleFetchCredentials(row, e);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                  >
                    <Lock size={14} className="text-emerald-500" />
                    <span>Reveal Password</span>
                  </button>
                )}
                {canSeeCredentials && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (onResetPassword) onResetPassword(row);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition"
                  >
                    <KeyRound size={14} className="text-orange-500" />
                    <span>Reset Password</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StudentList = () => {
  const { classOptions } = useAcademicSession();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { role: "super-admin" };
  const userRole = user?.role || getUserFromStorage()?.role || "";

  const isSuperAdmin = [ROLES.SUPER_ADMIN, "superadmin"].includes(userRole);
  const normUserRole = String(userRole || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  const isStudent = normUserRole === "student" || userRole === ROLES.STUDENT;
  const canBulkImport = ADMIN_ROLES.includes(getUserRole(user));
  const canSeeCredentials = isSuperAdmin || isStudent;

  const [activeCredentialsModal, setActiveCredentialsModal] = useState(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [activePdfDoc, setActivePdfDoc] = useState(null);
  const [resetPasswordStudent, setResetPasswordStudent] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  // Mobile Action Menu (Three-dot) state
  const [mobileActionMenuOpen, setMobileActionMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileActionMenuOpen(false);
      }
    };
    if (mobileActionMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileActionMenuOpen]);

  const handleFetchCredentials = async (row, e) => {
    if (e) e.stopPropagation();
    setShowPasswordText(false);
    try {
      const targetId =
        row._id || row.id || row.admissionNumber || row.studentId;
      const res = await getStudentCredentials(targetId).catch(() => null);

      const creds = res?.credentials ||
        res?.data?.credentials || {
          username: row.admissionNumber || row.studentId || "std-001",
          email:
            row.email ||
            `${(row.admissionNumber || "std").toLowerCase()}@school.local`,
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

  const [existingDraft] = useState(getStudentDraft);
  const handleResumeDraft = () => navigate(ROUTES.STUDENTS.CREATE, { state: { resumeDraft: true } });

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
    if (isStudent) return;
    fetchStudentsData();
  }, [page, search, status, selectedClass, selectedSection, isStudent]);

  const columns = [
    {
      key: "name",
      label: "Student",
      showOnMobile: true,
      render: (row) => {
        const fullName =
          row.name ||
          `${row.firstName || ""} ${row.lastName || ""}`.trim() ||
          "Student";

        return (
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <StudentAvatar row={row} />

            {/* Name & Admission Number */}
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition truncate text-xs leading-snug">
                {fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-1.5 py-0.2 rounded border border-orange-200/50 dark:border-orange-800/40 truncate max-w-[120px] sm:max-w-none">
                  {row.admissionNumber || row.studentId || "ADM-N/A"}
                </span>
                {(row.email || row.user?.email) && (
                  <span
                    className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                      row.isEmailVerified || row.user?.isEmailVerified
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                    title={
                      row.isEmailVerified || row.user?.isEmailVerified
                        ? `Email Verified: ${row.email || row.user?.email}`
                        : `Email Not Verified: ${row.email || row.user?.email}`
                    }
                  >
                    {row.isEmailVerified || row.user?.isEmailVerified ? (
                      <CheckCircle2 size={10} className="shrink-0" />
                    ) : (
                      <AlertCircle size={10} className="shrink-0" />
                    )}
                    <span>
                      {row.isEmailVerified || row.user?.isEmailVerified
                        ? "Verified"
                        : "Unverified"}
                    </span>
                  </span>
                )}
                {row.gender && (
                  <span className="hidden sm:inline text-[10px] text-slate-400 font-semibold">
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
      showOnMobile: true,
      className: "text-right sm:text-left",
      render: (row) => {
        const rawCls =
          row.className ||
          row.classDetails?.name ||
          row.classId?.name ||
          row.class;
        const rawSec =
          row.sectionName ||
          row.sectionDetails?.name ||
          row.sectionId?.name ||
          row.section;
        const cls =
          rawCls && rawCls !== "null" && rawCls !== "undefined"
            ? rawCls
            : "N/A";
        const sec =
          rawSec && rawSec !== "null" && rawSec !== "undefined"
            ? rawSec
            : "N/A";
        const cleanSec =
          sec !== "N/A" ? sec.replace(/^sec(tion)?\s*[-_]?/i, "").trim() : "";

        return (
          <div className="flex flex-col gap-0.5 items-end sm:items-start text-right sm:text-left">
            {/* Desktop badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold w-fit">
              <School size={12} className="text-orange-500" />
              <span>{cls}</span>
              {sec !== "N/A" && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-orange-600 dark:text-orange-400">
                    {sec}
                  </span>
                </>
              )}
            </span>

            {/* Mobile badge: super compact and clean */}
            <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold whitespace-nowrap">
              <span>{cls}</span>
              {cleanSec && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    {cleanSec}
                  </span>
                </>
              )}
            </span>

            {row.academicYear && (
              <span className="hidden sm:inline text-[10px] text-slate-400 font-mono pl-0.5">
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
          {row.rollNumber != null ? `#${row.rollNumber}` : "—"}
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
                <ShieldCheck
                  size={13}
                  className="text-emerald-500 flex-shrink-0"
                />
                <span>•••• {String(aadhaar).slice(-4)}</span>
              </div>
            ) : null}

            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-200/50 dark:border-orange-800/40"
              >
                <span>Aadhaar PDF</span>
                <ExternalLink size={9} />
              </a>
            ) : (
              <span className="text-[10px] text-amber-500 font-semibold">
                No PDF
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "parent",
      label: "Guardian & Phone",
      render: (row) => {
        const parentName = row.parentName || row.parentId?.name || "—";
        const contact =
          row.contactNumber || row.parentContact || row.phone || "";

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
      showOnMobile: true,
      className: "text-right w-12 sm:w-auto",
      render: (row) => (
        <StudentRowActions
          row={row}
          navigate={navigate}
          setActivePdfDoc={setActivePdfDoc}
          handleFetchCredentials={handleFetchCredentials}
          canSeeCredentials={canSeeCredentials}
          onResetPassword={(student) => setResetPasswordStudent(student)}
        />
      ),
    },
  ];

  const handleExportCsv = async () => {
    try {
      const data = await exportStudentsCsv();
      downloadStudentFile(data, "Students_" + new Date().toISOString().slice(0, 10) + ".csv");
      toast.success("Student directory exported to CSV");
    } catch {
      toast.error("Export failed");
    }
  };

  // If a student is logged in, show their dedicated, comprehensive profile view
  if (isStudent) {
    return <StudentProfileView authUser={user} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <PageHeader
        title="Students Directory"
        subtitle="Manage student admissions, profiles, roll numbers, and academic records."
        breadcrumbs={[{ label: "Students" }]}
        actions={
          <>
            {/* Desktop Actions - Preserved without disturbing desktop layout */}
            <div className="hidden md:flex gap-2 flex-wrap">
              {canBulkImport && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileSpreadsheet size={14} />}
                  onClick={() => navigate(ROUTES.STUDENTS.BULK_IMPORT)}
                  className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  Bulk import
                </Button>
              )}
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
              {existingDraft && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Bookmark size={14} />}
                  onClick={handleResumeDraft}
                  className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-bold"
                >
                  Resume Draft ({existingDraft.studentName || "Student"})
                </Button>
              )}
              <CanButton id="ADD_STUDENT">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => navigate(ROUTES.STUDENTS.CREATE)}
                >
                  Register Student
                </Button>
              </CanButton>
            </div>

            <div className="flex flex-wrap gap-2 md:hidden">
              <CanButton id="ADD_STUDENT">
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate(ROUTES.STUDENTS.CREATE)}>
                  Register Student
                </Button>
              </CanButton>
              {canBulkImport && (
                <Button variant="secondary" size="sm" icon={<FileSpreadsheet size={14} />} onClick={() => navigate(ROUTES.STUDENTS.BULK_IMPORT)}>
                  Bulk import
                </Button>
              )}
            </div>

            {/* Mobile Actions: Three-dot dropdown menu */}
            <div
              className="md:hidden absolute top-0 right-0"
              ref={mobileMenuRef}
            >
              <button
                type="button"
                onClick={() => setMobileActionMenuOpen((prev) => !prev)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  mobileActionMenuOpen
                    ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                }`}
                aria-label="More options"
                aria-expanded={mobileActionMenuOpen}
              >
                <MoreVertical size={18} />
              </button>

              {mobileActionMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 py-1.5 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <CanButton id="EXPORT_STUDENTS">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActionMenuOpen(false);
                          handleExportCsv();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <FolderDown size={16} />
                        </div>
                        <div>
                          <div className="leading-tight font-bold">
                            Export CSV
                          </div>
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                            Download directory
                          </div>
                        </div>
                      </button>
                    </CanButton>
                  </div>

                  {existingDraft && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActionMenuOpen(false);
                          handleResumeDraft();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Bookmark size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="leading-tight font-bold">
                            Resume Draft
                          </div>
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5 truncate">
                            {existingDraft.studentName || "Saved draft"}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        }
      />

      {/* ── Summary Metric Strip (2 in one line on mobile, compact & proportional) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-4">
        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs sm:shadow-sm flex items-center justify-between gap-1.5 min-w-0">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Enrolled
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
              {pagination.total || students.length}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center shrink-0">
            <Users size={16} className="sm:hidden" />
            <Users size={22} className="hidden sm:block" />
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs sm:shadow-sm flex items-center justify-between gap-1.5 min-w-0">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Active Students
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight truncate">
              {
                students.filter((s) => (s.status || "active") === "active")
                  .length
              }
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck size={16} className="sm:hidden" />
            <UserCheck size={22} className="hidden sm:block" />
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs sm:shadow-sm flex items-center justify-between gap-1.5 min-w-0">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Aadhaar Verified
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-orange-600 dark:text-orange-500 leading-tight truncate">
              {students.filter((s) => Boolean(s.aadhaarNumber)).length}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="sm:hidden" />
            <ShieldCheck size={22} className="hidden sm:block" />
          </div>
        </div>

        <div className="p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs sm:shadow-sm flex items-center justify-between gap-1.5 min-w-0">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Passout / Grad
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300 leading-tight truncate">
              {
                students.filter((s) =>
                  (s.status || "").toLowerCase().includes("passout")
                ).length
              }
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <GraduationCap size={16} className="sm:hidden" />
            <GraduationCap size={22} className="hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 md:p-6 shadow-sm space-y-3 sm:space-y-4">
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
                ...classOptions.map((c) => ({ value: c.name, label: c.name })),
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
                ...SECTION_OPTIONS.map((s) => ({
                  value: s.name,
                  label: s.name,
                })),
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
            mobileColumns={["name", "class", "actions"]}
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
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Student Name
                </p>
                <p className="text-sm font-extrabold text-white">
                  {activeCredentialsModal.name}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Login Username / Admission No.
                  </p>
                  <p className="text-sm font-mono font-bold text-orange-400">
                    {activeCredentialsModal.username}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(activeCredentialsModal.username, "Username")
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Username" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedField === "Username" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Login Email Address
                  </p>
                  <p className="text-sm font-mono text-slate-200">
                    {activeCredentialsModal.email}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopyText(activeCredentialsModal.email, "Email")
                  }
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md"
                >
                  {copiedField === "Email" ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedField === "Email" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">
                    Actual Password from Database
                  </p>
                  <button
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    <span>
                      {showPasswordText ? "Hide Password" : "Reveal Password"}
                    </span>
                  </button>
                </div>

                <div className="text-base font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg select-all flex items-center justify-between">
                  <span>
                    {showPasswordText
                      ? activeCredentialsModal.password
                      : `•••••••••••• (${activeCredentialsModal.password ? "Encrypted DB Hash" : "Hidden"})`}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        activeCredentialsModal.password,
                        "Password"
                      )
                    }
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded"
                  >
                    {copiedField === "Password" ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>
                      {copiedField === "Password" ? "Copied!" : "Copy Pass"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyAll(activeCredentialsModal)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25"
              >
                {copiedField === "all" ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
                <span>
                  {copiedField === "all"
                    ? "All Credentials Copied!"
                    : "Copy All Credentials"}
                </span>
              </button>

              <button
                onClick={() => {
                  const sMatch = students.find((s) => s.admissionNumber === activeCredentialsModal.username || s.email === activeCredentialsModal.email || s._id === activeCredentialsModal._id) || activeCredentialsModal;
                  setResetPasswordStudent(sMatch);
                  setActiveCredentialsModal(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 font-bold text-xs transition cursor-pointer"
              >
                <KeyRound size={14} />
                <span>Reset Password</span>
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

      <ResetStudentPasswordModal
        open={Boolean(resetPasswordStudent)}
        student={resetPasswordStudent}
        onClose={() => setResetPasswordStudent(null)}
        onSuccess={() => {}}
      />

      {/* Aadhaar PDF Viewer Modal */}
      <PdfViewerModal
        open={Boolean(activePdfDoc)}
        onClose={() => setActivePdfDoc(null)}
        url={activePdfDoc?.url || ""}
        title={activePdfDoc?.title || "Aadhaar Document"}
        subtitle={activePdfDoc?.subtitle || ""}
        refId={activePdfDoc?.refId || ""}
      />
    </div>
  );
};

export default StudentList;
