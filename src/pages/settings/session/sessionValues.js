import { formatDate } from '../../../utils/formatters.js';
import { dateInput, recordId } from '../../../utils/procurement.js';

export const SESSION_STATUS = {
  current: 'Current',
  upcoming: 'Upcoming',
  previous: 'Previous',
};

export function sessionStatus(session, activeSession) {
  if (session.isCurrent) return 'current';
  if (session.status) return session.status === 'upcoming' ? 'upcoming' : 'previous';
  return activeSession && session.endDate && dateInput(session.endDate) < dateInput(activeSession.startDate)
    ? 'previous'
    : 'upcoming';
}

export const formatSessionDate = (value) => formatDate(value, {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export const formatSessionRange = ({ startDate, endDate }) =>
  formatSessionDate(startDate) + ' – ' + formatSessionDate(endDate);

export const sessionPath = (id) => '/sessions/' + encodeURIComponent(id);

const utcDate = (day) => new Date(dateInput(day) + 'T00:00:00Z');
const toDay = (date) => Number.isFinite(date.getTime()) ? dateInput(date.toISOString()) : '';

export function addSessionDays(day, days) {
  const date = utcDate(day);
  date.setUTCDate(date.getUTCDate() + days);
  return toDay(date);
}

export function defaultSessionEnd(startDate) {
  const date = utcDate(startDate);
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return addSessionDays(toDay(date), -1);
}

function defaultSessionName(startDate, sessions) {
  if (!startDate) return '';
  const year = Number(startDate.slice(0, 4));
  const base = year + '-' + (year + 1);
  const names = new Set(sessions.map((session) => session.sessionName?.trim().toLowerCase()));
  let name = base;
  for (let number = 2; names.has(name.toLowerCase()); number += 1) name = base + ' (' + number + ')';
  return name;
}

function shiftedEnd(session, startDate) {
  const days = (utcDate(session.endDate) - utcDate(session.startDate)) / 86_400_000;
  return addSessionDays(startDate, days);
}

function sessionsInDateOrder(sessions) {
  return [...sessions].sort((left, right) =>
    dateInput(left.startDate).localeCompare(dateInput(right.startDate)) || recordId(left).localeCompare(recordId(right))
  );
}

export function sessionNeighbors(sessions, session) {
  const ordered = sessionsInDateOrder(sessions);
  const index = session ? ordered.findIndex((item) => recordId(item) === recordId(session)) : ordered.length;
  return { previous: ordered[index - 1], following: ordered.slice(index + 1) };
}

export function sessionDraft(session, previous, sessions, initialStart = '') {
  const startDate = previous ? addSessionDays(previous.endDate, 1) : dateInput(session?.startDate) || initialStart;
  return {
    sessionName: session?.sessionName || defaultSessionName(startDate, sessions),
    startDate,
    endDate: session ? shiftedEnd(session, startDate) : defaultSessionEnd(startDate),
    notes: session?.notes || '',
  };
}

export function upcomingDateChanges(sessions, endDate, activeSession) {
  if (!endDate) return [];
  const changes = [];
  for (const session of sessions) {
    if (sessionStatus(session, activeSession) !== 'upcoming') break;
    const startDate = addSessionDays(endDate, 1);
    endDate = shiftedEnd(session, startDate);
    if (startDate !== dateInput(session.startDate) && endDate > startDate) changes.push({ ...session, startDate, endDate });
  }
  return changes;
}

export function scheduleBreak(sessions, activeSession) {
  const ordered = sessionsInDateOrder(sessions);
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const session = ordered[index];
    const expectedStart = addSessionDays(previous.endDate, 1);
    if (expectedStart && sessionStatus(session, activeSession) !== 'previous' && dateInput(session.startDate) !== expectedStart) {
      return { previous, session, expectedStart };
    }
  }
  return null;
}

export function nextSessionFor(active, sessions) {
  if (!active) return null;
  const [next] = sessionNeighbors(sessions, active).following;
  return next && sessionStatus(next, active) === 'upcoming'
    && dateInput(next.startDate) === addSessionDays(active.endDate, 1)
    && (!next.previousSessionId || next.previousSessionId === recordId(active)) ? next : null;
}
