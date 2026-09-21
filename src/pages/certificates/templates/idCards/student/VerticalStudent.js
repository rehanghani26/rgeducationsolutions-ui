/**
 * @template VerticalStudent — Student ID Card
 * @description Modern vertical card with large photo at top, coral/orange gradient,
 * clean white info area. Distinctly different from other vertical templates.
 */
export const verticalStudentCard = {
  id: 'student-id-vertical',
  name: 'Modern Vertical',
  category: 'student-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 60mm; font-family: 'Inter', Arial, sans-serif;
        border-radius: 16px; overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        background: #fff;
      ">
        <!-- Top gradient section with photo -->
        <div style="
          background: linear-gradient(160deg, #f97316 0%, #ef4444 50%, #dc2626 100%);
          padding: 20px 16px 60px; position: relative; text-align: center;
        ">
          <div style="font-size:8px;font-weight:800;color:rgba(255,255,255,0.9);letter-spacing:1.5px;text-transform:uppercase;">Student ID</div>
          <div style="font-size:9px;font-weight:700;color:#fff;margin-top:2px;">${data.schoolName || 'School'}</div>

          <!-- Centered Photo, positioned to overlap -->
          <div style="position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);z-index:2;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:72px;height:72px;object-fit:cover;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.2);" />`
              : `<div style="width:72px;height:72px;border-radius:50%;border:4px solid #fff;background:linear-gradient(135deg,#fed7aa,#fdba74);box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#c2410c;">${initials}</div>`
            }
          </div>
        </div>

        <!-- Info section -->
        <div style="padding: 44px 16px 16px; text-align:center;">
          <div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:2px;">${data.name || 'Student Name'}</div>
          <div style="font-size:9px;color:#f97316;font-weight:700;margin-bottom:12px;">${data.class || ''} ${data.section ? '• ' + data.section : ''}</div>

          <!-- Divider -->
          <div style="width:40px;height:3px;background:linear-gradient(90deg,#f97316,#ef4444);border-radius:2px;margin:0 auto 12px;"></div>

          <!-- Info grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;">
            ${vCell('Admission No', data.admissionNumber)}
            ${vCell('Roll No', data.rollNumber || '—')}
            ${vCell('Blood Group', data.bloodGroup || '—')}
            ${vCell('Session', data.academicYear || '2026-27')}
          </div>

          <!-- Logo + school brand -->
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid #f1f5f9;display:flex;justify-content:center;align-items:center;gap:6px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:20px;width:20px;object-fit:contain;border-radius:4px;" />`
              : ''
            }
            <div style="font-size:7.5px;color:#94a3b8;font-style:italic;">${data.schoolMotto || 'Excellence in Education'}</div>
          </div>
        </div>
      </div>
    `;
  },
};

function vCell(label, value) {
  if (!value) return '';
  return `
    <div style="background:#f8fafc;border-radius:8px;padding:6px 8px;">
      <div style="font-size:7px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:9px;font-weight:700;color:#1e293b;margin-top:1px;">${value}</div>
    </div>
  `;
}
