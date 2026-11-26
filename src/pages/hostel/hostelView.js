export const hostelStatuses = {
  available: ['Available', 'success'],
  outOfService: ['Out of service', 'neutral'],
  legacyHold: ['Needs allocation review', 'warning'],
  assigned: ['Assigned', 'info'],
  left: ['Left hostel', 'neutral'],
  cancelled: ['Cancelled', 'neutral'],
  transferred: ['Transferred', 'neutral'],
  continued: ['Continued', 'neutral'],
  pendingRollover: ['Pending renewal', 'warning'],
  legacy: ['Imported history', 'neutral'],
  unknown: ['Status unavailable', 'neutral'],
};

export function hostelStatusCode(status) {
  if (status === 'reserved' || status === 'checkedIn') return 'assigned';
  if (status === 'checkedOut') return 'left';
  return typeof status === 'string' && Object.hasOwn(hostelStatuses, status) ? status : 'unknown';
}

const hostelDateOptions = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' };
const hostelDay = new Intl.DateTimeFormat('en-CA', hostelDateOptions);
const hostelDate = new Intl.DateTimeFormat('en-IN', { ...hostelDateOptions, month: 'short' });

export const hostelDateValue = (date = new Date()) => hostelDay.format(new Date(date));
export const formatHostelDate = (date) => hostelDate.format(new Date(date));

export const hostelCategories = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'coed', label: 'Co-ed (both)' },
];

export const hostelCategoryName = (category) => hostelCategories.find(({ value }) => value === category)?.label;

export const roomTypes = ['Normal', 'Premium'].map((value) => ({ value, label: value }));

export function bedLabel(label) {
  const value = label?.trim();
  if (!value) return '';
  return /^bed(?=\s|[-#:]|\d|$)/i.test(value) ? 'Bed' + value.slice(3) : 'Bed ' + value;
}

export function bedLocation({ hostelName, block, room, bed }) {
  return [hostelName, block, room && 'Room ' + room, bedLabel(bed)].filter(Boolean).join(' · ');
}
