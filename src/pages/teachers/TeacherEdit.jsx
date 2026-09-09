import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import TeacherForm, { blankTeacherForm, payloadFromForm } from './TeacherForm.jsx';
import { getTeacherById, updateTeacher } from '../../services';
import { mockTeachers } from '../../data/mockData.js';

const TeacherEdit = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(blankTeacherForm);

  useEffect(() => {
    if (!teacherId) return;
    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const res = await getTeacherById(teacherId);
        const found = res?.teacher || res?.data?.teacher || mockTeachers[0];
        setTeacher(found);
      } catch (err) {
        setTeacher(mockTeachers[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  useEffect(() => {
    if (teacher) {
      setForm({
        ...blankTeacherForm,
        ...teacher,
        dob: teacher.dob?.slice?.(0, 10) || '',
        joiningDate: teacher.joiningDate?.slice?.(0, 10) || '',
        permissions: teacher.permissions?.length ? teacher.permissions : blankTeacherForm.permissions,
      });
    }
  }, [teacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = payloadFromForm(form);
    delete payload.password;
    delete payload.confirmPassword;

    try {
      setSubmitting(true);
      await updateTeacher(teacherId, payload);
      navigate(`/teachers/${teacherId}`);
    } catch (err) {
      console.error("Teacher update error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullPage size="lg" text="Loading teacher record from API..." className="py-24" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Edit Teacher"
        subtitle={teacher?.name}
        breadcrumbs={[
          { label: 'Teachers', to: '/teachers' },
          { label: teacher?.name || 'Teacher', to: `/teachers/${teacherId}` },
          { label: 'Edit' },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <TeacherForm
          form={form}
          onChange={setForm}
          editing
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/teachers/${teacherId}`)}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default TeacherEdit;
