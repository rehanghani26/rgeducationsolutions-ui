/**
 * @template PremiumStudent — Student ID Card
 * @description Premium dark card with gold accents, holographic-style gradient,
 * and luxury aesthetic. Vertical layout with large photo.
 */
export const premiumStudentCard = {
  id: 'student-id-premium',
  name: 'Premium',
  category: 'student-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; min-height: 54mm; font-family: 'Inter', Arial, sans-serif;
        border-radius: 14px; overflow: hidden;
        background: linear-gradient(145deg, #1a0533 0%, #2d1b69 40%, #0f172a 100%);
        box-shadow: 0 8px 32px rgba(124,58,237,0.4), 0 0 0 1px rgba(168,85,247,0.3);
        position: relative;
      ">
        <!-- Holographic overlay -->
        <div style="
          position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,#f59e0b,#ec4899,#a855f7,#38bdf8,#10b981,#f59e0b);
        "></div>

        <!-- Header with school info -->
        <div style="padding:16px 14px 10px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="flex:1;">
            <div style="font-size:9.5px;font-weight:800;color:#e2e8f0;letter-spacing:0.3px;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:7px;color:#a855f7;letter-spacing:2px;text-transform:uppercase;margin-top:1px;">Student ID</div>
          </div>
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:30px;width:30px;object-fit:contain;border-radius:6px;background:rgba(255,255,255,0.1);padding:2px;" />`
            : `<div style="width:30px;height:30px;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.4);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#a855f7;">S</div>`
          }
        </div>

        <!-- Photo Section -->
        <div style="padding:0 14px;display:flex;gap:12px;align-items:center;">
          ${data.photo
            ? `<img src="${data.photo}" style="width:64px;height:76px;object-fit:cover;border-radius:10px;border:2px solid #a855f7;box-shadow:0 4px 12px rgba(168,85,247,0.4);" />`
            : `<div style="width:64px;height:76px;border-radius:10px;border:2px solid #a855f7;background:linear-gradient(135deg,#2e1065,#4c1d95);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#a855f7;">${initials}</div>`
          }
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:8px;line-height:1.1;">${data.name || 'Student Name'}</div>
            ${goldBadge(data.admissionNumber || 'STU-0001')}
            <div style="margin-top:6px;">${premRow('Class', `${data.class || ''} ${data.section || ''}`)}</div>
            ${premRow('Roll', data.rollNumber || '—')}
            ${premRow('Blood', data.bloodGroup || '—')}
          </div>
        </div>

        <!-- Session + motto -->
        <div style="
          margin: 10px 14px 14px; padding: 7px 10px;
          background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.25);
          border-radius: 8px; display:flex;justify-content:space-between;align-items:center;
        ">
          <div style="font-size:7.5px;color:#c4b5fd;font-style:italic;">${data.schoolMotto || 'Excellence in Education'}</div>
          <div style="font-size:7.5px;color:#a855f7;font-weight:700;">${data.academicYear || '2026-27'}</div>
        </div>
      </div>
    `;
  },
};

function goldBadge(text) {
  return `<div style="display:inline-block;background:linear-gradient(135deg,#78350f,#b45309);padding:2px 8px;border-radius:20px;font-size:8px;font-weight:700;color:#fbbf24;letter-spacing:0.5px;">${text}</div>`;
}

function premRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px;">
      <span style="font-size:7px;color:#7c3aed;min-width:32px;text-transform:uppercase;font-weight:700;">${label}:</span>
      <span style="font-size:8.5px;color:#e2e8f0;font-weight:600;">${value}</span>
    </div>
  `;
}
