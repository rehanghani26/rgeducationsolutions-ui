import React, { useState, useEffect } from "react";
import {
  BookOpen, Layers, School, Plus, X, GraduationCap, Search, FileText,
  Download, CheckCircle, Clock, Trash2, Edit3, User, Sparkles, Filter,
  ChevronRight, CheckSquare, Calendar
} from "lucide-react";
import erpService from "../services/erpService.js";
import curriculumService from "../services/curriculumService.js";
import { getTeachers } from "../services/teacherService.js";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/academicOptions.js";
import { mockAcademics } from "../data/mockData.js";
import Loader from "../components/ui/Loader.jsx";
import { Can, CanButton, getUserFromStorage } from "../config/access.jsx";
import { useSelector } from "react-redux";
import StudentAcademicView, { buildDynamicTimetable, ENRICHED_STUDENT_SUBJECTS } from "./academics/StudentAcademicView.jsx";
import ClassSyllabusSettings from "./settings/ClassSyllabusSettings.jsx";

const DEFAULT_COURSES = (ENRICHED_STUDENT_SUBJECTS || []).map((s) => ({
  ...s,
  _id: s.id,
  className: "Class 10",
  sectionName: "Section A",
}));

const AcademicManagement = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const currentUser = authUser || getUserFromStorage();
  const role = (currentUser?.role || '').toLowerCase().replace(/_/g, '-');
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const isPrivileged = ['super-admin', 'superadmin', 'school-admin', 'admin', 'principal', 'director'].includes(role);
  const isTeacher = ['teacher', 'head-teacher', 'hod', 'coordinator'].includes(role);
  const canManageCurriculum = isPrivileged || isTeacher;

  // Admin view toggle to preview student experience
  const [adminViewMode, setAdminViewMode] = useState('management'); // 'management' | 'student-preview'
  const [previewClass, setPreviewClass] = useState("Class 10");
  const [previewSection, setPreviewSection] = useState("Section A");

  const [activeTab, setActiveTab] = useState("curriculum"); // 'curriculum', 'classes', 'sections', 'subjects'
  const [classesList, setClassesList] = useState(mockAcademics.classes);
  const [sectionsList, setSectionsList] = useState(mockAcademics.sections);
  const [subjectsList, setSubjectsList] = useState(mockAcademics.subjects);
  const [teachersList, setTeachersList] = useState([]);
  const [curriculumsList, setCurriculumsList] = useState(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);

  // Curriculum Sub-view: "catalog" (cards) or "routine" (weekly schedule table)
  const [curriculumSubTab, setCurriculumSubTab] = useState("catalog");
  const [selectedRoutineDay, setSelectedRoutineDay] = useState("Monday");

  // Curriculum Filter States
  const [curriculumClassFilter, setCurriculumClassFilter] = useState("All");
  const [curriculumSectionFilter, setCurriculumSectionFilter] = useState("All");
  const [curriculumSearchQuery, setCurriculumSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [activeCurriculumForUnits, setActiveCurriculumForUnits] = useState(null);
  const [activeCurriculumForMaterials, setActiveCurriculumForMaterials] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Base Academic Form states
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    room: "",
    capacity: 40,
    classTeacher: "",
    classId: "",
    className: "",
    enrolled: 0,
    type: "theory",
    credits: 3,
    teacher: ""
  });

  // Curriculum & Course Form state
  const [curriculumFormData, setCurriculumFormData] = useState({
    className: currentUser?.classTeacherOf || currentUser?.className || "Class 10",
    sectionName: currentUser?.sectionName || "Section A",
    name: "",
    code: "",
    type: "theory",
    credits: 4,
    teacher: isTeacher ? (currentUser?.name || "") : "",
    teacherRole: isTeacher ? "Class Teacher" : "Subject Lecturer",
    room: "Block A - Room 101",
    schedule: "Mon, Wed, Fri (08:00 AM)",
    currentChapter: "Unit 1: Foundations",
    progress: 0,
  });

  // New Unit Form state
  const [unitFormData, setUnitFormData] = useState({
    title: "",
    status: "upcoming",
    duration: "2 weeks",
  });

  // New Material Form state
  const [materialFormData, setMaterialFormData] = useState({
    name: "",
    type: "PDF",
    size: "2.8 MB",
    url: "",
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      erpService.getClasses().catch(() => null),
      erpService.getSections().catch(() => null),
      erpService.getSubjects().catch(() => null),
      curriculumService.getAll().catch(() => null),
      getTeachers().catch(() => null),
    ])
      .then(([classesRes, sectionsRes, subjectsRes, curriculumRes, teachersRes]) => {
        if (classesRes?.data?.classes?.length > 0) {
          setClassesList(classesRes.data.classes);
        } else {
          setClassesList(mockAcademics.classes);
        }

        if (sectionsRes?.data?.sections?.length > 0) {
          setSectionsList(sectionsRes.data.sections);
        } else {
          setSectionsList(mockAcademics.sections);
        }

        if (subjectsRes?.data?.subjects?.length > 0) {
          setSubjectsList(subjectsRes.data.subjects);
        } else {
          setSubjectsList(mockAcademics.subjects);
        }

        if (curriculumRes?.curriculums?.length > 0) {
          setCurriculumsList(curriculumRes.curriculums);
        } else {
          setCurriculumsList([]);
        }

        const teacherRecords = teachersRes?.teachers || teachersRes?.data?.teachers || (Array.isArray(teachersRes?.data) ? teachersRes.data : []);
        if (teacherRecords && teacherRecords.length > 0) {
          setTeachersList(teacherRecords);
        }
      })
      .catch(() => {
        setClassesList(mockAcademics.classes);
        setSectionsList(mockAcademics.sections);
        setSubjectsList(mockAcademics.subjects);
        setCurriculumsList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setError("");
    setFormData({
      name: "",
      code: "",
      room: activeTab === "classes" ? "Room 101" : activeTab === "sections" ? "Block A - Room 101" : "",
      capacity: activeTab === "classes" ? 40 : 35,
      classTeacher: "",
      classId: classesList[0]?.id || classesList[0]?._id || "",
      className: classesList[0]?.name || "Class 10",
      enrolled: 0,
      type: "theory",
      credits: 3,
      teacher: ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      if (activeTab === "classes") {
        const payload = {
          name: formData.name,
          code: formData.code,
          room: formData.room,
          capacity: Number(formData.capacity) || 40,
          classTeacher: formData.classTeacher
        };
        const res = await erpService.createClass(payload);
        const newClass = res?.data?.class || payload;
        setClassesList((prev) => [newClass, ...prev]);
        setSuccessMsg("Class level created successfully!");
      } else if (activeTab === "sections") {
        const payload = {
          name: formData.name,
          classId: formData.classId,
          className: formData.className,
          room: formData.room,
          capacity: Number(formData.capacity) || 35,
          enrolled: Number(formData.enrolled) || 0,
          classTeacher: formData.classTeacher
        };
        const res = await erpService.createSection(payload);
        const newSec = res?.data?.section || payload;
        setSectionsList((prev) => [newSec, ...prev]);
        setSuccessMsg("Section created successfully!");
      } else if (activeTab === "subjects") {
        const payload = {
          name: formData.name,
          code: formData.code,
          type: formData.type,
          credits: Number(formData.credits) || 3,
          teacher: formData.teacher
        };
        const res = await erpService.createSubject(payload);
        const newSub = res?.data?.subject || payload;
        setSubjectsList((prev) => [newSub, ...prev]);
        setSuccessMsg("Course subject created successfully!");
      }

      closeModal();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create record.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Curriculum Handlers ───────────────────────────────────────────────────
  const handleOpenAssignCurriculum = (curriculum = null) => {
    setError("");
    if (curriculum) {
      setEditingCurriculum(curriculum);
      setCurriculumFormData({
        className: curriculum.className || "Class 10",
        sectionName: curriculum.sectionName || "All Sections",
        name: curriculum.name || "",
        code: curriculum.code || "",
        type: curriculum.type || "theory",
        credits: curriculum.credits || 4,
        teacher: curriculum.teacher || "",
        teacherRole: curriculum.teacherRole || "Subject Lecturer",
        room: curriculum.room || "Room 101",
        schedule: curriculum.schedule || "Mon, Wed, Fri (08:00 AM)",
        currentChapter: curriculum.currentChapter || "Unit 1: Foundations",
        progress: curriculum.progress || 0,
      });
    } else {
      setEditingCurriculum(null);
      setCurriculumFormData({
        className: currentUser?.classTeacherOf || currentUser?.className || classesList[0]?.name || "Class 10",
        sectionName: currentUser?.sectionName || "Section A",
        name: "",
        code: "",
        type: "theory",
        credits: 4,
        teacher: isTeacher ? (currentUser?.name || "") : "",
        teacherRole: isTeacher ? "Class Teacher" : "Subject Lecturer",
        room: "Block A - Room 101",
        schedule: "Mon, Wed, Fri (08:00 AM)",
        currentChapter: "Unit 1: Foundations",
        progress: 0,
      });
    }
    setIsCurriculumModalOpen(true);
  };

  const handleCloseCurriculumModal = () => {
    setIsCurriculumModalOpen(false);
    setEditingCurriculum(null);
    setError("");
  };

  const handleCurriculumInputChange = (e) => {
    const { name, value } = e.target;
    setCurriculumFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurriculumSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      if (editingCurriculum) {
        const id = editingCurriculum._id || editingCurriculum.id;
        const res = await curriculumService.update(id, curriculumFormData);
        const updated = res.curriculum || { ...editingCurriculum, ...curriculumFormData };
        setCurriculumsList((prev) =>
          prev.map((c) => ((c._id || c.id) === id ? updated : c))
        );
        setSuccessMsg("Curriculum course updated successfully!");
      } else {
        const res = await curriculumService.create(curriculumFormData);
        const newRecord = res.curriculum || { ...curriculumFormData, id: Date.now() };
        setCurriculumsList((prev) => [newRecord, ...prev]);
        setSuccessMsg("Curriculum course assigned successfully!");
      }
      handleCloseCurriculumModal();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save curriculum course.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurriculum = async (curriculum) => {
    const id = curriculum._id || curriculum.id;
    if (!window.confirm(`Are you sure you want to remove the course "${curriculum.name}" (${curriculum.code}) from ${curriculum.className}?`)) {
      return;
    }
    try {
      await curriculumService.delete(id);
      setCurriculumsList((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setSuccessMsg("Curriculum course deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete curriculum course.");
    }
  };

  // Unit Management
  const handleOpenUnitsModal = (curriculum) => {
    setActiveCurriculumForUnits(curriculum);
    setUnitFormData({ title: "", status: "upcoming", duration: "2 weeks" });
    setIsUnitsModalOpen(true);
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!activeCurriculumForUnits || !unitFormData.title.trim()) return;
    setSubmitting(true);
    try {
      const id = activeCurriculumForUnits._id || activeCurriculumForUnits.id;
      const res = await curriculumService.addUnit(id, unitFormData);
      const updatedCurriculum = res.curriculum || {
        ...activeCurriculumForUnits,
        units: [...(activeCurriculumForUnits.units || []), { ...unitFormData, id: Date.now() }],
      };
      setActiveCurriculumForUnits(updatedCurriculum);
      setCurriculumsList((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? updatedCurriculum : c))
      );
      setUnitFormData({ title: "", status: "upcoming", duration: "2 weeks" });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add syllabus unit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUnitStatus = async (unitIndex) => {
    if (!activeCurriculumForUnits) return;
    const units = [...(activeCurriculumForUnits.units || [])];
    const unit = units[unitIndex];
    if (!unit) return;

    // Cycle: upcoming -> in-progress -> completed -> upcoming
    const nextStatus =
      unit.status === "upcoming"
        ? "in-progress"
        : unit.status === "in-progress"
        ? "completed"
        : "upcoming";
    units[unitIndex] = { ...unit, status: nextStatus };

    const completedCount = units.filter((u) => u.status === "completed").length;
    const progress = units.length > 0 ? Math.round((completedCount / units.length) * 100) : 0;

    const id = activeCurriculumForUnits._id || activeCurriculumForUnits.id;
    try {
      const res = await curriculumService.update(id, { units, progress });
      const updated = res.curriculum || { ...activeCurriculumForUnits, units, progress };
      setActiveCurriculumForUnits(updated);
      setCurriculumsList((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? updated : c))
      );
    } catch (err) {
      console.error("Failed to toggle unit status:", err);
    }
  };

  const handleDeleteUnit = async (unitIndex) => {
    if (!activeCurriculumForUnits) return;
    const units = [...(activeCurriculumForUnits.units || [])];
    units.splice(unitIndex, 1);
    const completedCount = units.filter((u) => u.status === "completed").length;
    const progress = units.length > 0 ? Math.round((completedCount / units.length) * 100) : 0;
    const id = activeCurriculumForUnits._id || activeCurriculumForUnits.id;
    try {
      const res = await curriculumService.update(id, { units, progress });
      const updated = res.curriculum || { ...activeCurriculumForUnits, units, progress };
      setActiveCurriculumForUnits(updated);
      setCurriculumsList((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? updated : c))
      );
    } catch (err) {
      console.error("Failed to delete unit:", err);
    }
  };

  // Study Materials Management
  const handleOpenMaterialModal = (curriculum) => {
    setActiveCurriculumForMaterials(curriculum);
    setMaterialFormData({ name: "", type: "PDF", size: "2.8 MB", url: "" });
    setIsMaterialModalOpen(true);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!activeCurriculumForMaterials || !materialFormData.name.trim()) return;
    setSubmitting(true);
    try {
      const id = activeCurriculumForMaterials._id || activeCurriculumForMaterials.id;
      const res = await curriculumService.addMaterial(id, materialFormData);
      const updatedCurriculum = res.curriculum || {
        ...activeCurriculumForMaterials,
        materials: [...(activeCurriculumForMaterials.materials || []), { ...materialFormData, id: Date.now() }],
      };
      setActiveCurriculumForMaterials(updatedCurriculum);
      setCurriculumsList((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? updatedCurriculum : c))
      );
      setMaterialFormData({ name: "", type: "PDF", size: "2.8 MB", url: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add study material.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialIndex) => {
    if (!activeCurriculumForMaterials) return;
    const materials = [...(activeCurriculumForMaterials.materials || [])];
    materials.splice(materialIndex, 1);
    const id = activeCurriculumForMaterials._id || activeCurriculumForMaterials.id;
    try {
      const res = await curriculumService.update(id, { materials });
      const updated = res.curriculum || { ...activeCurriculumForMaterials, materials };
      setActiveCurriculumForMaterials(updated);
      setCurriculumsList((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? updated : c))
      );
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  // Filtered Curriculums
  const filteredCurriculums = curriculumsList.filter((c) => {
    const matchesClass =
      curriculumClassFilter === "All" ||
      (c.className && c.className.toLowerCase() === curriculumClassFilter.toLowerCase()) ||
      (c.className && c.className.toLowerCase().includes(curriculumClassFilter.toLowerCase()));
    const matchesSection =
      curriculumSectionFilter === "All" ||
      (c.sectionName && (c.sectionName === "All Sections" || c.sectionName.toLowerCase() === curriculumSectionFilter.toLowerCase()));
    const matchesSearch =
      !curriculumSearchQuery ||
      c.name?.toLowerCase().includes(curriculumSearchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(curriculumSearchQuery.toLowerCase()) ||
      c.teacher?.toLowerCase().includes(curriculumSearchQuery.toLowerCase());

    return matchesClass && matchesSection && matchesSearch;
  });

  // If user is a student or parent, directly render their tailored StudentAcademicView
  if (isStudent || isParent) {
    return <StudentAcademicView currentUser={currentUser} />;
  }

  // If administrator is in student preview mode
  if (adminViewMode === 'student-preview') {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-indigo-700/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-xl shadow-inner">👁️</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-sm text-white">Administrator Live Student Hub Preview</p>
                <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  Real-time Simulation
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-normal mt-0.5">
                Switch class and section below to inspect the dynamic academic portal, weekly timetable, syllabus units, and study materials as seen by students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch lg:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-indigo-200 font-semibold">Class:</span>
              <select
                value={previewClass}
                onChange={(e) => setPreviewClass(e.target.value)}
                className="bg-transparent font-extrabold text-white focus:outline-none cursor-pointer"
              >
                {classesList.map((c) => (
                  <option key={c.id || c._id || c.name} value={c.name} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-indigo-200 font-semibold">Section:</span>
              <select
                value={previewSection}
                onChange={(e) => setPreviewSection(e.target.value)}
                className="bg-transparent font-extrabold text-white focus:outline-none cursor-pointer"
              >
                {SECTION_OPTIONS.map((sec) => (
                  <option key={sec.id} value={sec.name} className="bg-slate-900 text-white">
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setAdminViewMode('management')}
              className="px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-extrabold transition-all shadow-md shrink-0 ml-auto lg:ml-0"
            >
              ← Return to Management
            </button>
          </div>
        </div>

        <StudentAcademicView
          currentUser={{
            ...currentUser,
            className: previewClass,
            sectionName: previewSection,
            name: `Preview Student (${previewClass} · ${previewSection})`
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Academic Structures
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure class levels, sections catalogs, and course subject allocations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setAdminViewMode('student-preview')}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all text-xs"
            title="Preview how students and parents view Academics"
          >
            <GraduationCap size={15} className="text-indigo-500" />
            <span>Student View Preview</span>
          </button>

          {activeTab !== "syllabus" && (
            <Can module="academics" action="create">
              {activeTab === "curriculum" ? (
                <CanButton id="ASSIGN_CURRICULUM">
                  <button
                    onClick={() => handleOpenAssignCurriculum()}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all duration-150 text-xs"
                  >
                    <Plus size={16} />
                    <span>Assign Curriculum & Course</span>
                  </button>
                </CanButton>
              ) : (
                <CanButton id={activeTab === "classes" ? "CREATE_CLASS" : activeTab === "sections" ? "CREATE_SECTION" : "CREATE_SUBJECT"}>
                  <button
                    onClick={openModal}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all duration-150 text-xs"
                  >
                    <Plus size={16} />
                    <span>
                      Add {activeTab === "classes" ? "Class Level" : activeTab === "sections" ? "Section" : "Subject"}
                    </span>
                  </button>
                </CanButton>
              )}
            </Can>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab select buttons */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-bold gap-1 shadow-sm w-full max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("classes")}
          className={`flex-1 py-2 px-3 rounded-lg capitalize flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "classes"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <School size={14} /> Classes
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex-1 py-2 px-3 rounded-lg capitalize flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "sections"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Layers size={14} /> Sections
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex-1 py-2 px-3 rounded-lg capitalize flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "subjects"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen size={14} /> Subjects
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex-1 py-2 px-3 rounded-lg capitalize flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "curriculum"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <GraduationCap size={14} /> Curriculum & Courses
        </button>
        <button
          onClick={() => setActiveTab("syllabus")}
          className={`flex-1 py-2 px-3 rounded-lg capitalize flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === "syllabus"
              ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
              : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          }`}
        >
          <BookOpen size={14} /> Class Syllabus & Books
        </button>
      </div>

      {/* Main card box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <Loader fullPage size="lg" text="Fetching academic structures from server..." />
        ) : (
          <div className="overflow-x-auto text-xs">
            {activeTab === "classes" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Class Level Name</th>
                    <th className="pb-3">Registry Code</th>
                    <th className="pb-3">Allocated Lecture Room</th>
                    <th className="pb-3">Total Students / Capacity</th>
                    <th className="pb-3">Class Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classesList.map((cls) => (
                    <tr
                      key={cls.id || cls._id || cls.code}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span className="text-lg">🏫</span>
                        <span>{cls.name}</span>
                      </td>
                      <td className="py-4 font-semibold text-indigo-500 dark:text-indigo-400">
                        {cls.code}
                      </td>
                      <td className="py-4 text-slate-500 font-medium">
                        {cls.room || "Room N/A"}
                      </td>
                      <td className="py-4 font-bold text-slate-700 dark:text-slate-300">
                        {cls.totalStudents || cls.capacity || "40"}
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-400 font-semibold">
                        {cls.classTeacher || "Sheikh Abdullah Al-Hafiz"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "sections" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Section Name</th>
                    <th className="pb-3">Linked Class Level</th>
                    <th className="pb-3">Lecture Room</th>
                    <th className="pb-3">Enrolled / Capacity</th>
                    <th className="pb-3">Assigned Class Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sectionsList.map((sec) => (
                    <tr
                      key={sec.id || sec._id || sec.name}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span className="text-lg">🧬</span>
                        <span>{sec.name}</span>
                      </td>
                      <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {sec.classId?.name || sec.className || "Grade 10"}
                      </td>
                      <td className="py-4 text-slate-500 font-medium">
                        {sec.room || "Block A - Room 201"}
                      </td>
                      <td className="py-4 font-bold text-indigo-500">
                        {sec.enrolled || 0} / {sec.capacity || 35}
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-400 font-semibold">
                        {sec.classTeacher ||
                          sec.classTeacherId ||
                          "Sheikh Abdullah Al-Hafiz"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "subjects" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Course Subject</th>
                    <th className="pb-3">Registry Code</th>
                    <th className="pb-3">Course Category</th>
                    <th className="pb-3">Academic Credits</th>
                    <th className="pb-3">Assigned Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjectsList.map((sub) => (
                    <tr
                      key={sub.id || sub._id || sub.code}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span className="text-lg">📚</span>
                        <span>{sub.name}</span>
                      </td>
                      <td className="py-4 font-semibold text-indigo-500">
                        {sub.code}
                      </td>
                      <td className="py-4 capitalize">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sub.type === "theory"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {sub.type}
                        </span>
                      </td>
                      <td className="py-4 font-extrabold text-slate-700 dark:text-slate-300">
                        {sub.credits} Credits
                      </td>
                      <td className="py-4 font-semibold text-slate-600 dark:text-slate-400">
                        {sub.teacher || "Sheikh Abdullah Al-Hafiz"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "curriculum" && (() => {
              const totalCoursesCount = filteredCurriculums.length;
              const totalUnitsTracked = filteredCurriculums.reduce((sum, c) => sum + (c.units?.length || 0), 0);
              const totalMaterialsTracked = filteredCurriculums.reduce((sum, c) => sum + (c.materials?.length || 0), 0);
              const avgCoverage = totalCoursesCount > 0
                ? Math.round(filteredCurriculums.reduce((sum, c) => {
                    const units = c.units || [];
                    const completed = units.filter((u) => u.status === 'completed').length;
                    const prog = c.progress !== undefined && c.progress !== null ? c.progress : (units.length > 0 ? Math.round((completed / units.length) * 100) : 0);
                    return sum + prog;
                  }, 0) / totalCoursesCount)
                : 0;

              const dynamicTimetable = buildDynamicTimetable(filteredCurriculums);
              const currentRoutineSlots = dynamicTimetable[selectedRoutineDay] || [];

              return (
                <div className="space-y-5">
                  {/* KPI Analytics Strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-base shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                          {totalCoursesCount}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Courses Allocated</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-base shrink-0">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                          {totalUnitsTracked}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Syllabus Units Tracked</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                          {totalMaterialsTracked}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Study Docs Attached</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-base shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                          {avgCoverage}%
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Avg Syllabus Coverage</p>
                      </div>
                    </div>
                  </div>

                  {/* Filter, Sub-view Toggle & Search Bar */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Sub-view switcher */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
                        <button
                          onClick={() => setCurriculumSubTab("catalog")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            curriculumSubTab === "catalog"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <BookOpen size={13} />
                          <span>Course Catalog</span>
                        </button>
                        <button
                          onClick={() => setCurriculumSubTab("routine")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            curriculumSubTab === "routine"
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Calendar size={13} />
                          <span>Weekly Class Routine</span>
                        </button>
                      </div>

                      {/* Class Filter */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                        <Filter size={13} className="text-slate-400" />
                        <span className="text-slate-400 font-medium">Class:</span>
                        <select
                          value={curriculumClassFilter}
                          onChange={(e) => setCurriculumClassFilter(e.target.value)}
                          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Classes</option>
                          {classesList.map((c) => (
                            <option key={c.id || c._id || c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Section Filter */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                        <span className="text-slate-400 font-medium">Section:</span>
                        <select
                          value={curriculumSectionFilter}
                          onChange={(e) => setCurriculumSectionFilter(e.target.value)}
                          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Sections</option>
                          {SECTION_OPTIONS.map((sec) => (
                            <option key={sec.id} value={sec.name}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Search Input */}
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs w-full xl:w-64">
                      <Search size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={curriculumSearchQuery}
                        onChange={(e) => setCurriculumSearchQuery(e.target.value)}
                        placeholder="Search course, code, teacher..."
                        className="bg-transparent w-full text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                      />
                      {curriculumSearchQuery && (
                        <button onClick={() => setCurriculumSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* View 1: Dynamic Weekly Routine Table */}
                  {curriculumSubTab === "routine" ? (
                    <div className="space-y-4">
                      {/* Day Selector Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedRoutineDay(day)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                              selectedRoutineDay === day
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      {/* Routine Table */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        {currentRoutineSlots.length === 0 ? (
                          <div className="text-center py-10 px-4">
                            <Calendar size={36} className="mx-auto text-slate-400 mb-2 opacity-60" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Routine Slots Configured for {selectedRoutineDay}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Assign courses with a lecture schedule (e.g. "Mon, Wed, Fri (08:00 AM)") to populate this routine.</p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                <th className="py-3 px-4">Period</th>
                                <th className="py-3 px-4">Scheduled Timing</th>
                                <th className="py-3 px-4">Course / Activity</th>
                                <th className="py-3 px-4">Course Code</th>
                                <th className="py-3 px-4">Lecture Room</th>
                                <th className="py-3 px-4">Assigned Faculty</th>
                                <th className="py-3 px-4">Category</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                              {currentRoutineSlots.map((slot, sIdx) => {
                                if (slot.isBreak) {
                                  return (
                                    <tr key={sIdx} className="bg-amber-500/5 text-amber-700 dark:text-amber-400 font-semibold">
                                      <td className="py-2.5 px-4 font-bold">—</td>
                                      <td className="py-2.5 px-4 font-mono text-[11px]">{slot.time}</td>
                                      <td colSpan={5} className="py-2.5 px-4 font-bold text-xs flex items-center gap-2">
                                        <span>☕</span>
                                        <span>{slot.subject}</span>
                                      </td>
                                    </tr>
                                  );
                                }
                                return (
                                  <tr key={sIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                                    <td className="py-3 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                                      Period {slot.period}
                                    </td>
                                    <td className="py-3 px-4 font-semibold font-mono text-slate-600 dark:text-slate-300">
                                      {slot.time}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                      {slot.subject}
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-indigo-500">
                                      {slot.code}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                      {slot.room}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                                      {slot.teacher}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                        slot.type === 'Lab'
                                          ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                                          : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                                      }`}>
                                        {slot.type}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* View 2: Course Catalog Cards */
                    filteredCurriculums.length === 0 ? (
                      <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <GraduationCap size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Academic Curriculum Courses Found</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          No courses assigned for this class or filter criteria. Administrators and Class Teachers can assign new curriculum courses.
                        </p>
                        {canManageCurriculum && (
                          <button
                            onClick={() => handleOpenAssignCurriculum()}
                            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            + Assign First Curriculum Course
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredCurriculums.map((cur) => {
                          const units = cur.units || [];
                          const completedUnits = units.filter((u) => u.status === "completed").length;
                          const progress =
                            cur.progress !== undefined && cur.progress !== null
                              ? cur.progress
                              : units.length > 0
                              ? Math.round((completedUnits / units.length) * 100)
                              : 0;

                          return (
                            <div
                              key={cur._id || cur.id}
                              className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                        cur.type === "practical"
                                          ? "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20"
                                          : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                                      }`}
                                    >
                                      {cur.type || "theory"}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                      {cur.code}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30">
                                      {cur.className} · {cur.sectionName || "All Sections"}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                                    {cur.name}
                                  </h3>
                                </div>

                                {/* Credits badge */}
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                                  {cur.credits || 4} Credits
                                </span>
                              </div>

                              {/* Faculty & Schedule Meta */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Faculty</p>
                                  <p className="font-bold flex items-center gap-1.5">
                                    <User size={13} className="text-indigo-500 shrink-0" />
                                    <span className="truncate">{cur.teacher || "Unassigned"}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400">{cur.teacherRole || "Faculty Lecturer"}</p>
                                </div>

                                <div className="space-y-0.5">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lecture & Room</p>
                                  <p className="font-bold flex items-center gap-1.5">
                                    <Clock size={13} className="text-amber-500 shrink-0" />
                                    <span className="truncate">{cur.schedule || "Mon, Wed, Fri"}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <School size={11} /> {cur.room || "Room 101"}
                                  </p>
                                </div>
                              </div>

                              {/* Syllabus Progress Strip */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Syllabus Progress</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {completedUnits} / {units.length} Units ({progress}%)
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                {cur.currentChapter && (
                                  <p className="text-[11px] text-slate-400 truncate">
                                    📖 Current Topic: <span className="text-slate-600 dark:text-slate-300 font-semibold">{cur.currentChapter}</span>
                                  </p>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenUnitsModal(cur)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
                                    title="Manage Syllabus Units"
                                  >
                                    <CheckSquare size={13} />
                                    <span>Units ({units.length})</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenMaterialModal(cur)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                                    title="Attach Study Materials"
                                  >
                                    <FileText size={13} />
                                    <span>Materials ({(cur.materials || []).length})</span>
                                  </button>
                                </div>

                                {canManageCurriculum && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenAssignCurriculum(cur)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                                      title="Edit Course Details"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    {isPrivileged && (
                                      <button
                                        onClick={() => handleDeleteCurriculum(cur)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                        title="Delete Course"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              );
            })()}

            {activeTab === "syllabus" && (
              <div className="pt-2">
                <ClassSyllabusSettings />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Base Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-5 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeTab === "classes" && <School size={18} className="text-indigo-600" />}
                {activeTab === "sections" && <Layers size={18} className="text-indigo-600" />}
                {activeTab === "subjects" && <BookOpen size={18} className="text-indigo-600" />}
                <span>
                  Add New {activeTab === "classes" ? "Class Level" : activeTab === "sections" ? "Section Catalog" : "Course Subject"}
                </span>
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {activeTab === "classes" && (
                <>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      Class Level Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Class 12 or Grade 12"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Registry Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        required
                        placeholder="e.g. C12"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Student Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Allocated Room
                      </label>
                      <input
                        type="text"
                        name="room"
                        placeholder="e.g. Room 101"
                        value={formData.room}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Class Teacher
                      </label>
                      <input
                        type="text"
                        name="classTeacher"
                        placeholder="e.g. Sheikh Abdullah"
                        value={formData.classTeacher}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "sections" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Section C"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Linked Class Level *
                      </label>
                      <select
                        name="className"
                        value={formData.className}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = classesList.find((c) => c.name === val);
                          setFormData((prev) => ({
                            ...prev,
                            className: val,
                            classId: found?.id || found?._id || ""
                          }));
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {classesList.map((c) => (
                          <option key={c.id || c._id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Section Room
                      </label>
                      <input
                        type="text"
                        name="room"
                        placeholder="e.g. Block A - Room 102"
                        value={formData.room}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Section Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      Assigned Class Teacher
                    </label>
                    <input
                      type="text"
                      name="classTeacher"
                      placeholder="e.g. Fatima Az-Zahra"
                      value={formData.classTeacher}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeTab === "subjects" && (
                <>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      Subject Title *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Advanced Physics & Mechanics"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        required
                        placeholder="e.g. PHY-201"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Category
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="theory">Theory</option>
                        <option value="practical">Practical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Academic Credits
                      </label>
                      <input
                        type="number"
                        name="credits"
                        min="1"
                        max="10"
                        value={formData.credits}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                        Assigned Teacher
                      </label>
                      <input
                        type="text"
                        name="teacher"
                        placeholder="e.g. Dr. Minerva McGonagall"
                        value={formData.teacher}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader size="sm" />}
                  <span>{submitting ? "Saving..." : "Create Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ASSIGN / EDIT CURRICULUM & COURSE ────────────────────── */}
      {isCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-xl w-full space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap size={20} className="text-indigo-600" />
                <span>
                  {editingCurriculum ? "Edit Academic Course & Curriculum" : "Assign Academic Curriculum & Course"}
                </span>
              </h3>
              <button
                onClick={handleCloseCurriculumModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCurriculumSubmit} className="space-y-4 text-xs font-medium">
              {/* Target Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Target Class Level *
                  </label>
                  <select
                    name="className"
                    required
                    value={curriculumFormData.className}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classesList.map((c) => (
                      <option key={c.id || c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Section Allocation *
                  </label>
                  <select
                    name="sectionName"
                    value={curriculumFormData.sectionName}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All Sections">All Sections</option>
                    {SECTION_OPTIONS.map((sec) => (
                      <option key={sec.id} value={sec.name}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Name & Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Course / Subject Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Mathematics & Geometry"
                    value={curriculumFormData.name}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. MTH-103"
                    value={curriculumFormData.code}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
              </div>

              {/* Type & Credits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Course Type
                  </label>
                  <select
                    name="type"
                    value={curriculumFormData.type}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical / Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    name="credits"
                    min="1"
                    max="10"
                    value={curriculumFormData.credits}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Teacher & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Assigned Teacher / Faculty
                  </label>
                  <input
                    type="text"
                    name="teacher"
                    list="registered-teachers-list"
                    placeholder="e.g. Dr. Bilal Siddiqui (or pick from list)"
                    value={curriculumFormData.teacher}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="registered-teachers-list">
                    {teachersList.map((t, idx) => (
                      <option
                        key={t.id || t._id || idx}
                        value={t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()}
                      >
                        {t.designation || t.department || ''}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Faculty Role / Title
                  </label>
                  <input
                    type="text"
                    name="teacherRole"
                    placeholder="e.g. Senior Mathematics Faculty"
                    value={curriculumFormData.teacherRole}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Room & Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Allocated Lecture Room / Lab
                  </label>
                  <input
                    type="text"
                    name="room"
                    placeholder="e.g. Block A - Room 101"
                    value={curriculumFormData.room}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Lecture Routine Schedule
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    placeholder="e.g. Mon, Wed, Fri (08:00 AM)"
                    value={curriculumFormData.schedule}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Current Chapter & Progress */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Current Syllabus Topic / Chapter
                  </label>
                  <input
                    type="text"
                    name="currentChapter"
                    placeholder="e.g. Unit 4: Quadratic Equations"
                    value={curriculumFormData.currentChapter}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    value={curriculumFormData.progress}
                    onChange={handleCurriculumInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseCurriculumModal}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader size="sm" />}
                  <span>{editingCurriculum ? "Save Changes" : "Assign Course"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: MANAGE SYLLABUS UNITS ───────────────────────────────── */}
      {isUnitsModalOpen && activeCurriculumForUnits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-5 relative max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare size={18} className="text-indigo-600" />
                  <span>Syllabus Units Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeCurriculumForUnits.name} ({activeCurriculumForUnits.code}) • {activeCurriculumForUnits.className}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsUnitsModalOpen(false);
                  setActiveCurriculumForUnits(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Units List */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Units (Click status badge to toggle progress)
              </p>
              {(!activeCurriculumForUnits.units || activeCurriculumForUnits.units.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No units created yet for this course.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeCurriculumForUnits.units.map((unit, idx) => (
                    <div
                      key={unit.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                        <button
                          type="button"
                          onClick={() => handleToggleUnitStatus(idx)}
                          className="shrink-0 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Click to toggle status (upcoming / in-progress / completed)"
                        >
                          {unit.status === "completed" ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : unit.status === "in-progress" ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-500" />
                          )}
                        </button>
                        <span className={`font-semibold truncate ${unit.status === "completed" ? "text-slate-700 dark:text-slate-300" : unit.status === "in-progress" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400"}`}>
                          {unit.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">{unit.duration || "2 weeks"}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            unit.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : unit.status === "in-progress"
                              ? "bg-indigo-500/10 text-indigo-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {unit.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Unit Form */}
            <form onSubmit={handleAddUnit} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                + Add New Syllabus Unit
              </p>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Unit Title (e.g. Unit 5: Chemical Equilibrium)"
                  value={unitFormData.title}
                  onChange={(e) => setUnitFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={unitFormData.status}
                    onChange={(e) => setUnitFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2 weeks)"
                    value={unitFormData.duration}
                    onChange={(e) => setUnitFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "+ Add Unit to Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: ATTACH STUDY MATERIAL ───────────────────────────────── */}
      {isMaterialModalOpen && activeCurriculumForMaterials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-5 relative max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Course Study Resources</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeCurriculumForMaterials.name} • {activeCurriculumForMaterials.className}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMaterialModalOpen(false);
                  setActiveCurriculumForMaterials(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Existing Materials List */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Attached Documents & Handouts
              </p>
              {(!activeCurriculumForMaterials.materials || activeCurriculumForMaterials.materials.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No study materials attached yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCurriculumForMaterials.materials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-mono text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">
                          {mat.type}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {mat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">{mat.size || "2.5 MB"}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          title="Delete Material"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Material Form */}
            <form onSubmit={handleAddMaterial} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                + Attach New Resource / Handout
              </p>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Comprehensive Solved Question Bank"
                  value={materialFormData.name}
                  onChange={(e) => setMaterialFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Format / Type
                  </label>
                  <select
                    value={materialFormData.type}
                    onChange={(e) => setMaterialFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PPTX">PowerPoint Slides (PPTX)</option>
                    <option value="DOCX">Word Document (DOCX)</option>
                    <option value="ZIP">Archive (ZIP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                    Estimated File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4.2 MB"
                    value={materialFormData.size}
                    onChange={(e) => setMaterialFormData((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Document URL / Resource Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://... or leave empty"
                  value={materialFormData.url}
                  onChange={(e) => setMaterialFormData((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? "Attaching..." : "+ Attach Resource to Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicManagement;
