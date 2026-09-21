/**
 * @template PremiumCertificate — Certificate
 * @description Luxury gold on dark theme certificate for high honors, excellence,
 * and prestigious achievements. Rich metallic accents and seal.
 */
export const premiumCertificate = {
  id: 'certificate-premium',
  name: 'Premium Honor',
  category: 'certificate',
  orientation: 'landscape',
  version: 'v1',

  render: (data) => {
    const typeLabel = getCertTypeLabel(data.certificateType);
    return `
      <div style="
        width: 280mm; min-height: 190mm; font-family: 'Cinzel', 'Georgia', serif;
        background: radial-gradient(ellipse at center, #1a2238 0%, #0c101d 100%);
        padding: 0; position: relative; overflow: hidden;
        border: 10px solid #1e293b; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      ">
        <!-- Gold outer and inner borders -->
        <div style="
          position:absolute;inset:8px;border:2px solid #d4af37;pointer-events:none;
        "></div>
        <div style="
          position:absolute;inset:14px;border:1px dashed rgba(212,175,55,0.6);pointer-events:none;
        "></div>

        <!-- Corner Ornaments -->
        <div style="position:absolute;top:18px;left:18px;width:30px;height:30px;border-top:3px solid #f59e0b;border-left:3px solid #f59e0b;pointer-events:none;"></div>
        <div style="position:absolute;top:18px;right:18px;width:30px;height:30px;border-top:3px solid #f59e0b;border-right:3px solid #f59e0b;pointer-events:none;"></div>
        <div style="position:absolute;bottom:18px;left:18px;width:30px;height:30px;border-bottom:3px solid #f59e0b;border-left:3px solid #f59e0b;pointer-events:none;"></div>
        <div style="position:absolute;bottom:18px;right:18px;width:30px;height:30px;border-bottom:3px solid #f59e0b;border-right:3px solid #f59e0b;pointer-events:none;"></div>

        <!-- Watermark/Background glow -->
        <div style="position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;"></div>

        <!-- Content -->
        <div style="padding: 36px 60px;text-align:center;position:relative;z-index:1;">

          <!-- School Header -->
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:14px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:60px;width:60px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(212,175,55,0.3));" />`
              : `<div style="width:60px;height:60px;background:linear-gradient(135deg,#f59e0b,#b45309);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#0f172a;box-shadow:0 0 15px rgba(245,158,11,0.4);">S</div>`
            }
            <div style="text-align:left;">
              <div style="font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:1px;">${data.schoolName || 'Institution of Excellence'}</div>
              ${data.schoolAddress ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;font-family:'Inter',sans-serif;">${data.schoolAddress}</div>` : ''}
              ${data.schoolPhone ? `<div style="font-size:10px;color:#94a3b8;font-family:'Inter',sans-serif;">Contact: ${data.schoolPhone}</div>` : ''}
            </div>
          </div>

          <!-- Metallic Accent Bar -->
          <div style="height:2px;background:linear-gradient(90deg,transparent,#f59e0b,#fef08a,#f59e0b,transparent);margin:0 60px 18px;"></div>

          <!-- Certificate Title -->
          <div style="margin-bottom:18px;">
            <div style="font-size:11px;color:#fcd34d;letter-spacing:6px;text-transform:uppercase;font-family:'Inter',sans-serif;font-weight:600;">Honorary Recognition</div>
            <div style="font-size:34px;font-weight:800;background:linear-gradient(135deg,#fff,#fde68a,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">
              Certificate of ${typeLabel}
            </div>
          </div>

          <!-- Body -->
          <div style="font-size:13px;color:#cbd5e1;line-height:2.1;max-width:620px;margin:0 auto 20px;font-family:'Georgia',serif;">
            This prestigious credential is proudly presented to
            <span style="font-size:22px;font-weight:700;color:#fef08a;display:block;margin:6px 0;letter-spacing:1px;font-family:'Cinzel','Georgia',serif;">
              ${data.recipientNameSnapshot || data.recipientName || 'Honoree Name'}
            </span>
            ${data.additionalSnapshot?.admissionNumber ? `ID / Admission No: <strong style="color:#fff;">${data.additionalSnapshot.admissionNumber}</strong> &nbsp;|&nbsp; ` : data.admissionNumber ? `ID: <strong style="color:#fff;">${data.admissionNumber}</strong> &nbsp;|&nbsp; ` : ''}
            ${data.additionalSnapshot?.class ? `Class: <strong style="color:#fff;">${data.additionalSnapshot.class}${data.additionalSnapshot.section ? ' (' + data.additionalSnapshot.section + ')' : ''}</strong>` : ''}
            ${data.academicSession ? `<br>for outstanding merit & participation during the academic period of <strong style="color:#fde68a;">${data.academicSession}</strong>.` : 'for exemplary distinction and contribution.'}
            ${data.purposeNote ? `<br><span style="color:#94a3b8;font-size:12px;">${data.purposeNote}</span>` : ''}
          </div>

          <!-- Badge / Certificate Token Row -->
          <div style="display:inline-flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(245,158,11,0.3);padding:6px 20px;border-radius:24px;margin-bottom:20px;">
            <span style="font-size:10px;color:#fcd34d;font-family:'Inter',sans-serif;letter-spacing:1px;">CERTIFICATE ID</span>
            <span style="font-size:11px;font-weight:700;color:#fff;font-family:'Inter',sans-serif;letter-spacing:1.5px;">${data.certificateNumber || 'CERT-2026-000001'}</span>
          </div>

          <!-- Signatures & Seal -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:0 30px;">
            <div style="text-align:center;width:140px;">
              <div style="border-bottom:1px solid rgba(245,158,11,0.5);padding-bottom:4px;margin-bottom:6px;">
                <div style="font-size:11px;font-weight:700;color:#f8fafc;font-family:'Inter',sans-serif;">${data.principalName || 'Principal'}</div>
              </div>
              <div style="font-size:9px;color:#94a3b8;font-family:'Inter',sans-serif;text-transform:uppercase;letter-spacing:1px;">Head of Institution</div>
            </div>

            <!-- Emblem / Seal Center -->
            <div style="width:70px;height:70px;border-radius:50%;border:2px double #f59e0b;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,#2d1f05,#111827);box-shadow:0 0 15px rgba(245,158,11,0.3);">
              <span style="font-size:8px;color:#fcd34d;font-weight:800;letter-spacing:1px;text-transform:uppercase;">OFFICIAL</span>
              <span style="font-size:10px;color:#fff;">★ ★ ★</span>
              <span style="font-size:7px;color:#94a3b8;">SEAL</span>
            </div>

            <div style="text-align:center;width:140px;">
              <div style="border-bottom:1px solid rgba(245,158,11,0.5);padding-bottom:4px;margin-bottom:6px;">
                <div style="font-size:11px;font-weight:700;color:#f8fafc;font-family:'Inter',sans-serif;">
                  ${data.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style="font-size:9px;color:#94a3b8;font-family:'Inter',sans-serif;text-transform:uppercase;letter-spacing:1px;">Date of Conformance</div>
            </div>
          </div>

          ${data.schoolWebsite ? `<div style="margin-top:16px;font-size:9px;color:#64748b;font-family:'Inter',sans-serif;">${data.schoolWebsite}</div>` : ''}
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
