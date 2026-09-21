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
        const loadedStudent = res?.student || res?.data?.student || (res?._id || res?.id ? res : null);
        if (loadedStudent) {
          setStudent(loadedStudent);
        } else {
          toast.error("Student record not found");
        }
      })
      .catch((err) => {
        console.error("Failed to load student record:", err);
        const found = mockStudents?.find(
          (s) => String(s.id) === String(studentId) || String(s._id) === String(studentId)
        );
        if (found) {
          setStudent(found);
        } else {
          toast.error("Failed to load student record from server");
        }
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (student) {
      // Resolve class ID & name
      let rawClassId = student.classId;
      if (typeof rawClassId === 'object' && rawClassId !== null) {
        rawClassId = rawClassId._id || rawClassId.id || rawClassId.name || '';
      }
      const className = student.className || student.class || (typeof student.classId === 'object' ? student.classId?.name : '') || '';

      // Resolve section ID & name
      let rawSectionId = student.sectionId;
      if (typeof rawSectionId === 'object' && rawSectionId !== null) {
        rawSectionId = rawSectionId._id || rawSectionId.id || rawSectionId.name || '';
      }
      const sectionName = student.sectionName || student.section || (typeof student.sectionId === 'object' ? student.sectionId?.name : '') || '';

      // Resolve parent info with all fallback options
      const parentName = student.parentName || student.parentId?.name || student.parentDetails?.name || student.guardianName || student.fatherName || '';
      const parentContact = student.parentContact || student.parentId?.phone || student.parentDetails?.phone || student.guardianPhone || student.emergencyContact || student.contactNumber || '';
      const parentEmail = student.parentEmail || student.parentId?.email || student.parentDetails?.email || student.guardianEmail || '';

      // Date formatter for HTML5 date inputs (strictly YYYY-MM-DD)
      const formatDateStr = (val) => {
        if (!val) return '';
        try {
          if (typeof val === 'string') {
            const trimmed = val.trim();
            // Already YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
              return trimmed.slice(0, 10);
            }
            // Parse DD/MM/YYYY or DD-MM-YYYY
            const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (dmyMatch) {
              const day = dmyMatch[1].padStart(2, '0');
              const month = dmyMatch[2].padStart(2, '0');
              const year = dmyMatch[3];
              return `${year}-${month}-${day}`;
            }
          }
          const d = new Date(val);
          return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
        } catch {
          return '';
        }
      };

      // Name resolution
      const fullName = student.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = student.firstName || nameParts[0] || '';
      const lastName = student.lastName != null && student.lastName !== ''
        ? student.lastName
        : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      // Photo and Aadhaar references
      const photoUrl = student.photo || student.imagesRef?.img || student.avatar || student.image || '';
      const photoId = student.imagesRef?.id || student.photoId || '';
      const imagesRef = { id: photoId, img: photoUrl };

      const aadhaarPdfUrl = student.aadhaarDocument || student.AdharRef?.pdf || student.aadhaarPdf || student.adharPdf || '';
      const aadhaarPdfId = student.AdharRef?.id || student.aadhaarDocId || '';
      const AdharRef = { id: aadhaarPdfId, pdf: aadhaarPdfUrl };

      const aadhaarNumber = student.aadhaarNumber || student.aadharNumber || student.aadhaarNo || student.aadharNo || '';

      // Address string extraction
      const address = typeof student.address === 'object' && student.address !== null
        ? (student.address.street || student.address.city || '')
        : (student.address || '');

      // Gender normalization
      const gRaw = String(student.gender || 'Male').toLowerCase().trim();
      const gender = gRaw === 'female' ? 'Female' : gRaw === 'other' ? 'Other' : 'Male';

      // Status normalization
      const sRaw = String(student.status || 'active').toLowerCase().trim();
      const status = sRaw.includes('passout') ? 'Passout' : (sRaw === 'inactive' ? 'inactive' : 'active');

      setForm({
        ...blankStudentForm,
        ...student,
        firstName,
        lastName,
        name: fullName || `${firstName} ${lastName}`.trim(),
        dob: formatDateStr(student.dob),
        joiningDate: formatDateStr(student.joiningDate) || new Date().toISOString().slice(0, 10),
        accountExpiryDate: formatDateStr(student.accountExpiryDate),
        classId: rawClassId || className,
        class: className,
        className,
        sectionId: rawSectionId || sectionName,
        section: sectionName,
        sectionName,
        parentName,
        parentContact,
        parentEmail,
        contactNumber: student.contactNumber || student.phone || student.mobileNumber || '',
        alternatePhone: student.alternatePhone || student.altPhone || '',
        email: student.email || student.user?.email || student.userDetails?.email || '',
        address,
        gender,
        bloodGroup: (student.bloodGroup || '').toUpperCase().trim(),
        status,
        aadhaarNumber,
        photo: photoUrl,
        imagesRef,
        aadhaarDocument: aadhaarPdfUrl,
        AdharRef,
        admissionNumber: student.admissionNumber || '',
        rollNumber: student.rollNumber != null ? student.rollNumber : null,
        permissions: Array.isArray(student.permissions) && student.permissions.length > 0
          ? student.permissions
          : (Array.isArray(student.user?.permissions) && student.user.permissions.length > 0
            ? student.user.permissions
            : blankStudentForm.permissions),
        forcePasswordChange: Boolean(student.forcePasswordChange ?? student.user?.forcePasswordChange),
        twoFactorEnabled: Boolean(student.twoFactorEnabled ?? student.user?.twoFactorEnabled),
        loginRestriction: student.loginRestriction || student.user?.loginRestriction || 'none',
      });
    }
  }, [student]);

  const isEdit = Boolean(studentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      firstName: form.firstName?.trim() || '',
      lastName: form.lastName?.trim() || '',
      name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
    };
    if (isEdit) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    try {
      setSubmitting(true);
      const res = isEdit
        ? await studentService.update(studentId, payload)
        : await studentService.create(payload);

      if (res?.success !== false && res?.data?.success !== false) {
        toast.success(
          res?.message || res?.data?.message || (isEdit ? 'Student updated successfully' : 'Student created successfully')
        );
        const newId = res?.student?._id || res?.student?.id || res?.data?.student?._id || res?.data?.student?.id || studentId;
        navigate(newId ? `/students/${newId}` : '/students');
      } else {
        toast.error(res?.message || res?.data?.message || (isEdit ? 'Update failed' : 'Creation failed'));
      }
    } catch (err) {
      console.error(isEdit ? 'Update student error:' : 'Create student error:', err);
      const msg = err.response?.data?.message || err.message || (isEdit ? 'Update failed' : 'Creation failed');
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
        title={isEdit ? "Edit Student" : "Add Student"}
        subtitle={isEdit ? student?.name : "Register a new student"}
        breadcrumbs={[
          { label: 'Students', to: '/students' },
          ...(isEdit && studentId ? [{ label: student?.name || 'Student', to: `/students/${studentId}` }] : []),
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
      />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <StudentForm
          form={form}
          onChange={setForm}
          editing={isEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit && studentId ? `/students/${studentId}` : '/students')}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default StudentEdit;
