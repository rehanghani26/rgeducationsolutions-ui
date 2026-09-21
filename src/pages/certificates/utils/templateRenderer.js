/**
 * @file templateRenderer.js
 * @description Master data preparation & template rendering utility.
 * Merges school branding, recipient models, custom configurations, and certificate metadata
 * into a single unified context object for template execution.
 */

import { getVerificationUrl } from './qrUtils.js';

/**
 * Format a raw Date or string to display format (e.g. 15 Aug 2026)
 * @param {string|Date} dateStr
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Normalizes any recipient model (Student, Teacher, Staff, User, or IssuedCertificate snapshot)
 * into a unified shape expected by templates.
 * @param {object} recipient - Raw recipient object or certificate record
 * @param {string} recipientType - 'student' | 'teacher' | 'staff'
 * @param {object} schoolSettings - School branding from SchoolBrandingContext or /erp/settings
 * @param {object} extraMeta - Additional metadata (cert number, token, date, etc.)
 */
export function prepareTemplateData(recipient = {}, recipientType = 'student', schoolSettings = {}, extraMeta = {}) {
  // If recipient is already an IssuedCertificate record with snapshots:
  if (recipient.recipientNameSnapshot) {
    const extra = recipient.additionalSnapshot || {};
    return {
      // School Info
      schoolName: schoolSettings.schoolName || schoolSettings.name || 'RGES International Academy',
      schoolLogo: schoolSettings.logo || schoolSettings.schoolLogo || '',
      schoolAddress: schoolSettings.address || schoolSettings.schoolAddress || '',
      schoolPhone: schoolSettings.phone || schoolSettings.schoolPhone || '',
      schoolEmail: schoolSettings.email || schoolSettings.schoolEmail || '',
      schoolWebsite: schoolSettings.website || schoolSettings.schoolWebsite || '',
      schoolMotto: schoolSettings.motto || schoolSettings.schoolMotto || 'Excellence in Education',
      principalName: schoolSettings.principalName || 'Principal',

      // Recipient info from snapshot
      name: recipient.recipientNameSnapshot,
      admissionNumber: recipient.recipientIdSnapshot,
      employeeId: recipient.recipientIdSnapshot,
      class: extra.class || extra.className || '',
      section: extra.section || '',
      rollNumber: extra.rollNumber || '',
      dob: formatDisplayDate(extra.dob),
      bloodGroup: extra.bloodGroup || '',
      gender: extra.gender || '',
      parentName: extra.parentName || '',
      designation: extra.designation || '',
      department: extra.department || '',
      subjectsAssigned: extra.subjectsAssigned || [],
      joiningDate: formatDisplayDate(extra.joiningDate),
      photo: extra.photo || '',

      // Certificate specifics
      certificateNumber: recipient.certificateNumber,
      certificateType: recipient.certificateType,
      academicSession: recipient.academicSession || extra.academicYear || '',
      issueDate: formatDisplayDate(recipient.issuedAt || new Date()),
      verificationToken: recipient.verificationToken || '',
      verificationUrl: getVerificationUrl(recipient.verificationToken),
      status: recipient.status || 'VALID',
      purposeNote: recipient.purposeNote || '',

      ...extraMeta,
    };
  }

  // Otherwise, normalize live recipient model
  const name = recipient.name || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'Name';
  const admissionNumber = recipient.admissionNumber || recipient.studentId || '';
  const employeeId = recipient.employeeId || '';
  const className = recipient.class?.name || recipient.class || recipient.className || '';
  const section = recipient.section?.name || recipient.section || '';

  return {
    // School branding
    schoolName: schoolSettings.schoolName || schoolSettings.name || 'RGES International Academy',
    schoolLogo: schoolSettings.logo || schoolSettings.schoolLogo || '',
    schoolAddress: schoolSettings.address || schoolSettings.schoolAddress || '',
    schoolPhone: schoolSettings.phone || schoolSettings.schoolPhone || '',
    schoolEmail: schoolSettings.email || schoolSettings.schoolEmail || '',
    schoolWebsite: schoolSettings.website || schoolSettings.schoolWebsite || '',
    schoolMotto: schoolSettings.motto || schoolSettings.schoolMotto || 'Excellence in Education',
    principalName: schoolSettings.principalName || 'Principal',

    // Recipient profile
    name,
    admissionNumber,
    employeeId,
    class: className,
    section,
    rollNumber: recipient.rollNumber || '',
    dob: formatDisplayDate(recipient.dob),
    bloodGroup: recipient.bloodGroup || '',
    gender: recipient.gender || '',
    parentName: recipient.parentName || (recipient.parents?.[0]?.name) || '',
    designation: recipient.designation || (recipientType === 'teacher' ? 'Faculty Member' : 'Staff Member'),
    department: recipient.department || '',
    subjectsAssigned: recipient.subjectsAssigned || [],
    joiningDate: formatDisplayDate(recipient.joiningDate),
    academicYear: recipient.academicYear || '2025-2026',
    photo: recipient.photo || recipient.profilePhoto || '',

    // Certificate metadata
    certificateNumber: extraMeta.certificateNumber || 'DRAFT-PREVIEW',
    certificateType: extraMeta.certificateType || 'BONAFIDE',
    academicSession: extraMeta.academicSession || recipient.academicYear || '2025-2026',
    issueDate: extraMeta.issueDate || formatDisplayDate(new Date()),
    verificationToken: extraMeta.verificationToken || '',
    verificationUrl: getVerificationUrl(extraMeta.verificationToken),
    purposeNote: extraMeta.purposeNote || '',
    status: extraMeta.status || 'VALID',

    ...extraMeta,
  };
}

/**
 * Execute template render function with merged data and configuration
 * @param {object} template - Template object with .render(data) method
 * @param {object} data - Normalized recipient & school data
 * @param {object} [customConfig] - Optional visual override configuration
 * @returns {string} - Rendered HTML string
 */
export function renderTemplate(template, data, customConfig = null) {
  if (!template || typeof template.render !== 'function') {
    return `<div style="padding:20px;color:red;text-align:center;">Template not found or invalid</div>`;
  }

  const mergedData = customConfig ? { ...data, ...customConfig } : data;
  return template.render(mergedData);
}
