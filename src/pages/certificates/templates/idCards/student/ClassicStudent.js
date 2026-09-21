/**
 * @template ClassicStudent — Student ID Card
 * @description Classic vertical student ID card with traditional layout.
 * Blue header, centered photo, clean information rows.
 */
export const classicStudentCard = {
  id: 'student-id-classic',
  name: 'Classic Student',
  category: 'student-id-card',
  orientation: 'vertical',
  version: 'v1',

  /**
   * Renders the ID card HTML using the provided data object.
   * This function is the single source of truth — used for preview, print, and PDF.
   * @param {object} data - Combined school + student data
   * @returns {string} - Complete HTML string for the ID card
   */
  render: (data) => {
    const initials = (data.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div style="
        width: 86mm; min-height: 54mm; font-family: 'Inter', Arial, sans-serif;
        border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        background: #fff; border: 1px solid #e2e8f0;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 12px 14px; display: flex; align-items: center; gap: 10px;
        ">
          ${data.schoolLogo
            ? `<img src="${data.schoolLogo}" style="height:36px;width:36px;object-fit:contain;border-radius:6px;background:#fff;padding:2px;" />`
            : `<div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;">S</div>`
          }
          <div>
            <div style="font-size:11px;font-weight:800;color:#fff;letter-spacing:0.3px;">${data.schoolName || 'School Name'}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.8);margin-top:1px;">STUDENT IDENTITY CARD</div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 12px 14px; display: flex; gap: 12px;">
          <!-- Photo -->
          <div style="flex-shrink:0;">
            ${data.photo
              ? `<img src="${data.photo}" style="width:60px;height:72px;object-fit:cover;border-radius:8px;border:2px solid #3b82f6;" />`
              : `<div style="width:60px;height:72px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:8px;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#1e3a8a;">${initials}</div>`
            }
          </div>

          <!-- Info -->
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:6px;line-height:1.2;">${data.name || 'Student Name'}</div>
            ${infoRow('ID', data.admissionNumber || 'STU-0001')}
            ${infoRow('Class', `${data.class || ''} ${data.section ? '• ' + data.section : ''}`)}
            ${infoRow('Roll No.', data.rollNumber || '—')}
            ${data.bloodGroup ? infoRow('Blood', data.bloodGroup) : ''}
            ${infoRow('Session', data.academicYear || data.academicSession || '2026-27')}
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background: #f8fafc; border-top: 1px solid #e2e8f0;
          padding: 6px 14px; display: flex; justify-content: space-between; align-items: center;
        ">
          <div style="font-size:7.5px;color:#64748b;">${data.schoolPhone || ''}</div>
          <div style="font-size:7.5px;color:#64748b;font-style:italic;">${data.schoolMotto || 'Excellence in Education'}</div>
        </div>
      </div>
    `;
  },
};

// Helper for consistent info rows
function infoRow(label, value) {
  if (!value) return '';
  return `
    <div style="display:flex;gap:4px;align-items:baseline;margin-bottom:3px;">
      <span style="font-size:7.5px;font-weight:700;color:#64748b;min-width:46px;text-transform:uppercase;letter-spacing:0.4px;">${label}:</span>
      <span style="font-size:9px;font-weight:600;color:#1e293b;">${value}</span>
    </div>
  `;
}
