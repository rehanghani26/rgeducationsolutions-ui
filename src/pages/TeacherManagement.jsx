import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { Activity, Edit3, KeyRound, Mail, Plus, Save, Wand2, X } from 'lucide-react';
import {
  fetchTeachers,
  registerTeacher,
  resetTeacherPassword,
  updateTeacher,
} from '../store/slices/erpSlice.js';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DataTable from '../components/ui/DataTable.jsx';

const permissionOptions = [
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

const blankForm = {
  firstName: '',
  lastName: '',
  gender: 'Male',
  dob: '',
  phone: '',
  alternatePhone: '',
  email: '',
  address: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  designation: '',
  department: '',
  qualification: '',
  experience: '',
  salary: '',
  classesAssignedText: '',
  sectionsAssignedText: '',
  subjectsAssignedText: '',
  isClassTeacher: false,
  role: 'teacher',
  permissions: ['dashboard', 'attendance', 'exam', 'marks', 'homework', 'timetable', 'leave', 'communication'],
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
  generateRandomPassword: false,
};

const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
const labelCls = 'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase';

const splitList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
const randomPassword = () => `Tch@${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;

const TeacherManagement = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null); // holds teacher object
  const [confirmResetPwd, setConfirmResetPwd] = useState(null);    // holds teacher object

  const { teachers, loading } = useSelector((state) => state.erp);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeachers());
  }, [dispatch]);

  const filteredTeachers = useMemo(() => {
    const term = search.toLowerCase();
    return teachers.filter((teacher) =>
      [teacher.name, teacher.employeeId, teacher.email, teacher.designation, teacher.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [teachers, search]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const togglePermission = (permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...blankForm, password: randomPassword(), confirmPassword: '' });
    setShowForm(true);
  };

  const openEdit = (teacher) => {
    setEditing(teacher);
    setForm({
      ...blankForm,
      ...teacher,
      dob: teacher.dob?.slice?.(0, 10) || '',
      joiningDate: teacher.joiningDate?.slice?.(0, 10) || '',
      accountExpiryDate: teacher.accountExpiryDate?.slice?.(0, 10) || '',
      classesAssignedText: (teacher.classesAssigned || teacher.assignedClasses || []).join(', '),
      sectionsAssignedText: (teacher.sectionsAssigned || teacher.assignedSections || []).join(', '),
      subjectsAssignedText: (teacher.subjectsAssigned || teacher.assignedSubjects || []).join(', '),
      permissions: teacher.permissions?.length ? teacher.permissions : blankForm.permissions,
      password: '',
      confirmPassword: '',
    });
    setShowForm(true);
  };

  const payloadFromForm = () => ({
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
    generateRandomPassword: form.generateRandomPassword,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = payloadFromForm();

    const action = editing
      ? updateTeacher({ id: editing.id || editing._id, data: payload })
      : registerTeacher(payload);

    dispatch(action).then((res) => {
      if (res.meta.requestStatus !== 'fulfilled') {
        toast.error(res.payload || 'Unable to save teacher');
        return;
      }

      const account = res.payload?.accountCreated;
      toast.success(account ? `Teacher saved. Login: ${account.employeeId} / ${account.email}` : 'Teacher updated successfully');
      setShowForm(false);
      dispatch(fetchTeachers());
    });
  };

  const handleDeactivate = () => {
    const teacher = confirmDeactivate;
    dispatch(updateTeacher({ id: teacher.id || teacher._id, data: { status: 'inactive' } })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') toast.success('Teacher deactivated');
      else toast.error(res.payload || 'Unable to deactivate teacher');
      setConfirmDeactivate(null);
    });
  };

  const handleResetPassword = () => {
    const teacher = confirmResetPwd;
    const password = randomPassword();
    dispatch(resetTeacherPassword({
      id: teacher.id || teacher._id,
      data: { password, forcePasswordChange: true },
    })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') toast.success(`Temporary password: ${res.payload.temporaryPassword}`);
      else toast.error(res.payload || 'Password reset failed');
      setConfirmResetPwd(null);
    });
  };

  /* Table column definitions */
  const columns = [
    {
      key: 'name',
      label: 'Teacher',
      render: (row) => (
        <div>
          <p className="font-extrabold">{row.name}</p>
          <p className="text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={11} /> {row.email || 'No email'}</p>
        </div>
      ),
    },
    { key: 'employeeId', label: 'Employee ID', render: (row) => <span className="font-bold text-indigo-500">{row.employeeId}</span> },
    { key: 'role', label: 'Role', render: (row) => <span className="capitalize">{row.role?.replace('-', ' ') || 'teacher'}</span> },
    { key: 'department', label: 'Department', render: (row) => row.department || row.designation || '—' },
    { key: 'permissions', label: 'Permissions', render: (row) => `${row.permissions?.length || 0} enabled` },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${row.status === 'inactive' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          <Activity size={10} /> {row.status || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="xs"
            icon={<Edit3 size={13} />}
            onClick={() => openEdit(row)}
            className="text-indigo-500 hover:bg-indigo-500/10"
            title="Edit teacher"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={<KeyRound size={13} />}
            onClick={() => setConfirmResetPwd(row)}
            className="text-amber-500 hover:bg-amber-500/10"
            title="Reset password"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={<Activity size={13} />}
            onClick={() => setConfirmDeactivate(row)}
            className="text-rose-500 hover:bg-rose-500/10"
            title="Deactivate"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer position="top-right" theme="colored" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Teacher Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create teacher records, credentials, roles, and permission sets.</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
          Create Teacher
        </Button>
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3.5 top-3 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input
          type="text"
          placeholder="Search by name, employee ID, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        {loading ? (
          <Loader fullPage size="md" text="Loading teachers..." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredTeachers}
            emptyTitle="No teacher records found"
            emptyDescription="Create your first teacher to get started."
          />
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold">{editing ? 'Edit Teacher' : 'Create Teacher'}</h3>
              <Button type="button" variant="ghost" size="sm" icon={<X size={18} />} onClick={() => setShowForm(false)} />
            </div>

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
                <div><label className={labelCls}>Address</label><textarea className={inputCls} value={form.address} onChange={(e) => updateField('address', e.target.value)} /></div>
              </section>

              <section className="space-y-3">
                <h4 className="font-bold text-sm">Professional &amp; Academic</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Joining Date</label><input type="date" className={inputCls} value={form.joiningDate} onChange={(e) => updateField('joiningDate', e.target.value)} /></div>
                  <div><label className={labelCls}>Salary</label><input type="number" className={inputCls} value={form.salary} onChange={(e) => updateField('salary', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Designation</label><input required className={inputCls} value={form.designation} onChange={(e) => updateField('designation', e.target.value)} /></div>
                <div><label className={labelCls}>Department</label><input className={inputCls} value={form.department} onChange={(e) => updateField('department', e.target.value)} /></div>
                <div><label className={labelCls}>Qualification</label><input className={inputCls} value={form.qualification} onChange={(e) => updateField('qualification', e.target.value)} /></div>
                <div><label className={labelCls}>Experience</label><input className={inputCls} value={form.experience} onChange={(e) => updateField('experience', e.target.value)} /></div>
                <div><label className={labelCls}>Classes Assigned</label><input className={inputCls} placeholder="Class 9, Class 10" value={form.classesAssignedText} onChange={(e) => updateField('classesAssignedText', e.target.value)} /></div>
                <div><label className={labelCls}>Sections Assigned</label><input className={inputCls} placeholder="A, B" value={form.sectionsAssignedText} onChange={(e) => updateField('sectionsAssignedText', e.target.value)} /></div>
                <div><label className={labelCls}>Subjects Assigned</label><input className={inputCls} placeholder="Math, Science" value={form.subjectsAssignedText} onChange={(e) => updateField('subjectsAssignedText', e.target.value)} /></div>
                <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.isClassTeacher} onChange={(e) => updateField('isClassTeacher', e.target.checked)} /> Class Teacher</label>
              </section>

              <section className="space-y-3">
                <h4 className="font-bold text-sm">Login, Role &amp; Permissions</h4>
                <div><label className={labelCls}>Role Selection</label><select className={inputCls} value={form.role} onChange={(e) => updateField('role', e.target.value)}><option value="teacher">Teacher</option><option value="head-teacher">Head Teacher</option><option value="hod">HOD</option><option value="coordinator">Coordinator</option></select></div>
                {!editing && (
                  <>
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                      <div><label className={labelCls}>Password</label><input required type="text" className={inputCls} value={form.password} onChange={(e) => updateField('password', e.target.value)} /></div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={<Wand2 size={16} />}
                        onClick={() => { const next = randomPassword(); setForm((c) => ({ ...c, password: next, confirmPassword: next })); }}
                        className="p-2 bg-slate-100 dark:bg-slate-800 !rounded-lg"
                      />
                    </div>
                    <div><label className={labelCls}>Confirm Password</label><input required type="text" className={inputCls} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} /></div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                  {permissionOptions.map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-[11px] font-semibold">
                      <input type="checkbox" checked={form.permissions.includes(value)} onChange={() => togglePermission(value)} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={(e) => updateField('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                  <div><label className={labelCls}>Expiry Date</label><input type="date" className={inputCls} value={form.accountExpiryDate} onChange={(e) => updateField('accountExpiryDate', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Login Restriction</label><select className={inputCls} value={form.loginRestriction} onChange={(e) => updateField('loginRestriction', e.target.value)}><option value="none">None</option><option value="school-network">School Network</option><option value="office-hours">Office Hours</option></select></div>
                <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.forcePasswordChange} onChange={(e) => updateField('forcePasswordChange', e.target.checked)} /> Force Password Change on First Login</label>
                <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.twoFactorEnabled} onChange={(e) => updateField('twoFactorEnabled', e.target.checked)} /> Two Factor Authentication</label>
              </section>
            </div>

            <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary" icon={<Save size={14} />}>Save Teacher</Button>
            </div>
          </form>
        </div>
      )}

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Teacher"
        message={`Are you sure you want to deactivate ${confirmDeactivate?.name}? They will lose access to the portal.`}
        confirmLabel="Deactivate"
        danger
      />

      {/* Reset Password Confirmation */}
      <ConfirmDialog
        open={!!confirmResetPwd}
        onClose={() => setConfirmResetPwd(null)}
        onConfirm={handleResetPassword}
        title="Reset Password"
        message={`Reset the password for ${confirmResetPwd?.name}? A new temporary password will be generated and displayed.`}
        confirmLabel="Reset Password"
      />
    </div>
  );
};

export default TeacherManagement;
