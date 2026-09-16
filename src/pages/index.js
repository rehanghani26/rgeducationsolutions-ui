/**
 * @file index.js
 * @description Central barrel export for all application page views.
 * Mirrors the EODSrc/pages/index.js architectural pattern.
 */

// ─── Domain Module Barrel Exports ──────────────────────────────────────────────
export * from './students';
export * from './teachers';
export * from './fees';
export * from './inventory';
export * from './academics';
export * from './attendance';
export * from './exams';
export * from './online-classes';
export * from './homework';

// ─── Core Pages ───────────────────────────────────────────────────────────────
export { default as Login }                 from './Login.jsx';
export { default as Signup }                from './Signup.jsx';
export { default as Dashboard }             from './Dashboard.jsx';
export { default as AcademicManagement }    from './AcademicManagement.jsx';
export { default as FeesManagement }        from './FeesManagement.jsx';
export { default as InventoryManagement }   from './InventoryManagement.jsx';
export { default as LeaveManagement }       from './LeaveManagement.jsx';
export { default as Settings }              from './Settings.jsx';
export { default as StudentManagement }     from './StudentManagement.jsx';
export { default as TeacherManagement }     from './TeacherManagement.jsx';
export { default as ModulePlaceholder }     from './ModulePlaceholder.jsx';

// ─── Sub-system Modules ───────────────────────────────────────────────────────
export { default as TimetableManagement }     from './timetable/TimetableManagement.jsx';
export { default as ResultsManagement }       from './results/ResultsManagement.jsx';
export { default as PayrollManagement }       from './payroll/PayrollManagement.jsx';
export { default as LibraryManagement }       from './library/LibraryManagement.jsx';
export { default as TransportManagement }     from './transport/TransportManagement.jsx';
export { default as HostelManagement }        from './hostel/HostelManagement.jsx';
export { default as CertificatesManagement }  from './certificates/CertificatesManagement.jsx';
export { default as NotificationsManagement } from './notifications/NotificationsManagement.jsx';
export { default as ReportsManagement }       from './reports/ReportsManagement.jsx';
export { default as AuditLogList }            from './audit-logs/AuditLogList.jsx';
export { default as OnlineClassesManagement } from './online-classes/OnlineClassesManagement.jsx';
export { default as HomeworkManagement }      from './homework/HomeworkManagement.jsx';
export { default as UserManagement }          from './UserManagement.jsx';
export { default as UserDetailPage }          from './UserDetailPage.jsx';
export { default as AiMode }                  from './ai-mode/AiMode.jsx';
