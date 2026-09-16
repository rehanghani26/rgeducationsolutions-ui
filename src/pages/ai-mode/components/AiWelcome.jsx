import React from "react";
import { Sparkles, Shield, Globe, Zap } from "lucide-react";
import { SUGGESTED_PROMPTS } from "../ai.constants.js";

export default function AiWelcome({ userName = "Admin", onSelectPrompt }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <div className="relative mb-5">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
            <div className="gradient-animated relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Hello,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="max-w-md text-[13px] leading-relaxed text-slate-400 sm:text-sm">
            I'm your intelligent School ERP assistant, powered by Advanced System AI.
            Ask me anything or command an action across the entire system.
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SUGGESTED_PROMPTS.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(sp.prompt)}
                className={`group flex flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${sp.bg}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${sp.gradient} shadow-md`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className={`text-[12px] font-semibold ${sp.textColor}`}>
                    {sp.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-slate-400 line-clamp-2">
                    {sp.prompt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Shield, label: "ERP Integrated" },
            { icon: Globe, label: "Real-time Data" },
            { icon: Zap, label: "Action Execution" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11px] text-slate-400"
            >
              <Icon className="h-3 w-3 text-indigo-400" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
