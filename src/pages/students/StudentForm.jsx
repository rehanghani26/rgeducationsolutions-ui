import { useAcademicSession } from '../../context/AcademicSessionContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, ClipboardCheck, FileText, GraduationCap, KeyRound, UserRound, UsersRound } from 'lucide-react';
import { SECTION_OPTIONS } from '../../constants/academicOptions.js';
import { getClasses } from '../../services/erpService.js';
import { validateStudentStep } from '../../utils/studentForm.js';
import StudentFormFields from './StudentFormFields.jsx';
import './studentRegistration.css';

const steps = [
  { id: 'profile', label: 'Profile', title: 'Student profile', description: 'Record the student’s personal and contact details.', icon: UserRound },
  { id: 'enrollment', label: 'Enrollment', title: 'Enrollment', description: 'Set the class placement, admission dates and school history.', icon: GraduationCap },
  { id: 'family', label: 'Family', title: 'Family and guardians', description: 'Add the people the school should contact for this student.', icon: UsersRound },
  { id: 'documents', label: 'Documents', title: 'Identity and documents', description: 'Upload the student photo and Aadhaar PDF, then add any supporting records.', icon: FileText },
  { id: 'portal', label: 'Portal', title: 'Student portal access', description: 'Set up the student’s login and account status.', icon: KeyRound },
  { id: 'review', label: 'Review', title: 'Review student record', description: 'Check the summary before saving the student record.', icon: ClipboardCheck },
];

const retainSelection = (items, value, label) => (
  value && !items.some((option) => option.value === value)
    ? [...items, { value, label: label || value }]
    : items
);
const options = (records) => records.map(({ id, name }) => ({ value: String(id), label: name }));
const extendOptions = (records, rows) => {
  const merged = new Map(records.map(({ id, name }) => [name.toLowerCase(), { id, name }]));
  for (const { id, name } of rows) {
    if (id && name && !merged.has(name.toLowerCase())) merged.set(name.toLowerCase(), { id, name });
  }
  return options([...merged.values()]);
};

function Review({ form, onEdit }) {
  const sections = [
    [['Name', [form.firstName, form.lastName].filter(Boolean).join(' ')], ['Date of birth', form.dob], ['Student phone', form.contactNumber]],
    [['Class and section', [form.className, form.sectionName].filter(Boolean).join(' · ')], ['Academic session', form.academicYear],
      ['Legacy student', form.isLegacyStudent ? 'Yes' : 'No'], ['Admission date', form.admissionDate], ['Joining date', form.joiningDate]],
    [['Primary guardian', form.parentName], ['Guardian phone', form.parentContact], ['Guardian email', form.parentEmail]],
    [['Student photo', form.photo ? 'Uploaded' : 'Missing'], ['Aadhaar PDF', form.aadhaarDocument ? 'Uploaded' : 'Missing'],
      ['Additional documents', String(form.documents.filter(({ name, url }) => name?.trim() || url?.trim()).length)]],
    [['Login email', form.email], ['Email verification', form.isEmailVerified ? 'Verified' : 'Pending'], ['Account status', form.status]],
  ];

  return (
    <div className="student-review">
      {sections.map((rows, index) => (
        <section className="student-review-card" key={steps[index].id}>
          <div><h3>{steps[index].label}</h3><button type="button" className="student-link" onClick={() => onEdit(index)} aria-label={`Edit ${steps[index].label.toLowerCase()}`}>Edit</button></div>
          <dl>{rows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>
          ))}</dl>
        </section>
      ))}
    </div>
  );
}

