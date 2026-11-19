import { forwardRef } from 'react';
import { SwitchInput } from './FormControls.jsx';

/** Boolean callback adapter for the existing Toggle API. */
const Toggle = forwardRef(function Toggle({ checked = false, onChange, onClick, onKeyDown, ...props }, ref) {
  return <SwitchInput {...props} ref={ref} leading checked={checked}
    onChange={(event) => onChange?.(event.target.checked)}
    onClick={(event) => { event.stopPropagation(); onClick?.(event); }}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.key === 'Enter' && !event.defaultPrevented) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.click();
      }
    }} />;
});

export default Toggle;
