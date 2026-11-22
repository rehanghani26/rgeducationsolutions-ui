import { useEffect, useRef, useState } from 'react';
import { Briefcase, FileCheck, FileText, LockKeyhole, UserRound, Wand2 } from 'lucide-react';
import ConfirmationBox from '../../components/ui/ConfirmationBox.jsx';
import { Input, SelectInput, SwitchInput, TextareaInput } from '../../components/ui/FormControls.jsx';
import { ErrorMessage } from '../../components/ui/ProcurementUI.jsx';
import { BLOOD_GROUP_OPTIONS, COMMON_STATUS_OPTIONS, GENDER_OPTIONS, LOGIN_RESTRICTION_OPTIONS } from '../../constants/commonOptions.js';
import { TEACHER_EMPLOYMENT_FIELDS, TEACHER_ROLE_OPTIONS } from '../../constants/teacherOptions.js';
import { randomPassword, teacherUploadError, validateTeacherStep } from '../../utils/teacherForm.js';
import { TeacherAvatar, TeacherFacts } from './TeacherProfileParts.jsx';

const steps = [
  { id: 'personal', name: 'Personal', title: 'Personal details', icon: UserRound },
  { id: 'employment', name: 'Employment', title: 'Employment and qualifications', icon: Briefcase },
  { id: 'documents', name: 'Documents', title: 'Photo and documents', icon: FileText },
  { id: 'portal', name: 'Portal access', title: 'Teacher portal access', icon: LockKeyhole },
  { id: 'review', name: 'Review', title: 'Review teacher profile', icon: FileCheck },
];

function TeacherFileField({ kind, file, record, error, onChoose }) {
  const photo = kind === 'photo';
  const label = photo ? 'Profile photo' : 'Aadhaar PDF';
  const existing = photo ? record?.photoName : record?.aadhaarFileName;
  return <div className="teacher-file-card">
    <label htmlFor={'teacher-' + kind}><strong>{label}</strong></label>
    {photo && <TeacherAvatar teacher={record} file={file} />}
    <input id={'teacher-' + kind} type="file" accept={photo ? 'image/jpeg,image/png,image/webp' : 'application/pdf,.pdf'}
      onChange={(event) => {
        if (event.target.files[0]) onChoose(kind, event.target.files[0]);
        event.target.value = '';
      }} />
    <p className="teacher-note">{photo ? 'JPG, PNG, or WebP. Up to 1 MB.' : 'PDF. Up to 1 MB.'}</p>
    {(file || existing) && <p className="teacher-note">{file?.name || existing}</p>}
    {(file || error) && <button type="button" className="proc-link justify-self-start text-xs" onClick={() => onChoose(kind, null)}>
      {file ? 'Remove selected file' : 'Clear selection'}
    </button>}
    {error && <p className="text-xs text-[var(--proc-danger)]" role="alert">{error}</p>}
  </div>;
}

