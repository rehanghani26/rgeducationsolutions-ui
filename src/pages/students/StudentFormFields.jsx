import { useState } from 'react';
import { Check, FileText, Image, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  ADMISSION_TYPE_OPTIONS, BLOOD_GROUP_STRINGS, ENROLLMENT_STATUS_OPTIONS, GENDER_STRINGS,
  GUARDIAN_RELATION_OPTIONS, HOUSE_OPTIONS, MEDIUM_OF_INSTRUCTION_OPTIONS,
  PREVIOUS_BOARD_OPTIONS, SPECIAL_EDUCATION_NEEDS_OPTIONS, STUDENT_CATEGORY_OPTIONS, STUDENT_TYPE_OPTIONS,
} from '../../constants';
import api from '../../services/api.js';
import { sendStudentEmailOtp, uploadStudentFile, verifyStudentEmailOtp } from '../../services/studentService.js';
import { generateStudentPassword, normalizeEmail } from '../../utils/studentForm.js';

const control = 'student-control';

export function Field({ label, name, value, onChange, error, required, options, type = 'text', wide, ...props }) {
  const settings = {
    id: name, name, value: value ?? '', onChange: (event) => onChange(event.target.value),
    required, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${name}-error` : undefined,
    className: control, ...props,
  };
  return (
    <div className={wide ? 'student-field student-wide' : 'student-field'}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {options ? (
        <select {...settings}>
          {!options.some((option) => option.value === '' || option === '') && <option value="">Select {label.toLowerCase()}</option>}
          {value && !options.some((option) => (option.value ?? option) === value) && <option value={value}>{value}</option>}
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>
          ))}
        </select>
      ) : type === 'textarea' ? <textarea {...settings} rows={2} /> : <input {...settings} type={type} />}
      {error && <p id={`${name}-error`} className="student-error">{error}</p>}
    </div>
  );
}

function Group({ title, children }) {
  return (
    <section className="student-group">
      <h3>{title}</h3>
      <div className="student-fields">{children}</div>
    </section>
  );
}

function Toggle({ label, description, name, checked, onChange }) {
  return (
    <label className="student-toggle student-wide">
      <span><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <input type="checkbox" name={name} role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

const profileFields = [
  ['firstName', 'First name', { required: true, autoComplete: 'given-name' }],
  ['lastName', 'Last name', { autoComplete: 'family-name' }],
  ['dob', 'Date of birth', { type: 'date' }], ['gender', 'Gender', { options: GENDER_STRINGS }],
  ['bloodGroup', 'Blood group', { options: BLOOD_GROUP_STRINGS }],
  ['studentCategory', 'Student category', { options: STUDENT_CATEGORY_OPTIONS }],
  ['nationality', 'Nationality'], ['motherTongue', 'Mother tongue'],
];

const learningFields = [
  ['houseName', 'House', { options: HOUSE_OPTIONS }],
  ['studentType', 'Student type', { options: STUDENT_TYPE_OPTIONS }],
  ['mediumOfInstruction', 'Medium of instruction', { options: MEDIUM_OF_INSTRUCTION_OPTIONS }],
  ['specialEducationNeeds', 'Special education needs', { options: SPECIAL_EDUCATION_NEEDS_OPTIONS }],
  ['careerInterest', 'Career interest', { wide: true }],
];

const previousFields = [
  ['previousSchoolName', 'Previous school', { wide: true }], ['previousClass', 'Previous class'],
  ['previousBoard', 'Previous board', { options: PREVIOUS_BOARD_OPTIONS }],
  ['transferCertificateNumber', 'Transfer certificate number'],
  ['transferCertificateDate', 'Transfer certificate date', { type: 'date' }],
];

const familyFields = [
  ['fatherName', "Father’s name"], ['fatherOccupation', "Father’s occupation"],
  ['fatherOrganization', "Father’s workplace", { wide: true }], ['motherName', "Mother’s name"],
  ['motherContact', "Mother’s phone", { type: 'tel' }], ['motherOccupation', "Mother’s occupation"],
  ['guardianRelation', 'Alternate guardian relationship', { options: GUARDIAN_RELATION_OPTIONS }],
  ['guardianAddress', 'Alternate guardian address', { wide: true, type: 'textarea' }],
];

const historyFields = [['school', 'School'], ['class', 'Class'], ['year', 'Academic year'], ['percentage', 'Percentage or grade']];
const documentFields = [['name', 'Document name'], ['url', 'Document link', { type: 'url', placeholder: 'https://' }]];
const statuses = [
  { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' },
  { value: 'Passout', label: 'Passout' }, { value: 'graduated', label: 'Graduated' },
];
const restrictions = [
  { value: 'none', label: 'None' }, { value: 'school-network', label: 'School network' },
  { value: 'office-hours', label: 'Office hours' },
];

function RecordList({ title, singular, name, rows, fields, onChange, errors = {} }) {
  return (
    <Group title={title}>
      {rows.map((row, index) => (
        <fieldset className="student-record student-wide" key={row._id || index}>
          <legend>{singular} {index + 1}</legend>
          <div className="student-fields">
            {fields.map(([key, label, props]) => (
              <Field key={key} {...props} name={`${name}-${index}-${key}`} label={label} value={row[key]}
                error={errors[[name, index, key].join('-')]}
                onChange={(value) => onChange(rows.map((item, i) => i === index ? { ...item, [key]: value } : item))} />
            ))}
          </div>
          <button type="button" className="student-link student-remove" onClick={() => onChange(rows.filter((_, i) => i !== index))}>
            <Trash2 size={15} /> Remove {singular.toLowerCase()} {index + 1}
          </button>
        </fieldset>
      ))}
      <button type="button" className="student-button student-secondary student-wide student-fit"
        onClick={() => onChange([...rows, Object.fromEntries(fields.map(([key]) => [key, '']))])}>
        <Plus size={16} /> Add {singular.toLowerCase()}
      </button>
    </Group>
  );
}

const uploadSettings = {
  photo: { label: 'Student photo', icon: Image, accept: 'image/jpeg,image/png,image/webp', hint: 'JPG, PNG or WEBP · up to 1 MB' },
  aadhaar: { label: 'Aadhaar PDF', icon: FileText, accept: '.pdf,application/pdf', hint: 'PDF · up to 1 MB' },
};

function UploadField({ type, name, value, error, required, onUpload, onRemove, onBusy }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const { label, icon: Icon, accept, hint } = uploadSettings[type];
  const inputId = `student-upload-${type}`;
  const fileUrl = value?.startsWith('/uploads/') ? new URL(value, api.defaults.baseURL).href : value;
  const preview = /^https?:\/\//i.test(fileUrl || '') ? fileUrl : '';

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    if (file.size > 1024 * 1024) {
      setUploadError('Choose a file up to 1 MB.');
      return;
    }
    const valid = type === 'photo' ? /^image\/(jpeg|jpg|png|webp)$/.test(file.type)
      : file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!valid) {
      setUploadError(type === 'photo' ? 'Choose a JPG, PNG or WEBP image.' : 'Choose a PDF file.');
      return;
    }
    setUploading(true);
    onBusy(true);
    try {
      const result = await uploadStudentFile(file, type);
      if (!result?.url) throw new Error('The upload did not return a file.');
      onUpload(result);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Choose the file again to retry.');
    } finally {
      setUploading(false);
      onBusy(false);
    }
  }

  return (
    <div className="student-upload" aria-busy={uploading}>
      <div className="student-upload-copy">
        {type === 'photo' && preview ? <img src={preview} alt="" /> : <span className="student-upload-icon"><Icon size={20} /></span>}
        <div><strong>{label}{required && <span className="student-error"> *</span>}</strong><small>{value ? 'Uploaded' : hint}</small></div>
      </div>
      <div className="student-upload-actions">
        <input className="sr-only student-file-input" id={inputId} name={name} type="file" accept={accept}
          onChange={upload} disabled={uploading} aria-invalid={Boolean(error || uploadError)}
          aria-describedby={error || uploadError ? `${inputId}-error` : undefined} />
        <label htmlFor={inputId} className="student-button student-secondary">
          <Upload size={15} /> {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
        </label>
        {preview && <a href={preview} target="_blank" rel="noreferrer" className="student-link">Open</a>}
        {value && <button type="button" className="student-link student-remove" disabled={uploading} onClick={onRemove}>Remove</button>}
      </div>
      {(uploadError || error) && <p className="student-error" id={`${inputId}-error`} role="alert">{uploadError || error}</p>}
    </div>
  );
}

function PortalEmail({ form, patch, error, onBusy }) {
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState('');
  const email = normalizeEmail(form.email);

  async function verify(send) {
    setPending(send ? 'send' : 'verify');
    setMessage('');
    onBusy('email', true);
    try {
      if (send) {
        await sendStudentEmailOtp(email, [form.firstName, form.lastName].filter(Boolean).join(' '));
        setSentTo(email);
        setCode('');
      } else {
        const result = await verifyStudentEmailOtp({ email, otp: code });
        if (!result?.isEmailVerified) throw new Error(result?.message || 'Verification failed.');
        patch({ isEmailVerified: true });
      }
    } catch (err) {
      setMessage(err.message || 'Could not verify the email.');
    } finally {
      setPending('');
      onBusy('email', false);
    }
  }

  return (
    <div className="student-wide student-email">
      <Field label="Student login email" name="email" type="email" required value={form.email} error={error} disabled={Boolean(pending)}
        onChange={(value) => {
          patch({ email: value, isEmailVerified: email === normalizeEmail(value) && form.isEmailVerified });
          if (email !== normalizeEmail(value)) {
            setSentTo('');
            setMessage('');
            setCode('');
          }
        }} />
      {form.isEmailVerified ? <p className="student-verified"><Check size={16} /> Email verified</p> : (
        <div className="student-email-verification">
          <button type="button" className="student-button student-secondary student-fit"
            disabled={Boolean(pending) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} onClick={() => verify(true)}>
            {pending === 'send' ? 'Sending…' : sentTo === email ? 'Resend code' : 'Send verification code'}
          </button>
          {sentTo && sentTo === email && (
            <div className="student-fields student-wide">
              <Field name="emailOtp" label="Verification code" value={code} inputMode="numeric" maxLength={6}
                autoComplete="one-time-code" onChange={(value) => setCode(value.replace(/\D/g, ''))} />
              <button type="button" className="student-button student-secondary student-fit student-align-end"
                disabled={Boolean(pending) || code.length !== 6} onClick={() => verify(false)}>
                {pending === 'verify' ? 'Verifying…' : 'Verify code'}
              </button>
            </div>
          )}
          {message && <p className="student-error student-wide" role="alert">{message}</p>}
        </div>
      )}
    </div>
  );
}

export default function StudentFormFields({ step, form, patch, errors, editing, classes, sections, onBusy }) {
  const [showPassword, setShowPassword] = useState(false);
  const field = (name, label, props = {}) => (
    <Field key={name} name={name} label={label} value={form[name]} error={errors[name]}
      onChange={(value) => patch({ [name]: value })} {...props} />
  );
  const fields = (definitions) => definitions.map(([name, label, props]) => field(name, label, props));
  const toggle = (name, label) => (
    <Toggle name={name} label={label} checked={form[name]} onChange={(value) => patch({ [name]: value })} />
  );

  if (step === 'profile') return (
    <>
      <Group title="Personal details">{fields(profileFields)}</Group>
      <Group title="Contact details">
        {field('contactNumber', 'Student phone', { type: 'tel' })}
        {field('alternatePhone', 'Alternate phone', { type: 'tel' })}
        {field('address', 'Home address', { type: 'textarea', wide: true, autoComplete: 'street-address' })}
      </Group>
    </>
  );
  if (step === 'enrollment') return (
    <>
      <Group title="Admission details">
        <Toggle name="isLegacyStudent" label="Legacy student" description="Turn on for a student carried over from an earlier register."
          checked={form.isLegacyStudent} onChange={(value) => patch({ isLegacyStudent: value })} />
        {field('classId', 'Class', { options: classes, onChange: (value) => {
          const label = classes.find((option) => option.value === value)?.label || '';
          patch({ classId: value, class: label, className: label, sectionId: '', section: '', sectionName: '' });
        } })}
        {field('sectionId', 'Section', { options: sections, onChange: (value) => {
          const label = sections.find((option) => option.value === value)?.label || '';
          patch({ sectionId: value, section: label, sectionName: label });
        } })}
        {field('admissionDate', 'Admission date', { type: 'date', required: !editing })}
        {field('joiningDate', 'Joining date', { type: 'date' })}
        {field('admissionType', 'Admission type', { options: ADMISSION_TYPE_OPTIONS })}
        {field('enrollmentStatus', 'Enrollment status', { options: ENROLLMENT_STATUS_OPTIONS })}
        <p className="student-hint student-wide">Academic session <strong>{form.academicYear}</strong>
          {!editing && <> · Admission and roll numbers are assigned on registration.</>}
        </p>
      </Group>
      <Group title="Learning profile">{fields(learningFields)}</Group>
      <Group title="Previous school">{fields(previousFields)}</Group>
      <RecordList title="Academic history" singular="Record" name="academicHistory" rows={form.academicHistory}
        fields={historyFields} onChange={(academicHistory) => patch({ academicHistory })} />
    </>
  );
  if (step === 'family') return (
    <>
      <Group title="Primary parent or guardian">
        {field('parentName', 'Full name', { required: true })}
        {field('parentContact', 'Phone number', { type: 'tel', required: true })}
        {field('parentEmail', 'Email address', { type: 'email', wide: true })}
      </Group>
      <Group title="Family and alternate guardian">{fields(familyFields)}</Group>
    </>
  );
  if (step === 'documents') return (
    <>
      <Group title="Identity verification">
        {field('aadhaarNumber', 'Aadhaar number', { inputMode: 'numeric', maxLength: 16, required: !editing, wide: true })}
        <UploadField type="photo" name="photo" value={form.photo} error={errors.photo} required={!editing}
          onBusy={(busy) => onBusy('photo', busy)}
          onRemove={() => patch({ photo: '', imagesRef: { id: '', img: '' } })}
          onUpload={({ id, url }) => patch({ photo: url, imagesRef: { id, img: url } })} />
        <UploadField type="aadhaar" name="aadhaarDocument" value={form.aadhaarDocument} error={errors.aadhaarDocument} required={!editing}
          onBusy={(busy) => onBusy('aadhaar', busy)}
          onRemove={() => patch({ aadhaarDocument: '', AdharRef: { id: '', pdf: '' } })}
          onUpload={({ id, url }) => patch({ aadhaarDocument: url, AdharRef: { id, pdf: url } })} />
      </Group>
      <RecordList title="Additional documents" singular="Document" name="documents" rows={form.documents}
        fields={documentFields} errors={errors} onChange={(documents) => patch({ documents })} />
    </>
  );
  return (
    <>
      <Group title="Student login">
        <PortalEmail form={form} patch={patch} error={errors.email} onBusy={onBusy} />
        {!editing && (
          <>
            {field('password', 'Password', { type: showPassword ? 'text' : 'password', required: true, autoComplete: 'new-password' })}
            {field('confirmPassword', 'Confirm password', { type: showPassword ? 'text' : 'password', required: true, autoComplete: 'new-password' })}
            <div className="student-password-actions student-wide">
              <button type="button" className="student-link" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide passwords' : 'Show passwords'}</button>
              <button type="button" className="student-link" onClick={() => {
                const password = generateStudentPassword();
                patch({ password, confirmPassword: password });
              }}><RefreshCw size={14} /> Generate password</button>
            </div>
          </>
        )}
      </Group>
      <Group title="Account settings">
        {field('status', 'Account status', { options: statuses })}
        {field('accountExpiryDate', 'Account expiry date', { type: 'date' })}
        {field('loginRestriction', 'Login restriction', { options: restrictions })}
        {toggle('forcePasswordChange', 'Require password change at next sign-in')}
        {toggle('twoFactorEnabled', 'Two-factor authentication')}
      </Group>
    </>
  );
}
