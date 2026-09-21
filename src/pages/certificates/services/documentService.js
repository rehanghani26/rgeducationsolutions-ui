/**
 * @file documentService.js
 * @description API client service for certificates, ID cards, custom templates, and public verification.
 */

import { toast } from 'react-toastify';
import api from '../../../services/api.js';
import { DOCUMENT_URLS } from '../../../constants/urls.js';

/**
 * Fetch paginated list of issued certificates with optional filters
 * @param {object} params - { page, limit, certificateType, recipientType, status, search }
 */
export async function getIssuedCertificates(params = {}) {
  try {
    const response = await api.get(DOCUMENT_URLS.CERTIFICATES, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching issued certificates:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch certificates');
    throw error;
  }
}

/**
 * Fetch a single issued certificate by ID
 * @param {string} id
 */
export async function getIssuedCertificateById(id) {
  try {
    const response = await api.get(DOCUMENT_URLS.BY_ID(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate by id:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch certificate details');
    throw error;
  }
}

/**
 * Issue an official certificate for a single recipient
 * @param {object} payload - { recipientType, recipientId, certificateType, templateId, templateVersion, academicSession, purposeNote }
 */
export async function issueCertificate(payload) {
  try {
    const response = await api.post(DOCUMENT_URLS.ISSUE, payload);
    toast.success('Certificate issued successfully!');
    return response.data;
  } catch (error) {
    console.error('Error issuing certificate:', error);
    toast.error(error.response?.data?.message || 'Failed to issue certificate');
    throw error;
  }
}

/**
 * Bulk issue certificates for multiple recipients in a single request
 * @param {object} payload - { recipients: Array<{ recipientType, recipientId, purposeNote }>, certificateType, templateId, templateVersion, academicSession }
 */
export async function bulkIssueCertificates(payload) {
  try {
    const response = await api.post(DOCUMENT_URLS.BULK_ISSUE, payload);
    toast.success(`Successfully issued ${response.data.count || ''} certificates!`);
    return response.data;
  } catch (error) {
    console.error('Error in bulk issuing certificates:', error);
    toast.error(error.response?.data?.message || 'Failed to bulk issue certificates');
    throw error;
  }
}

/**
 * Revoke an issued certificate
 * @param {string} id - MongoDB ID of IssuedCertificate
 * @param {string} revocationReason
 */
export async function revokeCertificate(id, revocationReason = '') {
  try {
    const response = await api.patch(DOCUMENT_URLS.REVOKE(id), { revocationReason });
    toast.success('Certificate revoked successfully');
    return response.data;
  } catch (error) {
    console.error('Error revoking certificate:', error);
    toast.error(error.response?.data?.message || 'Failed to revoke certificate');
    throw error;
  }
}

/**
 * Verify a certificate by verification token (Public endpoint - no auth required)
 * @param {string} token
 */
export async function verifyCertificate(token) {
  try {
    const response = await api.get(DOCUMENT_URLS.VERIFY(token));
    return response.data;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
}

/**
 * List custom templates
 */
export async function getCustomTemplates() {
  try {
    const response = await api.get(DOCUMENT_URLS.CUSTOM_TEMPLATES);
    return response.data;
  } catch (error) {
    console.error('Error fetching custom templates:', error);
    return { success: false, templates: [] };
  }
}

/**
 * Create a new custom template
 * @param {object} data - { name, baseTemplateId, category, configuration }
 */
export async function createCustomTemplate(data) {
  try {
    const response = await api.post(DOCUMENT_URLS.CUSTOM_TEMPLATES, data);
    toast.success('Custom template saved!');
    return response.data;
  } catch (error) {
    console.error('Error creating custom template:', error);
    toast.error(error.response?.data?.message || 'Failed to save template');
    throw error;
  }
}

/**
 * Update an existing custom template
 * @param {string} id
 * @param {object} data - { name, configuration }
 */
export async function updateCustomTemplate(id, data) {
  try {
    const response = await api.put(DOCUMENT_URLS.CUSTOM_TEMPLATE_BY_ID(id), data);
    toast.success('Template updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating custom template:', error);
    toast.error(error.response?.data?.message || 'Failed to update template');
    throw error;
  }
}

/**
 * Delete (soft-delete) a custom template
 * @param {string} id
 */
export async function deleteCustomTemplate(id) {
  try {
    const response = await api.delete(DOCUMENT_URLS.CUSTOM_TEMPLATE_BY_ID(id));
    toast.success('Template removed');
    return response.data;
  } catch (error) {
    console.error('Error deleting custom template:', error);
    toast.error(error.response?.data?.message || 'Failed to delete template');
    throw error;
  }
}

export default {
  getIssuedCertificates,
  getIssuedCertificateById,
  issueCertificate,
  bulkIssueCertificates,
  revokeCertificate,
  verifyCertificate,
  getCustomTemplates,
  createCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
};
