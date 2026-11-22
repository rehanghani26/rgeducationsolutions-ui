import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Layers,
  GraduationCap,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function AiClassSectionListCard({
  classes = [],
  sections = [],
  subjects = [],
  syllabus = null,
  classStudents = null,
  academicWorkspace = null,
  onAskAiPrompt = null,
  onSelectStudentForIdCard = null,
  onSelectStudentForReport = null,
}) {
  // Determine initial active tab based on what data was passed
  const initialTab = useMemo(() => {
    if (classStudents?.students && classStudents.students.length > 0) return "students";
    if (syllabus || (subjects.length > 0 && classes.length === 0)) return "subjects";
    return "classes";
  }, [classStudents, syllabus, subjects, classes]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Filter classes
  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    if (!searchTerm.trim()) return classes;
    const term = searchTerm.toLowerCase();
    return classes.filter(
      (c) =>
        (c.name || c.className || "").toLowerCase().includes(term) ||
        (c.code || "").toLowerCase().includes(term)
    );
  }, [classes, searchTerm]);

  // Filter sections
  const filteredSections = useMemo(() => {
    if (!sections) return [];
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter(
      (s) =>
        (s.name || s.sectionName || "").toLowerCase().includes(term) ||
        (s.className || "").toLowerCase().includes(term)
    );
  }, [sections, searchTerm]);

  // Filter subjects / courses
  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    if (!searchTerm.trim()) return subjects;
    const term = searchTerm.toLowerCase();
    return subjects.filter(
      (s) =>
        (s.name || s.subjectName || "").toLowerCase().includes(term) ||
        (s.code || "").toLowerCase().includes(term) ||
        (s.type || "").toLowerCase().includes(term)
    );
  }, [subjects, searchTerm]);

  // Filter class students if present
  const studentList = classStudents?.students || [];
  const filteredStudents = useMemo(() => {
    if (!studentList) return [];
    if (!searchTerm.trim()) return studentList;
    const term = searchTerm.toLowerCase();
    return studentList.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(term) ||
        (s.admissionNumber || "").toLowerCase().includes(term) ||
        String(s.rollNumber || "").toLowerCase().includes(term)
    );
  }, [studentList, searchTerm]);

  // Pagination target based on activeTab
  const activeList = useMemo(() => {
    if (activeTab === "classes") return filteredClasses;
    if (activeTab === "sections") return filteredSections;
    if (activeTab === "subjects") return filteredSubjects;
    if (activeTab === "students") return filteredStudents;
    return [];
  }, [activeTab, filteredClasses, filteredSections, filteredSubjects, filteredStudents]);

  const totalPages = Math.ceil(activeList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeList.slice(start, start + pageSize);
  }, [activeList, page, pageSize]);

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-[#303030] bg-[#161616] shadow-xl transition-all">
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] bg-[#1D1D1D] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7900] to-[#FFA000] text-white shadow-md shadow-[#FF7900]/25">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">
                Classes, Sections, Subjects & Curriculum
              </span>
              <span className="rounded-full bg-[#FF7900]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFA000] border border-[#FF7900]/30">
                Academic Structure
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Institutional grade levels, section streams, course catalogues and prescribed textbooks
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-lg border border-[#333333] bg-[#141414] p-0.5 text-xs">
          {(classes.length > 0 || (!subjects.length && !classStudents)) && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("classes");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === "classes"
                  ? "bg-[#FF7900] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Classes ({classes.length})
            </button>
          )}

          {sections.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("sections");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === "sections"
                  ? "bg-[#FF7900] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Sections ({sections.length})
            </button>
          )}

          {subjects.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("subjects");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === "subjects"
                  ? "bg-[#FF7900] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Subjects ({subjects.length})
            </button>
          )}

          {studentList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("students");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === "students"
                  ? "bg-[#FF7900] text-white shadow-xs"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Class Roster ({classStudents.class} · {studentList.length})
            </button>
          )}
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="border-b border-[#2A2A2A] bg-[#141414] px-4 py-2.5">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#71717A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${activeTab}...`}
            className="w-full rounded-lg border border-[#303030] bg-[#1A1A1A] pl-8 pr-3 py-1 text-xs text-[#FFFFFF] placeholder:text-[#71717A] focus:outline-none focus:border-[#FF7900] transition"
          />
        </div>
      </div>

      {/* ── Content by Active Tab ── */}
      <div className="p-3.5">
        {activeTab === "classes" && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <th className="py-2.5 px-3.5">Class / Grade</th>
                  <th className="py-2.5 px-3.5">Code</th>
                  <th className="py-2.5 px-3.5">Max Capacity</th>
                  <th className="py-2.5 px-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {paginatedList.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#252525] text-[11px] text-[#FFA000] font-bold">
                          {idx + 1}
                        </span>
                        <span>{c.name || c.className}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[#D4D4D8]">
                      {c.code || "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#A1A1AA]">
                      {c.capacity || "—"} students
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onAskAiPrompt &&
                            onAskAiPrompt(
                              `Who are the students in ${c.name || c.className}?`
                            )
                          }
                          className="px-2 py-1 rounded-lg border border-[#FF7900]/30 bg-[#FF7900]/10 text-[11px] font-semibold text-[#FFA000] hover:bg-[#FF7900]/20 transition cursor-pointer"
                        >
                          Show Students
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAskAiPrompt &&
                            onAskAiPrompt(
                              `Show timetable for ${c.name || c.className}`
                            )
                          }
                          className="px-2 py-1 rounded-lg border border-[#333333] bg-[#242424] text-[11px] font-medium text-[#D4D4D8] hover:text-white transition cursor-pointer"
                        >
                          Timetable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sections" && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <th className="py-2.5 px-3.5">Section Name</th>
                  <th className="py-2.5 px-3.5">Assigned Class</th>
                  <th className="py-2.5 px-3.5">Capacity</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {paginatedList.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-[#FFA000]">
                      Section {s.name || s.sectionName}
                    </td>
                    <td className="py-2.5 px-3.5 text-white font-medium">
                      {s.className || "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#A1A1AA]">
                      {s.capacity || "—"} seats
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onAskAiPrompt &&
                          onAskAiPrompt(
                            `Show students in ${s.className} Section ${s.name || s.sectionName}`
                          )
                        }
                        className="px-2.5 py-1 rounded-lg border border-[#FF7900]/30 bg-[#FF7900]/10 text-[11px] font-semibold text-[#FFA000] hover:bg-[#FF7900]/20 transition cursor-pointer"
                      >
                        View Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <th className="py-2.5 px-3.5">Subject / Course Name</th>
                  <th className="py-2.5 px-3.5">Subject Code</th>
                  <th className="py-2.5 px-3.5">Type / Category</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {paginatedList.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-white flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-[#FFA000] shrink-0" />
                      <span>{sub.name || sub.subjectName}</span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[#D4D4D8]">
                      {sub.code || "—"}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2A2A2A] text-[#E4E4E7] border border-[#3A3A3A]">
                        {sub.type || "Theory & Practical"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onAskAiPrompt &&
                          onAskAiPrompt(
                            `Which teachers teach subject ${sub.name || sub.subjectName}?`
                          )
                        }
                        className="px-2 py-1 rounded-lg border border-[#3A3A3A] bg-[#222222] text-[11px] text-[#A1A1AA] hover:text-white transition cursor-pointer"
                      >
                        Assigned Teachers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "students" && (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-[#A1A1AA]">
                Enrolled students in{" "}
                <strong className="text-white">{classStudents?.class}</strong> (
                {classStudents?.section || "All Sections"})
              </span>
              <span className="text-[11px] font-semibold text-[#FFA000]">
                {filteredStudents.length} Students
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#191919] text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  <th className="py-2 px-3">Roll No</th>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">Admission No</th>
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Quick AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {paginatedList.map((stu, idx) => (
                  <tr key={stu.id || idx} className="hover:bg-[#202020] transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-[#FFA000]">
                      #{stu.rollNumber || "—"}
                    </td>
                    <td className="py-2 px-3 font-semibold text-white">
                      {stu.name}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#A1A1AA]">
                      {stu.admissionNumber}
                    </td>
                    <td className="py-2 px-3 text-[#D4D4D8]">
                      Sec {stu.section || "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {stu.status || "Active"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onAskAiPrompt &&
                            onAskAiPrompt(
                              `Show student ID card for ${stu.name} (${stu.admissionNumber})`
                            )
                          }
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FF7900]/15 text-[#FFA000] border border-[#FF7900]/30 hover:bg-[#FF7900]/25 transition"
                        >
                          ID Card
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAskAiPrompt &&
                            onAskAiPrompt(
                              `Get comprehensive academic dossier for student ${stu.name} (${stu.admissionNumber})`
                            )
                          }
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2A2A2A] text-[#D4D4D8] border border-[#3A3A3A] hover:text-white transition"
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
