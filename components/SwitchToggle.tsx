import React from 'react';

interface SwitchToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const SwitchToggle: React.FC<SwitchToggleProps> = ({ id, checked, onChange, label, disabled }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center">
      <label htmlFor={id} className="mr-3 text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark cursor-pointer select-none">
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary-light dark:focus:ring-primary-dark ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${checked ? 'bg-primary-light dark:bg-primary-dark' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {/* Hidden checkbox for form semantics and accessibility if needed, though button with role=switch is generally sufficient */}
      <input
        type="checkbox"
        id={`${id}-checkbox`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        aria-labelledby={`${id}-label`}
      />
    </div>
  );
};
