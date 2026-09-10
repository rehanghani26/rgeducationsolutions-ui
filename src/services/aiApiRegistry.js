/**
 * @file aiApiRegistry.js
 * @description Comprehensive School ERP API Documentation (reference only).
 *
 * ⚠️  This file is documentation-only. All executable AI tool logic has
 *     been moved to the backend (server/ai/tools/). The frontend no longer
 *     runs AI tool calls — they are executed securely on the server.
 *
 * For the active AI integration see:
 *   - Backend tools: server/ai/tools/*.tools.js
 *   - Backend service: server/ai/ai.service.js
 *   - Frontend entry: ui/src/services/systemAiService.js
 */

/* ==========================================================================
 * SCHOOL ERP API SPECIFICATIONS (REFERENCE)
 * ========================================================================== */

/**
 * --------------------------------------------------------------------------
 * 1. STUDENTS MODULE APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/students
 *
 * 1.1 GET /api/v1/students
 *   - Purpose: Retrieve paginated list of students with optional search & filters.
 *   - Query Params:
 *       • page (number): Current page number (default 1)
 *       • limit (number): Items per page (default 10)
 *       • search (string): Search across student name, roll number, or admission number
 *       • class (string): Filter by class ID or name (e.g., '10th', 'Class 10')
 *       • section (string): Filter by section name (e.g., 'A', 'B')
 *       • status (string): 'active' | 'inactive' | 'graduated'
 *   - Returns: { success: boolean, data: { students: Student[], pagination: { total, page, pages } } }
 *
 * 1.2 GET /api/v1/students/:id
 *   - Purpose: Retrieve full student profile details, academic records, and parent contacts.
 *   - Returns: { success: boolean, data: Student }
 *
 * 1.3 POST /api/v1/students
 *   - Purpose: Enroll / register a new student in the school system.
 *   - Request Body:
 *       • name (string, required): Full name of the student
 *       • admissionNumber (string, optional): Unique student admission code
 *       • rollNumber (string, optional): Class roll number
 *       • class (string, required): Class enrolled into
 *       • section (string, optional): Section (e.g. 'A', 'B')
 *       • dateOfBirth (string, optional): ISO date string
 *       • gender (string, optional): 'male' | 'female' | 'other'
 *       • parentName (string, optional): Guardian / Father / Mother name
 *       • contactNumber (string, optional): Primary phone contact
 *       • email (string, optional): Student or guardian email
 *       • address (string, optional): Home address
 *   - Returns: { success: boolean, data: Student, message: string }
 *
 * 1.4 PUT /api/v1/students/:id
 *   - Purpose: Update existing student's personal or academic information.
 *   - Returns: { success: boolean, data: Student }
 *
 * 1.5 DELETE /api/v1/students/:id
 *   - Purpose: Remove or archive a student record.
 *   - Returns: { success: boolean, message: string }
 */

/**
 * --------------------------------------------------------------------------
 * 2. TEACHERS & STAFF MODULE APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/teachers
 *
 * 2.1 GET /api/v1/teachers
 *   - Purpose: List all faculty members and teachers.
 *   - Query Params: page, limit, search, department, status.
 *   - Returns: { success: boolean, data: { teachers: Teacher[], pagination } }
 *
 * 2.2 GET /api/v1/teachers/:id
 *   - Purpose: Retrieve teacher profile, subjects assigned, and schedule.
 *   - Returns: { success: boolean, data: Teacher }
 *
 * 2.3 POST /api/v1/teachers
 *   - Purpose: Add a new teacher / faculty member to the staff registry.
 *   - Request Body:
 *       • name (string, required): Full name
 *       • email (string, required): Official email
 *       • phone (string, optional): Contact number
 *       • department (string, optional): e.g., 'Science', 'Mathematics', 'Arts'
 *       • designation (string, optional): e.g., 'Senior Teacher', 'Head of Dept'
 *       • subjects (string[], optional): Assigned subject names
 *   - Returns: { success: boolean, data: Teacher }
 *
 * 2.4 PUT /api/v1/teachers/:id  — Modify teacher record.
 * 2.5 DELETE /api/v1/teachers/:id  — Remove teacher record.
 */

