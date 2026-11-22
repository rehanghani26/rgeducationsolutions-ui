import { SECTION_OPTIONS } from '../../../constants/academicOptions.js';
import { DAYS_OF_WEEK, WEEKDAYS } from '../../../constants/dateTime.js';
import { getSlotTypeMeta } from '../../timetable/timetableUtils.js';
import { periodTypes } from '../masterPeriods/masterPeriodValues.js';

export const scheduleType = 'regular';
export const textKey = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const sectionKey = (value) => textKey(value).replace(/^(section\s+|sec-)/, '');

export function timetableClass(row, classes) {
  const [keyClass, keySection] = (row.classSectionKey || '').split(/\s+[-\u2013\u2014]\s+|_(?=sec-)/i, 2);
  const matches = (values, name) => Boolean(name) && values.some((value) => textKey(value) === textKey(name));
  const grade = classes.find((item) => matches([item.id], row.classId)) ||
    classes.find((item) => [row.className, keyClass].some((name) => matches([item.name, item.code, ...(item.aliases || [])], name)));
  const section = SECTION_OPTIONS.find((item) => matches([item.id], row.sectionId)) ||
    SECTION_OPTIONS.find((item) => sectionKey(item.name) === sectionKey(row.sectionName || keySection || row.sectionId));
  return {
    classId: grade?.id || row.classId || '',
    className: grade?.name || (keySection ? keyClass : row.className || keyClass) || 'Class',
    sectionId: section?.id || row.sectionId || '',
    sectionName: section?.name || row.sectionName || keySection || '',
  };
}

export function classesWithAvailableSections(classes, timetables, rooms = []) {
  const savedSections = new Map();
  for (const timetable of timetables) {
    const { classId, sectionId } = timetableClass(timetable, classes);
    if (!classId || !sectionId) continue;
    if (!savedSections.has(classId)) savedSections.set(classId, new Set());
    savedSections.get(classId).add(sectionId);
  }
  return classes.map((grade) => {
    const configured = rooms.filter((room) => room.classId === grade.id && room.status !== 'archived')
      .map((room) => ({ id: room.sectionId, name: room.sectionName }));
    const sections = configured.length ? configured : SECTION_OPTIONS;
    return {
      ...grade,
      hasSavedSections: Boolean(savedSections.get(grade.id)?.size),
      sections: sections.filter(({ id }) => !savedSections.get(grade.id)?.has(id)),
    };
  }).filter((grade) => grade.sections.length > 0);
}

export const classLabel = ({ className, sectionName }) =>
  sectionName ? className + ' - ' + sectionName : className;

export function timetableDays(schedule) {
  if (!schedule) return [];
  const days = schedule.days?.length ? DAYS_OF_WEEK.filter((day) => schedule.days.includes(day.id)) : WEEKDAYS;
  return days.map((day) => {
    const custom = schedule.daySchedules?.[day.id];
    const config = custom?.enabled !== false && custom?.periods?.length ? custom : schedule;
    let teachingNumber = 0;
    const slots = (config.periods || []).map((period, index) => {
      const type = period.type || 'class';
      const number = type === 'class' ? ++teachingNumber : null;
      const label = number ? 'Period ' + number
        : period.customLabel || period.name || periodTypes.find((item) => item.value === type)?.label || getSlotTypeMeta(type).label;
      return { ...period, type, number, label, key: day.id + '_' + index, order: index + 1 };
    });
    return { ...day, slots, start: config.schoolStartTime, end: config.schoolEndTime, halfDay: Boolean(config.isHalfDay) };
  });
}

export const emptyAllocation = { subject: '', teacherId: '', teacherName: '', roomNo: '', bookName: '', subjectCode: '' };

export function readAllocations(timetable) {
  return Object.fromEntries((timetable?.allocations || []).map((slot) => [
    slot.day + '_' + (slot.periodOrder - 1),
    {
      subject: slot.subject || '', teacherId: slot.teacherId || '', teacherName: slot.teacherName || '',
      roomNo: slot.roomNo || '', bookName: slot.bookName || '', subjectCode: slot.subjectCode || '',
    },
  ]));
}

export function timetableAllocations(days, assignments) {
  return days.flatMap((day) => day.slots.map((slot) => ({
    day: day.id,
    periodOrder: slot.order,
    periodId: slot._id || slot.id || 'p-' + day.id + '-' + slot.order,
    periodType: slot.type,
    customLabel: slot.customLabel || slot.name || '',
    startTime: slot.startTime || '',
    endTime: slot.endTime || '',
    ...(assignments[slot.key] || emptyAllocation),
  })));
}

export const hasAssignment = (assignment) =>
  Boolean(assignment && (assignment.subject?.trim() || assignment.teacherId || assignment.teacherName || assignment.roomNo?.trim()));

export function copyTeachingPeriods(days, source, assignments) {
  const byNumber = new Map(source.slots
    .filter((slot) => slot.number && hasAssignment(assignments[slot.key]))
    .map((slot) => [slot.number, assignments[slot.key]]));
  return Object.fromEntries(days.filter((day) => day.id !== source.id)
    .flatMap((day) => day.slots.filter((slot) => byNumber.has(slot.number))
      .map((slot) => [slot.key, byNumber.get(slot.number)])));
}

export function timetableProgress(days, assignments) {
  const teaching = days.flatMap((day) => day.slots.filter((slot) => slot.number));
  return { total: teaching.length, assigned: teaching.filter((slot) => assignments[slot.key]?.subject?.trim()).length };
}

export function downloadTimetable(name, days, assignments) {
  const count = Math.max(0, ...days.map((day) => day.slots.length));
  const rows = [['Timetable for ' + name], [], ['Period Slot', ...days.map((day) => day.label)]];
  for (let index = 0; index < count; index += 1) {
    rows.push(['Slot #' + (index + 1), ...days.map((day) => {
      const slot = day.slots[index];
      if (!slot) return '[ Day Ended / Dismissed ]';
      const time = slot.startTime + '-' + slot.endTime;
      if (!slot.number) return '[ ' + slot.label + ' (' + time + ') ]';
      const assignment = assignments[slot.key];
      if (!assignment?.subject) return 'Free Period (' + time + ')';
      const book = assignment.bookName ? ' [Book: ' + assignment.bookName + ']' : '';
      return assignment.subject + book + ' (' + (assignment.teacherName || 'No Teacher') + ')';
    })]);
  }
  const cell = (value) => {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const csv = rows.map((row) => row.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name.replace(/\s+/g, '_') + '_Timetable.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
