import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sparkles,
} from "lucide-react";

const DAYS = ["All Days", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AiTimetableCard({
  timetable = [],
  className = "",
  section = "",
  onAskAiPrompt = null,
}) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return DAYS.includes(todayName) ? todayName : "All Days";
  });

  // Normalize timetable rows
  const schedule = useMemo(() => {
    if (!timetable || !Array.isArray(timetable)) return [];
    return timetable.map((item, idx) => ({
      id: item.id || `tt-${idx}`,
      day: item.day || "Regular",
      period: item.period || item.periodOrder || item.periodNumber || idx + 1,
      time: item.time || (item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : "—"),
      subject: item.subject || item.subjectName || item.customLabel || "—",
      teacher: item.teacher || item.teacherName || "Unassigned",
      section: item.section || item.sectionName || section || "All",
      isBreak: (item.periodType || "").toLowerCase().includes("break") || (item.subject || "").toLowerCase().includes("break"),
    }));
  }, [timetable, section]);

  // Real-time Teacher Conflict Detection
  const conflicts = useMemo(() => {
    const map = new Map();
    const detected = [];

    schedule.forEach((slot) => {
      if (!slot.teacher || slot.teacher === "Unassigned" || slot.teacher === "—" || slot.isBreak) return;
      const key = `${slot.day}-${slot.time}-${slot.teacher}`;
      if (map.has(key)) {
        const existing = map.get(key);
        detected.push({
          teacher: slot.teacher,
          day: slot.day,
          time: slot.time,
          period: slot.period,
          subject1: existing.subject,
          section1: existing.section,
          subject2: slot.subject,
          section2: slot.section,
        });
      } else {
        map.set(key, slot);
      }
    });

    return detected;
  }, [schedule]);

  // Filter schedule by selected day
  const filteredSchedule = useMemo(() => {
    if (selectedDay === "All Days") return schedule;
    return schedule.filter((s) => (s.day || "").toLowerCase() === selectedDay.toLowerCase());
  }, [schedule, selectedDay]);

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-xl transition-all">
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/25">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                {className ? `${className} Timetable` : "Class Timetable"}
              </span>
              {section && (
                <span className="rounded-full bg-[#FF7900]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFA000] border border-[#FF7900]/30">
                  Sec {section}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Period scheduling, bell slots, teacher assignments & live conflict verification
            </p>
          </div>
        </div>

        {/* Conflict Badge */}
        {conflicts.length > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>{conflicts.length} Conflict(s) Detected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>No Conflicts</span>
          </div>
        )}
      </div>

      {/* ── Conflict Alert Banner if detected ── */}
      {conflicts.length > 0 && (
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-2.5 text-xs text-rose-200 space-y-1">
          {conflicts.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span>
                <strong>Conflict Alert:</strong> {c.teacher} is double-booked on{" "}
                <strong>{c.day}</strong> at <strong>{c.time}</strong> between{" "}
                {c.subject1} (Sec {c.section1}) and {c.subject2} (Sec {c.section2}).
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Day Filter Tabs ── */}
      <div className="border-b border-[#2A2A2A] bg-[#141414] px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedDay === day
                ? "bg-[#FF7900] text-white shadow-xs font-bold"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#202020]"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* ── Timetable Slots Table ── */}
      {filteredSchedule.length === 0 ? (
        <div className="px-6 py-8 text-center text-xs text-[#A1A1AA]">
          No period slots scheduled for {selectedDay}.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                <th className="py-2.5 px-3.5 w-16">Slot</th>
                <th className="py-2.5 px-3.5">Day</th>
                <th className="py-2.5 px-3.5">Time Interval</th>
                <th className="py-2.5 px-3.5">Subject</th>
                <th className="py-2.5 px-3.5">Teacher Assigned</th>
                <th className="py-2.5 px-3.5 text-right">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredSchedule.map((slot, idx) => {
                const isConflictSlot = conflicts.some(
                  (c) =>
                    c.teacher === slot.teacher &&
                    c.day === slot.day &&
                    c.time === slot.time
                );

                return (
                  <tr
                    key={slot.id || idx}
                    className={`transition-colors ${
                      slot.isBreak
                        ? "bg-[#1E1E1E]/50 text-[#71717A]"
                        : isConflictSlot
                        ? "bg-rose-500/10 hover:bg-rose-500/15"
                        : "hover:bg-[#202020]"
                    }`}
                  >
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#252525] font-mono text-[11px] font-bold text-[#FFA000]">
                        P{slot.period}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-medium text-[#D4D4D8]">
                      {slot.day}
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-xs text-[#A1A1AA]">
                      {slot.time}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-[#FFA000] shrink-0" />
                        <span className="font-semibold text-white">
                          {slot.subject}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-[#71717A] shrink-0" />
                        <span
                          className={`${
                            isConflictSlot
                              ? "text-rose-400 font-bold"
                              : "text-[#D4D4D8]"
                          }`}
                        >
                          {slot.teacher}
                        </span>
                        {isConflictSlot && (
                          <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right font-medium text-[#A1A1AA]">
                      Sec {slot.section}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer Quick Prompts ── */}
      <div className="border-t border-[#2A2A2A] bg-[#141414] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#A1A1AA]">
          Total: <strong className="text-white">{filteredSchedule.length}</strong> period slots scheduled
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onAskAiPrompt &&
              onAskAiPrompt(`Check teacher conflict report for all classes`)
            }
            className="px-2.5 py-1 rounded-lg border border-[#3A3A3A] bg-[#202020] text-[11px] text-[#A1A1AA] hover:text-white transition cursor-pointer"
          >
            Audit All Teacher Conflicts
          </button>
        </div>
      </div>
    </div>
  );
}
