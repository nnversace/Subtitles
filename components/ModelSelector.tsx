import React from 'react';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  models: string[];
  label: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, disabled, models, label }) => {
  if (!models || models.length === 0) {
    return (
      <div className="flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400">
        No models configured.
      </div>
    );
  }

  return (
    <div className="relative">
       <label htmlFor="model-selector" className="sr-only">{label}</label>
      <select
        id="model-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 transition disabled:opacity-50"
      >
        {models.map(model => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};