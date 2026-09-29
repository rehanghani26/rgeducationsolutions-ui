import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { Edit3, Eye, FolderDown, GraduationCap, KeyRound, Plus, Save, Search, Trash2, UserX, Wand2, X } from 'lucide-react';
import {
  fetchStudents,
  registerStudent,
  removeStudent,
  resetStudentPassword,
  updateStudent,
} from '../store/slices/erpSlice.js';
import { CLASS_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions.js';

const permissionOptions = [
  ['dashboard', 'Dashboard Access'],
  ['academics', 'Academic Access'],
  ['attendance', 'Attendance View'],
  ['exam', 'Exam View'],
  ['timetable', 'Timetable Access'],
  ['library', 'Library Access'],
  ['reports', 'Reports Access'],
  ['communication', 'Communication Access'],
];

const blankForm = {
  firstName: '',
  lastName: '',
  email: '',
  dob: '',
  gender: 'Male',
  bloodGroup: '',
  classId: '',
  sectionId: '',
  class: '',
  section: '',
  contactNumber: '',
  alternatePhone: '',
  address: '',
  parentName: '',
  parentContact: '',
  parentEmail: '',
  aadhaarNumber: '',
  permissions: ['dashboard', 'academics', 'timetable', 'reports', 'communication'],
  status: 'active',
  accountExpiryDate: '',
  loginRestriction: 'none',
  twoFactorEnabled: false,
  forcePasswordChange: true,
  password: '',
  confirmPassword: '',
};

const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none';
const labelCls = 'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase';
const randomPassword = () => `Std@${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;

const StudentManagement = () => {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);

  const { students, loading } = useSelector((state) => state.erp);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase();
    return students.filter((student) =>
      [student.name, student.admissionNumber, student.email, student.rollNumber, student.parentName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [students, search]);

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
    const password = randomPassword();
    setForm({ ...blankForm, password, confirmPassword: password });
    setShowForm(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      ...blankForm,
      ...student,
      dob: student.dob?.slice?.(0, 10) || '',
      accountExpiryDate: student.accountExpiryDate?.slice?.(0, 10) || '',
      permissions: student.permissions?.length ? student.permissions : blankForm.permissions,
      password: '',
      confirmPassword: '',
    });
    setShowForm(true);
  };

  const payloadFromForm = () => ({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    name: `${form.firstName} ${form.lastName}`.trim(),
    rollNumber: form.rollNumber.trim(),
    admissionNumber: form.admissionNumber.trim(),
    email: form.email.trim(),
    dob: form.dob || undefined,
    gender: form.gender,
    bloodGroup: form.bloodGroup.trim(),
    classId: form.classId.trim(),
    sectionId: form.sectionId.trim(),
    contactNumber: form.contactNumber.trim(),
    alternatePhone: form.alternatePhone.trim(),
    address: form.address.trim(),
    parentName: form.parentName.trim(),
    parentContact: form.parentContact.trim(),
    parentEmail: form.parentEmail.trim(),
    aadhaarNumber: form.aadhaarNumber.trim(),
    permissions: form.permissions,
    status: form.status,
    accountExpiryDate: form.accountExpiryDate || undefined,
    loginRestriction: form.loginRestriction,
    twoFactorEnabled: form.twoFactorEnabled,
    forcePasswordChange: form.forcePasswordChange,
    password: form.password,
    confirmPassword: form.confirmPassword || form.password,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = payloadFromForm();
    const action = editing
      ? updateStudent({ id: editing.id || editing._id, data: payload })
      : registerStudent(payload);

    dispatch(action).then((res) => {
      if (res.meta.requestStatus !== 'fulfilled') {
        toast.error(res.payload || 'Unable to save student');
        return;
      }

      const account = res.payload?.accountCreated;
      toast.success(account ? `Student saved. Login: ${account.admissionNumber} / ${account.email}` : 'Student updated successfully');
      setShowForm(false);
      dispatch(fetchStudents());
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this student and linked login account?')) {
      dispatch(removeStudent(id)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          toast.success('Student record removed');
          if (selectedStudent && (selectedStudent.id === id || selectedStudent._id === id)) setSelectedStudent(null);
        } else {
          toast.error(res.payload || 'Failed to remove student');
        }
      });
    }
  };

  const handleDeactivate = (student) => {
    dispatch(updateStudent({ id: student.id || student._id, data: { status: 'inactive' } })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') toast.success('Student deactivated');
      else toast.error(res.payload || 'Unable to deactivate student');
    });
  };

  const handleResetPassword = (student) => {
    const password = randomPassword();
    dispatch(resetStudentPassword({
      id: student.id || student._id,
      data: { password, forcePasswordChange: true },
    })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') toast.success(`Temporary password: ${res.payload.temporaryPassword}`);
      else toast.error(res.payload || 'Password reset failed');
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Student Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage student records, credentials, status, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Student directory export prepared')} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm">
            <FolderDown size={14} /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm">
            <Plus size={14} /> Create Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students by name, admission number, email, roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {loading ? (
            <p className="text-xs font-semibold text-slate-500">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500">No student records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Admission</th>
                    <th className="pb-3">Class/Section</th>
                    <th className="pb-3">Parent</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((student) => (
                    <tr key={student.id || student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4">
                        <p className="font-extrabold">{student.name}</p>
                        <p className="text-slate-400">{student.email || student.contactNumber}</p>
                      </td>
                      <td className="py-4 font-bold text-indigo-500">{student.admissionNumber}</td>
                      <td className="py-4">{student.classDetails?.name || student.classId || 'Unassigned'} - {student.sectionDetails?.name || student.sectionId || '-'}</td>
                      <td className="py-4">{student.parentName} ({student.parentContact})</td>
                      <td className="py-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${student.status === 'inactive' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {student.status || 'active'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-1">
                        <button onClick={() => setSelectedStudent(student)} className="p-1.5 rounded hover:bg-indigo-500/10 text-indigo-500" title="View"><Eye size={14} /></button>
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded hover:bg-indigo-500/10 text-indigo-500" title="Edit"><Edit3 size={14} /></button>
                        <button onClick={() => handleResetPassword(student)} className="p-1.5 rounded hover:bg-amber-500/10 text-amber-500" title="Reset password"><KeyRound size={14} /></button>
                        <button onClick={() => handleDeactivate(student)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500" title="Deactivate"><UserX size={14} /></button>
                        {['super-admin', 'school-admin'].includes(user?.role) && (
                          <button onClick={() => handleDelete(student.id || student._id)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500" title="Delete"><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
          {selectedStudent ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                  {selectedStudent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">{selectedStudent.name}</h3>
                  <p className="text-slate-400">Admission ID: {selectedStudent.admissionNumber}</p>
                </div>
              </div>
              <p><strong>Roll:</strong> {selectedStudent.rollNumber}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>DOB:</strong> {selectedStudent.dob?.slice?.(0, 10) || '-'}</p>
              <p><strong>Phone:</strong> {selectedStudent.contactNumber}</p>
              <p><strong>Address:</strong> {selectedStudent.address}</p>
              <p><strong>Permissions:</strong> {selectedStudent.permissions?.length || 0} enabled</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <GraduationCap className="text-slate-400" size={32} />
              <p className="text-xs text-slate-400 font-semibold">Select a student to inspect profile and login settings.</p>
            </div>
          )}
        </aside>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold">{editing ? 'Edit Student' : 'Create Student'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>

            <div className={`grid grid-cols-1 ${editing ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
              <section className="space-y-3">
                <h4 className="font-bold">Personal Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>First Name</label><input required className={inputCls} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} /></div>
                  <div><label className={labelCls}>Last Name</label><input required className={inputCls} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => updateField('email', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Gender</label><select className={inputCls} value={form.gender} onChange={(e) => updateField('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div><label className={labelCls}>Date of Birth</label><input type="date" className={inputCls} value={form.dob} onChange={(e) => updateField('dob', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Phone Number</label><input required className={inputCls} value={form.contactNumber} onChange={(e) => updateField('contactNumber', e.target.value)} /></div>
                <div><label className={labelCls}>Alternate Phone</label><input className={inputCls} value={form.alternatePhone} onChange={(e) => updateField('alternatePhone', e.target.value)} /></div>
                <div><label className={labelCls}>Address</label><textarea className={inputCls} value={form.address} onChange={(e) => updateField('address', e.target.value)} /></div>
              </section>

              <section className="space-y-3">
                <h4 className="font-bold">Academic & Guardian</h4>
                <div className="p-2.5 rounded-lg border border-dashed border-slate-600 bg-slate-900/30">
                  <p className="text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold">Auto-Assigned: </span>
                    Admission No. (STD-{new Date().getFullYear()}-XXXX) and Roll No. (sequential per class & section) are automatically generated by the server.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Class Assigned</label>
                    <select
                      className={inputCls}
                      value={form.classId}
                      onChange={(e) => updateField('classId', e.target.value)}
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Section Assigned</label>
                    <select
                      className={inputCls}
                      value={form.sectionId}
                      onChange={(e) => updateField('sectionId', e.target.value)}
                    >
                      <option value="">Select Section</option>
                      {SECTION_OPTIONS.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>Blood Group</label><input className={inputCls} value={form.bloodGroup} onChange={(e) => updateField('bloodGroup', e.target.value)} /></div>
                <div><label className={labelCls}>Parent / Guardian</label><input required className={inputCls} value={form.parentName} onChange={(e) => updateField('parentName', e.target.value)} /></div>
                <div><label className={labelCls}>Parent Contact</label><input required className={inputCls} value={form.parentContact} onChange={(e) => updateField('parentContact', e.target.value)} /></div>
                <div><label className={labelCls}>Parent Email</label><input type="email" className={inputCls} value={form.parentEmail} onChange={(e) => updateField('parentEmail', e.target.value)} /></div>
                <div><label className={labelCls}>Aadhaar Number</label><input className={inputCls} value={form.aadhaarNumber} onChange={(e) => updateField('aadhaarNumber', e.target.value)} /></div>
              </section>

              {editing && (
                <section className="space-y-3">
                  <h4 className="font-bold">Login & Permissions</h4>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-3">
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
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-2"><Save size={14} /> Save Student</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
