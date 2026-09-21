/**
 * @template AcademicCertificate — Certificate
 * @description Emerald academic certificate — matches the Academic ID card family.
 * Formal, institution-grade layout with gold-green accents, watermark-style background.
 */
export const academicCertificate = {
  id: 'certificate-academic',
  name: 'Academic',
  category: 'certificate',
  orientation: 'landscape',
  version: 'v1',

  render: (data) => {
    const typeLabel = getCertTypeLabel(data.certificateType);
    return `
      <div style="
        width: 280mm; min-height: 190mm; font-family: 'Georgia', serif;
        background: #fff; position: relative; overflow: hidden;
        border: 6px solid #059669; box-shadow: 0 4px 30px rgba(5,150,105,0.15);
      ">
        <!-- Top gold-green gradient bar -->
        <div style="height:6px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>

        <!-- Subtle watermark -->
        <div style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          font-size:120px;font-weight:800;color:rgba(5,150,105,0.04);white-space:nowrap;
          pointer-events:none;z-index:0;letter-spacing:4px;text-transform:uppercase;
        ">${data.schoolName || 'SCHOOL'}</div>

        <!-- Content -->
        <div style="padding:36px 60px;text-align:center;position:relative;z-index:1;">

          <!-- School Logo + Name -->
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:14px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:60px;width:60px;object-fit:contain;border-radius:50%;border:3px solid #059669;padding:2px;background:#fff;" />`
              : `<div style="width:60px;height:60px;border-radius:50%;border:3px solid #059669;background:#d1fae5;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#065f46;font-family:Georgia,serif;">S</div>`
            }
            <div style="text-align:left;">
              <div style="font-size:22px;font-weight:700;color:#064e3b;font-family:Georgia,serif;">${data.schoolName || 'School Name'}</div>
              ${data.schoolAddress ? `<div style="font-size:10px;color:#6b7280;font-family:'Inter',sans-serif;">${data.schoolAddress}</div>` : ''}
              ${data.schoolPhone ? `<div style="font-size:10px;color:#6b7280;font-family:'Inter',sans-serif;">Tel: ${data.schoolPhone}</div>` : ''}
            </div>
          </div>

          <!-- Divider with leaves motif -->
          <div style="margin:0 40px 18px;display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#059669);"></div>
            <div style="font-size:16px;">✦</div>
            <div style="font-size:16px;color:#f59e0b;">✦</div>
            <div style="font-size:16px;">✦</div>
            <div style="flex:1;height:1px;background:linear-gradient(90deg,#059669,transparent);"></div>
          </div>

          <!-- Certificate Title -->
          <div style="margin-bottom:16px;">
            <div style="font-size:10px;color:#059669;letter-spacing:5px;text-transform:uppercase;font-family:'Inter',sans-serif;font-weight:700;">Certificate of</div>
            <div style="font-size:34px;font-weight:700;color:#064e3b;text-transform:uppercase;letter-spacing:3px;margin-top:4px;">${typeLabel}</div>
          </div>

          <!-- Body Text -->
          <div style="font-size:13px;color:#374151;line-height:2.1;max-width:580px;margin:0 auto 18px;font-family:'Inter',sans-serif;">
            This is to certify that
            <br>
            <span style="font-size:22px;font-weight:700;color:#064e3b;font-style:italic;font-family:Georgia,serif;">
              ${data.recipientNameSnapshot || data.recipientName || 'Student Name'}
            </span>
            <br>
            ${data.additionalSnapshot?.admissionNumber || data.admissionNumber
              ? `Admission No. <strong>${data.additionalSnapshot?.admissionNumber || data.admissionNumber}</strong>`
              : ''
            }
            ${data.additionalSnapshot?.class
              ? ` · Class <strong>${data.additionalSnapshot.class}${data.additionalSnapshot.section ? ', ' + data.additionalSnapshot.section : ''}</strong>`
              : ''
            }
            ${data.academicSession ? ` · Session <strong>${data.academicSession}</strong>` : ''}
            <br>has attended and studied at this institution.
            ${data.purposeNote ? `<br><em>${data.purposeNote}</em>` : ''}
          </div>

          <!-- Certificate Number -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;display:inline-block;padding:4px 20px;border-radius:20px;margin-bottom:24px;">
            <span style="font-size:9px;color:#6b7280;font-family:'Inter',sans-serif;">Certificate No: </span>
            <span style="font-size:10px;font-weight:700;color:#064e3b;font-family:'Inter',sans-serif;">${data.certificateNumber || 'CERT-2026-000001'}</span>
          </div>

          <!-- Signatures -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:0 40px;">
            <div style="text-align:center;">
              <div style="width:130px;border-top:1px dashed #059669;padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">${data.principalName || 'Principal'}</div>
                <div style="font-size:9px;color:#6b7280;font-family:'Inter',sans-serif;">Principal</div>
              </div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:9px;color:#9ca3af;font-family:'Inter',sans-serif;margin-bottom:4px;">Date of Issue</div>
              <div style="font-size:12px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">${data.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:130px;border-top:1px dashed #059669;padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#374151;font-family:'Inter',sans-serif;">Class Teacher</div>
                <div style="font-size:9px;color:#6b7280;font-family:'Inter',sans-serif;">Signature</div>
              </div>
            </div>
          </div>

          ${data.schoolMotto ? `<div style="margin-top:14px;font-size:10px;color:#94a3b8;font-style:italic;font-family:Georgia,serif;">${data.schoolMotto}</div>` : ''}
        </div>

        <!-- Bottom bar -->
        <div style="height:6px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>
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
