import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  Filter,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  LayoutGrid,
  List,
} from "lucide-react";

export default function AiTeacherListCard({
  teachers = [],
  total = 0,
  initialFilters = {},
  onAskAiPrompt = null,
  onSelectTeacherForTimetable = null,
  onSelectTeacherForDetail = null,
}) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const [selectedDept, setSelectedDept] = useState(initialFilters.department || "all");
  const [selectedDesignation, setSelectedDesignation] = useState(initialFilters.designation || "all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const pageSize = 6;

  // Extract unique departments and designations
  const departments = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      if (t.department && t.department !== "—") set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  const designations = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      if (t.designation && t.designation !== "—") set.add(t.designation);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Filtering
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = (t.name || "").toLowerCase().includes(term);
        const matchEmail = (t.email || "").toLowerCase().includes(term);
        const matchPhone = (t.phone || "").includes(term);
        const matchSub = Array.isArray(t.subjects)
          ? t.subjects.some((s) => String(s).toLowerCase().includes(term))
          : String(t.subjects || "").toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchPhone && !matchSub) return false;
      }
      if (selectedDept !== "all") {
        if ((t.department || "").toLowerCase() !== selectedDept.toLowerCase()) return false;
      }
      if (selectedDesignation !== "all") {
        if ((t.designation || "").toLowerCase() !== selectedDesignation.toLowerCase()) return false;
      }
      return true;
    });
  }, [teachers, searchTerm, selectedDept, selectedDesignation]);

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, page]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDept("all");
    setSelectedDesignation("all");
    setPage(1);
  };

  const hasActiveFilters = searchTerm || selectedDept !== "all" || selectedDesignation !== "all";

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-xl transition-all">
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/25">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                Faculty & Teacher Directory
              </span>
              <span className="rounded-full bg-[#FF7900]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFA000] border border-[#FF7900]/30">
                {filteredTeachers.length} of {total || teachers.length}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Teaching staff profiles, subjects taught, timetables and conflict management
            </p>
          </div>
        </div>

        {/* View Switcher & Reset */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-[#3A3A3A] bg-[#242424] px-2.5 py-1 text-xs font-medium text-[#A1A1AA] hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}

          <div className="flex items-center rounded-lg border border-[#333333] bg-[#141414] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#2A2A2A] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              title="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#2A2A2A] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              title="Card view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="border-b border-[#2A2A2A] bg-[#141414] p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by teacher name, email, phone or subject..."
            className="w-full rounded-xl border border-[#303030] bg-[#1A1A1A] pl-8 pr-3 py-1.5 text-xs text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-none focus:border-[#FF7900] transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#303030] bg-[#1A1A1A] px-2 py-1 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#FF7900]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">
              Designation
            </label>
            <select
              value={selectedDesignation}
              onChange={(e) => {
                setSelectedDesignation(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#303030] bg-[#1A1A1A] px-2 py-1 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#FF7900]"
            >
              <option value="all">All Roles</option>
              {designations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <span className="text-[11px] text-[#A1A1AA] italic">
              Showing {filteredTeachers.length} of {teachers.length} faculty
            </span>
          </div>
        </div>
      </div>

      {/* ── Table or Grid View ── */}
      {filteredTeachers.length === 0 ? (
        <div className="px-6 py-8 text-center text-xs text-[#A1A1AA]">
          No teacher records match your criteria.
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                <th className="py-2.5 px-3.5">Faculty Member</th>
                <th className="py-2.5 px-3.5">Department</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Subjects Taught</th>
                <th className="py-2.5 px-3.5">Contact</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {paginatedTeachers.map((t, idx) => {
                const initials = (t.name || "T")
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const subjects = Array.isArray(t.subjects)
                  ? t.subjects
                  : t.subjects
                  ? [t.subjects]
                  : [];

                return (
                  <tr
                    key={t.id || t._id || idx}
                    className="hover:bg-[#202020] transition-colors"
                  >
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#2A2A2A] text-xs font-bold text-[#FFA000] border border-[#3A3A3A]">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#FFFFFF] truncate">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-[#A1A1AA] truncate">
                            {t.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 align-middle">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#242424] text-[#D4D4D8] border border-[#333333]">
                        {t.department || "General"}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 align-middle">
                      <span className="text-xs text-[#E4E4E7]">
                        {t.designation || "Teacher"}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {subjects.length > 0 ? (
                          subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FF7900]/10 text-[#FFA000] border border-[#FF7900]/25"
                            >
                              {String(sub)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#71717A] italic text-[11px]">
                            None assigned
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 align-middle">
                      <span className="text-[11px] font-mono text-[#A1A1AA]">
                        {t.phone || "—"}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectTeacherForTimetable) {
                              onSelectTeacherForTimetable(t);
                            } else if (onAskAiPrompt) {
                              onAskAiPrompt(`Show timetable for teacher ${t.name}`);
                            }
                          }}
                          className="px-2 py-1 rounded-lg border border-[#FF7900]/30 bg-[#FF7900]/10 text-[11px] font-semibold text-[#FFA000] hover:bg-[#FF7900]/20 transition cursor-pointer"
                          title="View timetable"
                        >
                          Timetable
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectTeacherForDetail) {
                              onSelectTeacherForDetail(t);
                            } else if (onAskAiPrompt) {
                              onAskAiPrompt(`Show full profile of teacher ${t.name}`);
                            }
                          }}
                          className="px-2 py-1 rounded-lg border border-[#333333] bg-[#242424] text-[11px] font-medium text-[#D4D4D8] hover:text-white transition cursor-pointer"
                          title="View profile"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Layout */
        <div className="p-3.5 grid gap-3 sm:grid-cols-2">
          {paginatedTeachers.map((t, idx) => {
            const initials = (t.name || "T")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const subjects = Array.isArray(t.subjects)
              ? t.subjects
              : t.subjects
              ? [t.subjects]
              : [];

            return (
              <div
                key={t.id || t._id || idx}
                className="rounded-xl border border-[#2B2B2B] bg-[#1B1B1B] p-3.5 transition hover:border-[#FF7900]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-[#2A2A2A] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900]/20 to-[#FFA000]/20 text-xs font-bold text-[#FFA000] border border-[#FF7900]/30">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {t.name}
                        </h4>
                        <span className="text-[11px] text-[#A1A1AA]">
                          {t.designation || "Teacher"} · {t.department || "General"}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {t.status || "Active"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#A1A1AA]">
                    {t.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-[#71717A]" />
                        <span className="truncate">{t.email}</span>
                      </div>
                    )}
                    {t.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-[#71717A]" />
                        <span className="font-mono">{t.phone}</span>
                      </div>
                    )}
                    {subjects.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <BookOpen className="h-3 w-3 text-[#FFA000] shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#262626] text-[#D4D4D8] border border-[#3A3A3A]"
                            >
                              {String(sub)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTeacherForTimetable) {
                        onSelectTeacherForTimetable(t);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(`Show timetable for teacher ${t.name}`);
                      }
                    }}
                    className="flex-1 py-1 px-2 rounded-lg border border-[#FF7900]/30 bg-[#FF7900]/10 text-[11px] font-semibold text-[#FFA000] hover:bg-[#FF7900]/20 transition text-center cursor-pointer"
                  >
                    View Timetable
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTeacherForDetail) {
                        onSelectTeacherForDetail(t);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(`Show full profile of teacher ${t.name}`);
                      }
                    }}
                    className="py-1 px-3 rounded-lg border border-[#333333] bg-[#242424] text-[11px] font-medium text-[#D4D4D8] hover:text-white transition cursor-pointer"
                  >
                    Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination Footer ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-xs text-[#A1A1AA]">
          <span>
            Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#1C1C1C] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg border border-[#333333] bg-[#1C1C1C] px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
