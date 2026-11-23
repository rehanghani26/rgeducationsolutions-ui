import React from "react";
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { bg, border, text, badge, shadow } from "@/theme/color";

export default function AiStudentTransportCard({
  student = {},
  transport = {},
  onAskAiPrompt,
}) {
  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b ${border.default} px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-sm">
            <Bus className="h-4 w-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${text.primary}`}>
              School Bus & Transport Allocation
            </h3>
            <p className={`text-[11px] ${text.muted}`}>
              {student.name} • Class {student.class || "10"} ({student.section || "A"})
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
          {transport.routeNumber || "Route 05"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Route Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Vehicle No</span>
            <p className={`text-xs font-mono font-bold ${text.primary} mt-0.5`}>
              {transport.vehicleNumber || "DL-01-EXP-5521"}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Morning Pickup</span>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">
              {transport.morningPickupTime || "07:20 AM"}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <span className="text-[10px] uppercase font-bold text-stone-400">Afternoon Drop</span>
            <p className="text-xs font-bold text-amber-400 mt-0.5">
              {transport.afternoonDropTime || "03:40 PM"}
            </p>
          </div>
        </div>

        {/* Bus Stop */}
        <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${border.default} ${bg.surface}`}>
          <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400">Designated Bus Stop</span>
            <p className={`text-xs font-bold ${text.primary}`}>{transport.pickupStop || "Green Park Metro Gate 3"}</p>
            <p className={`text-[11px] ${text.muted}`}>{transport.routeName || "Metro Junction to Main Campus"}</p>
          </div>
        </div>

        {/* Driver & Attendant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`flex items-center justify-between p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400">Bus Driver</span>
              <p className={`text-xs font-bold ${text.primary}`}>{transport.driverName || "Suresh Chandra"}</p>
              <p className="text-[11px] font-mono text-stone-400">{transport.driverPhone || "9876501234"}</p>
            </div>
            <a
              href={`tel:${transport.driverPhone || "9876501234"}`}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-xl border ${border.default} ${bg.surface}`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400">Bus Attendant</span>
              <p className={`text-xs font-bold ${text.primary}`}>{transport.attendantName || "Kishore Kumar"}</p>
              <p className="text-[11px] font-mono text-stone-400">{transport.attendantPhone || "9876505678"}</p>
            </div>
            <a
              href={`tel:${transport.attendantPhone || "9876505678"}`}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
