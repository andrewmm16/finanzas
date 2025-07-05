import React from 'react';

interface InputFieldProps {
  value: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  error?: string;
  onChange: (value: string) => void;
}

export const InputFieldComponent: React.FC<InputFieldProps> = ({
  value,
  type = 'text',
  placeholder,
  error,
  autocomplete,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <input
        className="p-4 rounded-md bg-white"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autocomplete}
        required
      />
      {error && <span className="text-white text-sm">{error}</span>}
    </div>
  );
};
