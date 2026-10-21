import { useState, useEffect, useCallback } from 'react';
import setupService from '../services/setupService.js';

/**
 * Custom hook to monitor and control ERP initial setup wizard state.
 */
export function useSetupWizard(autoFetch = true) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await setupService.getStatus();
      if (res?.success && res?.status) {
        setStatus(res.status);
      }
    } catch (err) {
      console.warn('Could not load setup wizard status:', err);
      setError(err?.message || 'Failed to load setup status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }
  }, [autoFetch, fetchStatus]);

  const markStepComplete = async (stepKey) => {
    try {
      const res = await setupService.completeStep(stepKey, true);
      if (res?.status) {
        setStatus(res.status);
      } else {
        await fetchStatus();
      }
      return true;
    } catch (err) {
      console.error(`Failed to mark step ${stepKey} complete:`, err);
      return false;
    }
  };

  const dismiss = async () => {
    try {
      await setupService.dismiss();
      setStatus((prev) => (prev ? { ...prev, isDismissed: true } : prev));
      return true;
    } catch (err) {
      console.error('Failed to dismiss wizard:', err);
      return false;
    }
  };

  const reset = async () => {
    try {
      await setupService.reset();
      await fetchStatus();
      return true;
    } catch (err) {
      console.error('Failed to reset wizard:', err);
      return false;
    }
  };

  return {
    status,
    loading,
    error,
    refreshStatus: fetchStatus,
    markStepComplete,
    dismiss,
    reset,
    steps: status?.steps || [],
    completedCount: status?.completedCount || 0,
    totalSteps: status?.totalSteps || 5,
    percentComplete: status?.percentComplete || 0,
    isFullyComplete: status?.isFullyComplete || false,
    isDismissed: status?.isDismissed || false,
    nextStep: status?.nextStep || null,
  };
}

export default useSetupWizard;
