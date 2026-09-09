import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import StudentForm, { blankStudentForm } from './StudentForm.jsx';
import studentService from '../../services/studentService.js';
import { mockStudents } from '../../data/mockData.js';

const StudentEdit = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(blankStudentForm);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    studentService.getById(studentId)
      .then(res => {
        if (res.data?.student) setStudent(res.data.student);
      })
      .catch(() => {
        toast.error("Failed to load student record from server");
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (student) {
      setForm({
        ...blankStudentForm,
        ...student,
        firstName: student.firstName || student.name?.split(' ')[0] || '',
        lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || '',
        dob: student.dob?.slice?.(0, 10) || '',
        permissions: student.permissions?.length ? student.permissions : blankStudentForm.permissions,
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName} ${form.lastName}`.trim(),
    };
    delete payload.password;
    delete payload.confirmPassword;

    try {
      setSubmitting(true);
      const res = await studentService.update(studentId, payload);
      if (res.data?.success !== false) {
        toast.success(res.data?.message || 'Student updated successfully');
        navigate(`/students/${studentId}`);
      } else {
        toast.error(res.data?.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update student error:', err);
      const msg = err.response?.data?.message || err.message || 'Update failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullPage size="lg" text="Loading student record from API..." className="py-24" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Edit Student"
        subtitle={student?.name}
        breadcrumbs={[
          { label: 'Students', to: '/students' },
          { label: student?.name || 'Student', to: `/students/${studentId}` },
          { label: 'Edit' },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <StudentForm
          form={form}
          onChange={setForm}
          editing
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/students/${studentId}`)}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default StudentEdit;
