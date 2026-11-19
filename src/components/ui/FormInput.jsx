import { forwardRef } from 'react';
import { Input } from './FormControls.jsx';

/** Labeled input API kept for existing form consumers. */
const FormInput = forwardRef(function FormInput({ id, name, autoComplete = 'off', ...props }, ref) {
  return <Input {...props} id={id || name} name={name} autoComplete={autoComplete} frame readOnlyDisplay wrapperRef={ref} />;
});

export default FormInput;
