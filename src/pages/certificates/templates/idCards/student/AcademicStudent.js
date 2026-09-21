/**
 * @template AcademicStudent — Student ID Card
 * @description Academic style with emerald/teal color scheme, structured info table,
 * school emblem prominence, and formal document aesthetic.
 */
export const academicStudentCard = {
  id: 'student-id-academic',
  name: 'Academic',
  category: 'student-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; min-height: 54mm; font-family: 'Georgia', 'Times New Roman', serif;
        border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        background: #fff; border: 2px solid #059669;
      ">
        <!-- Top Gold Header Bar -->
        <div style="height:4px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>

        <!-- School Header -->
        <div style="
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
          padding: 10px 12px; text-align: center;
        ">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:32px;width:32px;object-fit:contain;border-radius:50%;background:#fff;padding:3px;margin:0 auto 4px;display:block;" />`
            : `<div style="width:32px;height:32px;background:rgba(255,255,255,0.15);border-radius:50%;border:2px solid #6ee7b7;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;">S</div>`
          }
          <div style="font-size:10px;font-weight:800;color:#fff;letter-spacing:0.5px;">${data.schoolName || 'School Name'}</div>
          <div style="font-size:7px;color:#a7f3d0;margin-top:1px;letter-spacing:1.5px;text-transform:uppercase;">Identity Card · Academic ${data.academicYear || '2026-27'}</div>
        </div>

        <!-- Photo + Info Row -->
        <div style="padding:12px;display:flex;gap:12px;align-items:flex-start;">
          <div style="flex-shrink:0;text-align:center;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:56px;height:68px;object-fit:cover;border-radius:6px;border:2px solid #059669;" />`
              : `<div style="width:56px;height:68px;border-radius:6px;border:2px solid #059669;background:linear-gradient(135deg,#d1fae5,#a7f3d0);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#065f46;">${initials}</div>`
            }
            <div style="font-size:7px;color:#059669;margin-top:3px;font-weight:700;">PHOTO</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:800;color:#064e3b;margin-bottom:2px;border-bottom:1px dashed #a7f3d0;padding-bottom:4px;">${data.name || 'Student Name'}</div>
            ${tRow('ID No.', data.admissionNumber)}
            ${tRow('Class', `${data.class || ''} ${data.section ? '| ' + data.section : ''}`)}
            ${tRow('Roll No.', data.rollNumber || '—')}
            ${tRow('Date of Birth', data.dob ? new Date(data.dob).toLocaleDateString('en-IN') : '—')}
            ${data.bloodGroup ? tRow('Blood Group', data.bloodGroup) : ''}
          </div>
        </div>

        <!-- Parent Info -->
        <div style="padding: 0 12px 8px;">
          ${tRow("Father's Name", data.parentName || '—')}
        </div>

        <!-- Footer -->
        <div style="height:4px;background:linear-gradient(90deg,#059669,#10b981,#f59e0b,#10b981,#059669);"></div>
        <div style="background:#f0fdf4;padding:5px 12px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:7px;color:#047857;font-style:italic;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#6b7280;">${data.schoolPhone || ''}</div>
        </div>
      </div>
    `;
  },
};

function tRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#6b7280;min-width:62px;font-family:'Inter',sans-serif;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#1e293b;font-family:'Inter',sans-serif;">${value}</span>
    </div>
  `;
}
