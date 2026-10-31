import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CreditCard,
  Palmtree,
  Edit3,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Phone,
  Droplet,
  GraduationCap,
} from "lucide-react";
import { bg, border, text, badge, button, shadow } from "@/theme/color";

export default function AiStudentListCard({
  students = [],
  total = 0,
  initialFilters = {},
  onSelectStudentForIdCard,
  onSelectStudentForLeaves,
  onSelectStudentForEdit,
  onSelectStudentForReport,
  onAskAiPrompt,
}) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const [selectedClass, setSelectedClass] = useState(initialFilters.class || "all");
  const [selectedSection, setSelectedSection] = useState(initialFilters.section || "all");
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status || "all");
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender || "all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(initialFilters.bloodGroup || "all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Extract available unique classes and sections from students
  const availableClasses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const c = s.class || s.className;
      if (c && c !== "—") set.add(c);
    });
    return Array.from(set).sort();
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const sec = s.section || s.sectionName;
      if (sec && sec !== "—") set.add(sec);
    });
    return Array.from(set).sort();
  }, [students]);

  // Client-side filtering across all fields
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = (s.name || "").toLowerCase().includes(term);
        const matchesAdm = (s.admissionNumber || "").toLowerCase().includes(term);
        const matchesRoll = String(s.rollNumber || "").toLowerCase().includes(term);
        const matchesContact = String(s.contactNumber || "").includes(term);
        if (!matchesName && !matchesAdm && !matchesRoll && !matchesContact) return false;
      }
      // Class
      if (selectedClass !== "all") {
        const c = (s.class || s.className || "").toLowerCase().replace(/class\s*/i, "").trim();
        const targetC = selectedClass.toLowerCase().replace(/class\s*/i, "").trim();
        if (c !== targetC) return false;
      }
      // Section
      if (selectedSection !== "all") {
        const sec = (s.section || s.sectionName || "").toLowerCase().trim();
        if (sec !== selectedSection.toLowerCase().trim()) return false;
      }
      // Status
      if (selectedStatus !== "all") {
        const st = (s.status || "").toLowerCase();
        if (st !== selectedStatus.toLowerCase()) return false;
      }
      // Gender
      if (selectedGender !== "all") {
        const g = (s.gender || "").toLowerCase();
        if (g !== selectedGender.toLowerCase()) return false;
      }
      // Blood Group
      if (selectedBloodGroup !== "all") {
        const bg = (s.bloodGroup || "").toUpperCase().trim();
        if (bg !== selectedBloodGroup.toUpperCase().trim()) return false;
      }
      return true;
    });
  }, [
    students,
    searchTerm,
    selectedClass,
    selectedSection,
    selectedStatus,
    selectedGender,
    selectedBloodGroup,
  ]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setSelectedSection("all");
    setSelectedStatus("all");
    setSelectedGender("all");
    setSelectedBloodGroup("all");
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedClass !== "all" ||
    selectedSection !== "all" ||
    selectedStatus !== "all" ||
    selectedGender !== "all" ||
    selectedBloodGroup !== "all";

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border ${border.default} ${bg.card} ${shadow.md} transition-all`}
    >
      {/* ── Header ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b ${border.default} px-4 py-3.5 ${bg.surface}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${text.primary}`}>
                Student Directory & Filter Console
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.primary}`}
              >
                {filteredStudents.length} of {total || students.length}
              </span>
            </div>
            <p className={`text-[11px] ${text.muted}`}>
              Instant filtering, live ID cards, leaves, and in-place student updates
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className={`flex items-center gap-1.5 rounded-lg border ${border.default} px-2.5 py-1 text-xs font-medium ${text.secondary} hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors`}
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Multi-Field Filter Bar ── */}
      <div className={`border-b ${border.default} p-3.5 space-y-2.5 bg-stone-50/60 dark:bg-stone-900/40`}>
        {/* Search Row */}
        <div className="relative">
          <Search className={`absolute left-3 top-2.5 h-4 w-4 ${text.muted}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name, roll no, admission no, or phone..."
            className={`w-full rounded-xl border ${border.default} ${bg.input} pl-9 pr-3 py-1.5 text-xs ${text.primary} placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all`}
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {/* Class Filter */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase ${text.muted} mb-1`}>
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
              className={`w-full rounded-lg border ${border.default} ${bg.input} px-2 py-1 text-xs ${text.primary} focus:outline-none focus:ring-1 focus:ring-orange-500`}
            >
              <option value="all">All Classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase ${text.muted} mb-1`}>
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setPage(1);
              }}
              className={`w-full rounded-lg border ${border.default} ${bg.input} px-2 py-1 text-xs ${text.primary} focus:outline-none focus:ring-1 focus:ring-orange-500`}
            >
              <option value="all">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase ${text.muted} mb-1`}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className={`w-full rounded-lg border ${border.default} ${bg.input} px-2 py-1 text-xs ${text.primary} focus:outline-none focus:ring-1 focus:ring-orange-500`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="passout">Passout</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase ${text.muted} mb-1`}>
              Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
              className={`w-full rounded-lg border ${border.default} ${bg.input} px-2 py-1 text-xs ${text.primary} focus:outline-none focus:ring-1 focus:ring-orange-500`}
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className={`block text-[10px] font-semibold uppercase ${text.muted} mb-1`}>
              Blood Group
            </label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => {
                setSelectedBloodGroup(e.target.value);
                setPage(1);
              }}
              className={`w-full rounded-lg border ${border.default} ${bg.input} px-2 py-1 text-xs ${text.primary} focus:outline-none focus:ring-1 focus:ring-orange-500`}
            >
              <option value="all">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Student List / Grid ── */}
      {paginatedStudents.length === 0 ? (
        <div className="py-10 text-center">
          <Users className={`mx-auto h-8 w-8 ${text.muted} mb-2 opacity-50`} />
          <p className={`text-xs font-medium ${text.secondary}`}>
            No students found matching current filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800/80 overflow-x-auto">
          {paginatedStudents.map((student) => {
            const initials = (student.name || "S")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            const isActive = String(student.status || "").toLowerCase() === "active";

            return (
              <div
                key={student.id || student.admissionNumber}
                className="flex flex-col gap-3 p-3.5 transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/30 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="h-10 w-10 flex-shrink-0 rounded-xl object-cover border border-orange-500/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 font-bold text-orange-600 dark:text-orange-400 text-xs border border-orange-500/30">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${text.primary} truncate`}>
                        {student.name}
                      </span>
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-stone-400"
                        }`}
                        title={student.status}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      <span className="font-mono font-medium text-stone-700 dark:text-stone-300">
                        {student.admissionNumber}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {student.class}
                        {student.section ? ` - ${student.section}` : ""}
                      </span>
                      {student.rollNumber && student.rollNumber !== "—" && (
                        <>
                          <span>•</span>
                          <span>Roll: {student.rollNumber}</span>
                        </>
                      )}
                      {student.bloodGroup && student.bloodGroup !== "—" && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-rose-500 font-medium">
                            <Droplet className="h-2.5 w-2.5" />
                            {student.bloodGroup}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                  {/* ID Card Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStudentForIdCard) {
                        onSelectStudentForIdCard(student);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(
                          `Show ID card for student ${student.name} (${student.admissionNumber})`
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-600 hover:bg-orange-500/20 dark:text-orange-400 transition-colors shadow-2xs`}
                    title="View & Print ID Card"
                  >
                    <CreditCard className="h-3 w-3" />
                    ID Card
                  </button>

                  {/* Leaves Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStudentForLeaves) {
                        onSelectStudentForLeaves(student);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(
                          `Show leaves and leave status for student ${student.name} (${student.admissionNumber})`
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border ${border.default} bg-stone-100 dark:bg-stone-800/60 px-2 py-1 text-[11px] font-medium ${text.secondary} hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors`}
                    title="View Student Leaves"
                  >
                    <Palmtree className="h-3 w-3 text-emerald-600" />
                    Leaves
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStudentForEdit) {
                        onSelectStudentForEdit(student);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(
                          `Help me update details for student ${student.name} (${student.admissionNumber})`
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border ${border.default} bg-stone-100 dark:bg-stone-800/60 px-2 py-1 text-[11px] font-medium ${text.secondary} hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors`}
                    title="Edit Student Information"
                  >
                    <Edit3 className="h-3 w-3 text-sky-600" />
                    Edit
                  </button>

                  {/* Full Dossier / Report */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStudentForReport) {
                        onSelectStudentForReport(student);
                      } else if (onAskAiPrompt) {
                        onAskAiPrompt(
                          `Get comprehensive academic dossier and report for student ${student.name} (${student.admissionNumber})`
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border ${border.default} bg-stone-100 dark:bg-stone-800/60 p-1 text-[11px] font-medium ${text.secondary} hover:bg-stone-200/70 dark:hover:bg-stone-700 transition-colors`}
                    title="360 Academic Dossier"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer / Pagination ── */}
      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between border-t ${border.default} px-4 py-2.5 text-xs ${text.muted} ${bg.surface}`}
        >
          <span>
            Page {page} of {totalPages} ({filteredStudents.length} results)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`rounded-md p-1 border ${border.default} ${button.ghost} disabled:opacity-30`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`rounded-md p-1 border ${border.default} ${button.ghost} disabled:opacity-30`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

