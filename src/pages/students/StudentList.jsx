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
  Upload,
  Download,
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
  Trash2,
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
  getStudentDraft,
  saveStudentDraft,
  clearStudentDraft,
  isStudentFormDirty,
} from "./StudentForm.jsx";
import ResetStudentPasswordModal from "./ResetStudentPasswordModal.jsx";
import {
  api,
  getStudents,
  getStudentCredentials,
  createStudent,
  bulkImportStudents,
  cleanCorruptedStudents,
  exportStudentsCsv,
} from "../../services";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../../constants/academicOptions.js";
import Loader from "../../components/ui/Loader.jsx";
import { CanButton } from "../../config/buttonAccess.jsx";

import { useSelector } from "react-redux";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";
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
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm border border-orange-200/50 dark:border-orange-800/40 select-none">
      {showImage ? (
        <img
          src={photo}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs text-white">
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
  const [submitting, setSubmitting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/sessions/active")
      .then((res) => {
        if (!isMounted) return;
        const sess = res.data?.session || res.data?.data?.session;
        if (sess) {
          setActiveSession(sess);
          setForm((prev) => ({
            ...prev,
            academicYear: sess.sessionName || prev.academicYear || "2026-27",
            sessionId: sess._id || sess.id || prev.sessionId || null,
          }));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch active academic session:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Bulk Excel/CSV Import state
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [showRefTables, setShowRefTables] = useState(true);

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

  const getInitialStudentForm = (sess = activeSession) => {
    const pass = randomPassword();
    return {
      ...blankStudentForm,
      academicYear: sess?.sessionName || "2026-27",
      sessionId: sess?._id || sess?.id || null,
      password: pass,
      confirmPassword: pass,
    };
  };

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(getInitialStudentForm());
  const [existingDraft, setExistingDraft] = useState(() => getStudentDraft());

  useEffect(() => {
    setExistingDraft(getStudentDraft());
  }, [showCreate]);

  const handleResumeDraft = () => {
    const draft = getStudentDraft();
    if (draft?.form) {
      setForm(draft.form);
      setExistingDraft(draft);
      setShowCreate(true);
      toast.success("Resumed student registration from saved draft!");
    } else {
      toast.info("No saved draft found.");
    }
  };

  const handleDiscardDraft = () => {
    clearStudentDraft();
    setExistingDraft(null);
    setForm(getInitialStudentForm());
    toast.info("Draft discarded. Starting fresh registration.");
  };

  const handleSaveDraftClick = () => {
    if (!isStudentFormDirty(form)) {
      toast.info("No student details entered yet to save as draft.");
      return;
    }
    const saved = saveStudentDraft(form);
    setExistingDraft(saved);
    toast.success(
      "Student registration saved as draft! You can complete it anytime."
    );
    setShowCreate(false);
  };

  const handleCancelCreate = () => {
    if (isStudentFormDirty(form)) {
      saveStudentDraft(form);
      setExistingDraft(getStudentDraft());
      toast.info("Registration closed. Filled details saved as a draft.");
    }
    setShowCreate(false);
  };

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

  const handleCreateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (form.confirmPassword && form.password !== form.confirmPassword) {
      return toast.warning("Passwords do not match");
    }

    // Manual single registration: Aadhaar Number, Photo, and Aadhaar PDF are mandatory
    if (!form.aadhaarNumber || !form.aadhaarNumber.trim()) {
      return toast.warning(
        "Aadhaar Number is mandatory for student registration."
      );
    }
    if (!form.photo || !form.photo.trim()) {
      return toast.warning(
        "Student Photo is mandatory (Max 1MB). Please upload a student photo."
      );
    }
    if (!form.aadhaarDocument || !form.aadhaarDocument.trim()) {
      return toast.warning(
        "Aadhaar PDF Document is mandatory (Max 1MB). Please upload the Aadhaar PDF."
      );
    }

    const currentYear = (() => {
      const yr = new Date().getFullYear();
      const m = new Date().getMonth();
      return m >= 3 ? `${yr}-${String(yr + 1).slice(-2)}` : `${yr - 1}-${String(yr).slice(-2)}`;
    })();

    const sessionName = activeSession?.sessionName || form.academicYear || form.sessionName || currentYear;
    const sessionId = activeSession?._id || activeSession?.id || form.sessionId || null;

    const payloadForm = {
      ...form,
      academicYear: sessionName,
      sessionId,
      sessionName,
      confirmPassword: form.confirmPassword || form.password,
    };
    // Remove permissions from payload as requested
    delete payloadForm.permissions;

    setSubmitting(true);
    try {
      const res = await createStudent(payloadForm);
      clearStudentDraft();
      setExistingDraft(null);
      toast.success(
        res?.data?.message || res?.message || "Student registered successfully"
      );
      setShowCreate(false);
      setForm(getInitialStudentForm());
      await fetchStudentsData();
    } catch (err) {
      console.error("Failed to register student:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to register student";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const data = await exportStudentsCsv();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Students_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Student directory exported to CSV");
    } catch {
      toast.error("Export failed");
    }
  };

  // Ensure SheetJS (XLSX) is available in browser
  const ensureXlsxLoaded = async () => {
    if (window.XLSX) return window.XLSX;
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="xlsx"]');
      if (existing && window.XLSX) return resolve(window.XLSX);
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () =>
        reject(
          new Error(
            "Failed to load Excel parsing engine. Please verify your internet connection or upload a .csv file."
          )
        );
      document.head.appendChild(script);
    });
  };

  const formatExcelDate = (val) => {
    if (!val) return "";
    if (val instanceof Date && !isNaN(val.getTime())) {
      return val.toISOString().slice(0, 10);
    }
    if (typeof val === "number" && val > 1000 && val < 60000) {
      const date = new Date((val - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    const str = String(val).trim();
    const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return str;
  };

  const isBinaryOrControl = (str) => {
    if (!str || typeof str !== "string") return false;
    return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/.test(str);
  };

  const normalizeStudentRow = (rowObj) => {
    const firstName = String(
      rowObj.firstName || rowObj.first || rowObj.name || ""
    ).trim();
    const lastName = String(rowObj.lastName || rowObj.last || "").trim();

    if (
      !firstName ||
      isBinaryOrControl(firstName) ||
      isBinaryOrControl(lastName)
    ) {
      return null;
    }

    const lowerFirst = firstName.toLowerCase();
    if (
      [
        "firstname",
        "first name",
        "total",
        "subtotal",
        "classid",
        "sectionid",
        "students",
        "summary",
        "count",
      ].includes(lowerFirst)
    ) {
      return null;
    }

    if (lowerFirst.startsWith("cls-") && !lastName) {
      return null;
    }

    if (!/[a-zA-Z0-9\u00C0-\u024F\u0900-\u097F]/.test(firstName)) {
      return null;
    }

    let rawClass = String(
      rowObj.classId || rowObj.class || rowObj.className || ""
    ).trim();
    let rawSec = String(
      rowObj.sectionId || rowObj.section || rowObj.sectionName || ""
    ).trim();

    const matchedCls = CLASS_OPTIONS.find(
      (c) =>
        c.id.toLowerCase() === rawClass.toLowerCase() ||
        c.name.toLowerCase() === rawClass.toLowerCase() ||
        c.name.toLowerCase().replace("class ", "") ===
          rawClass.toLowerCase().replace("cls-", "")
    );
    const resolvedClassId = matchedCls ? matchedCls.id : rawClass || "cls-1";
    const resolvedClassName = matchedCls
      ? matchedCls.name
      : rawClass || "Class 1";

    const matchedSec = SECTION_OPTIONS.find(
      (s) =>
        s.id.toLowerCase() === rawSec.toLowerCase() ||
        s.name.toLowerCase() === rawSec.toLowerCase() ||
        s.name.toLowerCase().replace("section ", "") ===
          rawSec.toLowerCase().replace("sec-", "")
    );
    const resolvedSectionId = matchedSec ? matchedSec.id : rawSec || "sec-a";
    const resolvedSectionName = matchedSec
      ? matchedSec.name
      : rawSec || "Section A";

    return {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      gender: rowObj.gender || "Male",
      dob: formatExcelDate(rowObj.dob),
      bloodGroup: (rowObj.bloodGroup || "").trim(),
      contactNumber: String(rowObj.contactNumber || "")
        .replace(/\.0$/, "")
        .trim(),
      alternatePhone: String(rowObj.alternatePhone || "")
        .replace(/\.0$/, "")
        .trim(),
      email: (rowObj.email || "").trim(),
      address: (rowObj.address || "").trim(),
      joiningDate:
        formatExcelDate(rowObj.joiningDate) ||
        new Date().toISOString().slice(0, 10),
      classId: resolvedClassId,
      className: resolvedClassName,
      class: resolvedClassName,
      sectionId: resolvedSectionId,
      sectionName: resolvedSectionName,
      section: resolvedSectionName,
      parentName:
        (rowObj.parentName || "").trim() ||
        `Guardian of ${firstName} ${lastName}`.trim(),
      parentContact: String(
        rowObj.parentContact || rowObj.contactNumber || ""
      )
        .replace(/\.0$/, "")
        .trim(),
      parentEmail: (rowObj.parentEmail || "").trim(),
      aadhaarNumber: String(rowObj.aadhaarNumber || "")
        .replace(/\.0$/, "")
        .trim(),
      password: (rowObj.password || "").trim(),
      academicYear: activeSession?.sessionName || "2026-27",
      sessionId: activeSession?._id || undefined,
      sessionName: activeSession?.sessionName || "2026-27",
    };
  };

  // Download Sample CSV / Excel Template
  const downloadSampleExcelTemplate = async (format = "csv") => {
    const sampleData = [
      {
        firstName: "Rahul",
        lastName: "Sharma",
        gender: "Male",
        dob: "2010-05-15",
        bloodGroup: "O+",
        contactNumber: "9876543210",
        alternatePhone: "9876543211",
        email: "rahul.sharma@school.local",
        address: "123 School Road, Delhi",
        joiningDate: "2026-06-01",
        classId: "cls-10",
        sectionId: "sec-a",
        parentName: "Rajesh Sharma",
        parentContact: "9876543210",
        parentEmail: "rajesh.sharma@gmail.com",
        aadhaarNumber: "123456789012",
        password: "Std@Password123",
      },
      {
        firstName: "Priya",
        lastName: "Verma",
        gender: "Female",
        dob: "2011-08-20",
        bloodGroup: "B+",
        contactNumber: "9876543220",
        alternatePhone: "9876543221",
        email: "priya.verma@school.local",
        address: "45 Park Avenue, Delhi",
        joiningDate: "2026-06-01",
        classId: "cls-9",
        sectionId: "sec-b",
        parentName: "Sunil Verma",
        parentContact: "9876543220",
        parentEmail: "sunil.verma@gmail.com",
        aadhaarNumber: "123456789013",
        password: "Std@Password123",
      },
    ];

    if (format === "xlsx") {
      try {
        const XLSX = await ensureXlsxLoaded();
        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_Import_Template.xlsx");
        toast.success("Downloaded Excel template (.xlsx)!");
        return;
      } catch (_e) {
        // Fallback to CSV
      }
    }

    const header = Object.keys(sampleData[0]).join(",");
    const rows = sampleData.map((s) => Object.values(s).join(","));
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded CSV template (.csv)!");
  };

  const handleCopyInstructions = () => {
    const text = `================================================
STUDENT BULK CSV / EXCEL IMPORT GUIDE
================================================

1. CSV HEADER LINE (Paste in Row 1 of your file):
firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password

NOTE: admissionNumber and rollNumber are AUTO-ASSIGNED by the server.
Do NOT include them in your CSV / Excel sheet.

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
${CLASS_OPTIONS.map((c) => `- ${c.name.padEnd(12)} => classId: "${c.id}"`).join("\n")}

4. VALID SECTION IDs:
${SECTION_OPTIONS.map((s) => `- ${s.name.padEnd(12)} => sectionId: "${s.id}"`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    toast.success("Full CSV import instructions copied to clipboard!");
  };

  const handleCopyHeaderLine = () => {
    const header =
      "firstName,lastName,gender,dob,bloodGroup,contactNumber,alternatePhone,email,address,joiningDate,classId,sectionId,parentName,parentContact,parentEmail,aadhaarNumber,password";
    navigator.clipboard.writeText(header);
    toast.success("CSV Header line copied to clipboard!");
  };

  // Helper function to split CSV lines respecting quoted fields containing commas
  const parseCSVLine = (line) => {
    const result = [];
    let cur = "";
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
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ""));
    return result;
  };

  // Handle Excel / CSV File Selection & Parse
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);
    setImporting(true);

    try {
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      let parsedRows = [];

      if (isExcel) {
        const XLSX = await ensureXlsxLoaded();
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array",
          cellDates: true,
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
        });

        if (!rawJson || rawJson.length === 0) {
          throw new Error("Excel sheet contains no data rows");
        }

        for (const rawRow of rawJson) {
          const rowObj = {};
          Object.entries(rawRow).forEach(([key, val]) => {
            const cleanKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
            if (cleanKey.includes("admission") || cleanKey.includes("roll")) return;

            if (cleanKey === "firstname" || cleanKey === "first") rowObj.firstName = val;
            else if (cleanKey === "lastname" || cleanKey === "last") rowObj.lastName = val;
            else if (cleanKey === "name" || cleanKey === "studentname") {
              if (!rowObj.firstName) {
                const parts = String(val).trim().split(" ");
                rowObj.firstName = parts[0];
                rowObj.lastName = parts.slice(1).join(" ");
              }
            } else if (cleanKey.includes("email") && !cleanKey.includes("parent") && !cleanKey.includes("guardian")) {
              rowObj.email = val;
            } else if (cleanKey === "password" || cleanKey === "pass") {
              rowObj.password = val;
            } else if (cleanKey === "gender" || cleanKey === "sex") {
              rowObj.gender = val;
            } else if (cleanKey === "dob" || cleanKey === "dateofbirth" || cleanKey === "birth") {
              rowObj.dob = val;
            } else if (cleanKey === "bloodgroup" || cleanKey === "blood") {
              rowObj.bloodGroup = val;
            } else if (["phone", "contact", "contactnumber", "mobile", "mobilenumber"].includes(cleanKey)) {
              rowObj.contactNumber = val;
            } else if (["alternatephone", "alternate", "altphone"].includes(cleanKey)) {
              rowObj.alternatePhone = val;
            } else if (cleanKey === "address") {
              rowObj.address = val;
            } else if (["joiningdate", "joining", "joined", "admissiondate"].includes(cleanKey)) {
              rowObj.joiningDate = val;
            } else if (["classid", "class", "classname", "grade", "standard"].includes(cleanKey)) {
              rowObj.classId = val;
            } else if (["sectionid", "section", "sectionname", "sec"].includes(cleanKey)) {
              rowObj.sectionId = val;
            } else if (["parentname", "guardian", "parent", "fathername", "mothername"].includes(cleanKey)) {
              rowObj.parentName = val;
            } else if (["parentcontact", "parentphone", "parentnumber", "guardiancontact"].includes(cleanKey)) {
              rowObj.parentContact = val;
            } else if (["parentemail", "guardianemail"].includes(cleanKey)) {
              rowObj.parentEmail = val;
            } else if (cleanKey.includes("aadhaar") || cleanKey.includes("adhar")) {
              rowObj.aadhaarNumber = val;
            }
          });

          const student = normalizeStudentRow(rowObj);
          if (student) parsedRows.push(student);
        }
      } else {
        // Plain CSV / Text parsing with UTF-8 BOM removal
        const text = await file.text();
        const cleanText = text.replace(/^\uFEFF/, "");
        const lines = cleanText
          .split(/\r\n|\n|\r/)
          .filter((line) => line.trim() !== "");

        if (lines.length < 2) {
          throw new Error("CSV file is empty or missing data rows");
        }

        const headers = parseCSVLine(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (!cols || cols.length === 0 || cols.every((c) => c === "")) continue;

          const rowObj = {};
          headers.forEach((h, idx) => {
            const val = (cols[idx] || "").trim();
            const key = String(h).toLowerCase().replace(/[^a-z0-9]/g, "");
            if (key.includes("admission") || key.includes("roll")) return;

            if (key === "firstname" || key === "first") rowObj.firstName = val;
            else if (key === "lastname" || key === "last") rowObj.lastName = val;
            else if (key === "name" || key === "studentname") {
              if (!rowObj.firstName) {
                const parts = val.split(" ");
                rowObj.firstName = parts[0];
                rowObj.lastName = parts.slice(1).join(" ");
              }
            } else if (key.includes("email") && !key.includes("parent") && !key.includes("guardian")) {
              rowObj.email = val;
            } else if (key === "password" || key === "pass") rowObj.password = val;
            else if (key === "gender") rowObj.gender = val;
            else if (key === "dob" || key === "dateofbirth" || key === "birth") rowObj.dob = val;
            else if (key === "bloodgroup" || key === "blood") rowObj.bloodGroup = val;
            else if (["phone", "contact", "contactnumber", "mobile"].includes(key)) rowObj.contactNumber = val;
            else if (["alternatephone", "alternate", "altphone"].includes(key)) rowObj.alternatePhone = val;
            else if (key === "address") rowObj.address = val;
            else if (["joiningdate", "joining", "joined"].includes(key)) rowObj.joiningDate = val;
            else if (["classid", "class", "classname", "grade"].includes(key)) rowObj.classId = val;
            else if (["sectionid", "section", "sectionname", "sec"].includes(key)) rowObj.sectionId = val;
            else if (["parentname", "guardian", "parent", "fathername"].includes(key)) rowObj.parentName = val;
            else if (["parentcontact", "parentphone", "guardiancontact"].includes(key)) rowObj.parentContact = val;
            else if (["parentemail", "guardianemail"].includes(key)) rowObj.parentEmail = val;
            else if (key.includes("aadhaar") || key.includes("adhar")) rowObj.aadhaarNumber = val;
          });

          if (!rowObj.firstName && cols[0]) rowObj.firstName = cols[0];
          if (!rowObj.lastName && cols[1]) rowObj.lastName = cols[1];

          const student = normalizeStudentRow(rowObj);
          if (student) parsedRows.push(student);
        }
      }

      if (parsedRows.length === 0) {
        throw new Error(
          "No valid student rows found in the file. Please check file formatting."
        );
      }

      setImportedData(parsedRows);
      toast.success(
        `Parsed ${parsedRows.length} valid student records from ${file.name}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to parse file. Please verify formatting.");
      setImportedData([]);
    } finally {
      setImporting(false);
    }
  };

  // Submit parsed rows to backend bulk import API
  const handleExecuteBulkImport = async () => {
    if (importedData.length === 0) {
      return toast.warning("Please upload a valid CSV or Excel file first");
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

  // Handle Clean Corrupted Records in Database
  const [cleaningCorrupted, setCleaningCorrupted] = useState(false);
  const handleCleanCorruptedRecords = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clean up all corrupted student records created during failed imports? This will purge records with binary or null characters."
      )
    ) {
      return;
    }
    setCleaningCorrupted(true);
    try {
      await cleanCorruptedStudents();
      fetchStudentsData();
    } catch (_err) {
      // Handled in service
    } finally {
      setCleaningCorrupted(false);
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
                  onClick={() => {
                    if (existingDraft && !isStudentFormDirty(form)) {
                      setForm(existingDraft.form);
                    }
                    setShowCreate(true);
                  }}
                >
                  Register Student
                </Button>
              </CanButton>
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
                    <CanButton id="ADD_STUDENT">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActionMenuOpen(false);
                          if (existingDraft && !isStudentFormDirty(form)) {
                            setForm(existingDraft.form);
                          }
                          setShowCreate(true);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <Plus size={16} />
                        </div>
                        <div>
                          <div className="leading-tight font-bold">
                            Register Student
                          </div>
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                            Single admission
                          </div>
                        </div>
                      </button>
                    </CanButton>

                    <CanButton id="ADD_STUDENT">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActionMenuOpen(false);
                          setShowExcelImport(true);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileSpreadsheet size={16} />
                        </div>
                        <div>
                          <div className="leading-tight font-bold">
                            Import Excel / CSV
                          </div>
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                            Bulk onboarding
                          </div>
                        </div>
                      </button>
                    </CanButton>

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

      {/* ── Summary Metric Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Enrolled
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {pagination.total || students.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Students
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {
                students.filter((s) => (s.status || "active") === "active")
                  .length
              }
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Aadhaar Verified
            </p>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-500">
              {students.filter((s) => Boolean(s.aadhaarNumber)).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Passout / Graduated
            </p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
              {
                students.filter((s) =>
                  (s.status || "").toLowerCase().includes("passout")
                ).length
              }
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
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
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Format Guidelines</span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 p-2 rounded-lg font-bold ${importFileName ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" : "bg-slate-800/40 text-slate-500"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importFileName ? "bg-orange-500 text-white" : "bg-slate-700 text-slate-400"}`}
                >
                  2
                </span>
                <span>Select &amp; Parse File</span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 p-2 rounded-lg font-bold ${importedData.length > 0 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-slate-800/40 text-slate-500"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importedData.length > 0 ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}`}
                >
                  3
                </span>
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
                    Copy complete instructions, copy header row, or click any
                    Class ID / Section ID to copy value.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyInstructions}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Copy size={14} />
                    <span>Copy Instructions</span>
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={() => downloadSampleExcelTemplate("xlsx")}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold border-none shadow"
                  >
                    Template (.xlsx)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={() => downloadSampleExcelTemplate("csv")}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold border-none shadow-md shadow-orange-500/25"
                  >
                    Template (.csv)
                  </Button>
                  <button
                    type="button"
                    onClick={handleCleanCorruptedRecords}
                    disabled={cleaningCorrupted}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                    title="Purge corrupted binary import records from database"
                  >
                    <Trash2 size={13} />
                    <span>{cleaningCorrupted ? "Purging..." : "Purge Corrupted Records"}</span>
                  </button>
                </div>
              </div>

              {/* Exact CSV Header Line Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={14} /> Standard CSV Header Line (Line
                    1):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHeaderLine}
                    className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-md text-[10px] font-bold flex items-center gap-1 transition"
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
                  <span className="text-[10px] text-orange-400 font-bold uppercase block">
                    FirstName &amp; LastName
                  </span>
                  <span className="text-white font-mono text-[11px]">
                    Required
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                    Admission No. &amp; Roll
                  </span>
                  <span className="text-emerald-300 font-mono text-[11px]">
                    Auto-Assigned ✓
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-orange-400 font-bold uppercase block">
                    classId &amp; sectionId
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Use ID from grid below
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-orange-400 font-bold uppercase block">
                    Email &amp; Password
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Auto-Provisioned
                  </span>
                </div>
              </div>

              {/* Class & Section ID Reference Grid */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                    <span>
                      Valid Class IDs &amp; Section IDs Reference Grid
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal normal-case">
                      (Click any badge to copy ID)
                    </span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowRefTables(!showRefTables)}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-bold underline"
                  >
                    {showRefTables
                      ? "Hide Reference Grid"
                      : "Show Reference Grid"}
                  </button>
                </div>

                {showRefTables && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class Options Reference List */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-xs text-orange-400">
                          Class Name
                        </span>
                        <span className="font-extrabold text-xs text-orange-400 font-mono">
                          classId
                        </span>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {CLASS_OPTIONS.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 transition"
                          >
                            <span className="font-bold text-slate-200">
                              {cls.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(cls.id);
                                toast.success(
                                  `Copied classId "${cls.id}" to clipboard!`
                                );
                              }}
                              className="font-mono text-[10px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold cursor-pointer"
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
                        <span className="font-extrabold text-xs text-emerald-400">
                          Section Name
                        </span>
                        <span className="font-extrabold text-xs text-emerald-400 font-mono">
                          sectionId
                        </span>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {SECTION_OPTIONS.map((sec) => (
                          <div
                            key={sec.id}
                            className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 transition"
                          >
                            <span className="font-bold text-slate-200">
                              {sec.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(sec.id);
                                toast.success(
                                  `Copied sectionId "${sec.id}" to clipboard!`
                                );
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
            <div className="p-8 border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 rounded-2xl bg-slate-900/40 transition-all text-center space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload size={26} />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-white">
                  {importFileName
                    ? `Selected: ${importFileName}`
                    : "Click or Drag & Drop your Excel / CSV file here"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Supports{" "}
                  <span className="text-orange-400 font-bold">.CSV</span>,{" "}
                  <span className="text-orange-400 font-bold">.XLSX</span>,{" "}
                  <span className="text-orange-400 font-bold">.XLS</span> format
                  files with up to 1,000+ student rows per batch.
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs cursor-pointer shadow-lg shadow-orange-500/25 transition"
              >
                <Upload size={14} />
                <span>
                  {importFileName
                    ? "Choose Another File"
                    : "Select CSV / Excel File"}
                </span>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Parsed Records
                      </p>
                      <p className="text-lg font-black text-white">
                        {importedData.length} Students
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Target Accounts
                      </p>
                      <p className="text-lg font-black text-orange-400">
                        DB Student + User + Parent
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Import Status
                      </p>
                      <p className="text-lg font-black text-purple-300">
                        Ready to Commit
                      </p>
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
                          <th className="p-3 text-emerald-400">
                            Adm No. (Auto)
                          </th>
                          <th className="p-3 text-emerald-400">Roll (Auto)</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Parent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                        {importedData.slice(0, 5).map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-800/50 transition"
                          >
                            <td className="p-3 text-slate-500 font-bold">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-bold text-white font-sans">
                              {row.firstName} {row.lastName}
                            </td>
                            <td className="p-3 text-orange-400">
                              {row.classId || row.class || "—"} /{" "}
                              {row.sectionId || row.section || "—"}
                            </td>
                            <td className="p-3 text-emerald-400 italic text-[10px]">
                              Auto-Assigned
                            </td>
                            <td className="p-3 text-emerald-400 italic text-[10px]">
                              Auto-Assigned
                            </td>
                            <td className="p-3 text-slate-300">
                              {row.email || (
                                <span className="text-emerald-400 italic">
                                  Auto
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-sans text-slate-300">
                              {row.parentName || "—"}
                            </td>
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
                {importedData.length > 0
                  ? `* ${importedData.length} records will be imported into the database`
                  : "* Select a CSV file to proceed"}
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
                  {importing
                    ? "Importing Students..."
                    : `Bulk Import (${importedData.length}) Students`}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Student Modal */}
      <Modal
        open={showCreate}
        onClose={handleCancelCreate}
        title={
          <div className="flex items-center gap-2.5">
            <span>Register New Student</span>
            {existingDraft && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Draft Mode
              </span>
            )}
          </div>
        }
        size="xl"
      >
        <form onSubmit={handleCreateSubmit}>
          <StudentForm
            form={form}
            onChange={setForm}
            hideButtons={true}
            onSaveDraft={handleSaveDraftClick}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {existingDraft ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <Bookmark size={13} />
                    <span>
                      Draft saved (
                      {new Date(existingDraft.savedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </span>
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="text-rose-500 hover:underline cursor-pointer font-medium"
                  >
                    Discard Draft
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  * You can save as draft anytime and complete registration
                  later
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                onClick={handleCancelCreate}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={handleSaveDraftClick}
                className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                icon={<Bookmark size={14} />}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={submitting}
                icon={<CheckCircle2 size={14} />}
              >
                Register Student
              </Button>
            </div>
          </div>
        </form>
      </Modal>

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
