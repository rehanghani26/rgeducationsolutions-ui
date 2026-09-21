/**
 * @template ModernFaculty — Teacher ID Card
 * @description Modern dark card with indigo/violet gradient, large photo,
 * subjects as pill badges. Vibrant and contemporary faculty card.
 */
export const modernFacultyCard = {
  id: 'teacher-id-modern',
  name: 'Modern Faculty',
  category: 'teacher-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'T').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const subjects = Array.isArray(data.subjectsAssigned) ? data.subjectsAssigned.slice(0, 3) : [];
    return `
      <div style="
        width: 70mm; font-family: 'Inter', Arial, sans-serif;
        background: linear-gradient(145deg, #0f172a, #1e1b4b 60%, #0f172a);
        border-radius: 16px; overflow: hidden;
        box-shadow: 0 8px 32px rgba(99,102,241,0.35);
        border: 1px solid rgba(99,102,241,0.3);
      ">
        <!-- Top accent -->
        <div style="height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#8b5cf6,#6366f1);"></div>

        <!-- Header -->
        <div style="padding:12px 14px 8px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:8px;color:#818cf8;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Faculty</div>
            <div style="font-size:9.5px;font-weight:800;color:#e2e8f0;">${data.schoolName || 'School Name'}</div>
          </div>
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:26px;width:26px;object-fit:contain;border-radius:5px;background:rgba(255,255,255,0.1);padding:2px;" />`
            : `<div style="width:26px;height:26px;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#818cf8;">S</div>`
          }
        </div>

        <!-- Photo -->
        <div style="padding:0 14px;text-align:center;">
          <div style="display:inline-block;position:relative;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:72px;height:84px;object-fit:cover;border-radius:12px;border:3px solid #6366f1;" />`
              : `<div style="width:72px;height:84px;border-radius:12px;border:3px solid #6366f1;background:linear-gradient(135deg,#1e1b4b,#312e81);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#818cf8;">${initials}</div>`
            }
          </div>
        </div>

        <!-- Name + Designation -->
        <div style="padding:10px 14px 6px;text-align:center;">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:2px;">${data.name || 'Teacher Name'}</div>
          <div style="font-size:9px;color:#8b5cf6;font-weight:600;margin-bottom:6px;">${data.designation || 'Teacher'} ${data.department ? '· ' + data.department : ''}</div>

          <!-- Subject pills -->
          <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">
            ${subjects.map(s => `<span style="background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);color:#a5b4fc;font-size:7px;font-weight:700;padding:2px 7px;border-radius:20px;">${s}</span>`).join('')}
          </div>

          <!-- ID -->
          <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:8px;padding:5px 10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:7px;color:#64748b;text-transform:uppercase;font-weight:700;">Employee ID</span>
            <span style="font-size:9px;font-weight:800;color:#c7d2fe;">${data.employeeId || 'TCH-0001'}</span>
          </div>
        </div>

        <!-- Bottom -->
        <div style="padding:8px 14px;border-top:1px solid rgba(99,102,241,0.2);text-align:center;">
          <div style="font-size:7px;color:#475569;font-style:italic;">${data.schoolMotto || ''}</div>
        </div>
      </div>
    `;
  },
};
