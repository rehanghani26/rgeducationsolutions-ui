const PermissionMatrix = ({ permissions = [], options = [], readOnly = false, onChange }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {options.map(([value, label]) => (
      <label
        key={value}
        className={`flex items-center gap-2 text-[11px] font-semibold p-2.5 rounded-lg border ${
          permissions.includes(value)
            ? 'border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
            : 'border-slate-100 dark:border-slate-800 text-slate-500'
        }`}
      >
        <input
          type="checkbox"
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
