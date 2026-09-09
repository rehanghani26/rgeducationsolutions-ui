import { Wand2, Save } from 'lucide-react';
import PermissionMatrix from '../../components/ui/PermissionMatrix.jsx';
import Button from '../../components/ui/Button.jsx';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../../constants/academicOptions.js';
import { getDefaultRolePermissions } from '../../config/access.jsx';
import {
  DESIGNATION_OPTIONS,
  DEPARTMENT_OPTIONS,
  QUALIFICATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHER_ROLE_OPTIONS,
} from '../../constants/teacherOptions.js';

export const permissionOptions = [
  ['dashboard', 'Dashboard Access'],
  ['student-management', 'Student Management'],
  ['attendance', 'Attendance Management'],
  ['exam', 'Exam Management'],
  ['marks', 'Marks Entry'],
  ['homework', 'Homework Management'],
  ['timetable', 'Timetable Access'],
  ['leave', 'Leave Management'],
  ['fee', 'Fee Management'],
  ['library', 'Library Access'],
  ['inventory', 'Inventory Access'],
  ['reports', 'Reports Access'],
  ['communication', 'Communication Access'],
];

export const blankTeacherForm = {
  firstName: '',
  lastName: '',
  gender: 'Male',
  dob: '',
  phone: '',
  alternatePhone: '',
  email: '',
  address: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  designation: DESIGNATION_OPTIONS[0].value,
  department: DEPARTMENT_OPTIONS[0].value,
  qualification: QUALIFICATION_OPTIONS[0].value,
  experience: EXPERIENCE_OPTIONS[2].value,
  salary: '',
  classesAssignedText: CLASS_OPTIONS[12].name, // Class 10
  sectionsAssignedText: SECTION_OPTIONS[0].name, // Section A
  subjectsAssignedText: SUBJECT_OPTIONS[0].value,
  isClassTeacher: false,
  role: 'teacher',
  permissions: getDefaultRolePermissions('teacher'),
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
};

