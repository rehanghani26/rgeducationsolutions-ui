import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  Layers,
  GraduationCap,
  Sparkles,
  BookMarked,
  Award,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { CLASS_OPTIONS } from "../../constants/academicOptions.js";
import {
  getSyllabusByClass,
  saveClassSyllabus,
  resetClassSyllabus,
} from "../../services/syllabusService.js";

const ClassSyllabusSettings = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState(
    CLASS_OPTIONS[3]?.id || "cls-1"
  ); // Class 1 default
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [syllabusData, setSyllabusData] = useState({
    className: "Class 1",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    description: "",
    subjects: [],
  });

  const activeClassObj =
    CLASS_OPTIONS.find((c) => c.id === selectedClassId) || CLASS_OPTIONS[3];

  const fetchSyllabus = async (classId) => {
    setLoading(true);
    try {
      const data = await getSyllabusByClass(classId);
      if (data) {
        setSyllabusData({
          className: data.className || activeClassObj?.name || "Class 1",
          academicYear:
            data.academicYear ||
            `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          description: data.description || "",
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        });
      }
    } catch (err) {
      console.error("Error loading syllabus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus(selectedClassId);
  }, [selectedClassId]);

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    const cls = CLASS_OPTIONS.find((c) => c.id === newClassId);
    if (cls) {
      setSyllabusData((prev) => ({ ...prev, className: cls.name }));
    }
  };

  const handleSubjectChange = (index, field, value) => {
    setSyllabusData((prev) => {
      const updated = [...prev.subjects];
      updated[index] = {
        ...updated[index],
        [field]:
          field === "maxMarks" || field === "passMarks"
            ? Number(value) || 0
            : value,
      };
      return { ...prev, subjects: updated };
    });
  };

  const handleAddSubject = () => {
    const newSub = {
      subjectName: "",
      subjectCode: "",
      bookName: "",
      author: "",
      publisher: "",
      maxMarks: 100,
      passMarks: 35,
    };
    setSyllabusData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
  };

  const handleRemoveSubject = (index) => {
    setSyllabusData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!syllabusData.subjects.length) {
      toast.warning("Please add at least one subject to this class syllabus.");
      return;
    }

    // Validate empty subject names
    const hasEmptyName = syllabusData.subjects.some(
      (s) => !s.subjectName || !s.subjectName.trim()
    );
    if (hasEmptyName) {
      toast.error("All subjects must have a valid Subject Name.");
      return;
    }

    setSaving(true);
    try {
      await saveClassSyllabus(selectedClassId, {
        className: activeClassObj.name,
        academicYear: syllabusData.academicYear,
        description: syllabusData.description,
        subjects: syllabusData.subjects,
      });
    } catch (err) {
      // toast shown in service
    } finally {
      setSaving(false);
    }
  };

  const handleResetToStandard = async () => {
    if (
      !window.confirm(
        `Reset ${activeClassObj.name} curriculum to standard national syllabus & recommended books? Any unsaved edits will be replaced.`
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      const defaultSyllabus = await resetClassSyllabus(selectedClassId);
      if (defaultSyllabus) {
        setSyllabusData({
          className: defaultSyllabus.className || activeClassObj.name,
          academicYear: defaultSyllabus.academicYear,
          description: defaultSyllabus.description,
          subjects: defaultSyllabus.subjects || [],
        });
      }
    } catch (err) {
      // toast shown in service
    } finally {
      setResetting(false);
    }
  };

  // Calculations
  const totalMaxMarks = syllabusData.subjects.reduce(
    (sum, s) => sum + (Number(s.maxMarks) || 0),
    0
  );
  const totalPassMarks = syllabusData.subjects.reduce(
    (sum, s) => sum + (Number(s.passMarks) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <BookMarked size={220} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-300" /> Academic
                Curriculum Engine
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <BookOpen className="text-indigo-300" /> Class Syllabus &
              Prescribed Books
            </h3>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Configure standardized subjects, textbook names (e.g.{" "}
              <em>Our English</em>, <em>Math Magic</em>), default full marks,
              and passing standards. These seamlessly auto-populate when
              creating exams and entering results.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() =>
                navigate(
                  "/ai-mode?prompt=" +
                    encodeURIComponent(
                      `Show prescribed curriculum, books, and marks for ${activeClassObj?.name || "Class 1"}`
                    )
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-violet-600/80 hover:bg-violet-600 border border-violet-400/30 rounded-xl text-xs font-semibold text-white transition shadow-sm backdrop-blur-sm"
              title="Ask RGES AI about this curriculum and books"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Ask AI</span>
            </button>
            <button
              onClick={handleResetToStandard}
              disabled={resetting || loading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition shadow-sm backdrop-blur-sm disabled:opacity-50"
              title="Reset to recommended standard textbook curriculum"
            >
              <RotateCcw
                size={14}
                className={resetting ? "animate-spin" : ""}
              />
              {resetting ? "Resetting..." : "Reset to Standard"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-xl text-xs font-bold text-white transition shadow-lg disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save Syllabus"}
            </button>
          </div>
        </div>
      </div>

      {/* Class Selector & Quick Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Class Selection Dropdown */}
        <div className="lg:col-span-5 flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
            <GraduationCap
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />
            Select Class:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.isPassout ? "(Passout)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Summary Badges */}
        <div className="lg:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <Layers size={15} className="text-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400">
              Total Subjects:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {syllabusData.subjects.length}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <Award size={15} className="text-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">
              Max Aggregate:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {totalMaxMarks}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">
              Passing Sum:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {totalPassMarks}
            </span>
          </div>
        </div>
      </div>

      {/* Subjects & Books Configuration Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              Prescribed Curriculum — {activeClassObj.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify textbooks, subject codes, max marks, and pass marks for
              this grade.
            </p>
          </div>
          <button
            onClick={handleAddSubject}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition"
          >
            <Plus size={14} /> Add Subject
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Loading syllabus data...</p>
          </div>
        ) : syllabusData.subjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
            />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              No subjects configured for {activeClassObj.name}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Click &apos;Reset to Standard&apos; to instantly load recommended
              textbooks, or add subjects manually.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetToStandard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow"
              >
                Load Standard Curriculum
              </button>
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[160px]">Subject Name *</th>
                  <th className="py-3 px-3 min-w-[110px]">Code</th>
                  <th className="py-3 px-3 min-w-[200px]">
                    Book Name (Textbook)
                  </th>
                  <th className="py-3 px-3 min-w-[150px]">
                    Publisher / Author
                  </th>
                  <th className="py-3 px-3 w-28 text-center">Full Marks</th>
                  <th className="py-3 px-3 w-28 text-center">Pass Marks</th>
                  <th className="py-3 px-3 w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {syllabusData.subjects.map((sub, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={sub.subjectName}
                        onChange={(e) =>
                          handleSubjectChange(
                            idx,
                            "subjectName",
                            e.target.value
                          )
                        }
                        placeholder="e.g. English"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={sub.subjectCode}
                        onChange={(e) =>
                          handleSubjectChange(
                            idx,
                            "subjectCode",
                            e.target.value
                          )
                        }
                        placeholder="e.g. ENG-101"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={sub.bookName}
                        onChange={(e) =>
                          handleSubjectChange(idx, "bookName", e.target.value)
                        }
                        placeholder="e.g. Our English / Math Magic"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={sub.publisher}
                        onChange={(e) =>
                          handleSubjectChange(idx, "publisher", e.target.value)
                        }
                        placeholder="e.g. NCERT / Oxford"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={sub.maxMarks}
                        onChange={(e) =>
                          handleSubjectChange(idx, "maxMarks", e.target.value)
                        }
                        className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-center text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none mx-auto block"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={sub.passMarks}
                        onChange={(e) =>
                          handleSubjectChange(idx, "passMarks", e.target.value)
                        }
                        className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-center text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none mx-auto block"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete subject"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Info size={15} className="text-indigo-500 shrink-0" />
            <span>
              Tip: When you schedule an exam for{" "}
              <strong>{activeClassObj.name}</strong>, these subjects, textbooks,
              and marks will auto-fill.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || syllabusData.subjects.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition shadow disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Syllabus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSyllabusSettings;
