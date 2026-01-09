
// src/components/ui/Field.tsx
import React from "react";
import { OptionItem } from "../../types/form";

type BaseProps = {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
};

export const TextInput: React.FC<
  BaseProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ id, label, required, description, ...rest }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input
      id={id}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      {...rest}
    />
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);

export const TextArea: React.FC<
  BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ id, label, required, description, ...rest }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <textarea
      id={id}
      className="min-h-[160px] w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      {...rest}
    />
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);

export const SelectInput: React.FC<
  BaseProps & { options: OptionItem[] } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ id, label, required, description, options, ...rest }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <select
      id={id}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      {...rest}
    >
      <option value="" disabled hidden>
        -- Select --
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);
