/**
 * @template PremiumFaculty — Teacher ID Card
 * @description Premium dark gold teacher card with metallic gradients,
 * elegant typography, department badge. Distinct premium executive look.
 */
export const premiumFacultyCard = {
  id: 'teacher-id-premium',
  name: 'Premium Faculty',
  category: 'teacher-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'T').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const subjects = Array.isArray(data.subjectsAssigned) ? data.subjectsAssigned.slice(0, 3) : [];
    return `
      <div style="
        width: 70mm; font-family: 'Inter', Arial, sans-serif;
        background: linear-gradient(145deg, #1c1400 0%, #2c1f02 50%, #1c1400 100%);
        border-radius: 16px; overflow: hidden;
        box-shadow: 0 8px 32px rgba(251,191,36,0.3), 0 0 0 1px rgba(251,191,36,0.2);
      ">
        <!-- Gold top bar -->
        <div style="height:3px;background:linear-gradient(90deg,#78350f,#fbbf24,#f59e0b,#fbbf24,#78350f);"></div>

        <!-- School header -->
        <div style="padding:12px 14px 8px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:7.5px;color:#fbbf24;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Faculty</div>
            <div style="font-size:9.5px;font-weight:800;color:#fde68a;">${data.schoolName || 'School Name'}</div>
          </div>
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:28px;width:28px;object-fit:contain;border-radius:5px;background:rgba(255,255,255,0.1);padding:2px;" />`
            : `<div style="width:28px;height:28px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);border-radius:5px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fbbf24;font-size:11px;">S</div>`
          }
        </div>

        <!-- Photo -->
        <div style="padding:0 14px;text-align:center;">
          ${data.photo
            ? `<img src="${data.photo}" style="width:72px;height:84px;object-fit:cover;border-radius:12px;border:2px solid #fbbf24;box-shadow:0 4px 16px rgba(251,191,36,0.3);" />`
            : `<div style="width:72px;height:84px;border-radius:12px;border:2px solid #fbbf24;background:linear-gradient(135deg,#292100,#3b2e01);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fbbf24;">${initials}</div>`
          }
        </div>

        <!-- Name + designation -->
        <div style="padding:10px 14px 6px;text-align:center;">
          <div style="font-size:14px;font-weight:800;color:#fde68a;margin-bottom:2px;">${data.name || 'Teacher Name'}</div>
          <div style="background:linear-gradient(135deg,#78350f,#b45309);display:inline-block;padding:2px 12px;border-radius:20px;margin-bottom:6px;">
            <span style="font-size:8px;font-weight:700;color:#fbbf24;">${data.designation || 'Teacher'}</span>
          </div>
          ${data.department ? `<div style="font-size:8px;color:#d97706;margin-bottom:6px;">${data.department}</div>` : ''}

          <!-- Subjects as dots -->
          ${subjects.length > 0 ? `
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">
              ${subjects.map(s => `<span style="background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);color:#fbbf24;font-size:7px;font-weight:700;padding:2px 6px;border-radius:20px;">${s}</span>`).join('')}
            </div>
          ` : ''}

          <!-- Employee ID -->
          <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:5px 10px;display:flex;justify-content:space-between;">
            <span style="font-size:7px;color:#92400e;text-transform:uppercase;font-weight:700;">Employee ID</span>
            <span style="font-size:9px;font-weight:800;color:#fbbf24;">${data.employeeId || 'TCH-0001'}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:8px 14px;border-top:1px solid rgba(251,191,36,0.15);text-align:center;">
          <div style="font-size:7px;color:#78350f;font-style:italic;">${data.schoolMotto || ''}</div>
        </div>

        <!-- Gold bottom bar -->
        <div style="height:3px;background:linear-gradient(90deg,#78350f,#fbbf24,#f59e0b,#fbbf24,#78350f);"></div>
      </div>
    `;
  },
};
