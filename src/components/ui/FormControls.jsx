import { Children, forwardRef, isValidElement, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { normalizeOptions, readOptionLabel } from '../../utils/formOptions.js';
import './formControls.css';

// Bare controls keep native form props and refs. Labels, help, and errors add a field wrapper.
const classes = (...values) => values.filter(Boolean).join(' ');

export function FieldLabel({ htmlFor, children, required, className, icon }) {
  if (!children) return null;
  return <label htmlFor={htmlFor} className={classes('form-label', className)}>
    {icon && <span aria-hidden="true">{icon}</span>}
    {children}
    {required && <span className="form-required" aria-hidden="true">*</span>}
  </label>;
}

export function FieldMessage({ id, error, children, className }) {
  const content = error?.message ?? error ?? children;
  if (!content) return null;
  return <p id={id} className={classes(error ? 'form-error' : 'form-hint', className)} role={error ? 'alert' : undefined}>
    {content}
  </p>;
}

function useField({
  id, label, labelClassName, errorMessage, errorClassName, helpText, hint, className, border,
  icon, iconRight, extraLabel, inAbsoluteArea, wrapperRef, showLabel = true, frame = false,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...native
}, { controlClassName = '', counter, ordinary = true } = {}) {
  const generatedId = useId();
  const description = hint || helpText;
  const framed = Boolean(frame || label && showLabel || description || errorMessage || icon || iconRight || extraLabel || inAbsoluteArea || counter != null || wrapperRef);
  const controlId = id || (framed ? generatedId : undefined);
  const hintId = description ? controlId + '-hint' : undefined;
  const errorId = errorMessage ? controlId + '-error' : undefined;
  const counterId = counter != null && !errorMessage ? controlId + '-count' : undefined;
  const controlClasses = framed ? controlClassName : classes(className, controlClassName);
  return {
    native: {
      ...native,
      id: controlId,
      className: classes(ordinary && 'form-control', ordinary && !border && !controlClasses && 'form-control--default', border, controlClasses),
      'aria-label': native['aria-label'] ?? (!showLabel && typeof label === 'string' ? label : undefined),
      'aria-invalid': errorMessage ? true : invalid,
      'aria-describedby': classes(describedBy, hintId, errorId, counterId) || undefined,
    },
    frame: framed ? {
      id: controlId, label: showLabel ? label : undefined, labelClassName, required: native.required,
      description, hintId, errorMessage, errorId, errorClassName, counter, counterId,
      className, wrapperRef, icon, iconRight, extraLabel, inAbsoluteArea,
    } : null,
  };
}

function ControlFrame({ frame, children }) {
  if (!frame) return children;
  const { label, id, required, labelClassName, extraLabel, icon, iconRight, inAbsoluteArea } = frame;
  return <div className={classes('form-field', frame.className)} ref={frame.wrapperRef}>
    {(label || extraLabel) && <div className="form-field__heading">
      <FieldLabel htmlFor={id} required={required} className={labelClassName}>{label}</FieldLabel>
      {extraLabel}
    </div>}
    {icon || iconRight || inAbsoluteArea ? <div className={classes('form-field__control', icon && 'form-field__control--start', iconRight && 'form-field__control--end')}>
      {icon && <span className="form-field__icon form-field__icon--start" aria-hidden="true">{icon}</span>}
      {children}
      {iconRight && <span className="form-field__icon form-field__icon--end">{iconRight}</span>}
      {inAbsoluteArea}
    </div> : children}
    <FieldMessage id={frame.hintId}>{frame.description}</FieldMessage>
    <FieldMessage id={frame.errorId} error={frame.errorMessage} className={frame.errorClassName} />
    {frame.counterId && <FieldMessage id={frame.counterId}>
      {frame.counter} {frame.counter === 1 ? 'character' : 'characters'} left
    </FieldMessage>}
  </div>;
}

function ReadOnlyValue({ attributes, value, children, refValue }) {
  const submitted = Array.isArray(value) ? value : [value];
  const { id, className, title, name, disabled } = attributes;
  return <>
    <output id={id} ref={refValue} title={title} className={classes(className, 'form-readonly')}
      aria-describedby={attributes['aria-describedby']} aria-label={attributes['aria-label']}
      aria-labelledby={attributes['aria-labelledby']} aria-invalid={attributes['aria-invalid']}>
      {children}
    </output>
    {name && !disabled && submitted.map((entry, index) => <input key={index} type="hidden" name={name} value={entry ?? ''} />)}
  </>;
}

function charactersRemaining(limit, text) {
  return limit == null ? undefined : Math.max(0, limit - String(text ?? '').length);
}

const unstyledInputTypes = new Set(['hidden', 'checkbox', 'radio', 'range', 'color', 'image', 'button', 'reset', 'submit']);

export const Input = forwardRef(function Input({
  type = 'text', value, defaultValue, readOnly, inputClassName, placeholderClassName, limit,
  readOnlyDisplay = false, onlyFloorValue = false, maxLength, ...props
}, ref) {
  const maxCharacters = maxLength ?? limit;
  const { native, frame } = useField(props, {
    controlClassName: classes(inputClassName, placeholderClassName),
    ordinary: !unstyledInputTypes.has(type),
    counter: readOnly ? undefined : charactersRemaining(limit, value ?? defaultValue),
  });
  const fieldValue = value === null ? '' : value;
  if (readOnly && readOnlyDisplay) {
    const text = fieldValue ?? defaultValue;
    return <ControlFrame frame={frame}>
      <ReadOnlyValue attributes={native} value={text} refValue={ref}>{text == null || text === '' ? 'Not specified' : text}</ReadOnlyValue>
    </ControlFrame>;
  }
  return <ControlFrame frame={frame}>
    <input {...native} ref={ref} type={type} readOnly={readOnly}
      value={type === 'file' ? undefined : fieldValue} defaultValue={type === 'file' ? undefined : defaultValue}
      maxLength={maxCharacters} step={native.step ?? (type === 'number' && onlyFloorValue ? 1 : undefined)} />
  </ControlFrame>;
});

function optionChildren(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === 'option') {
      const value = child.props.value ?? child.props.children;
      return [{ value, label: child.props.children, disabled: child.props.disabled }];
    }
    return optionChildren(child.props.children);
  });
}

