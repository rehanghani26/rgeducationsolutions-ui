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
import { uploadStudentFile } from "../../services/studentService.js";

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
  const photoInputRef = useRef(null);
  const aadhaarInputRef = useRef(null);

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
        toast.success("Student photo uploaded to Cloudinary successfully!");
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
        toast.success("Aadhaar PDF uploaded to Cloudinary successfully!");
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* ── Section: Identity, Photo & Aadhaar Documents ─────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-sky-50/50 dark:from-slate-800/60 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-100/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
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
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-500/40 shadow-md flex-shrink-0 bg-slate-100 dark:bg-slate-900">
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
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
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
                } hover:border-indigo-500 dark:hover:border-indigo-400 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[100px]`}
              >
                {uploadingPhoto ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2
                      size={24}
                      className="animate-spin text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-xs font-medium text-slate-500">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
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
                      className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
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
                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer"
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
                } hover:border-indigo-500 dark:hover:border-indigo-400 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[100px]`}
              >
                {uploadingAadhaar ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2
                      size={24}
                      className="animate-spin text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-xs font-medium text-slate-500">
                      Uploading PDF to Cloudinary...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
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
              <span className="font-semibold text-indigo-500">Note:</span>
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
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
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
          <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
            Student Account &amp; Login Credentials
          </h4>

          <FormInput
            label="Student Login Email"
            name="email"
            type="email"
            value={form.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="e.g. student101@school.com"
            required
          />

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
                  className="mb-[1px] p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 hover:bg-indigo-100 !rounded-lg"
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
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={14} />}
            loading={submitting}
          >
            {submitting ? "Saving..." : "Save Student"}
          </Button>
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
    </form>
  );
};

export default StudentForm;
