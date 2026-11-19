import { forwardRef } from 'react';
import { TextareaInput } from './FormControls.jsx';

/** Labeled textarea API kept for existing form consumers. */
const FormTextarea = forwardRef(function FormTextarea({ id, name, rows = 4, ...props }, ref) {
  return <TextareaInput {...props} id={id || name} name={name} rows={rows} frame readOnlyDisplay wrapperRef={ref} />;
});

export default FormTextarea;
