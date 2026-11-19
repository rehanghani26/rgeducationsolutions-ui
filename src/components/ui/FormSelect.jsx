import { forwardRef } from 'react';
import { SelectInput } from './FormControls.jsx';

/** Labeled select API kept for existing form consumers. */
const FormSelect = forwardRef(function FormSelect({ id, name, options = [], ...props }, ref) {
  return <SelectInput {...props} id={id || name} name={name} options={options} placeholderDisabled frame wrapperRef={ref} />;
});

export default FormSelect;
