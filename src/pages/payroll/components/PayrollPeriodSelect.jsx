import { Calendar } from 'lucide-react';
import { SelectInput } from '../../../components/ui/FormControls.jsx';
import { MONTH_NAME_OPTIONS, YEAR_OPTIONS } from '../../../constants/dateTime.js';

const controlClass = 'min-h-8 bg-transparent px-2 py-1 text-xs font-semibold';

export default function PayrollPeriodSelect({ month, year, onMonthChange, onYearChange, years = YEAR_OPTIONS, inline = false }) {
  return <div className={inline
    ? 'inline-flex flex-wrap items-center gap-1'
    : 'inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface-1)] px-2 py-1'}>
    {!inline && <Calendar size={14} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />}
    <SelectInput aria-label="Payroll month" className={controlClass} value={month} options={MONTH_NAME_OPTIONS}
      showPlaceholder={false} preserveValue onChange={(event) => onMonthChange(event.target.value)} />
    <SelectInput aria-label="Payroll year" className={controlClass} value={year} options={years}
      showPlaceholder={false} preserveValue onChange={(event) => onYearChange(Number(event.target.value))} />
  </div>;
}
