import React from "react";
import {
  FolderOpen,
  FileText,
  Download,
  Eye,
  CheckCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentDocumentsCard({
  student = {},
  totalDocuments = 5,
  documents = [],
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-sm">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Digital Documents & Certificate Vault
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[11px] font-bold text-teal-400">
          <CheckCircle className="h-3.5 w-3.5" />
          {totalDocuments} Verified Files
        </span>
      </div>

      {/* Document List */}
      <div className="p-5 space-y-2.5">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border ${border.default} ${bg.surface} hover:border-teal-500/40 transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className={`text-xs font-bold ${text.primary} block`}>
                  {doc.title}
                </span>
                <span className="text-[10px] text-stone-400">
                  {doc.category} • {doc.size} • Uploaded {doc.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
              <button
                type="button"
                onClick={() =>
                  onAskAiPrompt?.(
                    `View document ${doc.title} for student ${student.name}`
                  )
                }
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
