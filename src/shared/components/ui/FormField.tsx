import React from 'react';
import { Input, type InputProps } from './Input';

interface FormFieldProps extends Omit<InputProps, 'type'> {
  type?: string;
}

export const FormField: React.FC<FormFieldProps> = (props) => {
  return <Input {...props} />;
};
