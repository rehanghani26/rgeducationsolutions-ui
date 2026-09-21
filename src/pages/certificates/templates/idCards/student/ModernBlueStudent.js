/**
 * @template ModernBlueStudent — Student ID Card
 * @description Modern horizontal layout with glassmorphism accent panel,
 * dark navy background with vibrant gradient accents and QR section.
 */
export const modernBlueStudentCard = {
  id: 'student-id-modern-blue',
  name: 'Modern Blue',
  category: 'student-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0ea5e9 200%);
        border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(14,165,233,0.25);
        position: relative; display: flex;
      ">
        <!-- Left accent stripe -->
        <div style="width:6px;background:linear-gradient(180deg,#38bdf8,#0ea5e9,#7c3aed);flex-shrink:0;"></div>

        <!-- Left section: photo + ID strip -->
        <div style="
          width: 62px; flex-shrink:0; background: rgba(255,255,255,0.05);
          border-right: 1px solid rgba(255,255,255,0.1);
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 8px 0; gap: 6px;
        ">
          ${data.photo
            ? `<img src="${data.photo}" style="width:46px;height:54px;object-fit:cover;border-radius:8px;border:2px solid #38bdf8;" />`
            : `<div style="width:46px;height:54px;border-radius:8px;border:2px solid #38bdf8;background:linear-gradient(135deg,#1e3a5f,#0c4a6e);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#38bdf8;">${initials}</div>`
          }
          <div style="font-size:6.5px;color:#38bdf8;font-weight:700;letter-spacing:1px;text-align:center;">STUDENT</div>
        </div>

        <!-- Right section: info -->
        <div style="flex:1;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;">
          <!-- School -->
          <div style="display:flex;align-items:center;gap:6px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:18px;width:18px;object-fit:contain;border-radius:3px;background:#fff;padding:1px;" />`
              : `<div style="width:18px;height:18px;background:rgba(56,189,248,0.2);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:#38bdf8;">S</div>`
            }
            <div style="font-size:7.5px;font-weight:800;color:#e2e8f0;line-height:1.2;">${data.schoolName || 'School Name'}</div>
          </div>

          <!-- Student Name -->
          <div>
            <div style="font-size:14px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:2px;">${data.name || 'Student Name'}</div>
            <div style="font-size:8px;color:#94a3b8;">${data.class || ''} ${data.section ? '• ' + data.section : ''}</div>
          </div>

          <!-- ID + details -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            ${miniInfo('ID', data.admissionNumber)}
            ${miniInfo('Roll', data.rollNumber || '—')}
            ${miniInfo('Blood', data.bloodGroup || '—')}
            ${miniInfo('Year', data.academicYear || '2026-27')}
          </div>

          <!-- Bottom: motto -->
          <div style="font-size:7px;color:#38bdf8;font-style:italic;">${data.schoolMotto || ''}</div>
        </div>
      </div>
    `;
  },
};

function miniInfo(label, value) {
  if (!value) return '';
  return `
    <div>
      <div style="font-size:6.5px;color:#64748b;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:8.5px;font-weight:700;color:#cbd5e1;">${value}</div>
    </div>
  `;
}