export const SelectInput = forwardRef(function SelectInput({
  value, defaultValue, options, children, selectClassName, placeholder, showPlaceholder,
  placeholderDisabled = false, emptyMessage = 'No options available', preserveValue = false,
  multiple = false, readOnly = false, ...props
}, ref) {
  const { native, frame } = useField(props, { controlClassName: selectClassName });
  const current = value === undefined ? defaultValue : value;
  const selected = multiple && Array.isArray(current) ? current : [current];
  const supplied = options !== undefined;
  const normalized = supplied || readOnly
    ? normalizeOptions(options ?? optionChildren(children), preserveValue ? selected.filter((entry) => entry !== '') : [])
    : [];
  const placeholderVisible = !multiple && (showPlaceholder ?? supplied) && !normalized.some((option) => option.key === '');
  const defaultPlaceholder = typeof props.label === 'string' && props.label ? 'Select ' + props.label.toLowerCase() : 'Select an option';

  if (readOnly) {
    const text = selected.filter((entry) => entry != null && entry !== '').map((entry) => readOptionLabel(normalized, entry));
    return <ControlFrame frame={frame}>
      <ReadOnlyValue attributes={native} value={current} refValue={ref}>
        {text.length ? text.join(', ') : 'Not specified'}
      </ReadOnlyValue>
    </ControlFrame>;
  }

  const domValue = (entry) => typeof entry === 'boolean' ? String(entry) : entry;
  const selectValue = (entry) => Array.isArray(entry) ? entry.map(domValue) : domValue(entry);
  return <ControlFrame frame={frame}>
    <select {...native} ref={ref} value={value === null ? (multiple ? [] : '') : selectValue(value)}
      defaultValue={selectValue(defaultValue)} multiple={multiple}>
      {placeholderVisible && <option value="" disabled={placeholderDisabled}>{placeholder || defaultPlaceholder}</option>}
      {supplied ? normalized.map((option) =>
        <option value={domValue(option.value)} key={option.key} disabled={option.disabled}>{option.label}</option>
      ) : children}
      {supplied && !normalized.length && emptyMessage && <option disabled value="">{emptyMessage}</option>}
    </select>
  </ControlFrame>;
});

export const TextareaInput = forwardRef(function TextareaInput({
  value, defaultValue, readOnly, readOnlyDisplay = false, limit, maxLength, textareaClassName, ...props
}, ref) {
  const { native, frame } = useField(props, {
    controlClassName: textareaClassName,
    counter: readOnly ? undefined : charactersRemaining(limit, value ?? defaultValue),
  });
  if (readOnly && readOnlyDisplay) {
    const text = value ?? defaultValue;
    return <ControlFrame frame={frame}>
      <ReadOnlyValue attributes={native} value={text} refValue={ref}>{text == null || text === '' ? 'Not specified' : text}</ReadOnlyValue>
    </ControlFrame>;
  }
  return <ControlFrame frame={frame}>
    <textarea {...native} ref={ref} value={value === null ? '' : value} defaultValue={defaultValue}
      readOnly={readOnly} maxLength={maxLength ?? limit} />
  </ControlFrame>;
});

export const CheckboxInput = forwardRef(function CheckboxInput({
  label, description, className, inputClassName, indeterminate, disabled, type: _type, ...props
}, ref) {
  const input = useRef(null);
  useImperativeHandle(ref, () => input.current);
  useEffect(() => {
    if (input.current && indeterminate !== undefined) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const framed = Boolean(label || description);
  const checkbox = <input {...props} ref={input} type="checkbox" disabled={disabled}
    aria-checked={indeterminate ? 'mixed' : props['aria-checked']}
    className={classes('form-checkbox', framed ? inputClassName : classes(className, inputClassName))} />;
  if (!framed) return checkbox;
  return <label className={classes('form-choice', className)}>
    {checkbox}
    <span className="form-choice__copy">
      {label && <strong>{label}</strong>}
      {description && <small>{description}</small>}
    </span>
  </label>;
});

export const SwitchInput = forwardRef(function SwitchInput({
  label, description, className, leading = false, size = 'md', color, disabled, ...props
}, ref) {
  const checked = props.checked;
  const Wrapper = label || description ? 'label' : 'span';
  return <Wrapper data-size={size} data-color={color}
    className={classes('form-switch', leading && 'form-switch--leading', disabled && 'form-switch--disabled', className)}>
    {(label || description) && <span className="form-choice__copy">
      {label && <strong>{label}</strong>}
      {description && <small>{description}</small>}
    </span>}
    <span className="form-switch__control">
      <CheckboxInput {...props} ref={ref} role="switch" aria-checked={checked} disabled={disabled} className="form-switch__input" />
      <span className="form-switch__track" aria-hidden="true" />
    </span>
  </Wrapper>;
});
