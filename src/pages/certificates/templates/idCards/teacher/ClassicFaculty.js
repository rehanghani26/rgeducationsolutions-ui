/**
 * @template ClassicFaculty — Teacher ID Card
 * @description Traditional white horizontal teacher card with navy blue header,
 * subtle watermark, formal typography. Classic institution feel.
 */
export const classicFacultyCard = {
  id: 'teacher-id-classic',
  name: 'Classic Faculty',
  category: 'teacher-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'T').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const subjects = Array.isArray(data.subjectsAssigned) ? data.subjectsAssigned.slice(0, 2).join(' | ') : (data.subjectsAssigned || '');
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Georgia', serif;
        background: #fff; border-radius: 8px; overflow: hidden;
        border: 1.5px solid #1e3a8a;
        box-shadow: 0 4px 16px rgba(30,58,138,0.15);
        display: flex; flex-direction: column;
      ">
        <!-- Blue header -->
        <div style="background:#1e3a8a;padding:8px 12px;display:flex;align-items:center;gap:8px;">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:30px;width:30px;object-fit:contain;border-radius:4px;background:#fff;padding:2px;" />`
            : `<div style="width:30px;height:30px;background:rgba(255,255,255,0.2);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;font-family:Georgia,serif;">S</div>`
          }
          <div style="flex:1;">
            <div style="font-size:10.5px;font-weight:700;color:#fff;font-family:Georgia,serif;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:7px;color:#bfdbfe;letter-spacing:2px;text-transform:uppercase;font-family:'Inter',sans-serif;">Faculty Identity Card</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:7px;color:#93c5fd;font-family:'Inter',sans-serif;">${data.schoolPhone || ''}</div>
          </div>
        </div>

        <!-- Double line separator -->
        <div style="border-top:1px solid #1e3a8a;border-bottom:1px solid #bfdbfe;height:4px;"></div>

        <!-- Body: photo + info -->
        <div style="flex:1;padding:8px 12px;display:flex;gap:12px;">
          <div style="flex-shrink:0;text-align:center;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:54px;height:64px;object-fit:cover;border:1.5px solid #1e3a8a;" />`
              : `<div style="width:54px;height:64px;background:#dbeafe;border:1.5px solid #1e3a8a;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#1e3a8a;font-family:Georgia,serif;">${initials}</div>`
            }
            <div style="font-size:6.5px;color:#6b7280;margin-top:2px;font-family:'Inter',sans-serif;">PHOTO</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;color:#0f172a;border-bottom:1px solid #dbeafe;padding-bottom:4px;margin-bottom:5px;font-family:Georgia,serif;">${data.name || 'Teacher Name'}</div>
            ${cRow('Designation', data.designation || 'Teacher')}
            ${cRow('Department', data.department || '—')}
            ${cRow('Employee ID', data.employeeId || '—')}
            ${subjects ? cRow('Subject(s)', subjects) : ''}
            ${cRow('Joining Date', data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-IN') : '—')}
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top:2px solid #1e3a8a;background:#f0f7ff;padding:4px 12px;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#1e3a8a;font-style:italic;font-family:Georgia,serif;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#6b7280;font-family:'Inter',sans-serif;">${data.schoolEmail || ''}</div>
        </div>
      </div>
    `;
  },
};

function cRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#6b7280;min-width:68px;font-family:'Inter',sans-serif;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#1e293b;font-family:'Inter',sans-serif;">${value}</span>
    </div>
  `;
}
