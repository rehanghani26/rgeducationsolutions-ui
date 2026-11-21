import { useEffect, useRef, useState } from 'react';
import { AlignJustify, Copy, Plus, Trash2 } from 'lucide-react';
import { CheckboxInput, Input, SelectInput } from '../../../components/ui/FormControls.jsx';
import { ErrorMessage } from '../../../components/ui/ProcurementUI.jsx';
import { DAYS_OF_WEEK, WORKING_DAYS } from '../../../constants/dateTime.js';
import { saveMasterPeriod } from '../../../services/masterPeriodService.js';
import { calcSlotDuration, formatDurationString, timeToMinutes } from '../../timetable/timetableUtils.js';
import { copyDay, fitPeriods, newPeriod, periodLabel, periodTypes, schedulePayload, scheduleTypes, timeRange } from './masterPeriodValues.js';

export function BellTimeline({ day }) {
  const duration = calcSlotDuration(day.schoolStartTime, day.schoolEndTime);
  if (!duration) return null;
  const start = timeToMinutes(day.schoolStartTime);
  const blocks = day.periods.map((period) => ({
    period,
    start: Math.max(0, timeToMinutes(period.startTime) - start),
    end: Math.min(duration, timeToMinutes(period.endTime) - start),
  }));
  return <div className="bell-timeline">
    <div className="bell-timeline-label">
      <strong>{timeRange(day.schoolStartTime, day.schoolEndTime)}</strong>
      <span>{formatDurationString(duration)}</span>
    </div>
    {blocks.length > 0 && <div className="bell-timeline-track" aria-hidden="true">
      {blocks.map(({ period, start, end }, index) => end > start && (
        <div key={period.key || period._id || index} data-period={period.type}
          title={(period.customLabel || periodLabel(period.type)) + ' · ' + timeRange(period.startTime, period.endTime)}
          style={{ left: start / duration * 100 + '%', width: (end - start) / duration * 100 + '%' }} />
      ))}
    </div>}
  </div>;
}

