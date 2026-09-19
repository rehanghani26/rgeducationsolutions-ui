import React, { useState } from "react";
import { BookOpen, Award, CheckCircle2 } from "lucide-react";
import ClassSyllabusSettings from "./ClassSyllabusSettings.jsx";

const AcademicSettings = ({ settings, handleChange }) => {
  const [subTab, setSubTab] = useState("syllabus"); // default directly to Class Syllabus!

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab("syllabus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "syllabus"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen size={14} /> Class Syllabus & Prescribed Books
        </button>
        <button
          type="button"
          onClick={() => setSubTab("grading")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === "grading"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Award size={14} /> General Grading Scale & Passing %
        </button>
      </div>

      {subTab === "syllabus" ? (
        <ClassSyllabusSettings />
      ) : (
        <div className="space-y-4 max-w-2xl">
          <h3 className="font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            Academic Grading Rules
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                Default Passing Percentage (%)
              </label>
              <input
                type="number"
                name="defaultPassingPercentage"
                value={settings?.defaultPassingPercentage ?? 35}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                Grade Point Scale
              </label>
              <input
                type="number"
                name="gradePointScale"
                value={settings?.gradePointScale ?? 10}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 text-sm font-bold"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                name="enableGradeDistribution"
                checked={settings?.enableGradeDistribution ?? true}
                onChange={handleChange}
                id="enableGradeDistribution"
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enableGradeDistribution"
                className="cursor-pointer select-none"
              >
                <strong className="text-xs text-slate-800 dark:text-slate-100">Enable Grade Distribution</strong>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Track and analyze grade distribution across exams and results
                </p>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSettings;
