
import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { IconButton } from './IconButton';

interface SubtitleOutputProps {
  label: string;
  subtitles: string;
  isLoading: boolean;
  error: string | null;
  placeholder: string;
  copyTooltip: string;
  copiedTooltip: string;
  errorPrefix: string;
}

export const SubtitleOutput: React.FC<SubtitleOutputProps> = ({ label, subtitles, isLoading, error, placeholder, copyTooltip, copiedTooltip, errorPrefix }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (subtitles) {
      navigator.clipboard.writeText(subtitles);
      setCopied(true);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg w-full">
            <strong className="font-bold">{errorPrefix}</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      );
    }

    if (isLoading && !subtitles) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">AI is thinking...</p>
          </div>
        </div>
      );
    }

    if (!subtitles && !isLoading) {
       return (
        <div className="flex items-center justify-center h-full text-center">
          <p className="text-gray-500 dark:text-gray-400">{placeholder}</p>
        </div>
      );
    }

    return (
      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words" role="status" aria-live="polite">
        {subtitles}
        {isLoading && <span className="inline-block w-0.5 h-4 bg-gray-700 dark:bg-gray-300 animate-pulse ml-1" aria-hidden="true" />}
      </pre>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col h-full min-h-0 relative shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="subtitle-output" className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        {subtitles && !error && (
          <IconButton onClick={handleCopy} tooltip={copied ? copiedTooltip : copyTooltip}>
            <CopyIcon className="w-5 h-5"/>
          </IconButton>
        )}
      </div>
      <div id="subtitle-output" className="w-full flex-grow min-h-0 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 overflow-y-auto text-base">
        {renderContent()}
      </div>
    </div>
  );
};
