/**
 * @template MinimalStaff — Staff ID Card
 * @description Ultra-minimal monochrome white card. Clean, no-frills design
 * focused on readability. Perfect for administrative use.
 */
export const minimalStaffCard = {
  id: 'staff-id-minimal',
  name: 'Minimal',
  category: 'staff-id-card',
  orientation: 'horizontal',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; height: 54mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 8px; overflow: hidden;
        border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        display: flex; flex-direction: column;
      ">
        <!-- Minimal top bar -->
        <div style="height:3px;background:#0f172a;"></div>

        <!-- Header: just text -->
        <div style="padding:7px 12px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:6px;">
            ${data.schoolLogo
              ? `<img src="${data.schoolLogo}" style="height:20px;width:20px;object-fit:contain;" />`
              : ''
            }
            <div style="font-size:9.5px;font-weight:800;color:#0f172a;letter-spacing:0.2px;">${data.schoolName || 'School Name'}</div>
          </div>
          <div style="font-size:7px;font-weight:700;color:#64748b;letter-spacing:2px;text-transform:uppercase;">Staff ID</div>
        </div>

        <!-- Body -->
        <div style="flex:1;padding:8px 12px;display:flex;gap:12px;align-items:center;">
          <!-- Photo/initials -->
          <div>
            ${data.photo
              ? `<img src="${data.photo}" style="width:52px;height:58px;object-fit:cover;border-radius:4px;" />`
              : `<div style="width:52px;height:58px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#475569;">${initials}</div>`
            }
          </div>

          <!-- Info -->
          <div style="flex:1;border-left:2px solid #f1f5f9;padding-left:12px;">
            <div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:4px;line-height:1.1;">${data.name || 'Staff Name'}</div>
            <div style="font-size:9px;color:#64748b;font-weight:600;margin-bottom:8px;">${data.designation || 'Staff'} ${data.department ? '· ' + data.department : ''}</div>
            <div style="display:flex;gap:16px;">
              ${minCell('ID', data.employeeId || '—')}
              ${minCell('Phone', data.phone || '—')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:5px 12px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;">
          <div style="font-size:7px;color:#94a3b8;">${data.schoolAddress || ''}</div>
          <div style="font-size:7px;color:#94a3b8;">${data.schoolPhone || ''}</div>
        </div>
        <div style="height:2px;background:#f1f5f9;"></div>
      </div>
    `;
  },
};

function minCell(label, value) {
  return `
    <div>
      <div style="font-size:6.5px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">${label}</div>
      <div style="font-size:9px;font-weight:700;color:#1e293b;">${value}</div>
    </div>
  `;
}
