import api from "./api.js";
export async function submitPasswordChangeRequest({ newPassword, notes }) {
  const res = await api.post("/profile/password-change-request", {
    newPassword,
    notes,
  });
  return res.data;
}

export async function getPasswordChangeRequests(params = {}) {
  const res = await api.get("/profile/password-change-requests", { params });
  return res.data;
}

/**
 * Review a password change request (Accept or Reject - Super Admin only)
 * @param {string} id
 * @param {{ action: 'approve' | 'reject', adminNotes?: string }} payload
 */
export async function reviewPasswordChangeRequest(id, { action, adminNotes }) {
  const res = await api.patch(
    `/profile/password-change-requests/${id}/review`,
    {
      action,
      adminNotes,
    }
  );
  return res.data;
}

/**
 * Super Admin direct password reset for any user/student
 * @param {{ targetUserId: string, newPassword: string, adminNotes?: string }} payload
 */
export async function directPasswordReset({
  targetUserId,
  newPassword,
  adminNotes,
}) {
  const res = await api.post("/profile/direct-password-reset", {
    targetUserId,
    newPassword,
    adminNotes,
  });
  return res.data;
}
