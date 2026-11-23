import React from "react";
import {
  FileCheck,
  Printer,
  Sparkles,
  Download,
  Award,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentCertificateCard({
  certificate = {},
  onAskAiPrompt,
}) {
  const {
    certificateType = "Transfer Certificate",
    certificateNumber = "CERT-2026-9041",
    issueDate = new Date().toISOString().split("T")[0],
    student = {},
    schoolInfo = {},
    reason = "Completed Grade Curriculum / Guardian Relocation",
    conduct = "Exemplary & Diligent",
    validUntil = "2027-05-31",
    signatory = "Principal & Head of Institution",
  } = certificate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.lg}`}
    >
      {/* Header Actions */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              {certificateType} Issued
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              Serial No: <span className="font-mono">{certificateNumber}</span> • Issue Date: {issueDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Certificate
        </button>
      </div>

      {/* Certificate Frame Preview */}
      <div className="p-6">
        <div className="rounded-2xl border-4 border-double border-amber-500/40 p-6 bg-stone-50/50 dark:bg-stone-900/50 text-center space-y-4">
          <div>
            <h2 className="text-base font-black tracking-wider text-orange-500 uppercase">
              {schoolInfo.schoolName || "RG EduCore Model Senior School"}
            </h2>
            <p className="text-[11px] text-stone-400">
              {schoolInfo.schoolAddress || "Knowledge City, Institutional Area, New Delhi - 110001"}
            </p>
          </div>

          <div className="py-2 border-y border-amber-500/30">
            <h3 className={`text-lg font-black ${text.primary} tracking-wide uppercase`}>
              {certificateType}
            </h3>
          </div>

          <p className={`text-xs leading-relaxed ${text.primary} max-w-lg mx-auto text-justify`}>
            This is to certify that <strong>{student.name || "Student"}</strong>, son/daughter of{" "}
            <strong>{student.parentName || "Parent"}</strong>, bearing Admission Number{" "}
            <span className="font-mono font-bold">{student.admissionNumber || "STD-0001"}</span>, was a bonafide student of this institution in{" "}
            <strong>{student.class || "Class 10"}</strong> (Section {student.section || "A"}) during the academic session{" "}
            <strong>{student.academicYear || "2026-27"}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2 max-w-md mx-auto text-left">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Reason for Issue</span>
              <span className={`font-semibold ${text.primary}`}>{reason}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">General Conduct</span>
              <span className="font-semibold text-emerald-400">{conduct}</span>
            </div>
          </div>

          <div className="pt-8 flex justify-between items-end text-xs text-stone-400 px-4">
            <div className="text-left">
              <p className="font-mono">{issueDate}</p>
              <p className="text-[10px]">Date of Issue</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-24 border-b border-stone-400 mx-auto" />
              <p className="font-bold text-[11px] mt-1 text-stone-300">Official Seal</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-stone-200">{signatory}</p>
              <p className="text-[10px]">Head of Institution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
