/**
 * @template CorporateStaff — Staff ID Card
 * @description Clean corporate style — slate/grey color scheme, professional,
 * horizontal layout suitable for administrative/office staff.
 */
export const corporateStaffCard = {
  id: 'staff-id-corporate',
  name: 'Corporate',
  category: 'staff-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 10px; overflow: hidden;
        border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        display: flex; flex-direction: column;
      ">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:8px 12px;display:flex;align-items:center;gap:8px;">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:28px;width:28px;object-fit:contain;border-radius:4px;background:#fff;padding:2px;" />`
            : `<div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:12px;">S</div>`
          }
          <div style="flex:1;">
            <div style="font-size:10px;font-weight:800;color:#fff;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:6.5px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Staff Identity Card</div>
          </div>
          <div style="background:rgba(255,255,255,0.1);border-radius:4px;padding:2px 8px;">
            <span style="font-size:7px;font-weight:700;color:#e2e8f0;letter-spacing:1px;">STAFF</span>
          </div>
        </div>

        <!-- Body -->
        <div style="flex:1;padding:10px 12px;display:flex;gap:12px;">
          <div style="flex-shrink:0;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:56px;height:64px;object-fit:cover;border-radius:6px;border:1.5px solid #475569;" />`
              : `<div style="width:56px;height:64px;border-radius:6px;border:1.5px solid #475569;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#334155;">${initials}</div>`
            }
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:4px;">${data.name || 'Staff Name'}</div>
            <div style="display:inline-block;background:#f1f5f9;border:1px solid #cbd5e1;padding:1px 8px;border-radius:4px;margin-bottom:6px;">
              <span style="font-size:8px;font-weight:700;color:#475569;">${data.designation || 'Staff'}</span>
            </div>
            ${sRow('Employee ID', data.employeeId)}
            ${sRow('Department', data.department)}
            ${sRow('Phone', data.phone)}
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:5px 12px;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#64748b;font-style:italic;">${data.schoolMotto || ''}</div>
          <div style="font-size:7px;color:#94a3b8;">${data.schoolEmail || ''}</div>
        </div>
      </div>
    `;
  },
};

function sRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;margin-bottom:3px;align-items:baseline;">
      <span style="font-size:7px;color:#9ca3af;min-width:58px;text-transform:uppercase;font-weight:600;">${label}:</span>
      <span style="font-size:8.5px;font-weight:700;color:#374151;">${value}</span>
    </div>
  `;
}