/**
 * --------------------------------------------------------------------------
 * 3. USER MANAGEMENT & ACCESS CONTROL APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/users
 *
 * 3.1 GET /api/v1/users
 *   - Query Params: search, role ('admin'|'teacher'|'accountant'|'librarian'|'student'|'parent'), status.
 *   - Returns: { success: boolean, data: { users: User[], pagination } }
 *
 * 3.2 GET /api/v1/users/roles  — Get all system roles and user counts.
 * 3.3 GET /api/v1/users/:id    — Get single user credentials & permission details.
 *
 * 3.4 POST /api/v1/users
 *   - Request Body: { name, username, email, password, role, employeeId?, isActive? }
 *   - Returns: { success: boolean, data: User }
 *
 * 3.5 PUT /api/v1/users/:id          — Update user profile, password, or role.
 * 3.6 PATCH /api/v1/users/:id/status — Toggle active / inactive status.
 */

/**
 * --------------------------------------------------------------------------
 * 4. ATTENDANCE MODULE APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/attendance
 *
 * 4.1 GET /api/v1/attendance
 *   - Query Params: date (YYYY-MM-DD), class, section, type ('student' | 'staff')
 *   - Returns: { success: boolean, data: AttendanceRecord[] }
 *
 * 4.2 POST /api/v1/attendance
 *   - Body: { date, class, section, records: [{ studentId, status, remark }] }
 *
 * 4.3 GET /api/v1/attendance/stats
 *   - Returns attendance percentages, absence trends, and anomalies.
 */

/**
 * --------------------------------------------------------------------------
 * 5. FINANCE & FEES APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/finance
 *
 * 5.1 GET /api/v1/finance/fees
 *   - Query Params: search, class, status ('paid' | 'pending' | 'overdue'), studentId
 *
 * 5.2 POST /api/v1/finance/fees/collect
 *   - Body: { studentId, amount, paymentMethod, feeType, transactionId, notes }
 *
 * 5.3 GET /api/v1/finance/expenses — List institutional expenditures.
 */

/**
 * --------------------------------------------------------------------------
 * 6. INVENTORY & ASSET MANAGEMENT APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/inventory
 *
 * 6.1 GET /api/v1/inventory
 *   - Query Params: category, lowStock (boolean), search
 *
 * 6.2 POST /api/v1/inventory
 *   - Body: { itemName, category, quantity, unit, reorderLevel, unitPrice, vendor }
 *
 * 6.3 GET /api/v1/inventory/alerts — Items below reorder threshold.
 */

/**
 * --------------------------------------------------------------------------
 * 7. EXAMINATIONS & ACADEMIC RECORDS APIS
 * --------------------------------------------------------------------------
 * Base Route: /api/v1/exams
 *
 * 7.1 GET /api/v1/exams  — List upcoming and past examinations.
 *   - Query Params: class, term, status
 *
 * 7.2 POST /api/v1/exams  — Schedule a new examination.
 *   - Body: { title, class, term, startDate, endDate, subjects: [{ subject, date, maxMarks }] }
 */

/**
 * --------------------------------------------------------------------------
 * 8. ERP CORE (CLASSES, SECTIONS, DASHBOARD & SETTINGS) APIS
 * --------------------------------------------------------------------------
 * 8.1 GET /api/v1/erp/classes   — List all grades / academic classes.
 * 8.2 GET /api/v1/erp/sections  — List class sections.
 * 8.3 GET /api/v1/erp/subjects  — List curricular subjects.
 * 8.4 GET /api/v1/dashboard     — KPI metrics (students, staff, attendance %, revenue, alerts).
 * 8.5 GET /api/v1/erp/settings  — School profile, academic year, grading scale.
 */

/**
 * --------------------------------------------------------------------------
 * 9. ONLINE CLASSES & HOMEWORK APIS
 * --------------------------------------------------------------------------
 * 9.1 GET  /api/v1/online-classes — Virtual classroom meetings.
 * 9.2 GET  /api/v1/homework       — List assignments by teachers.
 * 9.3 POST /api/v1/homework       — Create a new homework assignment.
 */

/**
 * --------------------------------------------------------------------------
 * 10. AUDIT LOGS APIS
 * --------------------------------------------------------------------------
 * 10.1 GET /api/v1/audit-logs — Query security and administrative activity log trail.
 */
