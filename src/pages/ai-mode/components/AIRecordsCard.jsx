import React from 'react';

const layouts = {
  getClasses: ['Classes', 'classes', 'name', 'code', 'capacity'],
  getSections: ['Sections', 'sections', 'name', 'className', 'capacity'],
  getSubjects: ['Subjects', 'subjects', 'name', 'code', 'type'],
  getTeachers: ['Teachers', 'teachers', 'name', 'department', 'designation'],
  getClassTimetable: ['Class timetable', 'timetable', 'subject', 'section', 'day', 'time', 'teacher'],
  getTodayTimetable: ['Today’s timetable', 'timetable', 'subject', 'section', 'time', 'teacher'],
  getCurrentBudgetAllocation: ['Budget allocation', 'allocations', 'category', 'allocated', 'spent'],
  getSchoolSetupOverview: ['School setup', 'steps', 'title', 'complete'],
};
const labels = { className: 'Class', sectionName: 'Section', subjectName: 'Subject', complete: 'Status' };

export default function AIRecordsCard({ tool, data }) {
  if (tool === 'getRoleAccess' && Array.isArray(data.modules)) return <section className="rounded-xl border border-[#393939] bg-[#181818] p-4">
    <h3 className="font-semibold">Permissions · {data.role}</h3>
    <p className="my-2 text-sm text-[#A1A1AA]">View scope · {data.viewScope?.replaceAll('_', ' ') || 'Unspecified'}</p>
    <ul className="flex flex-wrap gap-2">{data.modules.map((module) => <li key={module} className="rounded-lg border border-white/10 px-2 py-1 text-sm">
      {module === '*' ? 'All modules' : module}
    </li>)}</ul>
  </section>;
  let layout = layouts[tool];
  if (tool === 'getAcademicWorkspace') layout = data.room
    ? ['Courses', 'subjects', 'subjectName', 'teacherName'] : ['Classrooms', 'rooms', 'className', 'sectionName', 'studentCount'];
  if (tool === 'getMyAcademicPlan') layout = ['My subjects', 'subjects', 'subjectName', 'teacherName'];
  if (!layout) return null;
  const [title, field, primary, ...columns] = layout;
  const rows = data[field];
  if (!Array.isArray(rows)) return null;
  return <section className="rounded-xl border border-[#393939] bg-[#181818] p-3">
    <h3 className="mb-3 font-semibold text-white">{title} <small className="text-[#FFA000]">{rows.length}</small></h3>
    {rows.length ? <ul className="grid gap-2 sm:grid-cols-2">{rows.map((row, i) => <li key={row.id || i} className="min-w-0 rounded-lg border border-white/10 p-3">
      <strong className="break-words text-sm">{row[primary] || '—'}</strong>
      <dl>{columns.map((key) => <div key={key} className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs">
        <dt className="capitalize text-[#A1A1AA]">{labels[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
        <dd>{key === 'complete' ? row[key] ? 'Configured' : 'Pending' : row[key] ?? '—'}</dd>
      </div>)}</dl>
    </li>)}</ul> : <p className="text-sm text-[#A1A1AA]">No records available.</p>}
    {tool === 'getSchoolSetupOverview' && data.timetable && <p className="mt-3 text-sm">Class timetables · {data.timetable.linked} of {data.timetable.classrooms} classrooms linked</p>}
  </section>;
}
