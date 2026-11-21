import { DAYS_OF_WEEK, WORKING_DAYS } from '../../../constants/dateTime.js';
import { clientKey, recordId } from '../../../utils/procurement.js';
import {
  calcSlotDuration, minutesToTime, timeToMinutes, TIMETABLE_TEMPLATES,
} from '../../timetable/timetableUtils.js';

export const scheduleTypes = [
  { value: 'regular', label: 'Regular' },
  { value: 'exam', label: 'Exam' },
];

export const periodTypes = [
  { value: 'class', label: 'Class period' },
  { value: 'prayer', label: 'Assembly / prayer' },
  { value: 'recess', label: 'Recess' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'pt', label: 'Sports' },
  { value: 'activities', label: 'Activity' },
  { value: 'dance', label: 'Dance' },
  { value: 'singing', label: 'Music' },
  { value: 'leave', label: 'Departure' },
  { value: 'custom', label: 'Custom' },
];

const fixedDuration = { prayer: 15, recess: 15, lunch: 30, leave: 10 };
const typeAliases = { teaching: 'class', assembly: 'prayer', activity: 'activities', sports: 'pt', break: 'recess' };
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const weekdayIds = WORKING_DAYS.map((day) => day.id);

export const periodLabel = (type) => periodTypes.find((option) => option.value === type)?.label || type || 'Period';
export const typeLabel = (type) => scheduleTypes.find((option) => option.value === type)?.label || 'Regular';
export const validTime = (value) => timePattern.test(value);

export function timeLabel(time) {
  if (!validTime(time)) return '—';
  const [hour, mins] = time.split(':');
  return (Number(hour) % 12 || 12) + ':' + mins + (Number(hour) >= 12 ? ' PM' : ' AM');
}

export const timeRange = (start, end) => timeLabel(start) + ' – ' + timeLabel(end);

function asEditablePeriods(periods, duplicate = false) {
  return periods.map(({ _id, ...slot }) => ({
    ...slot,
    ...(!duplicate && _id && { _id }),
    key: clientKey(),
    type: typeAliases[slot.type] || slot.type || 'class',
    customLabel: slot.customLabel || slot.name || '',
  }));
}

export function fitPeriods(periods, startTime, endTime) {
  if (!validTime(startTime) || !validTime(endTime) || endTime <= startTime) {
    throw new Error('Choose a start time and a later end time.');
  }
  const durations = periods.map((period) => calcSlotDuration(period.startTime, period.endTime) || fixedDuration[period.type] || 40);
  const flexible = periods.map((period) => !Object.hasOwn(fixedDuration, period.type));
  const flexibleCount = flexible.filter(Boolean).length;
  const fixedMinutes = durations.reduce((sum, duration, index) => sum + (flexible[index] ? 0 : duration), 0);
  const weight = durations.reduce((sum, duration, index) => sum + (flexible[index] ? duration : 0), 0);
  const remaining = calcSlotDuration(startTime, endTime) - fixedMinutes - flexibleCount;
  if (remaining < 0) throw new Error('These hours are too short for the fixed breaks and the periods. Extend the day or shorten a break.');

  let cursor = timeToMinutes(startTime);
  let usedWeight = 0;
  return periods.map((period, index) => {
    let duration = durations[index];
    if (flexible[index]) {
      const before = Math.round(remaining * usedWeight / weight);
      usedWeight += duration;
      duration = 1 + Math.round(remaining * usedWeight / weight) - before;
    }
    const start = minutesToTime(cursor);
    cursor += duration;
    return { ...period, startTime: start, endTime: minutesToTime(cursor) };
  });
}

export const masterPeriodTemplates = TIMETABLE_TEMPLATES.map((template) => ({
  ...template,
  schoolStartTime: template.id === 'tpl-regular-day' ? '07:30' : template.schoolStartTime,
}));

