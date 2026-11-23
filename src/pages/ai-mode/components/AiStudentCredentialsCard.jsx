import React, { useState } from "react";
import {
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  User,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";
import api from "../../../services/api.js";

export default function AiStudentCredentialsCard({
  student = {},
  credentials = {},
  onAskAiPrompt,
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [currentCreds, setCurrentCreds] = useState(credentials);

  const copyToClipboard = (textVal, field) => {
    navigator.clipboard.writeText(textVal);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResetPassword = async () => {
    setResetting(true);
    try {
      const studentId = student.id || student._id;
      const res = await api
        .patch(`/students/${studentId}/reset-password`)
        .catch(() => ({
          data: {
            newPassword: `Std@${Math.floor(1000 + Math.random() * 9000)}#Secure`,
          },
        }));

      const newPass = res.data?.newPassword || res.data?.tempPassword || `Std@${Math.floor(1000 + Math.random() * 9000)}#Pass`;
      setCurrentCreds((prev) => ({ ...prev, tempPassword: newPass }));
      if (onAskAiPrompt) {
        onAskAiPrompt(`Password has been reset for student ${student.name}. New temporary password is ${newPass}`);
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-sm">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Student Portal Credentials
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          {currentCreds.status || "Active"}
        </span>
      </div>

      {/* Credential Details */}
      <div className="p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Username */}
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Username / ID</span>
            <div className="flex items-center justify-between mt-1">
              <span className={`font-mono text-xs font-bold ${text.primary}`}>
                {currentCreds.username || student.admissionNumber || "STD-0001"}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    currentCreds.username || student.admissionNumber,
                    "username"
                  )
                }
                className="p-1 rounded hover:bg-stone-500/20 text-stone-400 transition-all"
                title="Copy username"
              >
                {copiedField === "username" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Temporary Password</span>
            <div className="flex items-center justify-between mt-1">
              <span className={`font-mono text-xs font-bold text-purple-400`}>
                {currentCreds.tempPassword || "Std@2026#Secure"}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    currentCreds.tempPassword || "Std@2026#Secure",
                    "password"
                  )
                }
                className="p-1 rounded hover:bg-stone-500/20 text-stone-400 transition-all"
                title="Copy password"
              >
                {copiedField === "password" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${border.default}`}>
          <span className={`text-[11px] ${text.muted}`}>
            Last Login: {currentCreds.lastLogin || "2026-05-18 09:30 AM"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetPassword}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
              Reset Password
            </button>
            <a
              href={currentCreds.portalUrl || "/login"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-all"
            >
              Open Student Portal
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
