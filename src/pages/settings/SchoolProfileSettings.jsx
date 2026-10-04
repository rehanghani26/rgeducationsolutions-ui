import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Upload,
  X,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Award,
  ShieldCheck,
  School,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import CompanyLogoUpload from "./CompanyLogoUpload";
import { useSchoolBranding } from "../../context/SchoolBrandingContext.jsx";
import { getUserFromStorage } from "../../config/access.jsx";

const SchoolProfileSettings = ({ settings, handleChange }) => {
  const { updateBranding } = useSchoolBranding();
  const authUser = useSelector((state) => state.auth?.user);
  const userRole = (authUser?.role || getUserFromStorage()?.role || "").toLowerCase().replace(/_/g, '-');
  const isStudent = userRole === 'student';

  const [logoPreview, setLogoPreview] = useState(settings?.schoolLogo || null);
  const [bannerPreview, setBannerPreview] = useState(
    settings?.schoolBanner || null
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);

  const uploadProfileImage = async (file, type) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    try {
      if (type === "logo") {
        setLogoUploading(true);
        setLogoProgress(0);
      } else {
        setBannerUploading(true);
        setBannerProgress(0);
      }

      const res = await api.post("/erp/uploads/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const progress = Math.round((e.loaded / e.total) * 100);
          if (type === "logo") {
            setLogoProgress(progress);
          } else {
            setBannerProgress(progress);
          }
        },
      });

      const image = res.data.image;
      const imageUrl = image.url;
      const imageFields =
        type === "logo"
          ? {
              schoolLogo: imageUrl,
              schoolLogoPublicId: image.publicId,
              schoolLogoAssetId: image.assetId,
              schoolLogoName: image.name,
            }
          : {
              schoolBanner: imageUrl,
              schoolBannerPublicId: image.publicId,
              schoolBannerAssetId: image.assetId,
              schoolBannerName: image.name,
            };

      Object.entries(imageFields).forEach(([name, value]) => {
        handleChange({
          target: { name, value: value || "", type: "text" },
        });
      });

      if (type === "logo") {
        setLogoPreview(imageUrl);
        updateBranding({ schoolLogo: imageUrl });
        toast.success("School logo uploaded successfully!");
      } else {
        setBannerPreview(imageUrl);
        toast.success("School banner uploaded successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || `Failed to upload ${type}`
      );
    } finally {
      if (type === "logo") {
        setLogoUploading(false);
        setLogoProgress(0);
      } else {
        setBannerUploading(false);
        setBannerProgress(0);
      }
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      uploadProfileImage(file, type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("bg-indigo-50", "dark:bg-indigo-950");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-indigo-50", "dark:bg-indigo-950");
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-indigo-50", "dark:bg-indigo-950");

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
      } else {
        setBannerUploading(false);
        setBannerProgress(0);
      }
    }
  };

  const deleteLogo = () => {
    setLogoPreview(null);
    ["schoolLogo", "schoolLogoPublicId", "schoolLogoAssetId", "schoolLogoName"].forEach((name) => {
      handleChange({
        target: { name, value: "", type: "text" },
      });
    });
    updateBranding({ schoolLogo: "" });
    toast.success("Logo removed");
  };

  const deleteBanner = () => {
    setBannerPreview(null);
    ["schoolBanner", "schoolBannerPublicId", "schoolBannerAssetId", "schoolBannerName"].forEach((name) => {
      handleChange({
        target: { name, value: "", type: "text" },
      });
    });
    toast.success("Banner removed");
  };

  const handleCompanyLogoChange = (companyLogo) => {
    handleChange({
      target: { name: "companyLogo", value: companyLogo || "", type: "text" },
    });
    updateBranding({ schoolLogo: companyLogo || "" });
  };

  // Student Read-Only Institutional View
  if (isStudent) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          {settings?.schoolBanner ? (
            <div className="h-44 sm:h-52 w-full overflow-hidden relative">
              <img
                src={settings.schoolBanner}
                alt="Campus Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
          ) : (
            <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          )}

          <div className="relative p-6 -mt-14 sm:-mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 z-10">
            <div className="flex items-end gap-4">
              <div className="size-20 sm:size-24 rounded-3xl bg-white dark:bg-slate-950 border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                {settings?.schoolLogo || settings?.companyLogo ? (
                  <img
                    src={settings.schoolLogo || settings.companyLogo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <School size={36} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {settings?.schoolName || "Institutional Profile"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                    <ShieldCheck size={12} /> Institutional Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">
                  "{settings?.schoolMotto || "Empowering minds, transforming futures"}"
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Info size={14} className="text-indigo-400" />
              <span>Student Reference View</span>
            </div>
          </div>
        </div>

        {/* School Information Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institutional Accreditation */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award size={18} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Affiliation & Accreditation</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Affiliation No.</span>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  {settings?.affiliationNumber || "—"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Education Board</span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {settings?.board || "Recognized Board"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">School Code</span>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  {settings?.registrationNumber || settings?.schoolCode || "—"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Established</span>
                <span className="font-bold text-slate-900 dark:text-white block font-mono">
                  {settings?.establishedYear || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Phone size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official Communication</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-sky-400" /> Official Email
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {settings?.contactEmail || "info@school.edu"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-400" /> Helpline Contact
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {settings?.schoolPhone || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Globe size={13} className="text-indigo-400" /> Portal Website
                </span>
                <span className="font-bold text-indigo-500 font-mono truncate max-w-[200px]">
                  {settings?.websiteUrl || "https://school.edu"}
                </span>
              </div>
            </div>
          </div>

          {/* Campus Location & Address */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MapPin size={18} className="text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Location & Postal Address</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Premises & Street Address</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {[settings?.addressLine1, settings?.addressLine2].filter(Boolean).join(", ") || "Main Campus Grounds"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">City, State & Zip</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                  {[settings?.city, settings?.state, settings?.postalCode].filter(Boolean).join(", ") || "—"}
                </p>
                <span className="text-[10px] text-slate-500 block">{settings?.country || "India"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
          School Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              School Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              name="schoolName"
              value={settings.schoolName || ""}
              onChange={handleChange}
              placeholder="e.g. St. Mary's Academy"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              School Code
            </label>
            <input
              type="text"
              name="schoolCode"
              value={settings.schoolCode || ""}
              onChange={handleChange}
              placeholder="e.g. SMA-001"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={settings.registrationNumber || ""}
              onChange={handleChange}
              placeholder="e.g. REG-2024-001"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Affiliation Number
            </label>
            <input
              type="text"
              name="affiliationNumber"
              value={settings.affiliationNumber || ""}
              onChange={handleChange}
              placeholder="e.g. AFF-2024-001"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              School Type
            </label>
            <select
              name="schoolType"
              value={settings.schoolType || ""}
              onChange={handleChange}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            >
              <option value="">Select School Type</option>
              <option value="primary">Primary School</option>
              <option value="secondary">Secondary School</option>
              <option value="senior">Senior Secondary</option>
              <option value="college">College</option>
              <option value="university">University</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Established Year
            </label>
            <input
              type="number"
              name="establishedYear"
              value={settings.establishedYear || ""}
              onChange={handleChange}
              placeholder="e.g. 2010"
              min="1800"
              max={new Date().getFullYear()}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Email Address <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail || ""}
              onChange={handleChange}
              placeholder="info@school.com"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Phone Number <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="tel"
              name="schoolPhone"
              value={settings.schoolPhone || ""}
              onChange={handleChange}
              placeholder="+1-XXX-XXX-XXXX"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Alternate Phone
            </label>
            <input
              type="tel"
              name="alternatePhone"
              value={settings.alternatePhone || ""}
              onChange={handleChange}
              placeholder="+1-XXX-XXX-XXXX"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={settings.websiteUrl || ""}
              onChange={handleChange}
              placeholder="https://www.school.com"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
          Address Information
        </h3>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
            Address Line 1 <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            value={settings.addressLine1 || ""}
            onChange={handleChange}
            placeholder="Street address"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
            Address Line 2
          </label>
          <input
            type="text"
            name="addressLine2"
            value={settings.addressLine2 || ""}
            onChange={handleChange}
            placeholder="Apartment, suite, etc. (optional)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              City <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={settings.city || ""}
              onChange={handleChange}
              placeholder="e.g. New York"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              State/Province <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={settings.state || ""}
              onChange={handleChange}
              placeholder="e.g. New York"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Country <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={settings.country || ""}
              onChange={handleChange}
              placeholder="e.g. United States"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Postal Code <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              name="postalCode"
              value={settings.postalCode || ""}
              onChange={handleChange}
              placeholder="e.g. 10001"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Branding & Identity Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
          Branding & Identity
        </h3>

        <CompanyLogoUpload
          companyLogo={settings.companyLogo || ""}
          onLogoChange={handleCompanyLogoChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              School Motto
            </label>
            <input
              type="text"
              name="schoolMotto"
              value={settings.schoolMotto || ""}
              onChange={handleChange}
              placeholder="e.g. Excellence in Education"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
              Principal Name
            </label>
            <input
              type="text"
              name="principalName"
              value={settings.principalName || ""}
              onChange={handleChange}
              placeholder="e.g. Dr. John Smith"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>
        </div>

        {/* School Logo Upload */}
        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
            School Logo
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "logo")}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition"
          >
            <input
              type="file"
              id="logoInput"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "logo")}
              className="hidden"
            />
            <label htmlFor="logoInput" className="cursor-pointer">
              {logoUploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${logoProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploading... {logoProgress}%
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="mx-auto text-indigo-600" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Drop your logo here or click to select
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Max size: 5MB • Format: JPG, PNG, GIF
                  </p>
                </div>
              )}
            </label>
          </div>

          {logoPreview && (
            <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-xs text-slate-900 dark:text-white">
                      Logo Uploaded
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {logoPreview.substring(0, 40)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={deleteLogo}
                  type="button"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* School Banner Upload */}
        <div>
          <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-2 text-xs">
            School Banner
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "banner")}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition"
          >
            <input
              type="file"
              id="bannerInput"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "banner")}
              className="hidden"
            />
            <label htmlFor="bannerInput" className="cursor-pointer">
              {bannerUploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${bannerProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploading... {bannerProgress}%
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="mx-auto text-indigo-600" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Drop your banner here or click to select
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Max size: 5MB • Format: JPG, PNG, GIF
                  </p>
                </div>
              )}
            </label>
          </div>

          {bannerPreview && (
            <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex flex-col gap-3">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">
                    Banner Uploaded
                  </p>
                  <button
                    onClick={deleteBanner}
                    type="button"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolProfileSettings;
