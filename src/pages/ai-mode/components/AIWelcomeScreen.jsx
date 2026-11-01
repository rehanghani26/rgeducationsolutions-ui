import React from "react";
import { Sparkles, ShieldCheck, Zap, Database } from "lucide-react";
import { SUGGESTED_PROMPTS } from "../ai.constants.js";
import AISuggestionGrid from "./AISuggestionGrid.jsx";
import rgLogo from "../../../assets/logo/RGLOGO.png";

export default function AIWelcomeScreen({
  userName = "Rehan",
  onSelectPrompt,
}) {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFFFFF]">
            Hello,{" "}
            <span className="bg-gradient-to-r from-[#FF7900] via-[#FFA000] to-amber-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-base sm:text-lg font-semibold text-[#FFA000]">
            Your intelligent School Management Assistant.
          </p>

          {/* Description */}
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#A1A1AA]">
            Query students, track attendance, monitor fees, analyze exam
            results, or execute ERP actions instantly using natural language
            commands.
          </p>

          {/* ERP Capability Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: ShieldCheck, label: "Enterprise ERP Integrated" },
              { icon: Database, label: "Live Database Sync" },
              { icon: Zap, label: "Instant Multi-Module Action" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#191919] px-3 py-1 text-[11px] font-medium text-[#A1A1AA]"
              >
                <Icon className="h-3 w-3 text-[#FF7900]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion Cards Grid (At least 12 interactive cards, 16 available) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Explore Modules & Quick Inquiries
            </span>
            <span className="text-[11px] text-[#A1A1AA]/70 font-mono">
              16 Actions Available
            </span>
          </div>
          <AISuggestionGrid
            items={SUGGESTED_PROMPTS}
            onSelectPrompt={onSelectPrompt}
          />
        </div>
      </div>
    </div>
  );
}
