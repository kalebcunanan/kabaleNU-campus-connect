import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { getFieldClasses } from '../../lib/formStyles';
import FormField from './FormField';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends ComponentPropsWithRef<'select'> {
  label: string;
  options: SelectOption[];
  placeholder: string;
  error?: string;
}

export default function Select({ label, options, placeholder, error, id, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField id={selectId} label={label} error={error}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={getFieldClasses(Boolean(error))}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
