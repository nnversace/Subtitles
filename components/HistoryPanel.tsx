
import React from 'react';
import { HistoryItem } from '../App';
import { IconButton } from './IconButton';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  texts: {
    title: string;
    empty: string;
    clear: string;
    close: string;
  };
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, history, onClose, onSelect, onClear, texts }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="history-panel-title" className="text-lg font-semibold">{texts.title}</h2>
            <IconButton onClick={onClose} tooltip={texts.close}>
              <CloseIcon className="w-6 h-6" />
            </IconButton>
          </div>
          
          {/* Content */}
          <div className="flex-grow overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <p>{texts.empty}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">
                        {item.copywriting}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(item.id).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{texts.clear}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};