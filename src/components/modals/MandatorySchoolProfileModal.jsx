import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Loader2,
  Save,
  LogOut,
  ShieldAlert,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  School,
  Globe,
  Award,
  Sparkles,
  Compass,
  FileCheck2,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import { useSchoolBranding } from "../../context/SchoolBrandingContext.jsx";
import { logoutUser } from "../../store/slices/authSlice.js";

const MANDATORY_KEYS = [
  "schoolName",
  "contactEmail",
  "schoolPhone",
  "addressLine1",
  "city",
  "state",
  "country",
  "postalCode",
];

export const checkIsSchoolProfileIncomplete = (settings) => {
  if (!settings || typeof settings !== "object") return true;
  return MANDATORY_KEYS.some(
    (key) => !settings[key] || !String(settings[key]).trim()
  );
};

const STEPS = [
  {
    id: 1,
    title: "School Identity",
    subtitle: "Name & Affiliation",
    icon: Building2,
  },
  {
    id: 2,
    title: "Contact Details",
    subtitle: "Email & Phone Lines",
    icon: Mail,
  },
  {
    id: 3,
    title: "Campus Location",
    subtitle: "Official Address",
    icon: MapPin,
  },
  {
    id: 4,
    title: "Review & Launch",
    subtitle: "Final Confirmation",
    icon: FileCheck2,
  },
];

