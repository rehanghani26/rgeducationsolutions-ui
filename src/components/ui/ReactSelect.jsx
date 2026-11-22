import { forwardRef, useId, useLayoutEffect, useState } from 'react';
import Select, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import './reactSelect.css';

function SelectContainer({ innerProps, selectProps, ...props }) {
  return <components.SelectContainer {...props} selectProps={selectProps} innerProps={{
    ...innerProps,
    title: selectProps.title,
    'aria-invalid': selectProps['aria-invalid'],
    'data-disabled': selectProps.isDisabled || undefined,
  }} />;
}

function SearchInput({ selectProps, ...props }) {
  const description = [props['aria-describedby'], selectProps['aria-describedby']].filter(Boolean).join(' ');
  return <components.Input {...props} selectProps={selectProps} aria-describedby={description || undefined} />;
}

const selectComponents = { SelectContainer, Input: SearchInput };
const selectStyles = {
  control: (base) => ({ ...base, minHeight: 22 }),
  menuPortal: (base) => ({ ...base, zIndex: 1100 }),
};
const optionValue = (option) => String(option.value ?? '');
const optionDisabled = (option) => Boolean(option.disabled || option.isDisabled);
const selectTheme = (theme) => ({ ...theme, spacing: { ...theme.spacing, menuGutter: 5 } });

const ReactSelect = forwardRef(function ReactSelect({
  id, className = 'form-control form-control--default', creatable = false, isMulti = false,
  isDisabled = false, menuPlacement = 'auto', ...props
}, ref) {
  const uniqueId = useId();
  const inputId = id || uniqueId;
  const [portalTarget, setPortalTarget] = useState(null);

  useLayoutEffect(() => {
    // Native dialogs are in the top layer. Their menus need to stay inside it.
    const input = document.getElementById(inputId);
    setPortalTarget(input?.closest('dialog') || document.body);
  }, [inputId]);

  const Dropdown = creatable ? CreatableSelect : Select;
  return <Dropdown
    {...props}
    ref={ref}
    inputId={inputId}
    instanceId={inputId}
    className={'rges-select ' + className}
    classNamePrefix="rges-select"
    unstyled
    components={selectComponents}
    styles={selectStyles}
    theme={selectTheme}
    getOptionValue={optionValue}
    isOptionDisabled={optionDisabled}
    isDisabled={isDisabled}
    isMulti={isMulti}
    closeMenuOnSelect={!isMulti}
    menuPortalTarget={portalTarget}
    menuPosition="fixed"
    menuPlacement={menuPlacement}
  />;
});

export default ReactSelect;