export default function StudentForm({
  form, setForm, editing = false, onSubmit, onCancel, onSaveDraft, submitting, submitError,
  onClearError, stepIndex, setStepIndex, busy, setBusy,
}) {
  const { classOptions } = useAcademicSession();
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const targetRef = useRef(null);
  const locked = submitting || Object.values(busy).some(Boolean);
  const step = steps[stepIndex];
  const isReview = step.id === 'review';

  useEffect(() => {
    let active = true;
    getClasses().then((result) => {
      if (active) setRooms(result?.classes || result?.data?.classes || []);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;
    const name = targetRef.current;
    targetRef.current = null;
    const target = name === 'heading' ? headingRef.current : formRef.current?.elements.namedItem(name);
    target?.focus({ preventScroll: true });
    (name === 'heading' ? target : target?.closest('.student-field, .student-upload'))?.scrollIntoView({
      block: 'nearest',
    });
  }, [stepIndex, errors]);

  const classes = options(classOptions);
  const matchingRooms = rooms.filter((room) => (
    form.classId && (String(room.classId || room.id || room._id) === form.classId
      || (form.className && room.className === form.className))
  ));
  const roomSections = matchingRooms.map((room) => ({ id: room.sectionId, name: room.sectionName })).filter(({ id, name }) => id && name);
  const sections = roomSections.length ? extendOptions([], roomSections.map(({ id, name }) => ({
    id: SECTION_OPTIONS.find((option) => option.name === name)?.id || id, name,
  }))) : options(SECTION_OPTIONS);

  function patch(changes) {
    setForm((current) => ({ ...current, ...changes }));
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !(key in changes))));
    if (submitError) onClearError();
  }

  function goTo(index) {
    if (locked || index === stepIndex) return;
    targetRef.current = 'heading';
    setErrors({});
    setStepIndex(index);
  }

  function showErrors(index, validationErrors) {
    targetRef.current = Object.keys(validationErrors)[0];
    setErrors(validationErrors);
    setStepIndex(index);
  }

  function submit(event) {
    event.preventDefault();
    if (locked) return;
    const indexes = isReview ? steps.slice(0, -1).map((_, index) => index) : [stepIndex];
    for (const index of indexes) {
      const validationErrors = validateStudentStep(steps[index].id, form, editing);
      if (Object.keys(validationErrors).length) {
        showErrors(index, validationErrors);
        return;
      }
    }
    if (!formRef.current.reportValidity()) return;
    if (isReview) onSubmit();
    else goTo(stepIndex + 1);
  }

  return (
    <div className="student-wizard">
      <nav className="student-steps" aria-label="Student form sections">
        <div className="student-mobile-progress">
          <span>Step {stepIndex + 1} of {steps.length}</span><strong>{step.label}</strong>
        </div>
        <ol>
          {steps.map(({ icon: Icon, label, id }, index) => (
            <li key={id}>
              <button type="button" className="student-step" aria-current={index === stepIndex ? 'step' : undefined}
                disabled={locked} onClick={() => goTo(index)}
                aria-label={`Step ${index + 1}: ${label}`}>
                <span className="student-step-icon" aria-hidden="true"><Icon size={17} /></span>
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <form className="student-card" ref={formRef} onSubmit={submit} noValidate>
        <header className="student-card-heading">
          <span className="student-heading-icon"><step.icon size={23} /></span>
          <div><h2 ref={headingRef} tabIndex={-1}>{step.title}</h2><p>{step.description}</p></div>
        </header>
        <div className="student-card-body">
          {isReview ? <Review form={form} onEdit={goTo} /> : (
            <StudentFormFields key={step.id} step={step.id} form={form} patch={patch} errors={errors} editing={editing}
              classes={editing ? retainSelection(classes, form.classId, form.className || form.class) : classes}
              sections={retainSelection(sections, form.sectionId, form.sectionName || form.section)} onBusy={(key, value) => setBusy((current) => ({ ...current, [key]: value }))} />
          )}
        </div>
        {submitError && <p className="student-submit-error student-error" role="alert">{submitError}</p>}
        <footer className="student-footer">
          <button className="student-button student-secondary" type="button" disabled={locked}
            onClick={stepIndex ? () => goTo(stepIndex - 1) : onCancel}>{stepIndex ? 'Back' : 'Cancel'}</button>
          {!editing && <button className="student-button student-secondary student-draft" type="button" onClick={onSaveDraft} disabled={locked}>
            <Bookmark size={16} /> <span>Save draft</span>
          </button>}
          <button className="student-button student-primary" type="submit" disabled={locked}>
            {submitting ? 'Saving…' : isReview ? (editing ? 'Save changes' : 'Register student') : 'Continue'}
          </button>
        </footer>
      </form>
    </div>
  );
}
