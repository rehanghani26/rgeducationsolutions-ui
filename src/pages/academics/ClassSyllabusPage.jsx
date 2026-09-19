import React from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import ClassSyllabusSettings from "../settings/ClassSyllabusSettings.jsx";

const ClassSyllabusPage = () => {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Class Syllabus & Prescribed Books"
        subtitle="Configure standardized subjects, textbook names, full marks, and pass marks for all classes."
        breadcrumbs={[
          { label: "Academics", to: "/academics" },
          { label: "Class Syllabus" },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <ClassSyllabusSettings />
      </div>
    </div>
  );
};

export default ClassSyllabusPage;
