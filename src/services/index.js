/**
 * @file index.js
 * @description Central barrel export for all API services.
 * Mirrors the EODSrc/services/index.js pattern.
 */

export { default as api } from './api.js';

export * from './authService.js';
export { default as authService } from './authService.js';

export * from './studentService.js';
export { default as studentService } from './studentService.js';

export * from './teacherService.js';
export { default as teacherService } from './teacherService.js';

export * from './feeService.js';
export { default as feeService } from './feeService.js';

export * from './inventoryService.js';
export { default as inventoryService } from './inventoryService.js';

export * from './examService.js';
export { default as examService } from './examService.js';

export * from './attendanceService.js';
export { default as attendanceService } from './attendanceService.js';

export * from './auditLogService.js';
export { default as auditLogService } from './auditLogService.js';

export * from './erpService.js';
export { default as erpService } from './erpService.js';

export * from './onlineClassService.js';
export { default as onlineClassService } from './onlineClassService.js';

export * from './homeworkService.js';
export { default as homeworkService } from './homeworkService.js';

export * from './userService.js';
export { default as userService } from './userService.js';

export * from './curriculumService.js';
export { default as curriculumService } from './curriculumService.js';
