
import React from 'react';

type Provider = 'gemini' | 'openai';

interface ProviderSelectorProps {
  value: Provider;
  onChange: (value: Provider) => void;
  disabled: boolean;
  texts: { gemini: string; openai: string };
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ value, onChange, disabled, texts }) => {
  const baseClasses = "px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 w-full";
  const activeClasses = "bg-gray-800 text-white dark:bg-blue-600 shadow-sm";
  const inactiveClasses = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <div className={`flex items-center p-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        onClick={() => !disabled && onChange('gemini')}
        disabled={disabled}
        className={`${baseClasses} ${value === 'gemini' ? activeClasses : inactiveClasses}`}
        aria-pressed={value === 'gemini'}
      >
        {texts.gemini}
      </button>
      <button
        onClick={() => !disabled && onChange('openai')}
        disabled={disabled}
        className={`${baseClasses} ${value === 'openai' ? activeClasses : inactiveClasses}`}
        aria-pressed={value === 'openai'}
      >
        {texts.openai}
      </button>
    </div>
  );
};
