/**
 * @file mockData.js
 * @description Mock data fallback for hostel, library, transport, reports, and notifications.
 */

export const mockHostel = [
  {
    id: 'hst-1',
    blockName: 'Al-Farooq Boys Residence Block A',
    totalRooms: 24,
    occupiedRooms: 20,
    capacity: 72,
    residentsCount: 60,
    warden: 'Maulana Tariq Jameel',
    wardenPhone: '+91 98765 43210',
  },
  {
    id: 'hst-2',
    blockName: 'Aisha Siddiqa Girls Residence Block B',
    totalRooms: 18,
    occupiedRooms: 14,
    capacity: 54,
    residentsCount: 42,
    warden: 'Fatima Begum',
    wardenPhone: '+91 98765 43211',
  },
];

export const mockLibrary = [
  {
    id: 'lib-1',
    isbn: '978-0199535569',
    title: 'The Holy Quran: Translation & Commentary',
    author: 'Abdullah Yusuf Ali',
    category: 'Islamic Studies',
    rack: 'R-01-A',
    totalCopies: 25,
    availableCopies: 18,
  },
  {
    id: 'lib-2',
    isbn: '978-0140449136',
    title: 'Riyad as-Salihin (Gardens of the Righteous)',
    author: 'Imam an-Nawawi',
    category: 'Hadith',
    rack: 'R-01-B',
    totalCopies: 15,
    availableCopies: 12,
  },
  {
    id: 'lib-3',
    isbn: '978-0078028786',
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    category: 'Mathematics',
    rack: 'R-03-C',
    totalCopies: 30,
    availableCopies: 14,
  },
  {
    id: 'lib-4',
    isbn: '978-0131103627',
    title: 'The C Programming Language',
    author: 'Kernighan & Ritchie',
    category: 'Computer Science',
    rack: 'R-04-A',
    totalCopies: 20,
    availableCopies: 9,
  },
];

export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'First Term Examination Schedule Published',
    category: 'Academic',
    message: 'The date sheet for Term 1 examinations has been uploaded to the portal.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Monthly Fee Reminder for Current Session',
    category: 'Finance',
    message: 'Parents are requested to clear all pending dues before the 15th.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'Annual Sports & Athletics Meet',
    category: 'Events',
    message: 'Registrations are now open for the Annual Inter-House Sports Gala.',
    timestamp: '3 days ago',
    read: true,
  },
];

export const mockReports = {
  attendanceOverview: 'Overall student attendance rate maintained at 94.2% across all enrolled classes.',
  feeCollectionOverview: 'Total collected tuition & fee revenue stands at 89.6% of projected session targets.',
  topPerformers: [
    { name: 'Zaid Khan', grade: 'Class 10 - Section A', score: '98.5%' },
    { name: 'Maryam Fatima', grade: 'Class 9 - Section B', score: '97.8%' },
    { name: 'Bilal Ahmed', grade: 'Class 8 - Section A', score: '96.4%' },
  ],
};

export const mockTransport = [
  {
    id: 'tr-1',
    routeName: 'Route 1 - Downtown Express to School Campus',
    vehicleNo: 'UP-32-AB-1234',
    driverName: 'Mohd Rafiq',
    driverPhone: '+91 98765 00001',
    capacity: 35,
    assignedStudents: 32,
    status: 'Active',
  },
  {
    id: 'tr-2',
    routeName: 'Route 2 - Northern Suburbs & City Center',
    vehicleNo: 'UP-32-CD-5678',
    driverName: 'Abdul Kareem',
    driverPhone: '+91 98765 00002',
    capacity: 40,
    assignedStudents: 38,
    status: 'Active',
  },
];

export default {
  mockHostel,
  mockLibrary,
  mockNotifications,
  mockReports,
  mockTransport,
};

