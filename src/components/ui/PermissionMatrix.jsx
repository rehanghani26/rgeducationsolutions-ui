import { CheckboxInput } from './FormControls.jsx';
const PermissionMatrix = ({ permissions = [], options = [], readOnly = false, onChange }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {options.map(([value, label]) => (
      <label
        key={value}
        className={`flex items-center gap-2 text-[11px] font-semibold p-2.5 rounded-md border ${
          permissions.includes(value)
            ? 'border-[var(--border-color)] bg-[var(--proc-accent-bg)] text-[var(--proc-accent)]'
            : 'border-[var(--border-color)] bg-[var(--surface-2)] text-[var(--text-secondary)]'
        }`}
      >
        <CheckboxInput
          checked={permissions.includes(value)}
          disabled={readOnly}
          onChange={() => !readOnly && onChange?.(value)}
          className="rounded"
        />
        {label}
      </label>
    ))}
  </div>
);

export default PermissionMatrix;
