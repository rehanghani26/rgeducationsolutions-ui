import React from "react";
import {
  Sparkles,
  ClipboardList,
  Users,
  Banknote,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import rgLogo from "../../../assets/logo/RGLOGO.png";

const CORE_CARDS = [
  {
    icon: ClipboardList,
    title: "Today's Attendance",
    desc: "Summary of student & staff attendance rates, absentees and section breakdowns",
    prompt: "Show today's student attendance summary and absentee counts.",
    tag: "Attendance",
  },
  {
    icon: Users,
    title: "Students & Enrollment",
    desc: "Lookup student records, active enrollment count and class distribution",
    prompt: "How many students are enrolled across all classes and sections?",
    tag: "Students",
  },
  {
    icon: Banknote,
    title: "Fee Collections & Dues",
    desc: "Overview of collected fees, pending balances and defaulters list",
    prompt: "Show fee collection summary, pending fee balances, and defaulters list.",
    tag: "Finance",
  },
  {
    icon: Calendar,
    title: "Timetable & Faculty",
    desc: "Weekly class schedules, room allocations and teacher assignments",
    prompt: "Show the current school timetable and period schedule across all classes.",
    tag: "Academics",
  },
];

export default function AIWelcomeScreen({
  userName = "Admin",
  role = "",
  onSelectPrompt,
}) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[28rem] rounded-full bg-gradient-to-b from-[#FF7900]/20 via-[#FFA000]/10 to-transparent blur-3xl"
      />

      <div className="relative z-10 w-full max-w-2xl space-y-6 sm:space-y-7">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          {/* Floating Emblem */}
          <div className="relative mb-3 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#FF7900]/30 via-[#FFA000]/15 to-transparent blur-sm"
            />

            <div
              className="relative flex items-center justify-center rounded-2xl border border-white/[0.12] bg-[#18181B] p-1.5 shadow-xl ring-2 ring-[#FF7900]/35 overflow-hidden"
              style={{
                width: "52px",
                height: "52px",
                minWidth: "52px",
                minHeight: "52px",
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
                className="rounded-xl"
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
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Clean Greeting Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white flex items-center justify-center gap-2"
          >
            <span>Hello,</span>
            <span className="bg-gradient-to-r from-[#FF7900] via-[#FFA000] to-amber-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="mt-1 text-[13px] text-[#A1A1AA] max-w-md leading-relaxed"
          >
            How can I help you manage your school today?
          </motion.p>
        </motion.div>

        {/* Clean 4-Card Grid (Like ChatGPT & Claude) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {CORE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                onClick={() => onSelectPrompt(card.prompt)}
                whileHover={{
                  y: -2,
                  scale: 1.015,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#161619]/90 p-4 text-left transition-colors duration-200 hover:border-[#FF7900]/50 hover:bg-[#1A1A1E] hover:shadow-[0_8px_24px_rgba(255,121,0,0.14)] cursor-pointer overflow-hidden"
              >
                {/* Subtle hover flare */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#FF7900]/0 blur-xl transition-all duration-300 group-hover:bg-[#FF7900]/15" />

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#202024] border border-white/[0.08] text-[#FFA000] group-hover:border-[#FF7900]/40 group-hover:bg-[#FF7900]/15 group-hover:text-[#FF7900] transition-all duration-200 shadow-xs flex-shrink-0">
                        <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <span className="inline-flex items-center rounded-full border border-[#FF7900]/25 bg-[#FF7900]/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#FFA000]">
                        {card.tag}
                      </span>
                    </div>

                    <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-white/[0.04] text-[#71717A] opacity-60 group-hover:opacity-100 group-hover:bg-[#FF7900]/15 group-hover:text-[#FFA000] transition-all duration-200">
                      <ArrowUpRight className="h-3.5 w-3.5 transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <h3 className="text-[13px] font-bold text-white group-hover:text-[#FFA000] transition-colors leading-snug">
                    {card.title}
                  </h3>

                  <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA] line-clamp-2">
                    {card.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
