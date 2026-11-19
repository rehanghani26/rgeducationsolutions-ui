import { Save, Wand2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Input, SelectInput, SwitchInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import MultiSelect from '../../components/ui/MultiSelect.jsx';
import PermissionMatrix from '../../components/ui/PermissionMatrix.jsx';
import { getDefaultRolePermissions } from '../../config/access.jsx';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../../constants/academicOptions.js';
import { COMMON_STATUS_OPTIONS, GENDER_OPTIONS, LOGIN_RESTRICTION_OPTIONS } from '../../constants/commonOptions.js';
import { DEPARTMENT_OPTIONS, DESIGNATION_OPTIONS, EXPERIENCE_OPTIONS, QUALIFICATION_OPTIONS, SUBJECT_OPTIONS, TEACHER_ROLE_OPTIONS } from '../../constants/teacherOptions.js';
import { splitSelections } from '../../utils/formOptions.js';
import { permissionOptions, randomPassword } from '../../utils/teacherForm.js';

export { blankTeacherForm, payloadFromForm, permissionOptions, randomPassword } from '../../utils/teacherForm.js';

const classNames = CLASS_OPTIONS.map(({ name }) => name);
const sectionNames = SECTION_OPTIONS.map(({ name }) => name);

function TeacherSection({ title, children }) {
  return <section className="space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-1)] p-3 sm:p-4 min-w-0">
    <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
    {children}
  </section>;
}

export default function TeacherForm({ form, onChange, editing = false, onSubmit, onCancel, submitting, hideButtons = false }) {
  const update = (name, value) => onChange({ ...form, [name]: value });
  const field = (name) => ({ name, value: form[name] ?? '', onChange: (event) => update(name, event.target.value) });
  const picks = (name) => ({
    name,
    value: splitSelections(form[name]),
    onChange: (values) => update(name, values.join(', ')),
  });
  const check = (name) => ({
    name,
    checked: Boolean(form[name]),
    onChange: (event) => update(name, event.target.checked),
  });
  const permissions = form.permissions || [];

  function applyRole(event) {
    const role = event.target.value;
    onChange({ ...form, role, permissions: getDefaultRolePermissions(role) });
  }

  function generatePassword() {
    const password = randomPassword();
    onChange({ ...form, password, confirmPassword: password });
  }

  return <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <TeacherSection title="Personal details">
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="First name" {...field('firstName')} autoComplete="given-name" required />
          <Input label="Last name" {...field('lastName')} autoComplete="family-name" required />
          <SelectInput label="Gender" {...field('gender')} options={GENDER_OPTIONS} showPlaceholder={false} preserveValue />
          <Input label="Date of birth" {...field('dob')} type="date" />
          <Input label="Phone number" {...field('phone')} type="tel" required />
          <Input label="Alternate phone" {...field('alternatePhone')} type="tel" />
        </div>
        <Input label="Email address" {...field('email')} type="email" required />
        <TextareaInput label="Address" {...field('address')} rows={3} />
      </TeacherSection>

      <TeacherSection title="Staff and teaching assignments">
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="Joining date" {...field('joiningDate')} type="date" />
          <Input label="Salary (₹)" {...field('salary')} type="number" step="0.01" />
        </div>
        <SelectInput label="Designation" {...field('designation')} options={DESIGNATION_OPTIONS} preserveValue />
        <SelectInput label="Department" {...field('department')} options={DEPARTMENT_OPTIONS} preserveValue />
        <SelectInput label="Qualification" {...field('qualification')} options={QUALIFICATION_OPTIONS} preserveValue />
        <SelectInput label="Experience" {...field('experience')} options={EXPERIENCE_OPTIONS} preserveValue />
        <MultiSelect label="Classes assigned" {...picks('classesAssignedText')} options={classNames} placeholder="Choose classes" />
        <MultiSelect label="Sections assigned" {...picks('sectionsAssignedText')} options={sectionNames} placeholder="Choose sections" />
        <MultiSelect label="Subjects assigned" {...picks('subjectsAssignedText')} options={SUBJECT_OPTIONS} placeholder="Choose subjects" />
        <SwitchInput {...check('isClassTeacher')} label="Class teacher" />
      </TeacherSection>

      <TeacherSection title="Account access">
        <SelectInput label="Role" {...field('role')} options={TEACHER_ROLE_OPTIONS} onChange={applyRole} showPlaceholder={false} preserveValue />
        {!editing && <>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
            <Input label="Password" {...field('password')} autoComplete="new-password" required />
            <Button type="button" variant="secondary" size="sm" aria-label="Generate password" title="Generate password"
              icon={<Wand2 size={16} />} onClick={generatePassword} className="min-h-9" />
          </div>
          <Input label="Confirm password" {...field('confirmPassword')} autoComplete="new-password" required />
        </>}
        {editing && <PermissionMatrix permissions={permissions} options={permissionOptions} onChange={(permission) => update(
          'permissions', permissions.includes(permission) ? permissions.filter((value) => value !== permission) : [...permissions, permission],
        )} />}
        <div className="grid grid-cols-2 gap-2.5">
          <SelectInput label="Status" {...field('status')} options={COMMON_STATUS_OPTIONS} showPlaceholder={false} preserveValue />
          <Input label="Expiry date" {...field('accountExpiryDate')} type="date" />
        </div>
        <SelectInput label="Login restriction" {...field('loginRestriction')} options={LOGIN_RESTRICTION_OPTIONS}
          showPlaceholder={false} preserveValue />
        <div className="grid gap-2">
          <SwitchInput {...check('forcePasswordChange')} label="Require password change on first login" />
          <SwitchInput {...check('twoFactorEnabled')} label="Two-factor authentication" />
        </div>
      </TeacherSection>
    </div>

    {!hideButtons && onCancel && <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-color)] pt-3">
      <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button type="submit" variant="primary" icon={<Save size={14} />} loading={submitting}>
        {submitting ? 'Saving…' : 'Save teacher'}
      </Button>
    </div>}
  </form>;
}
