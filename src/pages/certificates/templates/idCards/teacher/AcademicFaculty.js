/**
 * @template AcademicFaculty — Teacher ID Card
 * @description Emerald academic style matching the AcademicStudent template family.
 * Two-column layout, QR placeholder area, formal academic aesthetic.
 */
export const academicFacultyCard = {
  id: 'teacher-id-academic',
  name: 'Academic Faculty',
  category: 'teacher-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'T').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const subjects = Array.isArray(data.subjectsAssigned) ? data.subjectsAssigned.slice(0, 2).join(', ') : (data.subjectsAssigned || '');
    return `
      <div style="
        width: 86mm; min-height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 10px; overflow: hidden;
        border: 2px solid #059669; box-shadow: 0 4px 16px rgba(5,150,105,0.15);
      ">
        <!-- Green header -->
        <div style="height:4px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>
        <div style="background:linear-gradient(135deg,#064e3b,#065f46);padding:8px 12px;display:flex;align-items:center;gap:8px;">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:28px;width:28px;object-fit:contain;border-radius:4px;background:#fff;padding:2px;" />`
            : `<div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;">S</div>`
          }
          <div>
            <div style="font-size:10px;font-weight:800;color:#fff;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:6.5px;color:#a7f3d0;letter-spacing:2px;text-transform:uppercase;">Faculty Identity Card</div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:10px 12px;display:flex;gap:12px;">
          <div style="flex-shrink:0;display:flex;flex-direction:column;gap:6px;align-items:center;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:56px;height:66px;object-fit:cover;border-radius:6px;border:2px solid #059669;" />`
              : `<div style="width:56px;height:66px;border-radius:6px;border:2px solid #059669;background:linear-gradient(135deg,#d1fae5,#a7f3d0);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#065f46;">${initials}</div>`
            }
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:2px 6px;text-align:center;">
              <div style="font-size:6.5px;font-weight:800;color:#059669;letter-spacing:0.5px;">FACULTY</div>
            </div>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:800;color:#064e3b;border-bottom:1px dashed #a7f3d0;padding-bottom:4px;margin-bottom:6px;">${data.name || 'Teacher Name'}</div>
            <div style="background:#f0fdf4;border-left:3px solid #10b981;padding:3px 8px;border-radius:0 4px 4px 0;margin-bottom:6px;">
              <div style="font-size:9px;font-weight:800;color:#047857;">${data.designation || 'Teacher'}</div>
              ${data.department ? `<div style="font-size:7.5px;color:#6b7280;">${data.department}</div>` : ''}
            </div>
            ${aRow('Employee ID', data.employeeId)}
            ${subjects ? aRow('Subject(s)', subjects) : ''}
            ${aRow('Joined', data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—')}
          </div>
        </div>

        <div style="height:4px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>
        <div style="background:#f0fdf4;padding:4px 12px;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#047857;font-style:italic;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#6b7280;">${data.schoolPhone || ''}</div>
        </div>
      </div>
    `;
  },
};

function aRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#9ca3af;min-width:58px;text-transform:uppercase;font-weight:600;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#1e293b;">${value}</span>
    </div>
  `;
}
