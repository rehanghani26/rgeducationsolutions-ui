/**
 * @template ProfessionalStaff — Staff ID Card
 * @description Royal blue professional staff card, similar to ProfessionalFaculty
 * but distinctly styled for non-teaching staff with department focus.
 */
export const professionalStaffCard = {
  id: 'staff-id-professional',
  name: 'Professional',
  category: 'staff-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 12px; overflow: hidden;
        box-shadow: 0 4px 20px rgba(37,99,235,0.15); display: flex;
        border: 1px solid #bfdbfe;
      ">
        <!-- Left blue stripe with role label -->
        <div style="
          width: 10px; background: linear-gradient(180deg, #1d4ed8, #3b82f6, #60a5fa);
          flex-shrink:0;
        "></div>

        <!-- Content -->
        <div style="flex:1;display:flex;flex-direction:column;">
          <!-- Header -->
          <div style="padding:8px 10px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #dbeafe;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:26px;width:26px;object-fit:contain;border-radius:4px;background:#eff6ff;padding:2px;" />`
              : `<div style="width:26px;height:26px;background:#dbeafe;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#1d4ed8;font-size:11px;">S</div>`
            }
            <div style="flex:1;">
              <div style="font-size:9.5px;font-weight:800;color:#1e3a8a;">${data.schoolName || 'School Name'}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:7px;color:#3b82f6;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Staff ID</div>
            </div>
          </div>

          <!-- Body -->
          <div style="flex:1;padding:8px 10px;display:flex;gap:10px;">
            <div style="flex-shrink:0;">
              ${data.photo
                ? `<img src="${data.photo}" style="width:50px;height:58px;object-fit:cover;border-radius:6px;border:2px solid #3b82f6;" />`
                : `<div style="width:50px;height:58px;border-radius:6px;border:2px solid #3b82f6;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#1d4ed8;">${initials}</div>`
              }
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px;">${data.name || 'Staff Name'}</div>
              <div style="font-size:8.5px;color:#3b82f6;font-weight:700;margin-bottom:6px;">${data.designation || 'Staff'} ${data.department ? '· ' + data.department : ''}</div>
              ${psRow('ID', data.employeeId)}
              ${psRow('Phone', data.phone)}
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:4px 10px;border-top:1px solid #dbeafe;background:#eff6ff;display:flex;justify-content:space-between;">
            <div style="font-size:6.5px;color:#3b82f6;font-style:italic;">${data.schoolMotto || ''}</div>
            <div style="font-size:6.5px;color:#94a3b8;">${data.schoolPhone || ''}</div>
          </div>
        </div>
      </div>
    `;
  },
};

function psRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#9ca3af;min-width:30px;text-transform:uppercase;font-weight:600;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#374151;">${value}</span>
    </div>
  `;
}
