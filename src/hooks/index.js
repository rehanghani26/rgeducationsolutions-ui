/**
 * @file index.js
 * @description Barrel export for all React Query hooks.
 *
 * Usage (import multiple hooks from one path):
 *   import { useTeachers, useCreateTeacher } from '../hooks';
 *   import { useStudents, useStudent }        from '../hooks';
 *   import { useFees, useCollectFee }         from '../hooks';
 */

// ── Teachers ──────────────────────────────────────────────────────────────────
export {
  TEACHER_KEYS,
  useTeachers,
  useTeacher,
  useTeacherActivity,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
  useBulkDeleteTeachers,
  useResetTeacherPassword,
} from './useTeachers.js';

// ── Students ──────────────────────────────────────────────────────────────────
export {
  STUDENT_KEYS,
  useStudents,
  useStudent,
  useStudentActivity,
  useClasses,
  useSections,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useBulkDeleteStudents,
  useBulkPromoteStudents,
} from './useStudents.js';

// ── Fees / Finance ────────────────────────────────────────────────────────────
export {
  FEE_KEYS,
  useFees,
  useFee,
  useFeeActivity,
  useExpenses,
  useCollectFee,
  useUpdateFee,
  useCreateExpense,
} from './useFees.js';

// ── Inventory ─────────────────────────────────────────────────────────────────
export {
  INVENTORY_KEYS,
  useInventory,
  useInventoryItem,
  useInventoryActivity,
  useInventoryAlerts,
  useVendors,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useAdjustStock,
} from './useInventory.js';

// ── Exams ─────────────────────────────────────────────────────────────────────
export {
  EXAM_KEYS,
  useExams,
  useExam,
  useExamActivity,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
} from './useExams.js';

// ── Attendance ────────────────────────────────────────────────────────────────
export {
  ATTENDANCE_KEYS,
  useAttendanceRecords,
  useAttendanceStats,
  useCreateAttendance,
} from './useAttendance.js';

// ── Audit Logs ────────────────────────────────────────────────────────────────
export {
  AUDIT_LOG_KEYS,
  useAuditLogs,
} from './useAuditLogs.js';
