
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
    <div className="flex items-center">
       <label htmlFor="model-selector" className="sr-only">{label}</label>
      <select
        id="model-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 text-sm font-semibold bg-transparent text-gray-700 dark:text-gray-300 rounded-lg border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
      >
        {models.map(model => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};
