import { Wand2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import FormSelect from '../../components/ui/FormSelect.jsx';
import FormTextarea from '../../components/ui/FormTextarea.jsx';
import PermissionMatrix from '../../components/ui/PermissionMatrix.jsx';
import { getClasses, getSections } from '../../services';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../../constants/academicOptions.js';
import { getDefaultRolePermissions } from '../../config/access.jsx';

export const permissionOptions = [
  ['dashboard', 'Dashboard Access'],
  ['academics', 'Academic Access'],
  ['attendance', 'Attendance View'],
  ['fees', 'Fees View'],
  ['exams', 'Exams View'],
];

export const initialStudentForm = {
  firstName: '',
  lastName: '',
  gender: 'Male',
  dob: '',
  bloodGroup: '',
  contactNumber: '',
  alternatePhone: '',
  email: '',
  address: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  classId: '',
  sectionId: '',
  class: '',
  section: '',
  parentName: '',
  parentContact: '',
  parentEmail: '',
  aadhaarNumber: '',
  permissions: getDefaultRolePermissions('student'),
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
};

export const blankStudentForm = initialStudentForm;
export const randomPassword = () =>
  `Std@${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'Passout', label: 'Passout / Graduated' },
];

const StudentForm = ({
  form,
  onChange,
  editing = false,
  onSubmit,
  onCancel,
  submitting,
  hideButtons = false,
  showAccessControl = false,
}) => {
  const [classes, setClasses] = useState(CLASS_OPTIONS);
  const [sections, setSections] = useState(SECTION_OPTIONS);

  useEffect(() => {
    getClasses()
      .then((res) => {
        const list = res?.classes || res?.data?.classes;
        if (list?.length > 0) setClasses(list);
      })
      .catch(() => {});
    getSections()
      .then((res) => {
        const list = res?.sections || res?.data?.sections;
        if (list?.length > 0) setSections(list);
      })
      .catch(() => {});
  }, []);

  const updateField = (field, value) => onChange({ ...form, [field]: value });

  const togglePermission = (permission) => {
    const permissions = form.permissions.includes(permission)
      ? form.permissions.filter((p) => p !== permission)
      : [...form.permissions, permission];
    updateField('permissions', permissions);
  };

  const generatePwd = () => {
    const next = randomPassword();
    onChange({ ...form, password: next, confirmPassword: next });
  };

  const classOptions = classes.map((c) => ({
    value: c.id || c._id || c.name,
    label: c.name,
  }));

  const sectionOptions = SECTION_OPTIONS.map((s) => ({
    value: s.id || s._id || s.name,
    label: s.name,
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Section 1: Personal Information ───────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
            Personal Information
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              options={GENDER_OPTIONS}
            />
            <FormInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob}
              onChange={(e) => updateField('dob', e.target.value)}
            />
          </div>

          <FormInput
            label="Phone Number"
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            onChange={(e) => updateField('contactNumber', e.target.value)}
            required
          />
          <FormInput
            label="Alternate Phone"
            name="alternatePhone"
            type="tel"
            value={form.alternatePhone}
            onChange={(e) => updateField('alternatePhone', e.target.value)}
          />
          <FormTextarea
            label="Address"
            name="address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            rows={3}
          />
        </section>

        {/* ── Section 2: Academic & Guardian ────────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
            Academic &amp; Guardian
          </h4>

          {/* Auto-assigned badge when editing */}
          {editing && (form.admissionNumber || form.rollNumber) && (
            <div className="flex flex-wrap gap-2">
              {form.admissionNumber && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Admission No:</span>
                  <span className="font-mono text-xs font-bold">{form.admissionNumber}</span>
                </div>
              )}
              {form.rollNumber != null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Roll No:</span>
                  <span className="font-mono text-xs font-bold">{form.rollNumber}</span>
                </div>
              )}
            </div>
          )}

          {!editing && (
            <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">Auto-Assigned:</span>
                Admission Number is globally unique (STD-{new Date().getFullYear()}-XXXX). Roll Number
                is assigned automatically per class &amp; section starting from 1.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Class"
              name="classId"
              value={form.classId || form.class || ''}
              onChange={(e) => {
                const val = e.target.value;
                const selectedObj = classes?.find((c) => (c.id || c._id || c.name) === val);
                const className = selectedObj?.name || val;
                onChange({ ...form, classId: val, class: className, className, sectionId: '' });
              }}
              options={classOptions}
              placeholder="Select Class"
            />
            <FormSelect
              label="Section"
              name="sectionId"
              value={form.sectionId || form.section || ''}
              onChange={(e) => {
                const val = e.target.value;
                const selectedObj = SECTION_OPTIONS.find((s) => (s.id || s._id || s.name) === val);
                const sectionName = selectedObj?.name || val;
                onChange({ ...form, sectionId: val, section: sectionName, sectionName });
              }}
              options={sectionOptions}
              placeholder="Select Section"
            />
          </div>

          <FormSelect
            label="Blood Group"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={(e) => updateField('bloodGroup', e.target.value)}
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Select Blood Group"
          />
          <FormInput
            label="Parent / Guardian"
            name="parentName"
            value={form.parentName}
            onChange={(e) => updateField('parentName', e.target.value)}
            required
          />
          <FormInput
            label="Parent Contact"
            name="parentContact"
            type="tel"
            value={form.parentContact}
            onChange={(e) => updateField('parentContact', e.target.value)}
            required
          />
          <FormInput
            label="Parent Email"
            name="parentEmail"
            type="email"
            value={form.parentEmail}
            onChange={(e) => updateField('parentEmail', e.target.value)}
          />
        </section>

        {/* ── Section 3: Account & Credentials ─────────────────────────── */}
        <section className="space-y-3">
          <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
            Student Account &amp; Login Credentials
          </h4>

          <FormInput
            label="Student Login Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="e.g. student101@school.com"
            required
          />

          {!editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <FormInput
                  label="Account Login Password"
                  name="password"
                  type="text"
                  value={form.password}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange({ ...form, password: val, confirmPassword: val });
                  }}
                  placeholder="Enter login password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Wand2 size={16} />}
                  onClick={generatePwd}
                  className="mb-[1px] p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 hover:bg-indigo-100 !rounded-lg"
                  title="Auto-generate password"
                />
              </div>
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="text"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
              />
            </div>
          )}

          {editing && (
            <PermissionMatrix
              permissions={form.permissions}
              options={permissionOptions}
              onChange={togglePermission}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              options={STATUS_OPTIONS}
            />
            <FormInput
              label="Expiry Date"
              name="accountExpiryDate"
              type="date"
              value={form.accountExpiryDate}
              onChange={(e) => updateField('accountExpiryDate', e.target.value)}
            />
          </div>
        </section>
      </div>

      {!hideButtons && onCancel && (
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={14} />}
            loading={submitting}
          >
            {submitting ? 'Saving...' : 'Save Student'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StudentForm;
