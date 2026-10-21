/**
 * @file setupService.js
 * @description Frontend API service for the School ERP Setup Wizard.
 * Connects UI to backend /api/v1/setup endpoints and related settings APIs.
 */

import api from './api.js';

export const setupService = {
  /**
   * Fetch live setup status across all 5 initial setup steps
   * @returns {Promise<{success: boolean, status: object}>}
   */
  async getStatus() {
    try {
      const response = await api.get('/setup/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching setup status:', error);
      throw error;
    }
  },

  /**
   * Mark a flag-based step complete or re-trigger evaluation
   * @param {string} stepKey - 'schoolProfile' | 'academicSession' | 'masterPeriods' | 'academicRules' | 'financePolicies'
   * @param {boolean} [markComplete=true]
   */
  async completeStep(stepKey, markComplete = true) {
    try {
      const response = await api.post('/setup/complete-step', { stepKey, markComplete });
      return response.data;
    } catch (error) {
      console.error('Error marking setup step complete:', error);
      throw error;
    }
  },

  /**
   * Dismiss the setup wizard banner / modal
   */
  async dismiss() {
    try {
      const response = await api.post('/setup/dismiss');
      return response.data;
    } catch (error) {
      console.error('Error dismissing setup wizard:', error);
      throw error;
    }
  },

  /**
   * Reset setup wizard (Super Admin only)
   */
  async reset() {
    try {
      const response = await api.post('/setup/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting setup wizard:', error);
      throw error;
    }
  },

  /**
   * Step 1: Save School Profile
   * @param {object} profileData
   */
  async saveSchoolProfile(profileData) {
    try {
      const response = await api.put('/erp/settings', profileData);
      return response.data;
    } catch (error) {
      console.error('Error saving school profile:', error);
      throw error;
    }
  },

  /**
   * Step 2: Create & activate initial Academic Session
   * @param {object} sessionData
   */
  async saveAcademicSession(sessionData) {
    try {
      // First try /sessions endpoint, fallback to /erp/academic-sessions if needed
      const payload = {
        sessionName: sessionData.sessionName,
        startDate: sessionData.startDate,
        endDate: sessionData.endDate,
        isCurrent: true,
        notes: sessionData.notes || 'Created via ERP Initial Setup Wizard',
      };
      const response = await api.post('/sessions', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating academic session:', error);
      throw error;
    }
  },

  /**
   * Step 3: Create initial Master Period Schedule
   * @param {object} periodData
   */
  async saveMasterPeriods(periodData) {
    try {
      const payload = {
        scheduleName: periodData.scheduleName || 'Regular Bell Schedule',
        periodType: 'regular',
        isActive: true,
        schoolStartTime: periodData.schoolStartTime || '08:00',
        schoolEndTime: periodData.schoolEndTime || '14:30',
        periods: periodData.periods || [],
      };
      const response = await api.post('/erp/master-periods', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating master periods:', error);
      throw error;
    }
  },

  /**
   * Step 4: Save Academic & Grading Rules
   * @param {object} rulesData
   */
  async saveAcademicRules(rulesData) {
    try {
      const response = await api.put('/erp/settings', {
        defaultPassingPercentage: rulesData.defaultPassingPercentage || 40,
        gradePointScale: rulesData.gradePointScale || '10.0',
        minAttendancePercentage: rulesData.minAttendancePercentage || 75,
      });
      // Also mark step completed explicitly in setupWizard
      await this.completeStep('academicRules', true);
      return response.data;
    } catch (error) {
      console.error('Error saving academic rules:', error);
      throw error;
    }
  },

  /**
   * Step 5: Save Finance Policies
   * @param {object} financeData
   */
  async saveFinancePolicies(financeData) {
    try {
      const response = await api.put('/erp/settings', {
        currencySymbol: financeData.currencySymbol || '₹',
        lateFeePolicy: financeData.lateFeePolicy || 'Flat Fee',
        lateFeeAmount: financeData.lateFeeAmount || 50,
        invoiceGraceDays: financeData.invoiceGraceDays || 7,
      });
      // Mark step completed explicitly in setupWizard
      await this.completeStep('financePolicies', true);
      return response.data;
    } catch (error) {
      console.error('Error saving finance policies:', error);
      throw error;
    }
  },
};

export default setupService;