export default function TeacherForm({ form, onChange, files, onFilesChange, record, initialStep, editing, saving, error, onClearError, onSave, onCancel }) {
  const [index, setIndex] = useState(() => Math.max(0, steps.findIndex(({ id }) => id === initialStep)));
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [confirm, setConfirm] = useState(false);
  const heading = useRef(null);
  const step = steps[index];
  const reviewing = step.id === 'review';

  useEffect(() => { if (index > 0) heading.current?.focus(); }, [index]);

  function patch(changes) {
    onChange((current) => ({ ...current, ...changes }));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !Object.hasOwn(changes, key))));
    if (error) onClearError();
  }
  const field = (name) => ({
    name, value: form[name] ?? '', errorMessage: errors[name],
    onChange: (event) => patch({ [name]: event.target.value }),
  });
  const check = (name) => ({ name, checked: Boolean(form[name]), onChange: (event) => patch({ [name]: event.target.checked }) });

  function chooseFile(kind, file) {
    const issue = file ? teacherUploadError(kind, file) : '';
    setFileErrors((current) => ({ ...current, [kind]: issue }));
    if (!issue) onFilesChange((current) => ({ ...current, [kind]: file }));
    if (error) onClearError();
  }

  function next(event) {
    event.preventDefault();
    if (saving) return;
    const targets = reviewing ? steps.slice(0, -1) : [step];
    for (const target of targets) {
      if (target.id === 'documents' && Object.values(fileErrors).some(Boolean)) {
        setIndex(steps.indexOf(target));
        return;
      }
      const issues = validateTeacherStep(target.id, form, editing);
      if (Object.keys(issues).length) {
        setErrors(issues);
        setIndex(steps.indexOf(target));
        return;
      }
    }
    if (reviewing) setConfirm(true);
    else setIndex(index + 1);
  }

  return <div className="teacher-form">
    <nav className="teacher-nav teacher-steps" aria-label="Teacher registration steps">
      {steps.map(({ id, name, icon: Icon }, position) => <button key={id} type="button"
        aria-current={position === index ? 'step' : undefined} disabled={position > index || saving}
        onClick={() => setIndex(position)}><Icon size={15} aria-hidden="true" /> {name}</button>)}
    </nav>
    <form className="teacher-panel !p-0" onSubmit={next} noValidate aria-busy={saving}>
      <div className="teacher-form-heading">
        <h2 ref={heading} tabIndex={-1}>{step.title}</h2>
        <p className="teacher-note">Step {index + 1} of {steps.length}</p>
      </div>
      <div className="teacher-form-body">
        {error && <ErrorMessage error={error} />}
        {step.id === 'personal' && <div className="teacher-fields">
          <Input label="First name" required autoComplete="given-name" {...field('firstName')} />
          <Input label="Last name" required autoComplete="family-name" {...field('lastName')} />
          <Input label="Login email" type="email" required autoComplete="email" {...field('email')} />
          <Input label="Phone number" type="tel" required autoComplete="tel" {...field('phone')} />
          <SelectInput label="Gender" options={GENDER_OPTIONS} preserveValue {...field('gender')} />
          <Input label="Date of birth" type="date" {...field('dob')} />
          <SelectInput label="Blood group" options={BLOOD_GROUP_OPTIONS} preserveValue {...field('bloodGroup')} />
          <Input label="Alternate phone" type="tel" {...field('alternatePhone')} />
          <TextareaInput label="Address" rows={2} className="teacher-field-wide" {...field('address')} />
          <Input label="Emergency contact name" {...field('emergencyContactName')} />
          <Input label="Emergency contact phone" type="tel" {...field('emergencyContactPhone')} />
          <Input label="Emergency contact relationship" {...field('emergencyContactRelation')} />
        </div>}
        {step.id === 'employment' && <>
          <div className="teacher-fields">
            {TEACHER_EMPLOYMENT_FIELDS.map(({ name, label, options, required }) =>
              <SelectInput key={name} label={label} required={required} options={options} preserveValue {...field(name)} />
            )}
            <Input label="Employment type" list="teacher-employment-types" {...field('employmentType')} />
            <Input label="Joining date" type="date" {...field('joiningDate')} />
            <Input label="Monthly salary" type="number" min={0} step="0.01" {...field('salary')} />
            <Input label="Employee ID" hint="Leave blank to generate an employee ID." readOnly={editing} {...field('employeeId')} />
          </div>
          <datalist id="teacher-employment-types">
            {['Full-time', 'Part-time', 'Contract', 'Visiting'].map((value) => <option key={value} value={value} />)}
          </datalist>
          <p className="teacher-note">Set teaching periods in the class timetable after registration.</p>
        </>}
        {step.id === 'documents' && <>
          <div className="teacher-fields teacher-documents">
            <TeacherFileField kind="photo" file={files.photo} record={record} error={fileErrors.photo} onChoose={chooseFile} />
            <TeacherFileField kind="aadhaar" file={files.aadhaar} record={record} error={fileErrors.aadhaar} onChoose={chooseFile} />
          </div>
          <div className="teacher-fields">
            <Input label="Aadhaar number" inputMode="numeric" hint="Optional, 12 digits." {...field('aadhaarNumber')} />
          </div>
        </>}
        {step.id === 'portal' && <>
          <div className="teacher-fields">
            <SelectInput label="Faculty role" options={TEACHER_ROLE_OPTIONS} showPlaceholder={false} preserveValue
              hint="The faculty role controls portal access." {...field('role')} />
            <SelectInput label="Account status" options={COMMON_STATUS_OPTIONS} showPlaceholder={false} preserveValue {...field('status')} />
            <SelectInput label="Login restriction" options={LOGIN_RESTRICTION_OPTIONS} showPlaceholder={false} preserveValue {...field('loginRestriction')} />
            <Input label="Account expiry" type="date" {...field('accountExpiryDate')} />
            {!editing && <>
              <Input label="Password" type="password" autoComplete="new-password" hint="Leave blank to generate a password." {...field('password')} />
              <Input label="Confirm password" type="password" autoComplete="new-password" {...field('confirmPassword')} />
            </>}
          </div>
          {!editing && <button type="button" className="proc-btn justify-self-start" onClick={() => {
            const password = randomPassword();
            patch({ password, confirmPassword: password });
          }}><Wand2 size={15} /> Generate password</button>}
          <div className="teacher-fields">
            <SwitchInput label="Require password change on login" {...check('forcePasswordChange')} />
            <SwitchInput label="Two-factor authentication" {...check('twoFactorEnabled')} />
          </div>
        </>}
        {reviewing && <TeacherFacts items={[
          ['Name', [form.firstName, form.lastName].join(' ')], ['Login email', form.email], ['Phone', form.phone],
          ['Designation', form.designation], ['Department', form.department || '—'], ['Employment type', form.employmentType || '—'],
          ['Qualification', form.qualification || '—'], ['Specialization', form.specialization || '—'],
          ['Joining date', form.joiningDate || '—'], ['Faculty role', TEACHER_ROLE_OPTIONS.find(({ value }) => value === form.role)?.label],
          ['Profile photo', files.photo?.name || record?.photoName || '—'], ['Aadhaar PDF', files.aadhaar?.name || record?.aadhaarFileName || '—'],
          ['Aadhaar number', form.aadhaarNumber ? 'Ending in ' + form.aadhaarNumber.replace(/[\s-]/g, '').slice(-4) : '—'],
        ]} />}
      </div>
      <div className="teacher-form-footer">
        <button type="button" className="proc-btn" disabled={saving} onClick={onCancel}>Cancel</button>
        <div className="proc-actions">
          {index > 0 && <button type="button" className="proc-btn" disabled={saving} onClick={() => setIndex(index - 1)}>Back</button>}
          <button type="submit" className="proc-btn proc-primary" disabled={saving}>
            {saving ? 'Saving…' : reviewing ? (editing ? 'Save changes' : 'Register teacher') : 'Continue'}
          </button>
        </div>
      </div>
      {confirm && <ConfirmationBox heading={editing ? 'Save teacher changes?' : 'Register teacher?'}
        confirmationMessage={editing ? 'Save the updated profile and selected files.' : 'Create a profile and portal login for ' + form.firstName + ' ' + form.lastName + '.'}
        leftButtonName="Cancel" rightButtonName={editing ? 'Save changes' : 'Register teacher'} rightButtonDisabled={saving}
        onLeftButtonClick={() => setConfirm(false)} onRightButtonClick={async () => { await onSave(); setConfirm(false); }} />}
    </form>
  </div>;
}