export function templateSchedule(template) {
  const { name, scheduleType, schoolStartTime, schoolEndTime, days, slots } = template;
  const periods = fitPeriods(
    slots.map((slot) => ({ ...slot, type: typeAliases[slot.type] || slot.type })),
    schoolStartTime, schoolEndTime,
  );
  return { name, scheduleType, schoolStartTime, schoolEndTime, days, periods };
}

export function scheduleDraft(saved, duplicate = false) {
  const dayStart = saved?.schoolStartTime || '08:00';
  const dayEnd = saved?.schoolEndTime || '14:30';
  const days = saved?.days?.length ? saved.days : weekdayIds;
  return {
    _id: !duplicate ? recordId(saved) : '',
    name: saved ? saved.name + (duplicate ? ' copy' : '') : '',
    scheduleType: saved?.scheduleType || 'regular',
    isDefault: false,
    days: [...days],
    daySchedules: Object.fromEntries(DAYS_OF_WEEK.map(({ id, label }) => {
      const source = saved?.daySchedules?.[id];
      return [id, {
        day: id, dayLabel: label,
        name: source?.name || label + ' Schedule',
        schoolStartTime: source?.schoolStartTime || dayStart,
        schoolEndTime: source?.schoolEndTime || dayEnd,
        isHalfDay: Boolean(source?.isHalfDay),
        periods: asEditablePeriods(source?.periods ?? saved?.periods ?? [], duplicate),
      }];
    })),
  };
}

export function copyDay(source, target) {
  return {
    ...target,
    schoolStartTime: source.schoolStartTime,
    schoolEndTime: source.schoolEndTime,
    isHalfDay: source.isHalfDay,
    periods: asEditablePeriods(source.periods, true),
  };
}

export function newPeriod(day) {
  const periods = [...day.periods];
  const start = periods.at(-1)?.endTime || day.schoolStartTime;
  const classCount = periods.filter((period) => period.type === 'class').length;
  const period = { key: clientKey(), type: 'class', customLabel: 'Period ' + (classCount + 1), startTime: start, endTime: '' };
  const available = calcSlotDuration(start, day.schoolEndTime);
  if (available > 0) {
    return [...periods, { ...period, endTime: minutesToTime(timeToMinutes(start) + Math.min(40, available)) }];
  }
  const departure = periods.findIndex((item) => item.type === 'leave');
  periods.splice(departure < 0 ? periods.length : departure, 0, period);
  return fitPeriods(periods, day.schoolStartTime, day.schoolEndTime);
}

export function schedulePayload(draft) {
  if (!draft.name.trim()) throw new Error('Enter a schedule name.');
  if (!draft.days.length) throw new Error('Choose a working day.');
  const days = DAYS_OF_WEEK.map((day) => day.id).filter((day) => draft.days.includes(day));
  const daySchedules = Object.fromEntries(Object.entries(draft.daySchedules).map(([day, value]) => [day, {
    ...value,
    enabled: days.includes(day),
    periods: value.periods.map(({ key, ...period }) => period),
  }]));
  for (const day of days) {
    const { dayLabel, periods, schoolStartTime, schoolEndTime } = daySchedules[day];
    if (!validTime(schoolStartTime) || !validTime(schoolEndTime) || schoolEndTime <= schoolStartTime) {
      throw new Error(dayLabel + ' needs a start time and a later end time.');
    }
    if (!periods.length) throw new Error('Add a period for ' + dayLabel + '.');
    let previousEnd = schoolStartTime;
    for (const period of periods) {
      if (!validTime(period.startTime) || !validTime(period.endTime) ||
          period.endTime <= period.startTime || period.startTime < previousEnd || period.endTime > schoolEndTime) {
        throw new Error(dayLabel + ' periods must be in order, with no overlaps, within school hours.');
      }
      previousEnd = period.endTime;
    }
  }
  const { schoolStartTime, schoolEndTime, periods } = daySchedules[days[0]];
  return {
    _id: draft._id,
    name: draft.name.trim(),
    scheduleType: draft.scheduleType,
    isDefault: draft.isDefault,
    days, daySchedules, schoolStartTime, schoolEndTime, periods,
  };
}
