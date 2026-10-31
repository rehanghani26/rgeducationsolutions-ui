import React from "react";
import {
  User,
  GraduationCap,
  CalendarCheck,
  Palmtree,
  DollarSign,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Edit3,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, button, shadow } from "@/theme/color";

export default function AiStudentProfileCard({
  student = {},
  attendance = { percentage: 85, present: 18, absent: 2, late: 1 },
  leavesSummary = { total: 2, pending: 1, approved: 1 },
  fee = { amountPaid: 25000, amountPending: 5000, status: "Partially Paid" },
  onSelectStudentForIdCard,
  onSelectStudentForLeaves,
  onSelectStudentForEdit,
  onAskAiPrompt,
}) {
  const initials = (student.name || "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isActive = String(student.status || "").toLowerCase() === "active";

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.lg}`}
    >
      {/* ── Top Hero Banner ── */}
      <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.name}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-white/80 shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-lg font-black text-white border-2 border-white/60 shadow-md">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {student.name}
                </h3>
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                  {student.status || "Active"}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Admission: <span className="font-mono">{student.admissionNumber}</span> •{" "}
                <span className="font-bold">{student.class}</span> - {student.section} • Roll:{" "}
                {student.rollNumber || "—"}
              </p>
            </div>
          </div>

          {/* Quick Hero Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onSelectStudentForIdCard) onSelectStudentForIdCard(student);
                else if (onAskAiPrompt)
                  onAskAiPrompt(`Show ID card for student ${student.name} (${student.admissionNumber})`);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              ID Card
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectStudentForEdit) onSelectStudentForEdit(student);
                else if (onAskAiPrompt)
                  onAskAiPrompt(`Update details for student ${student.name}`);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white text-orange-600 px-3 py-1.5 text-xs font-bold transition-all shadow-sm hover:bg-white/90"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Stats Row ── */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 border-b ${border.default} divide-x divide-y sm:divide-y-0 divide-stone-100 dark:divide-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40`}>
        {/* Attendance */}
        <div className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-500 mb-0.5">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
            Attendance
          </div>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {attendance.percentage || 85}%
          </span>
          <p className="text-[10px] text-stone-400">
            {attendance.present || 0} Present • {attendance.absent || 0} Absent
          </p>
        </div>

        {/* Leaves */}
        <div className="p-3.5 text-center cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
             onClick={() => {
               if (onSelectStudentForLeaves) onSelectStudentForLeaves(student);
             }}>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-500 mb-0.5">
            <Palmtree className="h-3.5 w-3.5 text-teal-500" />
            Leaves
          </div>
          <span className="text-lg font-black text-teal-600 dark:text-teal-400">
            {leavesSummary.total || 0} Total
          </span>
          <p className="text-[10px] text-stone-400">
            {leavesSummary.pending || 0} Pending • {leavesSummary.approved || 0} Approved
          </p>
        </div>

        {/* Fee Status */}
        <div className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-500 mb-0.5">
            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
            Fee Status
          </div>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 block mt-1">
            {fee.status || "Paid"}
          </span>
          <p className="text-[10px] text-stone-400">
            Due: ₹{fee.amountPending || 0}
          </p>
        </div>

        {/* Blood Group & Gender */}
        <div className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-500 mb-0.5">
            <Droplet className="h-3.5 w-3.5 text-rose-500" />
            Vitals
          </div>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 block mt-1">
            {student.bloodGroup || "O+"} • {student.gender || "Male"}
          </span>
          <p className="text-[10px] text-stone-400">
            DOB: {student.dob || "—"}
          </p>
        </div>
      </div>

      {/* ── Personal & Contact Details Grid ── */}
      <div className="p-4 space-y-3">
        <h4 className={`text-xs font-bold uppercase ${text.muted} tracking-wider`}>
          Contact & Guardian Information
        </h4>

        <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <User className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span>Parent / Guardian:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">
              {student.parentName || "—"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <Phone className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span>Emergency Phone:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">
              {student.parentContact || student.contactNumber || "—"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <Mail className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span>Email:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100 truncate">
              {student.email || "—"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <MapPin className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span>Address:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100 truncate">
              {student.address || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

