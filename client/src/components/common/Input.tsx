import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { getFieldClasses } from '../../lib/formStyles';
import FormField from './FormField';

interface InputProps extends ComponentPropsWithRef<'input'> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField id={inputId} label={label} error={error}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={getFieldClasses(Boolean(error))}
        {...rest}
      />
    </FormField>
  );
}
