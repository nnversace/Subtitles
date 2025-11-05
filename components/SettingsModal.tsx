
import React, { useState, useEffect, useRef } from 'react';
import { IconButton } from './IconButton';
import { CloseIcon } from './icons/CloseIcon';
import { ToggleSwitch } from './ToggleSwitch';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { CheckIcon } from './icons/CheckIcon';

export interface AppSettings {
  apiKey: string;
  openaiProxyUrl: string;
  useClientSide: boolean;
  selectedModels: string[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  texts: {
    title: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    apiUrl: string;
    apiUrlPlaceholder: string;
    apiUrlHint: string;
    useClientSide: string;
    useClientSideHint: string;
    modelList: string;
    modelListHint: string;
    modelSelectorPlaceholder: string;
    connectivityCheck: string;
    test: string;
    testing: string;
    testSuccess: string;
    testFailure: string;
    save: string;
    close: string;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, texts }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelManagerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setLocalSettings(settings);
    setTestStatus('idle');
    setAvailableModels([]);
    setIsModelDropdownOpen(false);
  }, [settings, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (modelManagerRef.current && !modelManagerRef.current.contains(event.target as Node)) {
            setIsModelDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [modelManagerRef]);

  const handleSave = () => {
    onSave(localSettings);
  };
  
  const handleRemoveModel = (modelToRemove: string) => {
    setLocalSettings(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.filter(m => m !== modelToRemove)
    }));
  };
  
  const handleToggleModel = (modelId: string) => {
    setLocalSettings(prev => {
        const selected = prev.selectedModels;
        if (selected.includes(modelId)) {
            return { ...prev, selectedModels: selected.filter(m => m !== modelId) };
        } else {
            return { ...prev, selectedModels: [...selected, modelId] };
        }
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setAvailableModels([]);
    try {
      const endpoint = `${(localSettings.openaiProxyUrl || '').replace(/\/$/, '')}/v1/models`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localSettings.apiKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
            const sortedModels = data.data.sort((a: any, b: any) => a.id.localeCompare(b.id));
            setAvailableModels(sortedModels);
            setTestStatus('success');
            setIsModelDropdownOpen(true);
        } else {
             setTestStatus('failure');
        }
      } else {
        setTestStatus('failure');
      }
    } catch (error) {
      setTestStatus('failure');
    } finally {
      setIsTesting(false);
    }
  };

  const getTestButtonStatus = () => {
    if (isTesting) {
      return { text: texts.testing, color: 'bg-gray-500', icon: <RefreshIcon className="w-4 h-4 animate-spin"/> };
    }
    switch(testStatus) {
      case 'success':
        return { text: texts.testSuccess, color: 'bg-green-600', icon: null };
      case 'failure':
        return { text: texts.testFailure, color: 'bg-red-600', icon: null };
      default:
        return { text: texts.test, color: 'bg-slate-700 hover:bg-slate-600', icon: null };
    }
  }

  if (!isOpen) return null;
  
  const testButtonStatus = getTestButtonStatus();

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{texts.title}</h2>
          <IconButton onClick={onClose} tooltip={texts.close}>
            <CloseIcon className="w-6 h-6" />
          </IconButton>
        </header>
        <main className="p-6 space-y-6 overflow-y-auto">
          {/* API Configuration */}
          <div className="space-y-5">
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-800 dark:text-gray-200">{texts.apiKey}</label>
              <div className="relative mt-1">
                <input
                  id="api-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings(prev => ({...prev, apiKey: e.target.value}))}
                  placeholder={texts.apiKeyPlaceholder}
                  className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  {showApiKey ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="api-url-input" className="block text-sm font-medium text-gray-800 dark:text-gray-200">{texts.apiUrl}</label>
              <input
                id="api-url-input"
                type="text"
                value={localSettings.openaiProxyUrl}
                onChange={(e) => setLocalSettings(prev => ({...prev, openaiProxyUrl: e.target.value}))}
                placeholder={texts.apiUrlPlaceholder}
                className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{texts.apiUrlHint}</p>
            </div>
            
            <div>
              <ToggleSwitch
                id="client-side-toggle"
                checked={localSettings.useClientSide}
                onChange={(checked) => setLocalSettings(prev => ({ ...prev, useClientSide: checked }))}
                label={texts.useClientSide}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{texts.useClientSideHint}</p>
            </div>
          </div>
          
          <hr className="border-gray-200 dark:border-slate-800" />

          {/* Model Management */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">{texts.modelList}</label>
            <div className="relative" ref={modelManagerRef}>
              <div 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex flex-wrap gap-2 p-2 min-h-[42px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
              >
                {localSettings.selectedModels.length > 0 ? localSettings.selectedModels.map(model => (
                  <div key={model} className="flex items-center bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium pl-3 pr-1.5 py-1 rounded-md">
                      <span>{model}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModel(model);
                        }} 
                        className="ml-1.5 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600"
                      >
                          <CloseIcon className="w-3.5 h-3.5"/>
                      </button>
                  </div>
                )) : (
                  <span className="text-gray-400 dark:text-gray-500 self-center px-1">{texts.modelSelectorPlaceholder}</span>
                )}
              </div>

              {isModelDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableModels.length > 0 ? (
                    <ul>
                      {availableModels.map(model => (
                        <li 
                          key={model.id}
                          onClick={() => handleToggleModel(model.id)}
                          className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center"
                        >
                          <span>{model.id}</span>
                          {localSettings.selectedModels.includes(model.id) && (
                            <CheckIcon className="w-5 h-5 text-blue-500" />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {isTesting ? texts.testing : "Click 'Test' to load models."}
                    </div>
                  )}
                </div>
              )}
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400">{texts.modelListHint}</p>
          </div>

        </main>
        <footer className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 dark:border-slate-800 flex-shrink-0 bg-gray-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button
              onClick={handleTestConnection}
              disabled={isTesting || !localSettings.apiKey || !localSettings.openaiProxyUrl}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${testButtonStatus.color} ${testStatus === 'idle' ? 'bg-slate-600 hover:bg-slate-500' : ''}`}
            >
              {testButtonStatus.icon}
              {getTestButtonStatus().text}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-blue-500"
          >
            {texts.save}
          </button>
        </footer>
      </div>
    </div>
  );
};
