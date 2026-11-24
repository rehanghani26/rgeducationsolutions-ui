import { HeartPulse, Droplet, Phone, AlertTriangle } from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentMedicalCard({
  student = {},
  medical = {
    bloodGroup: "O+",
    allergies: ["Penicillin", "Dust / Pollen"],
    chronicConditions: "None reported",
    visionCorrection: "Eyeglasses (-1.25 D)",
    dietaryRestrictions: "Vegetarian",
    emergencyContacts: [],
    preferredHospital: "City Care Multi-Specialty Hospital",
  },
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-rose-500/15 via-red-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-sm">
            <HeartPulse className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              Medical Profile & Emergency Protocols
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Admission: {student.admissionNumber || "—"}
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 font-mono text-xs font-black text-rose-300">
          <Droplet className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          Blood: {medical.bloodGroup || student.bloodGroup || "O+"}
        </span>
      </div>

      {/* Medical Content */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Allergies */}
          <div
            className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}
          >
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Known Allergies
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {medical.allergies?.map((a, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[11px] font-semibold"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div
            className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}
          >
            <span className="text-[10px] uppercase font-bold text-stone-400">
              Chronic Conditions
            </span>
            <p className={`text-xs font-semibold ${text.primary} mt-1`}>
              {medical.chronicConditions || "None"}
            </p>
          </div>

          {/* Vision & Diet */}
          <div
            className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}
          >
            <span className="text-[10px] uppercase font-bold text-stone-400">
              Diet & Vision
            </span>
            <p className={`text-xs font-semibold ${text.primary} mt-1`}>
              {medical.dietaryRestrictions || "Regular"} •{" "}
              {medical.visionCorrection || "Standard"}
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Emergency Contacts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {medical.emergencyContacts?.map((c, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${border.default} ${bg.surface}`}
              >
                <div>
                  <span className={`text-xs font-bold ${text.primary} block`}>
                    {c.name} ({c.relation})
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {c.phone}
                  </span>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  title="Call emergency contact"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
