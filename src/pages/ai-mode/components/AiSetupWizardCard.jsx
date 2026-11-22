import React, { useMemo } from "react";
import {
  Sparkles,
  Building2,
  Calendar,
  Clock,
  LayoutGrid,
  Award,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Settings,
} from "lucide-react";

const SETUP_PRIORITIES = [
  {
    id: "p1",
    priority: "P1",
    stepNum: 1,
    key: "schoolProfile",
    badge: "Core Setup",
    title: "School Profile & Identity",
    description:
      "Institutional identity, contact information, postal address, affiliation numbers, logos, and banners.",
    icon: Building2,
    configurePrompt:
      "Configure school profile, institutional identity, and official contact details",
  },
  {
    id: "p2",
    priority: "P2",
    stepNum: 2,
    key: "academicSession",
    badge: "Core Setup",
    title: "Academic Session & Calendar",
    description:
      "Set academic year start/end dates, activate the current session, and run bulk whole-school class promotions.",
    icon: Calendar,
    configurePrompt:
      "Configure academic session start and end dates and activate the current academic year",
  },
  {
    id: "p3",
    priority: "P3",
    stepNum: 3,
    key: "masterPeriods",
    badge: "Period Slots",
    title: "Master Period & Bell Schedule",
    description:
      "Define daily period structure — school timings, bell intervals, Regular & Exam timetable slots inherited by all classes.",
    icon: Clock,
    configurePrompt:
      "Define daily period structure, school bell timings, and period slot intervals",
  },
  {
    id: "p4",
    priority: "P4",
    stepNum: 4,
    key: "classTimetable",
    badge: "Timetable",
    title: "Class Timetable Builder",
    description:
      "Assign subjects and teachers to each class period slot per class-section — with real-time teacher conflict detection.",
    icon: LayoutGrid,
    configurePrompt:
      "Assign subjects and teachers to class period slots with teacher conflict detection",
  },
  {
    id: "p5",
    priority: "P5",
    stepNum: 5,
    key: "academicRules",
    badge: "Grading Scale",
    title: "Academic & Grading Rules",
    description:
      "Default passing percentage, GPA grading scale (4.0/10.0), and examination grade distribution analytics.",
    icon: Award,
    configurePrompt:
      "Set academic passing percentage, GPA grading scale, and exam evaluation rules",
  },
];

export default function AiSetupWizardCard({
  setupStatus = null,
  onAskAiPrompt = null,
}) {
  // Determine completion state of each step from passed setup status
  const stepsState = useMemo(() => {
    const rawSteps = setupStatus?.steps || [];
    const isStepDone = (key, stepNum) => {
      const match = rawSteps.find(
        (s) => s.key === key || s.stepNumber === stepNum || s.title?.toLowerCase().includes(key.toLowerCase())
      );
      if (match) return !!match.complete;
      // If setupStatus provides direct booleans
      if (setupStatus?.[key] !== undefined) return !!setupStatus[key];
      // Default heuristics: P1 and P2 often configured in existing schools
      if (stepNum === 1 && setupStatus?.schoolName) return true;
      if (stepNum === 2 && (setupStatus?.activeSession || setupStatus?.sessionCount > 0)) return true;
      if (stepNum === 3 && setupStatus?.periodCount > 0) return true;
      if (stepNum === 4 && setupStatus?.timetable?.linked > 0) return true;
      if (stepNum === 5 && setupStatus?.passingPercentage != null) return true;
      return false;
    };

    return SETUP_PRIORITIES.map((p) => {
      const complete = isStepDone(p.key, p.stepNum);
      return { ...p, complete };
    });
  }, [setupStatus]);

  const completedCount = stepsState.filter((s) => s.complete).length;
  const percentComplete = Math.round((completedCount / SETUP_PRIORITIES.length) * 100);

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-xl transition-all">
      {/* ── Card Header ── */}
      <div className="border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                  Core Setup & Foundation Architecture
                </span>
                <span className="rounded-full bg-[#FF7900]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFA000] border border-[#FF7900]/30">
                  {percentComplete}% Configured ({completedCount}/5 Anchors)
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Institutional identity, academic calendar, bell slots, timetable, and grading scale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#FFA000]">
              {completedCount === 5 ? "Fully Operational ✓" : `${5 - completedCount} Action(s) Needed`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#262626]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF7900] to-[#FFA000] transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* ── 5 Priority Cards List ── */}
      <div className="divide-y divide-[#222222] p-2">
        {stepsState.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#1B1B1B] transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="flex h-6 w-7 items-center justify-center rounded-md bg-[#252525] font-mono text-[11px] font-extrabold text-[#FFA000] border border-[#3A3A3A]">
                    {step.priority}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#202020] text-[#A1A1AA]">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#282828] text-[#FFA000] border border-[#3A3A3A]">
                      {step.badge}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {step.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-[#A1A1AA] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-end sm:shrink-0 pt-2 sm:pt-0">
                {step.complete ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAiPrompt &&
                      onAskAiPrompt(`Show details for ${step.title}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Configured ✓</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAiPrompt && onAskAiPrompt(step.configurePrompt)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FF7900]/40 bg-[#FF7900]/15 text-xs font-bold text-[#FFA000] hover:bg-[#FF7900]/25 transition shadow-sm shadow-[#FF7900]/15 cursor-pointer"
                  >
                    <span>Configure Settings</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#2A2A2A] bg-[#141414] px-4 py-2.5 flex items-center justify-between text-xs text-[#A1A1AA]">
        <span>
          {completedCount === 5
            ? "✓ All institutional foundation anchors are active."
            : "Click 'Configure Settings' on any pending anchor to set it up automatically via AI."}
        </span>
        {completedCount < 5 && (
          <button
            type="button"
            onClick={() =>
              onAskAiPrompt &&
              onAskAiPrompt(
                "Run a complete setup audit and guide me through the remaining pending steps"
              )
            }
            className="text-[11px] font-semibold text-[#FFA000] hover:underline cursor-pointer"
          >
            Audit & Complete All
          </button>
        )}
      </div>
    </div>
  );
}