export const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
export const labelCls = 'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase';
export const randomPassword = () => `Tch@${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;

const splitList = (value) => value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];

const TeacherForm = ({ form, onChange, editing = false, onSubmit, onCancel, submitting, hideButtons = false }) => {
  const updateField = (field, value) => onChange({ ...form, [field]: value });

  const togglePermission = (permission) => {
    const permissions = form.permissions.includes(permission)
      ? form.permissions.filter((p) => p !== permission)
      : [...form.permissions, permission];
    updateField('permissions', permissions);
  };

  const handleRoleChange = (newRole) => {
    const defaultPerms = getDefaultRolePermissions(newRole);
    onChange({
      ...form,
      role: newRole,
      permissions: defaultPerms,
    });
  };

  const generatePwd = () => {
    const next = randomPassword();
    onChange({ ...form, password: next, confirmPassword: next });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="space-y-3">
          <h4 className="font-bold text-sm">Personal Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>First Name</label><input required className={inputCls} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} /></div>
            <div><label className={labelCls}>Last Name</label><input required className={inputCls} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Gender</label><select className={inputCls} value={form.gender} onChange={(e) => updateField('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
            <div><label className={labelCls}>Date of Birth</label><input type="date" className={inputCls} value={form.dob} onChange={(e) => updateField('dob', e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>Phone Number</label><input required className={inputCls} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
          <div><label className={labelCls}>Alternate Phone</label><input className={inputCls} value={form.alternatePhone} onChange={(e) => updateField('alternatePhone', e.target.value)} /></div>
          <div><label className={labelCls}>Email Address</label><input required type="email" className={inputCls} value={form.email} onChange={(e) => updateField('email', e.target.value)} /></div>
          <div><label className={labelCls}>Address</label><textarea className={inputCls} rows={3} value={form.address} onChange={(e) => updateField('address', e.target.value)} /></div>
        </section>

        <section className="space-y-3">
          <h4 className="font-bold text-sm">Professional &amp; Academic</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Joining Date</label><input type="date" className={inputCls} value={form.joiningDate} onChange={(e) => updateField('joiningDate', e.target.value)} /></div>
            <div><label className={labelCls}>Salary (₹)</label><input type="number" className={inputCls} value={form.salary} onChange={(e) => updateField('salary', e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>Designation</label>
            <select className={inputCls} value={form.designation} onChange={(e) => updateField('designation', e.target.value)}>
              <option value="">Select Designation</option>
              {DESIGNATION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <select className={inputCls} value={form.department} onChange={(e) => updateField('department', e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Qualification</label>
            <select className={inputCls} value={form.qualification} onChange={(e) => updateField('qualification', e.target.value)}>
              <option value="">Select Qualification</option>
              {QUALIFICATION_OPTIONS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Experience</label>
            <select className={inputCls} value={form.experience} onChange={(e) => updateField('experience', e.target.value)}>
              <option value="">Select Experience</option>
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp.value} value={exp.value}>{exp.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Classes Assigned</label>
            <select
              className={inputCls}
              value={form.classesAssignedText}
              onChange={(e) => updateField('classesAssignedText', e.target.value)}
            >
              <option value="">Select Assigned Class</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sections Assigned</label>
            <select
              className={inputCls}
              value={form.sectionsAssignedText}
              onChange={(e) => updateField('sectionsAssignedText', e.target.value)}
            >
              <option value="">Select Assigned Section</option>
              {SECTION_OPTIONS.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Primary Subject Assigned</label>
            <select className={inputCls} value={form.subjectsAssignedText} onChange={(e) => updateField('subjectsAssignedText', e.target.value)}>
              <option value="">Select Primary Subject</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub.value} value={sub.value}>{sub.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold">
            <input type="checkbox" checked={form.isClassTeacher} onChange={(e) => updateField('isClassTeacher', e.target.checked)} /> Class Teacher
          </label>
        </section>

        <section className="space-y-3">
          <h4 className="font-bold text-sm">Login, Role &amp; Permissions</h4>
          <div>
            <label className={labelCls}>Role Selection</label>
            <select className={inputCls} value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
              {TEACHER_ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {!editing && (
            <>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div><label className={labelCls}>Password</label><input required type="text" className={inputCls} value={form.password} onChange={(e) => updateField('password', e.target.value)} /></div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Wand2 size={16} />}
                  onClick={generatePwd}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 !rounded-lg"
                />
              </div>
              <div><label className={labelCls}>Confirm Password</label><input required type="text" className={inputCls} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} /></div>
            </>
          )}
          {editing && (
            <PermissionMatrix permissions={form.permissions} options={permissionOptions} onChange={togglePermission} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={(e) => updateField('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div><label className={labelCls}>Expiry Date</label><input type="date" className={inputCls} value={form.accountExpiryDate} onChange={(e) => updateField('accountExpiryDate', e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>Login Restriction</label><select className={inputCls} value={form.loginRestriction} onChange={(e) => updateField('loginRestriction', e.target.value)}><option value="none">None</option><option value="school-network">School Network</option><option value="office-hours">Office Hours</option></select></div>
          <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.forcePasswordChange} onChange={(e) => updateField('forcePasswordChange', e.target.checked)} /> Force Password Change on First Login</label>
          <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.twoFactorEnabled} onChange={(e) => updateField('twoFactorEnabled', e.target.checked)} /> Two Factor Authentication</label>
        </section>
      </div>

      {!hideButtons && onCancel && (
        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={14} />}
            loading={submitting}
          >
            {submitting ? 'Saving...' : 'Save Teacher'}
          </Button>
        </div>
      )}
    </form>
  );
};

export const payloadFromForm = (form) => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  gender: form.gender,
  dob: form.dob || undefined,
  phone: form.phone.trim(),
  alternatePhone: form.alternatePhone.trim(),
  email: form.email.trim(),
  address: form.address.trim(),
  joiningDate: form.joiningDate || undefined,
  designation: form.designation.trim(),
  department: form.department.trim(),
  qualification: form.qualification.trim(),
  experience: form.experience.trim(),
  salary: Number(form.salary) || 0,
  classesAssigned: splitList(form.classesAssignedText),
  sectionsAssigned: splitList(form.sectionsAssignedText),
  subjectsAssigned: splitList(form.subjectsAssignedText),
  isClassTeacher: form.isClassTeacher,
  role: form.role,
  permissions: form.permissions,
  status: form.status,
  accountExpiryDate: form.accountExpiryDate || undefined,
  loginRestriction: form.loginRestriction,
  twoFactorEnabled: form.twoFactorEnabled,
  forcePasswordChange: form.forcePasswordChange,
  password: form.password,
  confirmPassword: form.confirmPassword || form.password,
});

export default TeacherForm;
