import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { normalizeOptions, optionKey } from '../../utils/formOptions.js';
import { CheckboxInput, FieldLabel, FieldMessage, Input } from './FormControls.jsx';

const noSelections = [];

const MultiSelect = forwardRef(function MultiSelect({
  id, name, label, title, placeholder = 'Choose options', options = [], value = noSelections,
  onChange, onSelectClick, errorMessage, helpText, required, disabled, readOnly,
  className = '', labelClassName, icon, dropdownOnTop = false,
}, ref) {
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef(null);
  const uid = useId();
  const fieldId = id || uid;
  const popupId = uid + '-choices';
  const hintId = helpText ? uid + '-hint' : undefined;
  const errorId = errorMessage ? uid + '-error' : undefined;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  useImperativeHandle(ref, () => trigger.current);

  const currentValues = Array.isArray(value) ? value : value == null ? [] : [value];
  const selections = normalizeOptions([], currentValues);
  const choices = normalizeOptions(options, currentValues);
  const selectionKeys = new Set(selections.map((entry) => entry.key));
  const selected = choices.filter((entry) => selectionKeys.has(entry.key));
  const term = query.trim().toLowerCase();
  const matches = choices.filter((entry) =>
    (typeof entry.label === 'string' ? entry.label : entry.key).toLowerCase().includes(term));
  const showChoices = open && !disabled && !readOnly;

  useEffect(() => {
    if (!showChoices) return undefined;
    search.current?.focus();
    function closeOutside(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [showChoices]);

  function change(entry, checked) {
    const next = checked
      ? [...selections.map((item) => item.value), entry.value]
      : selections.filter((item) => item.key !== entry.key).map((item) => item.value);
    if (onChange) onChange(next);
    else if (onSelectClick) onSelectClick(next);
  }

  const selectedNames = selected.map((entry) => typeof entry.label === 'string' ? entry.label : entry.key);
  const names = selectedNames.join(', ');
  const caption = readOnly ? names || 'Not specified' : selected.length ? selected.length + ' selected' : placeholder;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return <div className={'form-field form-multi ' + className} ref={root} onBlur={(event) => {
    if (showChoices && event.relatedTarget && !root.current?.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={(event) => {
    if (event.key !== 'Escape' || !showChoices) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    trigger.current?.focus();
  }}>
    <FieldLabel htmlFor={fieldId} required={required} className={labelClassName} icon={icon}>{label}</FieldLabel>
    {readOnly ? <output id={fieldId} className="form-control form-control--default form-readonly" aria-describedby={describedBy}>{caption}</output> :
      <button id={fieldId} ref={trigger} className="form-control form-control--default form-multi__trigger" type="button" title={title || names || caption}
        disabled={disabled} aria-label={label ? undefined : placeholder}
        aria-controls={showChoices ? popupId : undefined} aria-expanded={showChoices}
        aria-describedby={describedBy} aria-invalid={errorMessage ? true : undefined}
        onClick={() => { setQuery(''); setOpen(!open); }}>
        <span>{caption}</span><ChevronDown size={15} aria-hidden="true" />
      </button>}
    {!readOnly && selected.length > 0 && <ul aria-label="Selected options" className="form-multi__chips">
      {selected.map((entry) => <li key={entry.key}>
        <span>{entry.label}</span>
        {!disabled && <button type="button" aria-label={'Remove ' + (typeof entry.label === 'string' ? entry.label : entry.key)}
          onClick={() => change(entry, false)}><X size={12} aria-hidden="true" /></button>}
      </li>)}
    </ul>}
    <FieldMessage id={hintId}>{helpText}</FieldMessage>
    <FieldMessage id={errorId} error={errorMessage} />
    {name && !disabled && selected.map((entry) => <Input key={entry.key} type="hidden" name={name} value={optionKey(entry.value)} />)}
    {showChoices && <div id={popupId} className={'form-multi__popup' + (dropdownOnTop ? ' form-multi__popup--top' : '')}>
      <Input type="search" ref={search} frame icon={<Search size={14} />} aria-label="Search options" placeholder="Search options"
        value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }} />
      <div className="form-multi__choices" role="group" aria-label="Options">
        {matches.length ? matches.map((entry) =>
          <CheckboxInput key={entry.key} label={entry.label} checked={selectionKeys.has(entry.key)} disabled={entry.disabled}
            onChange={(event) => change(entry, event.target.checked)} />
        ) : <p role="status" className="form-hint">No matching options</p>}
      </div>
    </div>}
  </div>;
});

export default MultiSelect;