export default function MasterScheduleEditor({ initial, onSaved, onCancel, setBusy }) {
  const [draft, setDraft] = useState(initial);
  const [dayId, setDayId] = useState(initial.days[0]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const heading = useRef(null);
  const day = draft.daySchedules[dayId];
  const typeIsFixed = Boolean(draft._id);
  const weekdays = WORKING_DAYS.map(({ id }) => id).filter((id) => draft.days.includes(id));

  useEffect(() => { heading.current?.focus(); }, []);

  function updateDay(next, issue = null) {
    setDraft((current) => ({ ...current, daySchedules: { ...current.daySchedules, [dayId]: next } }));
    setError(issue);
  }

  function changeHours(name, value) {
    const next = { ...day, [name]: value };
    try {
      next.periods = fitPeriods(next.periods, next.schoolStartTime, next.schoolEndTime);
      updateDay(next);
    } catch (error) {
      updateDay(next, error);
    }
  }

  function toggleDay(id) {
    const selected = draft.days.includes(id);
    const days = selected ? draft.days.filter((item) => item !== id) : [...draft.days, id];
    if (!days.length) return;
    setDraft((current) => ({ ...current, days }));
    if (selected && id === dayId) setDayId(days[0]);
    if (!selected) setDayId(id);
    setError(null);
  }

  function copyToDays(days) {
    const daySchedules = { ...draft.daySchedules };
    for (const id of days) {
      if (id !== dayId) daySchedules[id] = copyDay(day, daySchedules[id]);
    }
    setDraft((current) => ({ ...current, daySchedules }));
    setError(null);
  }

  function updatePeriod(index, name, value) {
    updateDay({ ...day, periods: day.periods.map((period, item) => item === index ? { ...period, [name]: value } : period) });
  }

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    try {
      const payload = schedulePayload(draft);
      setSaving(true);
      setBusy(true);
      onSaved(await saveMasterPeriod(payload));
    } catch (error) {
      setError(error);
    } finally {
      setSaving(false);
      setBusy(false);
    }
  }

  return <form className="proc-panel proc-pad bell-editor" onSubmit={save}>
    <h2 ref={heading} tabIndex={-1} className="bell-section-title outline-none">{draft._id ? 'Edit Schedule' : 'New Schedule'}</h2>
    <fieldset disabled={saving} className="bell-editor-fields">
      <div className="bell-editor-grid bell-editor-identity">
        <Input required label="Schedule name" name="scheduleName" value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <SelectInput label="Schedule type" name="scheduleType" options={scheduleTypes} value={draft.scheduleType}
          disabled={typeIsFixed} onChange={(event) => setDraft({ ...draft, scheduleType: event.target.value })} />
        {!typeIsFixed && <CheckboxInput className="bell-choice" label="Use as default" checked={draft.isDefault}
          onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })} />}
      </div>
      <div>
        <h3 className="bell-field-title">Working days</h3>
        <div className="bell-tabs" role="group" aria-label="Working days">
          {DAYS_OF_WEEK.map(({ id, label, short }) => <button type="button" key={id}
            aria-label={label} aria-pressed={draft.days.includes(id)}
            disabled={draft.days.length === 1 && draft.days.includes(id)} onClick={() => toggleDay(id)}>{short}</button>)}
        </div>
      </div>
      <div className="bell-day-editor">
        <div className="bell-section-heading">
          <h3 className="bell-field-title">Daily periods</h3>
          <div className="bell-tabs" role="group" aria-label="Select day to edit">
            {DAYS_OF_WEEK.filter(({ id }) => draft.days.includes(id)).map(({ id, label, short }) => (
              <button type="button" key={id} aria-label={'Edit ' + label} aria-pressed={id === dayId}
                onClick={() => { setDayId(id); setError(null); }}>{short}</button>
            ))}
          </div>
        </div>
        <div className="bell-editor-grid">
          <Input type="time" required label={day.dayLabel + ' start time'} name="startTime" value={day.schoolStartTime}
            onChange={(event) => changeHours('schoolStartTime', event.target.value)} />
          <Input type="time" required label={day.dayLabel + ' end time'} name="endTime" value={day.schoolEndTime}
            onChange={(event) => changeHours('schoolEndTime', event.target.value)} />
          <CheckboxInput className="bell-choice" label="Short day" checked={day.isHalfDay}
            onChange={(event) => updateDay({ ...day, isHalfDay: event.target.checked })} />
        </div>
        <p className="proc-hint">Changing the hours resizes teaching periods and keeps assembly, break, lunch, and departure lengths.</p>
        <BellTimeline day={day} />
        {day.periods.length ? <div className="bell-slot-editor" aria-label={day.dayLabel + ' periods'}>
          <div className="bell-slot-row bell-slot-head" aria-hidden="true">
            <span>Type</span><span>Label</span><span>Start</span><span>End</span><span>Length</span><span />
          </div>
          {day.periods.map((period, index) => {
            const options = periodTypes.some((item) => item.value === period.type)
              ? periodTypes : [...periodTypes, { value: period.type, label: periodLabel(period.type) }];
            return <div className="bell-slot-row" key={period.key} data-period={period.type}>
              <SelectInput aria-label={'Period ' + (index + 1) + ' type'} options={options} value={period.type}
                onChange={(event) => updatePeriod(index, 'type', event.target.value)} />
              <Input aria-label={'Period ' + (index + 1) + ' label'} value={period.customLabel}
                placeholder={periodLabel(period.type)} onChange={(event) => updatePeriod(index, 'customLabel', event.target.value)} />
              <div className="bell-slot-clock"><span className="bell-slot-clock-label" aria-hidden="true">Starts</span>
                <Input type="time" aria-label={'Period ' + (index + 1) + ' start'} value={period.startTime}
                  onChange={(event) => updatePeriod(index, 'startTime', event.target.value)} />
              </div>
              <div className="bell-slot-clock"><span className="bell-slot-clock-label" aria-hidden="true">Ends</span>
                <Input type="time" aria-label={'Period ' + (index + 1) + ' end'} value={period.endTime}
                  onChange={(event) => updatePeriod(index, 'endTime', event.target.value)} />
              </div>
              <span className="bell-slot-length">{formatDurationString(calcSlotDuration(period.startTime, period.endTime))}</span>
              <button type="button" className="proc-btn bell-remove-slot" aria-label={'Remove period ' + (index + 1)}
                onClick={() => updateDay({ ...day, periods: day.periods.filter((_, item) => item !== index) })}>
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>;
          })}
        </div> : <p className="proc-hint">Add the first period for {day.dayLabel}.</p>}
        <div className="proc-actions">
          <button type="button" className="proc-btn" onClick={() => {
            try { updateDay({ ...day, periods: newPeriod(day) }); } catch (error) { setError(error); }
          }}><Plus size={16} aria-hidden="true" /> Add Period</button>
          <button type="button" className="proc-btn" disabled={!day.periods.length}
            onClick={() => changeHours('schoolStartTime', day.schoolStartTime)}><AlignJustify size={15} aria-hidden="true" /> Fit Periods</button>
          <button type="button" className="proc-btn" disabled={!day.periods.length || draft.days.length === 1}
            onClick={() => copyToDays(draft.days)}><Copy size={15} aria-hidden="true" /> Copy to Working Days</button>
          {weekdays.length < draft.days.length && weekdays.some((id) => id !== dayId) && (
            <button type="button" className="proc-btn" disabled={!day.periods.length}
              onClick={() => copyToDays(weekdays)}>Copy to Weekdays</button>
          )}
        </div>
      </div>
    </fieldset>
    <ErrorMessage error={error} />
    <div className="proc-form-footer">
      <button type="button" className="proc-btn" disabled={saving} onClick={onCancel}>Cancel</button>
      <button type="submit" className="proc-btn proc-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Schedule'}</button>
    </div>
  </form>;
}
