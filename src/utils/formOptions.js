export function getOptionValue(option) {
  if (option && typeof option === 'object') {
    return option.value ?? option.id ?? option._id ?? option.name;
  }
  return option;
}

export const optionKey = (option) => {
  const value = getOptionValue(option);
  return value == null ? null : String(value);
};

export function normalizeOptions(options = [], currentValues = []) {
  const normalized = new Map();
  for (const option of [...(options ?? []), ...(currentValues ?? [])]) {
    const key = optionKey(option);
    if (key == null || normalized.has(key)) continue;
    const value = getOptionValue(option);
    normalized.set(key, {
      key,
      value,
      label: option?.label ?? option?.name ?? key,
      disabled: Boolean(option?.disabled),
    });
  }
  return [...normalized.values()];
}

export function optionsFromValues(values, labelFor = (value) => value) {
  return values.map((value) => ({ value, label: labelFor(value) }));
}

export const optionsFromRecord = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export const readOptionLabel = (options, value) => {
  const key = optionKey(value);
  return options.find((option) => option.key === key)?.label ?? key;
};

export const splitSelections = (value) => Array.isArray(value)
  ? value
  : String(value ?? '').split(',').map((part) => part.trim()).filter(Boolean);
