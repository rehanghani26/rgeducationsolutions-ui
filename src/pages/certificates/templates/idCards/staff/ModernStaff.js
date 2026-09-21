/**
 * @template ModernStaff — Staff ID Card
 * @description Rose/pink-accented modern staff card. Bold typography,
 * vertical design, overlapping photo circle. Distinctive and modern.
 */
export const modernStaffCard = {
  id: 'staff-id-modern',
  name: 'Modern',
  category: 'staff-id-card',
  orientation: 'vertical',
  version: 'v1',

  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 64mm; font-family: 'Inter', Arial, sans-serif;
        background: #fff; border-radius: 16px; overflow: hidden;
        box-shadow: 0 6px 24px rgba(244,63,94,0.18); border: 1px solid #fce7f3;
      ">
        <!-- Top section -->
        <div style="background:linear-gradient(135deg,#be123c,#f43f5e 50%,#fb7185);padding:18px 14px 52px;position:relative;text-align:center;">
          <div style="font-size:7.5px;font-weight:800;color:rgba(255,255,255,0.85);letter-spacing:2px;text-transform:uppercase;">Staff ID</div>
          <div style="font-size:9px;font-weight:700;color:#fff;margin-top:2px;">${data.schoolName || 'School'}</div>
          <div style="position:absolute;bottom:-38px;left:50%;transform:translateX(-50%);z-index:2;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:76px;height:76px;object-fit:cover;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.15);" />`
              : `<div style="width:76px;height:76px;border-radius:50%;border:4px solid #fff;background:linear-gradient(135deg,#fce7f3,#fbcfe8);box-shadow:0 4px 16px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#be123c;">${initials}</div>`
            }
          </div>
        </div>

        <!-- Info section -->
        <div style="padding:46px 14px 14px;text-align:center;">
          <div style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:2px;">${data.name || 'Staff Name'}</div>
          <div style="font-size:9px;color:#f43f5e;font-weight:700;margin-bottom:4px;">${data.designation || 'Staff'}</div>
          ${data.department ? `<div style="font-size:8px;color:#94a3b8;margin-bottom:10px;">${data.department}</div>` : '<div style="margin-bottom:10px;"></div>'}
          <div style="width:40px;height:3px;background:linear-gradient(90deg,#be123c,#f43f5e);border-radius:2px;margin:0 auto 10px;"></div>
          <div style="background:#fff1f2;border:1px solid #fce7f3;border-radius:10px;padding:8px 12px;margin-bottom:8px;">
            <div style="font-size:7px;color:#be123c;text-transform:uppercase;font-weight:700;margin-bottom:2px;">Employee ID</div>
            <div style="font-size:11px;font-weight:800;color:#1e293b;">${data.employeeId || 'STF-0001'}</div>
          </div>
          <div style="display:flex;justify-content:center;gap:6px;">
            ${data.schoolLogo ? `<img src="${data.schoolLogo}" style="height:16px;width:16px;object-fit:contain;" />` : ''}
            <div style="font-size:7px;color:#94a3b8;font-style:italic;">${data.schoolMotto || ''}</div>
          </div>
        </div>
      </div>
    `;
  },
};
