
import React from 'react';
import { IconButton } from './IconButton';
import { UploadIcon } from './icons/UploadIcon';

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
  onUploadClick: () => void;
  uploadTooltip: string;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  onUploadClick,
  uploadTooltip,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col h-full min-h-0 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="copywriting-input" className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        <div className="flex items-center gap-2">
            <IconButton onClick={onUploadClick} tooltip={uploadTooltip}>
              <UploadIcon className="w-5 h-5" />
            </IconButton>
        </div>
      </div>
      <textarea
        id="copywriting-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full flex-grow min-h-0 h-full overflow-y-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:ring-0 rounded-md resize-none p-2 text-base leading-relaxed transition-all duration-300 disabled:opacity-60"
        rows={15}
      />
    </div>
  );
};