const MandatorySchoolProfileModal = ({
  isOpen,
  initialSettings = {},
  onComplete,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { updateBranding } = useSchoolBranding();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolCode: "",
    registrationNumber: "",
    affiliationNumber: "",
    schoolType: "",
    establishedYear: "",
    principalName: "",
    schoolMotto: "",
    contactEmail: "",
    schoolPhone: "",
    alternatePhone: "",
    websiteUrl: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialSettings,
      }));
    }
  }, [initialSettings]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.schoolName?.trim()) {
        newErrors.schoolName = "School Name is mandatory";
      }
    } else if (stepNumber === 2) {
      if (!formData.contactEmail?.trim()) {
        newErrors.contactEmail = "Email Address is mandatory";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
        newErrors.contactEmail = "Please provide a valid email address";
      }

      if (!formData.schoolPhone?.trim()) {
        newErrors.schoolPhone = "Phone Number is mandatory";
      }
    } else if (stepNumber === 3) {
      if (!formData.addressLine1?.trim()) {
        newErrors.addressLine1 = "Address Line 1 is mandatory";
      }
      if (!formData.city?.trim()) {
        newErrors.city = "City is mandatory";
      }
      if (!formData.state?.trim()) {
        newErrors.state = "State/Province is mandatory";
      }
      if (!formData.country?.trim()) {
        newErrors.country = "Country is mandatory";
      }
      if (!formData.postalCode?.trim()) {
        newErrors.postalCode = "Postal Code is mandatory";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    return step1Valid && step2Valid && step3Valid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Please fill in all mandatory fields (*) marked on this step");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (targetStep) => {
    // Only allow jumping back to an earlier step or advancing if validated
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    } else if (targetStep > currentStep) {
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
      } else {
        toast.error("Please complete mandatory fields before proceeding");
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateAll()) {
      toast.error("Please fill in all mandatory fields marked with an asterisk (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...initialSettings,
        ...formData,
      };

      const res = await api.put("/erp/settings", payload);
      const savedSettings = res.data?.settings || payload;

      updateBranding({
        schoolName: savedSettings.schoolName,
        schoolMotto: savedSettings.schoolMotto,
        schoolLogo:
          savedSettings.companyLogo || savedSettings.schoolLogo || "",
      });

      toast.success("School profile initialized successfully! Welcome to your dashboard.");

      if (onComplete) {
        onComplete(savedSettings);
      }
    } catch (err) {
      console.error("Failed to save mandatory school details:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to save school details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/login"));
  };

  // Progress percentage calculation
  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-screen overflow-y-auto bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/85 px-4 sm:px-8 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
            <School size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-white">
                RG EduCore
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                Setup Wizard
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">
              Institutional Setup & Mandatory Profile Configuration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-bold text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
            title="Sign out and return later"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Banner Area */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-7 shadow-2xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  <ShieldAlert size={12} />
                  Mandatory Step
                </span>
                <span className="text-xs font-semibold text-indigo-300">
                  Step {currentStep} of {STEPS.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Please add these details to continue
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Mandatory school information is missing from the database. Please provide accurate details below to configure and access your school portal.
              </p>
            </div>

            <div className="shrink-0 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-3 text-right hidden md:block">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Overall Progress
              </p>
              <p className="text-lg font-black text-indigo-400">{progressPercent}%</p>
            </div>
          </div>
        </div>

        {/* ── STEP PROGRESS LINE ── */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-md">
          <div className="relative flex items-center justify-between">
            {/* Background Track Line */}
            <div className="absolute left-8 right-8 top-5 h-1 bg-slate-800 rounded-full -translate-y-1/2 z-0" />

            {/* Filled Progress Line */}
            <div
              className="absolute left-8 top-5 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * (100 - 14)}%`,
              }}
            />

            {/* Step Nodes */}
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="relative z-10 flex flex-col items-center group focus:outline-none cursor-pointer"
                >
                  {/* Circle Indicator */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-100 ring-2 ring-emerald-400/40"
                        : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/40 scale-110 ring-4 ring-indigo-500/25"
                        : "bg-slate-900 text-slate-500 border border-slate-700/80 hover:border-slate-600 group-hover:text-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={18} className="stroke-[3]" />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-xs font-bold tracking-tight transition-colors ${
                        isActive
                          ? "text-indigo-400 font-extrabold"
                          : isCompleted
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-500 hidden sm:block">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP CONTENT AREA ── */}
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: School Identity ── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-indigo-400" size={18} />
                    <h3 className="text-base font-extrabold text-white">
                      Step 1: School Identity & Credentials
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the official institutional name, school affiliation code, and leadership information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* School Name * */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      School Name <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="relative">
                      <School
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName || ""}
                        onChange={handleChange}
                        placeholder="e.g. St. Xavier's International School"
                        className={`w-full rounded-2xl border ${
                          errors.schoolName
                            ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                            : "border-slate-700 bg-slate-950/70"
                        } pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                      />
                    </div>
                    {errors.schoolName && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.schoolName}
                      </p>
                    )}
                  </div>

                  {/* School Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      School Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="schoolCode"
                      value={formData.schoolCode || ""}
                      onChange={handleChange}
                      placeholder="e.g. SCH-2024-001"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>

                  {/* School Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      School Type (Optional)
                    </label>
                    <select
                      name="schoolType"
                      value={formData.schoolType || ""}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    >
                      <option value="">Select School Type</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="senior">Senior Secondary</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
                    </select>
                  </div>

                  {/* Principal Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Principal / Head Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="principalName"
                      value={formData.principalName || ""}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Johnathan Smith"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>

                  {/* Established Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Established Year (Optional)
                    </label>
                    <input
                      type="number"
                      name="establishedYear"
                      value={formData.establishedYear || ""}
                      onChange={handleChange}
                      placeholder="e.g. 1995"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>

                  {/* School Motto */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      School Motto / Tagline (Optional)
                    </label>
                    <input
                      type="text"
                      name="schoolMotto"
                      value={formData.schoolMotto || ""}
                      onChange={handleChange}
                      placeholder="e.g. Inspiring Excellence, Cultivating Character"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Contact Details ── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="text-indigo-400" size={18} />
                    <h3 className="text-base font-extrabold text-white">
                      Step 2: Contact & Official Communications
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide the official contact email, telephone, and website address for student and parent notifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Contact Email * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Official Email Address <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail || ""}
                        onChange={handleChange}
                        placeholder="admin@school.edu"
                        className={`w-full rounded-2xl border ${
                          errors.contactEmail
                            ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                            : "border-slate-700 bg-slate-950/70"
                        } pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                      />
                    </div>
                    {errors.contactEmail && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  {/* School Phone * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Primary Phone Number <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="tel"
                        name="schoolPhone"
                        value={formData.schoolPhone || ""}
                        onChange={handleChange}
                        placeholder="+1 (555) 019-2834"
                        className={`w-full rounded-2xl border ${
                          errors.schoolPhone
                            ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                            : "border-slate-700 bg-slate-950/70"
                        } pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                      />
                    </div>
                    {errors.schoolPhone && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.schoolPhone}
                      </p>
                    )}
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Alternate / Helpdesk Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone || ""}
                        onChange={handleChange}
                        placeholder="+1 (555) 019-2835"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                      />
                    </div>
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Official Website URL (Optional)
                    </label>
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="url"
                        name="websiteUrl"
                        value={formData.websiteUrl || ""}
                        onChange={handleChange}
                        placeholder="https://www.myschool.edu"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Campus Location ── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-indigo-400" size={18} />
                    <h3 className="text-base font-extrabold text-white">
                      Step 3: Campus Address & Location
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter physical location details for invoices, student cards, and official correspondence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Address Line 1 * */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Address Line 1 <span className="text-rose-400 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1 || ""}
                      onChange={handleChange}
                      placeholder="Street Address, Campus Main Entrance"
                      className={`w-full rounded-2xl border ${
                        errors.addressLine1
                          ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                          : "border-slate-700 bg-slate-950/70"
                      } px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                    />
                    {errors.addressLine1 && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2 || ""}
                      onChange={handleChange}
                      placeholder="Sector, Landmark, or Suite (optional)"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                    />
                  </div>

                  {/* City * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      City <span className="text-rose-400 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      placeholder="e.g. San Francisco"
                      className={`w-full rounded-2xl border ${
                        errors.city
                          ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                          : "border-slate-700 bg-slate-950/70"
                      } px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                    />
                    {errors.city && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* State/Province * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      State / Province <span className="text-rose-400 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      placeholder="e.g. California"
                      className={`w-full rounded-2xl border ${
                        errors.state
                          ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                          : "border-slate-700 bg-slate-950/70"
                      } px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                    />
                    {errors.state && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* Country * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Country <span className="text-rose-400 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      placeholder="e.g. United States"
                      className={`w-full rounded-2xl border ${
                        errors.country
                          ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                          : "border-slate-700 bg-slate-950/70"
                      } px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                    />
                    {errors.country && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Postal Code * */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Postal Code <span className="text-rose-400 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ""}
                      onChange={handleChange}
                      placeholder="e.g. 94103"
                      className={`w-full rounded-2xl border ${
                        errors.postalCode
                          ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500"
                          : "border-slate-700 bg-slate-950/70"
                      } px-4 py-3.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition`}
                    />
                    {errors.postalCode && (
                      <p className="text-rose-400 text-xs font-semibold mt-1.5">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Review & Launch ── */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="text-emerald-400" size={18} />
                    <h3 className="text-base font-extrabold text-white">
                      Step 4: Review & Final Confirmation
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Please verify your institutional profile details. Once saved, your school ERP dashboard will be initialized.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Identity */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Identity
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">
                        {formData.schoolName || "N/A"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Code: {formData.schoolCode || "N/A"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Type: {formData.schoolType ? formData.schoolType.toUpperCase() : "N/A"}
                      </p>
                      {formData.principalName && (
                        <p className="text-[11px] text-slate-400">
                          Principal: {formData.principalName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Contact */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Communication
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate" title={formData.contactEmail}>
                        {formData.contactEmail || "N/A"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Phone: {formData.schoolPhone || "N/A"}
                      </p>
                      {formData.alternatePhone && (
                        <p className="text-[11px] text-slate-400">
                          Alt: {formData.alternatePhone}
                        </p>
                      )}
                      {formData.websiteUrl && (
                        <p className="text-[11px] text-slate-400 truncate">
                          Web: {formData.websiteUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Address */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Campus Location
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {formData.addressLine1 || "N/A"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formData.city}, {formData.state}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formData.country} - {formData.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-200">
                    All mandatory fields have been reviewed. Clicking <strong>Complete Setup & Launch Dashboard</strong> will register your institutional settings and grant immediate system access.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between gap-3">
            {/* Back Button */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Next or Finish Button */}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-600/30 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Complete Setup & Launch Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MandatorySchoolProfileModal;
