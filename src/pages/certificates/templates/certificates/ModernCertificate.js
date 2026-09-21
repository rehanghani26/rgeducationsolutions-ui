/**
 * @template ModernCertificate — Certificate
 * @description Modern A4 certificate with dark navy background, vibrant gradient accents,
 * premium typography, and geometric decorative elements.
 */
export const modernCertificate = {
  id: 'certificate-modern',
  name: 'Modern',
  category: 'certificate',
  orientation: 'landscape',
  version: 'v1',

  render: (data) => {
    const typeLabel = getCertTypeLabel(data.certificateType);
    return `
      <div style="
        width: 280mm; min-height: 190mm; font-family: 'Inter', Arial, sans-serif;
        background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
        position: relative; overflow: hidden;
        box-shadow: 0 8px 40px rgba(99,102,241,0.3);
      ">
        <!-- Top gradient bar -->
        <div style="height:6px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981,#6366f1);"></div>

        <!-- Decorative circle top-right -->
        <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.15),transparent);pointer-events:none;"></div>
        <div style="position:absolute;bottom:-80px;left:-80px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.1),transparent);pointer-events:none;"></div>

        <!-- Content -->
        <div style="padding:40px 60px;text-align:center;position:relative;z-index:1;">

          <!-- School Branding -->
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:20px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:50px;width:50px;object-fit:contain;border-radius:10px;background:rgba(255,255,255,0.1);padding:4px;" />`
              : `<div style="width:50px;height:50px;background:rgba(99,102,241,0.2);border:2px solid rgba(99,102,241,0.4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#818cf8;">S</div>`
            }
            <div style="text-align:left;">
              <div style="font-size:18px;font-weight:800;color:#e2e8f0;">${data.schoolName || 'School Name'}</div>
              ${data.schoolAddress ? `<div style="font-size:9px;color:#64748b;margin-top:2px;">${data.schoolAddress}</div>` : ''}
            </div>
          </div>

          <!-- Accent line -->
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.6),transparent);margin:0 60px 24px;"></div>

          <!-- Certificate type badge -->
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);padding:4px 20px;border-radius:30px;margin-bottom:12px;">
            <div style="width:6px;height:6px;border-radius:50%;background:#6366f1;"></div>
            <span style="font-size:10px;font-weight:700;color:#818cf8;letter-spacing:4px;text-transform:uppercase;">Certificate of</span>
            <div style="width:6px;height:6px;border-radius:50%;background:#6366f1;"></div>
          </div>

          <!-- Title -->
          <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#c7d2fe,#a5b4fc,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">
            ${typeLabel}
          </div>

          <!-- Recipient -->
          <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">This is to certify that</div>
          <div style="font-size:26px;font-weight:800;color:#fff;margin-bottom:10px;font-style:italic;">
            ${data.recipientNameSnapshot || data.recipientName || 'Student Name'}
          </div>

          <!-- Details -->
          <div style="font-size:12px;color:#94a3b8;line-height:2;margin-bottom:20px;">
            ${data.additionalSnapshot?.admissionNumber || data.admissionNumber
              ? `Admission No. <span style="color:#c7d2fe;font-weight:700;">${data.additionalSnapshot?.admissionNumber || data.admissionNumber}</span> · `
              : ''
            }
            ${data.additionalSnapshot?.class
              ? `<span style="color:#c7d2fe;font-weight:700;">${data.additionalSnapshot.class}${data.additionalSnapshot.section ? ' – ' + data.additionalSnapshot.section : ''}</span> · `
              : ''
            }
            Academic Session <span style="color:#c7d2fe;font-weight:700;">${data.academicSession || '2026-27'}</span>
            ${data.purposeNote ? `<br><span style="color:#94a3b8;">${data.purposeNote}</span>` : ''}
          </div>

          <!-- Certificate number badge -->
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:inline-block;padding:4px 16px;border-radius:20px;margin-bottom:28px;">
            <span style="font-size:9px;color:#64748b;">Cert No: </span>
            <span style="font-size:10px;font-weight:700;color:#a5b4fc;">${data.certificateNumber || 'CERT-2026-000001'}</span>
          </div>

          <!-- Signatures -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:0 40px;">
            <div style="text-align:center;">
              <div style="width:130px;border-top:1px solid rgba(99,102,241,0.4);padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#c7d2fe;">${data.principalName || 'Principal'}</div>
                <div style="font-size:8px;color:#64748b;">Principal</div>
              </div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:8px;color:#64748b;margin-bottom:3px;">Date of Issue</div>
              <div style="font-size:11px;font-weight:700;color:#e2e8f0;">${data.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:130px;border-top:1px solid rgba(99,102,241,0.4);padding-top:6px;">
                <div style="font-size:10px;font-weight:700;color:#c7d2fe;">Class Teacher</div>
                <div style="font-size:8px;color:#64748b;">Signature</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div style="height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981,#6366f1);"></div>
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
