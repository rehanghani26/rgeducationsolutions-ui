/**
 * @file appRoutes.js
 * @description Application route configuration objects array.
 * Mirrors the EODSrc/routes/appRoutes.js pattern.
 */

import {
  Login,
  Signup,
  Dashboard,
  StudentList,
  StudentDetail,
  StudentEdit,
  TeacherList,
  TeacherDetail,
  TeacherEdit,
  FeeList,
  FeeDetail,
  FeeEdit,
  InventoryList,
  InventoryDetail,
  InventoryEdit,
  ClassList,
  ClassDetail,
  AcademicManagement,
  AttendanceManagement,
  ExamList,
  ExamDetail,
  TimetableManagement,
  ResultsManagement,
  LeaveManagement,
  PayrollManagement,
  LibraryManagement,
  TransportManagement,
  HostelManagement,
  CertificatesManagement,
  NotificationsManagement,
  ReportsManagement,
  AuditLogList,
  Settings,
  OnlineClassesManagement,
  HomeworkManagement,
  UserManagement,
  UserDetailPage,
  AiMode,
} from '../pages/index.js';

import { ROUTES } from './routes.js';
import { ROLES, ADMIN_ROLES, FINANCE_ROLES, INVENTORY_ROLES } from '../constants/roles.js';

const appRoutes = [
  // ─── Public Authentication Routes ──────────────────────────────────────────
  { path: ROUTES.LOGIN, element: Login, name: 'login', public: true },
  { path: ROUTES.SIGNUP, element: Signup, name: 'signup', public: true },

  // ─── Protected Application Routes ───────────────────────────────────────────
  { path: ROUTES.DASHBOARD, element: Dashboard, name: 'dashboard', navTitle: 'Dashboard' },

  // Students
  { path: ROUTES.STUDENTS.LIST, element: StudentList, name: 'student-list', module: 'students' },
  { path: ROUTES.STUDENTS.CREATE, element: StudentEdit, name: 'student-create', module: 'students' },
  { path: ROUTES.STUDENTS.DETAIL_PARAM, element: StudentDetail, name: 'student-detail', module: 'students' },
  { path: ROUTES.STUDENTS.EDIT_PARAM, element: StudentEdit, name: 'student-edit', module: 'students' },

  // Teachers
  { path: ROUTES.TEACHERS.LIST, element: TeacherList, name: 'teacher-list', module: 'teachers' },
  { path: ROUTES.TEACHERS.CREATE, element: TeacherEdit, name: 'teacher-create', module: 'teachers' },
  { path: ROUTES.TEACHERS.DETAIL_PARAM, element: TeacherDetail, name: 'teacher-detail', module: 'teachers' },
  { path: ROUTES.TEACHERS.EDIT_PARAM, element: TeacherEdit, name: 'teacher-edit', module: 'teachers' },

  // Fees / Finance
  { path: ROUTES.FEES.LIST, element: FeeList, name: 'fee-list', module: 'fees', allowedRoles: FINANCE_ROLES },
  { path: ROUTES.FEES.CREATE, element: FeeEdit, name: 'fee-create', module: 'fees', allowedRoles: FINANCE_ROLES },
  { path: ROUTES.FEES.DETAIL_PARAM, element: FeeDetail, name: 'fee-detail', module: 'fees', allowedRoles: FINANCE_ROLES },
  { path: ROUTES.FEES.EDIT_PARAM, element: FeeEdit, name: 'fee-edit', module: 'fees', allowedRoles: FINANCE_ROLES },

  // Inventory
  { path: ROUTES.INVENTORY.LIST, element: InventoryList, name: 'inventory-list', module: 'inventory', allowedRoles: INVENTORY_ROLES },
  { path: ROUTES.INVENTORY.CREATE, element: InventoryEdit, name: 'inventory-create', module: 'inventory', allowedRoles: INVENTORY_ROLES },
  { path: ROUTES.INVENTORY.DETAIL_PARAM, element: InventoryDetail, name: 'inventory-detail', module: 'inventory', allowedRoles: INVENTORY_ROLES },
  { path: ROUTES.INVENTORY.EDIT_PARAM, element: InventoryEdit, name: 'inventory-edit', module: 'inventory', allowedRoles: INVENTORY_ROLES },

  // Academics
  { path: ROUTES.ACADEMICS.BASE, element: AcademicManagement, name: 'academic-overview', module: 'academics' },
  { path: ROUTES.ACADEMICS.CLASSES, element: ClassList, name: 'class-list', module: 'academics' },
  { path: ROUTES.ACADEMICS.CLASS_PARAM, element: ClassDetail, name: 'class-detail', module: 'academics' },

  // Attendance
  { path: ROUTES.ATTENDANCE, element: AttendanceManagement, name: 'attendance', module: 'attendance' },

  // Exams
  { path: ROUTES.EXAMS.LIST, element: ExamList, name: 'exam-list', module: 'exams' },
  { path: ROUTES.EXAMS.DETAIL_PARAM, element: ExamDetail, name: 'exam-detail', module: 'exams' },

  // Other Modules
  { path: ROUTES.TIMETABLE, element: TimetableManagement, name: 'timetable', module: 'timetable' },
  { path: ROUTES.RESULTS, element: ResultsManagement, name: 'results', module: 'results' },
  { path: ROUTES.LEAVE, element: LeaveManagement, name: 'leave', module: 'leave' },
  { path: ROUTES.PAYROLL, element: PayrollManagement, name: 'payroll', module: 'payroll' },
  { path: ROUTES.LIBRARY, element: LibraryManagement, name: 'library', module: 'library' },
  { path: ROUTES.TRANSPORT, element: TransportManagement, name: 'transport', module: 'transport' },
  { path: ROUTES.HOSTEL, element: HostelManagement, name: 'hostel', module: 'hostel' },
  { path: ROUTES.CERTIFICATES, element: CertificatesManagement, name: 'certificates', module: 'certificates' },
  { path: ROUTES.NOTIFICATIONS, element: NotificationsManagement, name: 'notifications', module: 'notifications' },
  { path: ROUTES.REPORTS, element: ReportsManagement, name: 'reports', module: 'reports' },

  // System
  { path: ROUTES.USER_MANAGEMENT, element: UserManagement, name: 'user-management', module: 'user-management', allowedRoles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, 'admin'] },
  { path: ROUTES.USER_DETAIL, element: UserDetailPage, name: 'user-detail', module: 'user-management', allowedRoles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, 'admin'] },
  { path: ROUTES.AUDIT_LOGS, element: AuditLogList, name: 'audit-logs', allowedRoles: ADMIN_ROLES },
  { path: ROUTES.SETTINGS, element: Settings, name: 'settings', allowedRoles: ADMIN_ROLES },

  // Learning Modules
  { path: ROUTES.ONLINE_CLASSES, element: OnlineClassesManagement, name: 'online-classes', module: 'online-classes' },
  { path: ROUTES.HOMEWORK, element: HomeworkManagement, name: 'homework', module: 'homework' },

  // AI Hub
  { path: ROUTES.AI_MODE, element: AiMode, name: 'ai-mode', fullScreen: true },
];

export default appRoutes;
