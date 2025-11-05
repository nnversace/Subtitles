
import React, { useState, useEffect } from 'react';
import { IconButton } from './IconButton';
import { CloseIcon } from './icons/CloseIcon';

export interface AppSettings {
  selectedModels: string[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  texts: {
    title: string;
    modelList: string;
    modelListHint: string;
    addModel: string;
    add: string;
    modelNamePlaceholder: string;
    modelExistsError: string;
    save: string;
    close: string;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, texts }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [newModelName, setNewModelName] = useState('');
  const [modelError, setModelError] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
    setNewModelName('');
    setModelError('');
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(localSettings);
  };
  
  const handleRemoveModel = (modelToRemove: string) => {
    setLocalSettings(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.filter(m => m !== modelToRemove)
    }));
  };

  const handleAddModel = () => {
    setModelError('');
    const trimmedName = newModelName.trim();
    if (!trimmedName) return;

    if (localSettings.selectedModels.includes(trimmedName)) {
      setModelError(texts.modelExistsError);
      return;
    }
    
    setLocalSettings(prev => ({
      ...prev,
      selectedModels: [...prev.selectedModels, trimmedName]
    }));
    setNewModelName('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddModel();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-gray-100 dark:bg-gray-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{texts.title}</h2>
          <IconButton onClick={onClose} tooltip={texts.close}>
            <CloseIcon className="w-6 h-6" />
          </IconButton>
        </header>
        <main className="p-6 space-y-6 overflow-y-auto">
          {/* Model List */}
          <div>
             <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{texts.modelList}</label>
             <div className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex flex-wrap gap-2">
                    {localSettings.selectedModels.length > 0 ? localSettings.selectedModels.map(model => (
                        <div key={model} className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium pl-2.5 pr-1 py-0.5 rounded-full">
                            <span>{model}</span>
                            <button onClick={() => handleRemoveModel(model)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">
                                <CloseIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    )) : (
                      <p className="text-sm text-gray-500">No models configured.</p>
                    )}
                </div>
             </div>
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{texts.modelListHint}</p>
          </div>

          {/* Add Model */}
          <div>
            <label htmlFor="add-model-input" className="block text-sm font-medium text-gray-800 dark:text-gray-200">{texts.addModel}</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                id="add-model-input"
                type="text"
                value={newModelName}
                onChange={(e) => {
                  setNewModelName(e.target.value);
                  setModelError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder={texts.modelNamePlaceholder}
                className="flex-grow px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                onClick={handleAddModel}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition"
              >
                {texts.add}
              </button>
            </div>
            {modelError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{modelError}</p>}
          </div>

        </main>
        <footer className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleSave}
            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            {texts.save}
          </button>
        </footer>
      </div>
    </div>
  );
};
