/**
 * @template ClassicStaff — Staff ID Card
 * @description Formal maroon/burgundy style for senior non-teaching staff,
 * double-border design, traditional institution aesthetic.
 */
export const classicStaffCard = {
  id: 'staff-id-classic',
  name: 'Classic',
  category: 'staff-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Georgia', serif;
        background: #fff; border-radius: 8px; overflow: hidden;
        border: 2px solid #881337; box-shadow: 0 4px 16px rgba(136,19,55,0.12);
        display: flex; flex-direction: column;
      ">
        <!-- Maroon header -->
        <div style="background:linear-gradient(135deg,#881337,#9f1239);padding:7px 12px;display:flex;align-items:center;gap:8px;">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:28px;width:28px;object-fit:contain;border-radius:4px;background:#fff;padding:2px;" />`
            : `<div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;font-family:Georgia,serif;">S</div>`
          }
          <div style="flex:1;">
            <div style="font-size:10px;font-weight:700;color:#fff;font-family:Georgia,serif;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:6.5px;color:#fda4af;letter-spacing:1.5px;text-transform:uppercase;font-family:'Inter',sans-serif;">Non-Teaching Staff ID</div>
          </div>
        </div>

        <!-- Double line -->
        <div style="border-top:1px solid #881337;border-bottom:1px solid #fecdd3;height:4px;"></div>

        <!-- Body -->
        <div style="flex:1;padding:8px 12px;display:flex;gap:12px;">
          <div style="flex-shrink:0;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:54px;height:62px;object-fit:cover;border:1.5px solid #881337;" />`
              : `<div style="width:54px;height:62px;background:#fff1f2;border:1.5px solid #881337;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#881337;font-family:Georgia,serif;">${initials}</div>`
            }
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;color:#0f172a;font-family:Georgia,serif;margin-bottom:3px;border-bottom:1px solid #fecdd3;padding-bottom:3px;">${data.name || 'Staff Name'}</div>
            ${csRow('Designation', data.designation || 'Staff')}
            ${csRow('Department', data.department || '—')}
            ${csRow('Employee ID', data.employeeId || '—')}
            ${csRow('Phone', data.phone || '—')}
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top:2px solid #881337;background:#fff1f2;padding:4px 12px;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#881337;font-style:italic;font-family:Georgia,serif;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#9f1239;font-family:'Inter',sans-serif;">${data.schoolPhone || ''}</div>
        </div>
      </div>
    `;
  },
};

function csRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#9ca3af;min-width:68px;font-family:'Inter',sans-serif;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#1e293b;font-family:'Inter',sans-serif;">${value}</span>
    </div>
  `;
}
