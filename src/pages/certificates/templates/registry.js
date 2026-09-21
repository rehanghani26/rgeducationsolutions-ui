/**
 * @file registry.js
 * @description Central Registry for all ID Card and Certificate Templates.
 * Provides helper functions to fetch templates by category, ID, and apply custom overrides.
 */

// Student ID Cards
import { classicStudentCard } from './idCards/student/ClassicStudent.js';
import { modernBlueStudentCard } from './idCards/student/ModernBlueStudent.js';
import { academicStudentCard } from './idCards/student/AcademicStudent.js';
import { premiumStudentCard } from './idCards/student/PremiumStudent.js';
import { verticalStudentCard } from './idCards/student/VerticalStudent.js';

// Teacher ID Cards
import { professionalFacultyCard } from './idCards/teacher/ProfessionalFaculty.js';
import { modernFacultyCard } from './idCards/teacher/ModernFaculty.js';
import { classicFacultyCard } from './idCards/teacher/ClassicFaculty.js';
import { academicFacultyCard } from './idCards/teacher/AcademicFaculty.js';
import { premiumFacultyCard } from './idCards/teacher/PremiumFaculty.js';

// Staff ID Cards
import { corporateStaffCard } from './idCards/staff/CorporateStaff.js';
import { professionalStaffCard } from './idCards/staff/ProfessionalStaff.js';
import { modernStaffCard } from './idCards/staff/ModernStaff.js';
import { minimalStaffCard } from './idCards/staff/MinimalStaff.js';
import { classicStaffCard } from './idCards/staff/ClassicStaff.js';

// Certificates
import { classicCertificate } from './certificates/ClassicCertificate.js';
import { modernCertificate } from './certificates/ModernCertificate.js';
import { academicCertificate } from './certificates/AcademicCertificate.js';
import { premiumCertificate } from './certificates/PremiumCertificate.js';
import { minimalCertificate } from './certificates/MinimalCertificate.js';

export const ALL_TEMPLATES = [
  // Student
  classicStudentCard,
  modernBlueStudentCard,
  academicStudentCard,
  premiumStudentCard,
  verticalStudentCard,

  // Faculty / Teacher
  professionalFacultyCard,
  modernFacultyCard,
  classicFacultyCard,
  academicFacultyCard,
  premiumFacultyCard,

  // Staff
  corporateStaffCard,
  professionalStaffCard,
  modernStaffCard,
  minimalStaffCard,
  classicStaffCard,

  // Certificates
  classicCertificate,
  modernCertificate,
  academicCertificate,
  premiumCertificate,
  minimalCertificate,
];

/**
 * Get templates filtered by category
 * @param {'student-id-card' | 'teacher-id-card' | 'staff-id-card' | 'certificate'} category
 */
export const getTemplatesByCategory = (category) => {
  return ALL_TEMPLATES.filter((t) => t.category === category);
};

/**
 * Find template by ID
 * @param {string} id
 */
export const getTemplateById = (id) => {
  return ALL_TEMPLATES.find((t) => t.id === id) || ALL_TEMPLATES[0];
};

/**
 * Apply custom styling configuration overrides onto a base template
 * @param {object} baseTemplate
 * @param {object} configuration
 */
export const applyTemplateOverrides = (baseTemplate, configuration = {}) => {
  if (!configuration || Object.keys(configuration).length === 0) {
    return baseTemplate;
  }

  return {
    ...baseTemplate,
    render: (data) => {
      const mergedData = {
        ...data,
        primaryColor: configuration.primaryColor || data.primaryColor,
        secondaryColor: configuration.secondaryColor || data.secondaryColor,
        fontFamily: configuration.fontFamily || data.fontFamily,
        showQRCode: configuration.showQRCode !== undefined ? configuration.showQRCode : data.showQRCode,
        showPhoto: configuration.showPhoto !== undefined ? configuration.showPhoto : data.showPhoto,
        showSignature: configuration.showSignature !== undefined ? configuration.showSignature : data.showSignature,
      };
      return baseTemplate.render(mergedData);
    },
  };
};
