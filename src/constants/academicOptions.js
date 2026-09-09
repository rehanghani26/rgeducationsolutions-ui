/**
 * @file academicOptions.js
 * @description Centralized constant options for Classes (Nursery to 12th & Passout) and Sections (Section A to G).
 */

export const CLASS_OPTIONS = [
  { id: "cls-nur", name: "Nursery", label: "Nursery", value: "Nursery" },
  { id: "cls-lkg", name: "LKG", label: "LKG", value: "LKG" },
  { id: "cls-ukg", name: "UKG", label: "UKG", value: "UKG" },
  { id: "cls-1",   name: "Class 1", label: "Class 1", value: "Class 1" },
  { id: "cls-2",   name: "Class 2", label: "Class 2", value: "Class 2" },
  { id: "cls-3",   name: "Class 3", label: "Class 3", value: "Class 3" },
  { id: "cls-4",   name: "Class 4", label: "Class 4", value: "Class 4" },
  { id: "cls-5",   name: "Class 5", label: "Class 5", value: "Class 5" },
  { id: "cls-6",   name: "Class 6", label: "Class 6", value: "Class 6" },
  { id: "cls-7",   name: "Class 7", label: "Class 7", value: "Class 7" },
  { id: "cls-8",   name: "Class 8", label: "Class 8", value: "Class 8" },
  { id: "cls-9",   name: "Class 9", label: "Class 9", value: "Class 9" },
  { id: "cls-10",  name: "Class 10", label: "Class 10", value: "Class 10" },
  { id: "cls-11",  name: "Class 11", label: "Class 11", value: "Class 11" },
  { id: "cls-12",  name: "Class 12", label: "Class 12", value: "Class 12" },
  { id: "cls-passout", name: "Passout", label: "🎓 Passout", value: "Passout", isPassout: true },
];

export const SECTION_OPTIONS = [
  { id: "sec-a", name: "Section A" },
  { id: "sec-b", name: "Section B" },
  { id: "sec-c", name: "Section C" },
  { id: "sec-d", name: "Section D" },
  { id: "sec-e", name: "Section E" },
  { id: "sec-f", name: "Section F" },
  { id: "sec-g", name: "Section G" },
];

export const STUDENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "Passout", label: "🎓 Passout / Graduated" },
];

export const CLASS_SECTION_COMBINED_OPTIONS = CLASS_OPTIONS.flatMap((cls) =>
  SECTION_OPTIONS.map((sec) => ({
    label: `${cls.name} - ${sec.name}`,
    value: `${cls.name} - ${sec.name}`,
    classId: cls.id,
    className: cls.name,
    sectionId: sec.id,
    sectionName: sec.name,
    classSectionKey: `${cls.name} - ${sec.name}`,
    key: `${cls.id}_${sec.id}`,
  }))
);

export default {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  CLASS_SECTION_COMBINED_OPTIONS,
};
