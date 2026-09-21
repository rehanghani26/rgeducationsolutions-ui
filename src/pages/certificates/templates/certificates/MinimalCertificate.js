/**
 * @template MinimalCertificate — Certificate
 * @description Ultra-clean minimalist certificate design. Modern Swiss typography,
 * generous white space, elegant understated borders and lines.
 */
export const minimalCertificate = {
  id: 'certificate-minimal',
  name: 'Minimal Modern',
  category: 'certificate',
  orientation: 'landscape',
  version: 'v1',

  render: (data) => {
    const typeLabel = getCertTypeLabel(data.certificateType);
    return `
      <div style="
        width: 280mm; min-height: 190mm; font-family: 'Inter', -apple-system, sans-serif;
        background: #fafafa; padding: 0; position: relative; overflow: hidden;
        border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      ">
        <!-- Minimal subtle top accent bar -->
        <div style="height: 6px; width: 100%; background: #0f172a;"></div>

        <div style="padding: 40px 70px; display:flex; flex-direction:column; justify-content:space-between; min-height: 178mm; box-sizing:border-box;">
          
          <!-- Top Header Section -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:12px;">
                ${data.schoolLogo
                  ? `<img src="${data.schoolLogo}" style="height:44px; width:44px; object-fit:contain; border-radius:4px;" />`
                  : `<div style="width:40px; height:40px; background:#0f172a; color:#fff; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">S</div>`
                }
                <div>
                  <div style="font-size:16px; font-weight:700; color:#0f172a; letter-spacing:-0.3px;">${data.schoolName || 'Institution Name'}</div>
                  ${data.schoolAddress ? `<div style="font-size:10px; color:#64748b; margin-top:2px;">${data.schoolAddress}</div>` : ''}
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#94a3b8;">Document ID</div>
                <div style="font-size:11px; font-weight:700; color:#0f172a; font-family:monospace; margin-top:2px;">${data.certificateNumber || 'CERT-2026-000001'}</div>
              </div>
            </div>

            <div style="height:1px; background:#e2e8f0; margin:24px 0 28px;"></div>
          </div>

          <!-- Certificate Core Content -->
          <div style="text-align:center; padding: 0 20px;">
            <div style="font-size:11px; font-weight:600; color:#64748b; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px;">
              Certificate of ${typeLabel}
            </div>

            <div style="font-size:13px; color:#64748b; margin-bottom:14px;">
              This certifies that
            </div>

            <div style="font-size:32px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; margin-bottom:16px;">
              ${data.recipientNameSnapshot || data.recipientName || 'Recipient Name'}
            </div>

            <div style="font-size:14px; color:#334155; line-height:1.8; max-width:640px; margin:0 auto;">
              has been awarded this official credential
              ${data.additionalSnapshot?.admissionNumber ? `(Student ID: <span style="font-weight:600;">${data.additionalSnapshot.admissionNumber}</span>)` : data.admissionNumber ? `(ID: <span style="font-weight:600;">${data.admissionNumber}</span>)` : ''}
              ${data.additionalSnapshot?.class ? `enrolled in <span style="font-weight:600;">${data.additionalSnapshot.class}${data.additionalSnapshot.section ? ' - ' + data.additionalSnapshot.section : ''}</span>` : ''}
              ${data.academicSession ? `for the academic session <span style="font-weight:600;">${data.academicSession}</span>` : ''}
              in recognition of adherence to the standards and conduct of the institution.
              ${data.purposeNote ? `<br><span style="font-size:12px; color:#64748b; margin-top:8px; display:inline-block;">${data.purposeNote}</span>` : ''}
            </div>
          </div>

          <!-- Bottom Signature / Meta Section -->
          <div style="margin-top:30px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
              <div>
                <div style="font-size:9px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Date Issued</div>
                <div style="font-size:12px; font-weight:600; color:#0f172a;">
                  ${data.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div style="text-align:center;">
                <div style="width:140px; border-bottom:1px solid #0f172a; padding-bottom:6px; margin-bottom:6px;">
                  <span style="font-size:11px; font-weight:600; color:#0f172a;">${data.principalName || 'Authorized Signatory'}</span>
                </div>
                <div style="font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Head of Institution</div>
              </div>
            </div>

            <div style="margin-top:20px; padding-top:12px; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#94a3b8;">
              <div>${data.schoolWebsite || ''}</div>
              <div>Digitally Generated Institutional Credential</div>
            </div>
          </div>

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
