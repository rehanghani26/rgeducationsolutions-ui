/**
 * @template ProfessionalFaculty — Teacher ID Card
 * @description Professional dark-teal horizontal layout with designation badge,
 * subjects listed, and authoritative faculty aesthetic.
 */
export const professionalFacultyCard = {
  id: 'teacher-id-professional',
  name: 'Professional Faculty',
  category: 'teacher-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'T').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const subjects = Array.isArray(data.subjectsAssigned) ? data.subjectsAssigned.slice(0, 2).join(', ') : data.subjectsAssigned || '';
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 12px; overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12); display: flex; flex-direction: column;
        border: 1px solid #e2e8f0;
      ">
        <!-- Header stripe -->
        <div style="
          background: linear-gradient(135deg, #134e4a 0%, #0d9488 100%);
          padding: 8px 12px; display: flex; align-items: center; gap: 8px;
        ">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:28px;width:28px;object-fit:contain;border-radius:5px;background:#fff;padding:2px;" />`
            : `<div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:5px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;">S</div>`
          }
          <div style="flex:1;">
            <div style="font-size:10px;font-weight:800;color:#fff;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:7px;color:#99f6e4;letter-spacing:1.5px;text-transform:uppercase;">Faculty Identity Card</div>
          </div>
          <div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;">
            <div style="font-size:7px;font-weight:800;color:#fff;letter-spacing:1px;">FACULTY</div>
          </div>
        </div>

        <!-- Body -->
        <div style="flex:1;padding:10px 12px;display:flex;gap:12px;">
          <!-- Photo -->
          <div style="flex-shrink:0;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:56px;height:66px;object-fit:cover;border-radius:8px;border:2px solid #0d9488;" />`
              : `<div style="width:56px;height:66px;border-radius:8px;border:2px solid #0d9488;background:linear-gradient(135deg,#ccfbf1,#99f6e4);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#134e4a;">${initials}</div>`
            }
          </div>

          <!-- Info -->
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:4px;">${data.name || 'Teacher Name'}</div>
            <div style="background:#f0fdfa;border-left:3px solid #0d9488;padding:2px 8px;border-radius:0 4px 4px 0;margin-bottom:6px;">
              <div style="font-size:9px;font-weight:700;color:#0d9488;">${data.designation || 'Teacher'}</div>
              ${data.department ? `<div style="font-size:7.5px;color:#6b7280;">${data.department}</div>` : ''}
            </div>
            ${fRow('Employee ID', data.employeeId)}
            ${fRow('Subject(s)', subjects)}
            ${fRow('Joined', data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—')}
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f0fdfa;border-top:1px solid #ccfbf1;padding:5px 12px;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#0d9488;font-style:italic;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#6b7280;">${data.schoolPhone || ''}</div>
        </div>
      </div>
    `;
  },
};

function fRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#9ca3af;min-width:58px;text-transform:uppercase;font-weight:600;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#374151;">${value}</span>
    </div>
  `;
}
