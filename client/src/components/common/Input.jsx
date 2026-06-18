import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900
          ${error 
            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500' 
            : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500 focus:border-transparent'
          }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium leading-4">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-4">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
