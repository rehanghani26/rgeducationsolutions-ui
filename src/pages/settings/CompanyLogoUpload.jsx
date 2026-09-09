import React, { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import { useSchoolBranding } from "../../context/SchoolBrandingContext.jsx";

const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

const CompanyLogoUpload = ({ companyLogo, onLogoChange }) => {
  const { updateBranding } = useSchoolBranding();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(companyLogo || "");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState(0);

  const isLocalPreview = useMemo(
    () => previewUrl && previewUrl !== companyLogo,
    [companyLogo, previewUrl]
  );

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(companyLogo || "");
    }
  }, [companyLogo, selectedFile]);

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, SVG, and WEBP images are allowed.");
      return false;
    }

    if (file.size > maxFileSize) {
      toast.error("File size must be less than 5MB.");
      return false;
    }

    return true;
  };

  const chooseFile = (file) => {
    if (!file || !validateFile(file)) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProgress(0);
  };

  const handleFileInput = (event) => {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(companyLogo || "");
    setProgress(0);
  };

  const uploadLogo = async () => {
    if (!selectedFile) {
      toast.error("Please select a logo first.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", selectedFile);

    try {
      setUploading(true);
      setProgress(0);

      const res = await api.post("/company/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      const uploadedLogo = res.data.companyLogo || "";
      onLogoChange(uploadedLogo);
      updateBranding({ schoolLogo: uploadedLogo });
      setSelectedFile(null);
      setPreviewUrl(uploadedLogo);
      toast.success(res.data.message || "Company logo uploaded successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload company logo.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeLogo = async () => {
    try {
      setRemoving(true);
      const res = await api.delete("/company/logo");
      onLogoChange("");
      updateBranding({ schoolLogo: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      toast.success(res.data.message || "Company logo removed successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove company logo.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Company Logo
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            JPG, PNG, SVG, WEBP up to 5MB
          </p>
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={selectedFile ? cancelSelection : removeLogo}
            disabled={uploading || removing}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 disabled:opacity-50"
            title={selectedFile ? "Cancel selection" : "Remove logo"}
          >
            {selectedFile ? <X size={16} /> : <Trash2 size={16} />}
          </button>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
            : "border-slate-300 dark:border-slate-600"
        }`}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Company logo preview"
              className="h-20 max-w-[220px] object-contain rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2"
            />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isLocalPreview ? "Preview ready to upload" : "Current company logo"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ImagePlus size={26} className="mx-auto text-indigo-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Drop your company logo here
            </p>
          </div>
        )}

        <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer">
          <UploadCloud size={15} />
          Choose Logo
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Uploading... {progress}%
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {selectedFile && (
          <button
            type="button"
            onClick={uploadLogo}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={15} /> : <UploadCloud size={15} />}
            Upload Logo
          </button>
        )}

        {companyLogo && !selectedFile && (
          <button
            type="button"
            onClick={removeLogo}
            disabled={removing}
            className="inline-flex items-center gap-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold py-2.5 px-4 rounded-lg text-xs disabled:opacity-50"
          >
            {removing ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
            Remove Logo
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
