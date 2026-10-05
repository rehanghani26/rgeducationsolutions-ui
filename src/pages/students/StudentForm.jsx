import {
  Wand2,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  User,
  Eye,
  Bookmark,
  Clock,
  KeyRound,
  RefreshCw,
  X,
  Mail,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button.jsx";
import FormInput from "../../components/ui/FormInput.jsx";
import FormSelect from "../../components/ui/FormSelect.jsx";
import FormTextarea from "../../components/ui/FormTextarea.jsx";
import PermissionMatrix from "../../components/ui/PermissionMatrix.jsx";
import PdfViewerModal from "../../components/ui/PdfViewerModal.jsx";
import { getClasses, getSections } from "../../services";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
} from "../../constants/academicOptions.js";
import { getDefaultRolePermissions } from "../../config/access.jsx";
import {
  uploadStudentFile,
  sendStudentEmailOtp,
  verifyStudentEmailOtp,
} from "../../services/studentService.js";

export const permissionOptions = [
  ["dashboard", "Dashboard Access"],
  ["academics", "Academic Access"],
  ["attendance", "Attendance View"],
  ["fees", "Fees View"],
  ["exams", "Exams View"],
];

export const initialStudentForm = {
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  bloodGroup: "",
  contactNumber: "",
  alternatePhone: "",
  email: "",
  isEmailVerified: false,
  address: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  classId: "",
  sectionId: "",
  class: "",
  section: "",
  parentName: "",
  parentContact: "",
  parentEmail: "",
  aadhaarNumber: "",
  photo: "",
  aadhaarDocument: "",
  imagesRef: { id: "", img: "" },
  AdharRef: { id: "", pdf: "" },
  permissions: getDefaultRolePermissions("student"),
  forcePasswordChange: true,
  password: "",
  confirmPassword: "",
  status: "active",
  accountExpiryDate: "",
  loginRestriction: "none",
  twoFactorEnabled: false,
};

export const blankStudentForm = initialStudentForm;

// ─── Student Registration Draft Helpers ─────────────────────────────────────
export const DRAFT_STORAGE_KEY = "student_registration_draft";

export const getStudentDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading student draft:", err);
    return null;
  }
};

