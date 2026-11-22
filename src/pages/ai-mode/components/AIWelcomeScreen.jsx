import React from "react";
import { Sparkles, ShieldCheck, BookOpen, Calendar, Wallet, Settings } from "lucide-react";
import { SUGGESTED_PROMPTS } from "../ai.constants.js";
import AISuggestionGrid from "./AISuggestionGrid.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

export default function AIWelcomeScreen({
  userName,
  role,
  onSelectPrompt,
}) {
  const accountRole = String(role || '').toLowerCase().replaceAll('_', '-');
  const admin = ['admin','superadmin','super-admin','school-admin'].includes(accountRole);
  const personal = ['student','parent'].includes(accountRole);
  const faculty = ['teacher','head-teacher','coordinator','hod','director'].includes(accountRole);
  const suggestions = [
    ...(personal ? [{ icon: BookOpen, title: 'My syllabus', description: 'Published chapters and prescribed books', prompt: 'Show my subjects, chapters and prescribed books.' },
      { icon: Calendar, title: 'My timetable', description: 'Weekly classes and teachers', prompt: 'Show my weekly class timetable.' }] : []),
    ...(faculty || admin || accountRole === 'principal' ? [{ icon: BookOpen, title: 'Classes & courses', description: 'Classrooms, sections and subject plans', prompt: 'Show the classes and sections I can access and their curriculum.' }] : []),
    ...(admin || accountRole === 'principal' ? [{ icon: Settings, title: 'School setup', description: 'Profile, session, schedules and grading', prompt: 'Show school setup progress including class timetable coverage.' }] : []),
    ...(admin || ['accountant','principal'].includes(accountRole) ? [{ icon: Wallet, title: 'Budget allocation', description: 'Current allocations and spending', prompt: 'Show the current session budget by category.' }] : []),
    { icon: ShieldCheck, title: 'My permissions', description: 'Modules and actions available to your role', prompt: 'Which modules and actions can my role access?' },
    ...(admin ? SUGGESTED_PROMPTS : []),
  ];
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient Top Glow (Lumix AI style) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-gradient-to-b from-[#FF7900]/15 via-[#FFA000]/5 to-transparent blur-3xl opacity-70" />

      <div className="relative z-10 w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          {/* Constrained, Sleek RGES AI Logo / Emblem */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#FF7900]/30 via-[#FFA000]/25 to-[#FF7900]/30 blur-lg" />
            <div
              className="relative flex items-center justify-center rounded-2xl border border-[#303030] bg-[#191919] p-2 shadow-2xl ring-1 ring-[#FF7900]/40 overflow-hidden"
              style={{
                width: "72px",
                height: "72px",
                minWidth: "72px",
                minHeight: "72px",
                maxWidth: "72px",
                maxHeight: "72px",
              }}
            >
              <img
                src={rgLogo}
                alt="RGES Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                }}
                className="rounded-xl transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                style={{ display: "none" }}
                className="h-full w-full items-center justify-center text-[#FFA000]"
              >
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Greeting Heading */}
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#FFFFFF]">
            Hello,{" "}
            <span className="bg-gradient-to-r from-[#FF7900] via-[#FFA000] to-amber-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>

        </div>

        {/* Suggestion Cards Grid (At least 12 interactive cards, 16 available) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Explore Modules & Quick Inquiries
            </span>
            <span className="text-[11px] text-[#A1A1AA]/70 font-mono">
              {suggestions.length} suggestions
            </span>
          </div>
          <AISuggestionGrid
            items={suggestions}
            onSelectPrompt={onSelectPrompt}
          />
        </div>
      </div>
    </div>
  );
}
