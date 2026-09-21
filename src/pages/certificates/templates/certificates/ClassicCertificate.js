/**
 * @template ClassicCertificate — Certificate
 * @description Classic A4-style certificate with navy blue border, gold accents,
 * formal serif typography, and space for principal signature.
 */
export const classicCertificate = {
  id: 'certificate-classic',
  name: 'Classic',
  category: 'certificate',
  orientation: 'landscape',
  version: 'v1',

  render: (data) => {
    const typeLabel = getCertTypeLabel(data.certificateType);
    return `
      <div style="
        width: 280mm; min-height: 190mm; font-family: 'Georgia', serif;
        background: #fff; padding: 0; position: relative; overflow: hidden;
        border: 8px double #1e3a8a; box-shadow: 0 4px 30px rgba(0,0,0,0.1);
      ">
        <!-- Gold decorative inner border -->
        <div style="
          position:absolute;inset:10px;border:2px solid #d4af37;pointer-events:none;
          box-shadow: inset 0 0 20px rgba(212,175,55,0.05);
        "></div>

        <!-- Content -->
        <div style="padding: 36px 60px;text-align:center;position:relative;z-index:1;">

          <!-- School Branding -->
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:56px;width:56px;object-fit:contain;border-radius:8px;" />`
              : `<div style="width:56px;height:56px;background:#dbeafe;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#1e3a8a;">S</div>`
            }
            <div style="text-align:left;">
              <div style="font-size:20px;font-weight:700;color:#1e3a8a;letter-spacing:0.5px;">${data.schoolName || 'School Name'}</div>
              ${data.schoolAddress ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">${data.schoolAddress}</div>` : ''}
              ${data.schoolPhone ? `<div style="font-size:10px;color:#64748b;">Tel: ${data.schoolPhone}</div>` : ''}
            </div>
          </div>

          <!-- Gold Divider -->
          <div style="height:2px;background:linear-gradient(90deg,transparent,#d4af37,#b8860b,#d4af37,transparent);margin:0 40px 20px;"></div>

          <!-- Certificate Title -->
          <div style="margin-bottom:16px;">
            <div style="font-size:11px;color:#d4af37;letter-spacing:6px;text-transform:uppercase;font-family:'Inter',sans-serif;font-weight:600;">Certificate of</div>
            <div style="font-size:32px;font-weight:700;color:#1e3a8a;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">${typeLabel}</div>
          </div>

          <!-- Body Text -->
          <div style="font-size:13px;color:#374151;line-height:2;max-width:600px;margin:0 auto 20px;">
            This is to certify that
            <span style="font-size:18px;font-weight:700;color:#0f172a;font-style:italic;display:block;margin:6px 0;">
              ${data.recipientNameSnapshot || data.recipientName || 'Student Name'}
            </span>
            ${data.additionalSnapshot?.admissionNumber ? `bearing Admission Number <strong>${data.additionalSnapshot.admissionNumber}</strong>` : data.admissionNumber ? `bearing Admission Number <strong>${data.admissionNumber}</strong>` : ''}
            ${data.additionalSnapshot?.class ? `is/was a student of <strong>${data.additionalSnapshot.class}${data.additionalSnapshot.section ? ' – ' + data.additionalSnapshot.section : ''}</strong>` : ''}
            ${data.academicSession ? `during the academic session <strong>${data.academicSession}</strong>` : ''}
            at this institution.
            ${data.purposeNote ? `<br><br>${data.purposeNote}` : ''}
          </div>

          <!-- Certificate Number -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;display:inline-block;padding:4px 16px;border-radius:20px;margin-bottom:24px;">
            <span style="font-size:9px;color:#64748b;font-family:'Inter',sans-serif;">Certificate No: </span>
            <span style="font-size:10px;font-weight:700;color:#1e293b;font-family:'Inter',sans-serif;">${data.certificateNumber || 'CERT-2026-000001'}</span>
          </div>

          <!-- Signatures Row -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;padding:0 40px;">
            <div style="text-align:center;">
              <div style="width:120px;border-top:1px solid #1e3a8a;padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">${data.principalName || 'Principal'}</div>
                <div style="font-size:9px;color:#64748b;font-family:'Inter',sans-serif;">Principal</div>
              </div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:9px;color:#94a3b8;font-family:'Inter',sans-serif;margin-bottom:4px;">Date of Issue</div>
              <div style="font-size:11px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">${data.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:120px;border-top:1px solid #1e3a8a;padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">Class Teacher</div>
                <div style="font-size:9px;color:#64748b;font-family:'Inter',sans-serif;">Signature</div>
              </div>
            </div>
          </div>

          <!-- School motto footer -->
          <div style="margin-top:20px;font-size:10px;color:#94a3b8;font-style:italic;">
            ${data.schoolMotto || ''}
          </div>
          ${data.schoolWebsite ? `<div style="font-size:9px;color:#3b82f6;font-family:'Inter',sans-serif;margin-top:2px;">${data.schoolWebsite}</div>` : ''}
        </div>
      </div>
    `;
  },
};

function getCertTypeLabel(type) {
  const labels = {
    BONAFIDE: 'Bonafide', CHARACTER: 'Character', ACHIEVEMENT: 'Achievement',
    PARTICIPATION: 'Participation', TC: 'Transfer', CUSTOM: 'Excellence',
  };
  return labels[type] || type || 'Certificate';
}