export const saveStudentDraft = (formData) => {
  try {
    const studentName =
      `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
      formData.parentName ||
      "Untitled Student";
    const draftPayload = {
      form: formData,
      savedAt: new Date().toISOString(),
      studentName,
      className: formData.className || formData.class || "",
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
    return draftPayload;
  } catch (err) {
    console.error("Error saving student draft:", err);
    return null;
  }
};

export const clearStudentDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.error("Error clearing student draft:", err);
  }
};

export const isStudentFormDirty = (form) => {
  if (!form) return false;
  return Boolean(
    form.firstName?.trim() ||
      form.lastName?.trim() ||
      form.contactNumber?.trim() ||
      form.email?.trim() ||
      form.parentName?.trim() ||
      form.parentContact?.trim() ||
      form.aadhaarNumber?.trim() ||
      form.photo?.trim() ||
      form.aadhaarDocument?.trim() ||
      form.address?.trim() ||
      form.classId ||
      form.sectionId
  );
};

export const randomPassword = () =>
  `Std@${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "Passout", label: "Passout / Graduated" },
];

const StudentForm = ({
  form,
  onChange,
  editing = false,
  onSubmit,
  onCancel,
  onSaveDraft,
  submitting,
  hideButtons = false,
  showAccessControl = false,
}) => {
  const [classes, setClasses] = useState(CLASS_OPTIONS);
  const [sections, setSections] = useState(SECTION_OPTIONS);

  useEffect(() => {
    getClasses()
      .then((res) => {
        const list = res?.classes || res?.data?.classes;
        if (list?.length > 0) setClasses(list);
      })
      .catch(() => {});
    getSections()
      .then((res) => {
        const list = res?.sections || res?.data?.sections;
        if (list?.length > 0) setSections(list);
      })
      .catch(() => {});
  }, []);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [draftInfo, setDraftInfo] = useState(() => (!editing ? getStudentDraft() : null));
  const photoInputRef = useRef(null);
  const aadhaarInputRef = useRef(null);

  // Student Email Verification State
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [otpError, setOtpError] = useState("");
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState(
    () => (form?.isEmailVerified ? form.email : "")
  );

  // Countdown timer for OTP resend
  useEffect(() => {
    if (!showOtpBox || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtpBox, countdown]);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    const wasVerified = form.isEmailVerified;
    const isDifferent =
      lastVerifiedEmail &&
      val.trim().toLowerCase() !== lastVerifiedEmail.trim().toLowerCase();

    onChange({
      ...form,
      email: val,
      ...(wasVerified && isDifferent ? { isEmailVerified: false } : {}),
    });
  };

  const handleSendEmailOtp = async () => {
    const targetEmail = form.email?.trim();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      toast.warning("Please enter a valid student email address first.");
      return;
    }

    try {
      setSendingOtp(true);
      setOtpError("");
      const res = await sendStudentEmailOtp(
        targetEmail,
        form.firstName || form.name || "Student"
      );
      toast.success(res?.message || `Verification code sent to ${targetEmail}`);
      setShowOtpBox(true);
      setCountdown(60);
      setOtpValue("");
    } catch (err) {
      console.error("Failed to send student email OTP:", err);
      const msg =
        err.message ||
        err.response?.data?.message ||
        "Failed to send verification code";
      setOtpError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const code = otpValue.trim();
    if (!code || code.length !== 6) {
      setOtpError("Please enter the 6-digit verification code");
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError("");
      const targetId = editing ? form._id || form.id : undefined;
      const res = await verifyStudentEmailOtp({
        email: form.email.trim(),
        otp: code,
        studentId: targetId,
      });

      if (res?.success || res?.isEmailVerified) {
        toast.success(res?.message || "Student email verified successfully!");
        setLastVerifiedEmail(form.email.trim());
        onChange({
          ...form,
          isEmailVerified: true,
        });
        setShowOtpBox(false);
        setOtpValue("");
      } else {
        setOtpError(res?.message || "Verification code is incorrect");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const msg =
        err.message ||
        err.response?.data?.message ||
        "Invalid verification code";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRestoreDraft = () => {
    const draft = getStudentDraft();
    if (draft?.form) {
      onChange(draft.form);
      setDraftInfo(draft);
      toast.success("Saved student registration draft restored!");
    }
  };

  const handleDiscardDraft = () => {
    clearStudentDraft();
    setDraftInfo(null);
    onChange(blankStudentForm);
    toast.info("Draft discarded. Starting fresh registration.");
  };

  const handleSaveDraftClick = () => {
    if (onSaveDraft) {
      onSaveDraft();
    } else {
      if (!isStudentFormDirty(form)) {
        toast.info("No student details entered yet to save as draft.");
        return;
      }
      const saved = saveStudentDraft(form);
      setDraftInfo(saved);
      toast.success("Student registration saved as draft! You can complete it later.");
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate size <= 1MB (1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      toast.error(
        `Photo file size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1MB limit. Please upload an image under 1MB.`
      );
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await uploadStudentFile(file, "photo");
      if (res?.url) {
        const fileId = res.id || res.publicId || `img_${Date.now()}`;
        const refObj = { id: fileId, img: res.url };
        onChange({
          ...form,
          photo: res.url,
          imagesRef: refObj,
        });
        toast.success("Student photo uploaded successfully!");
      } else {
        toast.error(res?.message || "Failed to upload photo");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAadhaarPdfSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Validate size <= 1MB (1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      toast.error(
        `Aadhaar PDF size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1MB limit. Please compress or choose a PDF under 1MB.`
      );
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Aadhaar document must be in PDF format (.pdf).");
      return;
    }

    try {
      setUploadingAadhaar(true);
      const res = await uploadStudentFile(file, "aadhaar");
      if (res?.url) {
        const fileId = res.id || res.publicId || `doc_${Date.now()}`;
        const refObj = { id: fileId, pdf: res.url };
        onChange({
          ...form,
          aadhaarDocument: res.url,
          AdharRef: refObj,
        });
        toast.success("Aadhaar PDF uploaded successfully!");
      } else {
        toast.error(res?.message || "Failed to upload Aadhaar document");
      }
    } catch (err) {
      console.error("Aadhaar document upload error:", err);
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const updateField = (field, value) => onChange({ ...form, [field]: value });

  const togglePermission = (permission) => {
    const permissions = form.permissions.includes(permission)
      ? form.permissions.filter((p) => p !== permission)
      : [...form.permissions, permission];
    updateField("permissions", permissions);
  };

  const generatePwd = () => {
    const next = randomPassword();
    onChange({ ...form, password: next, confirmPassword: next });
  };

  const classOptions = classes.map((c) => ({
    value: c.id || c._id || c.name,
    label: c.name,
  }));

  const sectionOptions = SECTION_OPTIONS.map((s) => ({
    value: s.id || s._id || s.name,
    label: s.name,
  }));

  // Smart resolution for class dropdown
  const resolvedClassValue = (() => {
    const raw = form.classId || form.class || form.className || "";
    const str = (
      typeof raw === "object" && raw !== null
        ? raw._id || raw.id || raw.name || ""
        : String(raw || "")
    ).trim();
    if (!str) return "";

    // Direct match with value
    const byVal = classOptions.find(
      (opt) => String(opt.value).toLowerCase() === str.toLowerCase()
    );
    if (byVal) return byVal.value;

    // Match with label
    const byLabel = classOptions.find(
      (opt) => String(opt.label).toLowerCase() === str.toLowerCase()
    );
    if (byLabel) return byLabel.value;

    // Normalized match e.g. "cls-10", "class 10", "10"
    const norm = str
      .replace(/^(cls-|class\s*|grade\s*)/i, "")
      .trim()
      .toLowerCase();
    const byNorm = classOptions.find((opt) => {
      const optValNorm = String(opt.value)
        .replace(/^(cls-|class\s*|grade\s*)/i, "")
        .trim()
        .toLowerCase();
      const optLblNorm = String(opt.label)
        .replace(/^(cls-|class\s*|grade\s*)/i, "")
        .trim()
        .toLowerCase();
      return optValNorm === norm || optLblNorm === norm;
    });
    if (byNorm) return byNorm.value;

    return str;
  })();

  const displayClassOptions = [...classOptions];
  if (
    resolvedClassValue &&
    !displayClassOptions.some((opt) => opt.value === resolvedClassValue)
  ) {
    displayClassOptions.push({
      value: resolvedClassValue,
      label: form.className || form.class || resolvedClassValue,
    });
  }

  // Smart resolution for section dropdown
  const resolvedSectionValue = (() => {
    const raw = form.sectionId || form.section || form.sectionName || "";
    const str = (
      typeof raw === "object" && raw !== null
        ? raw._id || raw.id || raw.name || ""
        : String(raw || "")
    ).trim();
    if (!str) return "";

    // Direct match with value
    const byVal = sectionOptions.find(
      (opt) => String(opt.value).toLowerCase() === str.toLowerCase()
    );
    if (byVal) return byVal.value;

    // Match with label
    const byLabel = sectionOptions.find(
      (opt) => String(opt.label).toLowerCase() === str.toLowerCase()
    );
    if (byLabel) return byLabel.value;

    // Normalized match e.g. "sec-a", "section a", "a"
    const norm = str
      .replace(/^(sec-|section\s*)/i, "")
      .trim()
      .toLowerCase();
    const byNorm = sectionOptions.find((opt) => {
      const optValNorm = String(opt.value)
        .replace(/^(sec-|section\s*)/i, "")
        .trim()
        .toLowerCase();
      const optLblNorm = String(opt.label)
        .replace(/^(sec-|section\s*)/i, "")
        .trim()
        .toLowerCase();
      return optValNorm === norm || optLblNorm === norm;
    });
    if (byNorm) return byNorm.value;

    return str;
  })();

  const displaySectionOptions = [...sectionOptions];
  if (
    resolvedSectionValue &&
    !displaySectionOptions.some((opt) => opt.value === resolvedSectionValue)
  ) {
    displaySectionOptions.push({
      value: resolvedSectionValue,
      label: form.sectionName || form.section || resolvedSectionValue,
    });
  }

  const currentPhoto = form.photo || form.imagesRef?.img || "";
  const currentPhotoId = form.imagesRef?.id || "";
  const currentAadhaar = form.aadhaarDocument || form.AdharRef?.pdf || "";
  const currentAadhaarId = form.AdharRef?.id || "";

  const FormElement = hideButtons ? "div" : "form";
  const formProps = hideButtons ? { className: "space-y-6" } : { onSubmit, className: "space-y-6" };

  return (
    <FormElement {...formProps}>
      {/* ── Draft Notification Banner ─────────────────────────────────── */}
      {!editing && draftInfo && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bookmark size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {isStudentFormDirty(form) ? "Working on saved draft" : "Unfinished registration draft available"}
                {draftInfo.studentName ? `: "${draftInfo.studentName}"` : ""}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                Saved on {new Date(draftInfo.savedAt).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(draftInfo.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • You can save progress and complete registration later.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!isStudentFormDirty(form) && (
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Resume Draft
              </button>
            )}
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* ── Section: Identity, Photo & Aadhaar Documents ─────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-stone-50 to-amber-50/50 dark:from-stone-800/60 dark:via-stone-900 dark:to-orange-950/30 border border-orange-100 dark:border-orange-900/40 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-orange-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Identity &amp; Government Verification
                {!editing && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Mandatory (1MB limit)
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded once to Cloudinary. Photo and Aadhaar PDF must be 1MB
                or less.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Student Photo */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                Student Photo
                {!editing && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Max 1 MB
              </span>
            </div>

            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {currentPhoto ? (
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-orange-500/40 shadow-md flex-shrink-0 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={currentPhoto}
                    alt="Student Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>Saved to Cloudinary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-500 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">
                      •
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...form,
                          photo: "",
                          imagesRef: { id: "", img: "" },
                        })
                      }
                      disabled={uploadingPhoto}
                      className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  {currentPhotoId && (
                    <div
                      className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]"
                      title={currentPhotoId}
                    >
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        ID:{" "}
                      </span>
                      {currentPhotoId}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  !uploadingPhoto && photoInputRef.current?.click()
                }
                className={`p-4 rounded-xl border-2 border-dashed ${
                  !editing && !currentPhoto
                    ? "border-amber-400/80 bg-amber-500/5"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                } hover:border-orange-500 dark:hover:border-orange-400 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[100px]`}
              >
                {uploadingPhoto ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2
                      size={24}
                      className="animate-spin text-orange-600 dark:text-orange-500"
                    />
                    <span className="text-xs font-medium text-slate-500">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center mb-1.5">
                      <ImageIcon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Upload Student Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, or WEBP (Max 1MB)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. Aadhaar Document (PDF) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                Aadhaar Document (PDF)
                {!editing && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Max 1 MB
              </span>
            </div>

            <input
              type="file"
              ref={aadhaarInputRef}
              onChange={handleAadhaarPdfSelect}
              accept="application/pdf"
              className="hidden"
            />

            {currentAadhaar ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      Aadhaar_Document.pdf
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={11} />
                      <span>Stored on Cloudinary</span>
                    </div>
                  </div>
                </div>

                {currentAadhaarId && (
                  <div
                    className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate"
                    title={currentAadhaarId}
                  >
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      ID:{" "}
                    </span>
                    {currentAadhaarId}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfPreviewOpen(true)}
                      className="flex items-center gap-1 font-bold text-orange-600 dark:text-orange-500 hover:underline cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Preview PDF</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">
                      •
                    </span>
                    <a
                      href={currentAadhaar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <span>New Tab</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => aadhaarInputRef.current?.click()}
                      disabled={uploadingAadhaar}
                      className="text-xs font-semibold text-slate-500 hover:text-orange-600 cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...form,
                          aadhaarDocument: "",
                          AdharRef: { id: "", pdf: "" },
                        })
                      }
                      disabled={uploadingAadhaar}
                      className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  !uploadingAadhaar && aadhaarInputRef.current?.click()
                }
                className={`p-4 rounded-xl border-2 border-dashed ${
                  !editing && !currentAadhaar
                    ? "border-amber-400/80 bg-amber-500/5"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                } hover:border-orange-500 dark:hover:border-orange-400 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[100px]`}
              >
                {uploadingAadhaar ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2
                      size={24}
                      className="animate-spin text-orange-600 dark:text-orange-500"
                    />
                    <span className="text-xs font-medium text-slate-500">
                      Uploading PDF to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-500 flex items-center justify-center mb-1.5">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Upload Aadhaar PDF
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF format only (Max 1MB)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. Aadhaar Number */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  Aadhaar Card Number
                  {!editing && (
                    <span className="text-rose-500 font-bold">*</span>
                  )}
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  12 Digits
                </span>
              </div>
              <FormInput
                name="aadhaarNumber"
                value={form.aadhaarNumber || ""}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/[^\d\s-]/g, "")
                    .slice(0, 16);
                  updateField("aadhaarNumber", val);
                }}
                placeholder="e.g. 1234 5678 9012"
                required={!editing}
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-orange-500">Note:</span>
              UIDAI 12-digit number issued to the student.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Section 1: Personal Information ───────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
            Personal Information
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              name="firstName"
              value={form.firstName || ""}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={form.lastName || ""}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Gender"
              name="gender"
              value={form.gender || "Male"}
              onChange={(e) => updateField("gender", e.target.value)}
              options={GENDER_OPTIONS}
            />
            <FormInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob || ""}
              onChange={(e) => updateField("dob", e.target.value)}
            />
          </div>

          <FormInput
            label="Phone Number"
            name="contactNumber"
            type="tel"
            value={form.contactNumber || ""}
            onChange={(e) => updateField("contactNumber", e.target.value)}
            required
          />
          <FormInput
            label="Alternate Phone"
            name="alternatePhone"
            type="tel"
            value={form.alternatePhone || ""}
            onChange={(e) => updateField("alternatePhone", e.target.value)}
          />
          <FormTextarea
            label="Address"
            name="address"
            value={form.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            rows={3}
          />
        </section>

        {/* ── Section 2: Academic & Guardian ────────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
            Academic &amp; Guardian
          </h4>

          {/* Auto-assigned badge when editing */}
          {editing && (form.admissionNumber || form.rollNumber) && (
            <div className="flex flex-wrap gap-2">
              {form.admissionNumber && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Admission No:
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {form.admissionNumber}
                  </span>
                </div>
              )}
              {form.rollNumber != null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Roll No:
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {form.rollNumber}
                  </span>
                </div>
              )}
            </div>
          )}

          {!editing && (
            <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">
                  Auto-Assigned:
                </span>
                Admission Number is globally unique (STD-
                {new Date().getFullYear()}-XXXX). Roll Number is assigned
                automatically per class &amp; section starting from 1.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Class"
              name="classId"
              value={resolvedClassValue}
              onChange={(e) => {
                const val = e.target.value;
                const selectedObj = displayClassOptions.find(
                  (c) => c.value === val
                );
                const className = selectedObj?.label || val;
                onChange({
                  ...form,
                  classId: val,
                  class: className,
                  className,
                  ...(val !== resolvedClassValue && !editing
                    ? { sectionId: "" }
                    : {}),
                });
              }}
              options={displayClassOptions}
              placeholder="Select Class"
            />
            <FormSelect
              label="Section"
              name="sectionId"
              value={resolvedSectionValue}
              onChange={(e) => {
                const val = e.target.value;
                const selectedObj = displaySectionOptions.find(
                  (s) => s.value === val
                );
                const sectionName = selectedObj?.label || val;
                onChange({
                  ...form,
                  sectionId: val,
                  section: sectionName,
                  sectionName,
                });
              }}
              options={displaySectionOptions}
              placeholder="Select Section"
            />
          </div>

          <FormSelect
            label="Blood Group"
            name="bloodGroup"
            value={form.bloodGroup || ""}
            onChange={(e) => updateField("bloodGroup", e.target.value)}
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Select Blood Group"
          />
          <FormInput
            label="Parent / Guardian"
            name="parentName"
            value={form.parentName || ""}
            onChange={(e) => updateField("parentName", e.target.value)}
            required
          />
          <FormInput
            label="Parent Contact"
            name="parentContact"
            type="tel"
            value={form.parentContact || ""}
            onChange={(e) => updateField("parentContact", e.target.value)}
            required
          />
          <FormInput
            label="Parent Email"
            name="parentEmail"
            type="email"
            value={form.parentEmail || ""}
            onChange={(e) => updateField("parentEmail", e.target.value)}
          />
        </section>

        {/* ── Section 3: Account & Credentials ─────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-orange-600 dark:text-orange-500">
            Student Account &amp; Login Credentials
          </h4>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <span>Student Login Email</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {form.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold shadow-xs">
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold shadow-xs">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>Not Verified</span>
                </span>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-1 min-w-0">
                <FormInput
                  name="email"
                  type="email"
                  value={form.email || ""}
                  onChange={handleEmailChange}
                  placeholder="e.g. student101@school.com"
                  required
                />
              </div>

              {!form.isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={sendingOtp || !form.email || !form.email.includes("@")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    form.email && form.email.includes("@")
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-95"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                  title="Verify student email with 6-digit OTP code"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={13} />
                      <span>{showOtpBox ? "Resend OTP" : "Verify Email"}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Inline OTP Verification Panel */}
            {showOtpBox && !form.isEmailVerified && (
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-orange-50/80 to-amber-50/40 dark:from-stone-800 dark:to-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                    <KeyRound size={14} className="text-orange-600 dark:text-orange-500" />
                    <span>Enter 6-Digit Verification Code</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpBox(false);
                      setOtpValue("");
                      setOtpError("");
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Close verification"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  A 6-digit verification code was sent to <strong className="text-orange-600 dark:text-orange-400">{form.email}</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtpValue(val);
                        setOtpError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full px-3 py-2 text-center font-mono font-bold tracking-[8px] text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={verifyingOtp || otpValue.length !== 6}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                      otpValue.length === 6 && !verifyingOtp
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 active:scale-95"
                        : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                    }`}
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Verify OTP</span>
                      </>
                    )}
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{otpError}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-orange-200/60 dark:border-stone-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Didn't receive code?</span>
                  {countdown > 0 ? (
                    <span className="font-mono text-slate-400">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={sendingOtp}
                      className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={11} className={sendingOtp ? "animate-spin" : ""} />
                      <span>Resend OTP Code</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <FormInput
                  label="Account Login Password"
                  name="password"
                  type="text"
                  value={form.password || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({ ...form, password: val, confirmPassword: val });
                  }}
                  placeholder="Enter login password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Wand2 size={16} />}
                  onClick={generatePwd}
                  className="mb-[1px] p-2 bg-orange-50 dark:bg-orange-900/40 text-orange-600 hover:bg-orange-100 !rounded-lg"
                  title="Auto-generate password"
                />
              </div>
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="text"
                value={form.confirmPassword || ""}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
              />
            </div>
          )}

          {editing && (
            <PermissionMatrix
              permissions={form.permissions}
              options={permissionOptions}
              onChange={togglePermission}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Status"
              name="status"
              value={form.status || "active"}
              onChange={(e) => updateField("status", e.target.value)}
              options={STATUS_OPTIONS}
            />
            <FormInput
              label="Expiry Date"
              name="accountExpiryDate"
              type="date"
              value={form.accountExpiryDate || ""}
              onChange={(e) => updateField("accountExpiryDate", e.target.value)}
            />
          </div>
        </section>
      </div>

      {!hideButtons && onCancel && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {!editing && draftInfo && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Bookmark size={12} /> Draft saved locally
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            {!editing && (
              <Button
                type="button"
                variant="secondary"
                icon={<Bookmark size={14} />}
                onClick={handleSaveDraftClick}
                className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={14} />}
              loading={submitting}
            >
              {submitting ? "Saving..." : editing ? "Update Student" : "Register Student"}
            </Button>
          </div>
        </div>
      )}

      {/* Aadhaar PDF Viewer Modal */}
      <PdfViewerModal
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        url={currentAadhaar}
        title={`${form.firstName || "Student"} — Aadhaar Document`}
        subtitle={form.aadhaarNumber ? `Aadhaar: ${form.aadhaarNumber}` : ""}
        refId={currentAadhaarId}
      />
    </FormElement>
  );
};

export default StudentForm;
