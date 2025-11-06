
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { SubtitleOutput } from './components/SubtitleOutput';
import { MagicIcon } from './components/icons/MagicIcon';
import { generateSubtitles } from './services/openaiService';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { ModelSelector } from './components/ModelSelector';

// Add mammoth to the window scope for TypeScript
declare var mammoth: any;

export interface HistoryItem {
  id: number;
  copywriting: string;
  subtitles: string;
}

type Language = 'en' | 'zh';
type Theme = 'light' | 'dark';

const translations = {
  en: {
    title: "Copywriting to Subtitles",
    ai: "AI",
    yourScript: "Your Script",
    placeholder: "Paste your script or copywriting here...",
    generatedSubtitles: "Generated Subtitles",
    selectModel: "Select Model",
    outputPlaceholder: "Your generated subtitles will appear here.",
    history: "History",
    generate: "Generate Subtitles",
    generating: "Generating...",
    clear: "Clear",
    historyPanelTitle: "Generation History",
    historyEmpty: "Your generation history is empty.",
    clearHistory: "Clear History",
    copyTooltip: "Copy to clipboard",
    copiedTooltip: "Copied!",
    errorPrefix: "Error: ",
    toggleTheme: "Toggle theme",
    toggleLanguage: "切换中文",
    openSettings: "Settings",
    uploadTooltip: "Upload from file",
    uploadError: "Failed to read file.",
    settings: {
      title: "Settings",
      apiKey: "API Key",
      apiKeyPlaceholder: "Enter your OpenAI-compatible API Key",
      apiUrl: "API URL",
      apiUrlPlaceholder: "https://api.openai.com",
      useClientSide: "Use client-side request mode",
      useClientSideHint: "Client-side mode sends requests directly from the browser. Required for model testing.",
      modelList: "Model List",
      modelListHint: "Manage models displayed in the dropdown.",
      modelSelectorPlaceholder: "Add models to use...",
      searchModelsPlaceholder: "Search models...",
      // FIX: Add missing 'connectivityCheck' property to fix TypeScript error.
      connectivityCheck: "Connectivity Check",
      test: "Test",
      testing: "Testing...",
      testSuccess: "Success",
      testFailure: "Failed",
      save: "Save",
      close: "Close",
    }
  },
  zh: {
    title: "文案转字幕",
    ai: "AI",
    yourScript: "你的文稿",
    placeholder: "在此处粘贴您的脚本或文案...",
    generatedSubtitles: "生成的字幕",
    selectModel: "选择模型",
    outputPlaceholder: "您生成的字幕将显示在此处。",
    history: "历史",
    generate: "生成字幕",
    generating: "生成中...",
    clear: "清屏",
    historyPanelTitle: "生成历史",
    historyEmpty: "您的生成历史为空。",
    clearHistory: "清除历史",
    copyTooltip: "复制到剪贴板",
    copiedTooltip: "已复制！",
    errorPrefix: "错误：",
    toggleTheme: "切换主题",
    toggleLanguage: "Switch to English",
    openSettings: "设置",
    uploadTooltip: "从文件上传",
    uploadError: "读取文件失败。",
    settings: {
      title: "设置",
      apiKey: "API Key",
      apiKeyPlaceholder: "请输入 OpenAI 兼容的 API Key",
      apiUrl: "API 地址",
      apiUrlPlaceholder: "https://api.openai.com",
      useClientSide: "使用客户端请求模式",
      useClientSideHint: "客户端请求模式将从浏览器直接发起对话请求。模型测试需要开启此项。",
      modelList: "模型列表",
      modelListHint: "管理在下拉菜单中展示的模型。",
      modelSelectorPlaceholder: "请添加需要使用的模型...",
      searchModelsPlaceholder: "搜索模型...",
      // FIX: Add missing 'connectivityCheck' property to fix TypeScript error.
      connectivityCheck: "连通性检查",
      test: "检查",
      testing: "检查中...",
      testSuccess: "成功",
      testFailure: "失败",
      save: "保存",
      close: "关闭",
    }
  },
};

const resolveEnvString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
};

// Provide default settings seeded from environment variables when available.
const defaultSettings: AppSettings = {
  apiKey: resolveEnvString(import.meta.env.VITE_OPENAI_API_KEY),
  apiUrl: resolveEnvString(import.meta.env.VITE_OPENAI_API_URL, 'https://api.openai.com'),
  useClientSide: true,
  selectedModels: ['gpt-4o-mini', 'gpt-4o'],
};

const App: React.FC = () => {
  const [copywriting, setCopywriting] = useState<string>('');
  const [subtitles, setSubtitles] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'zh');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitlesRef = useRef<string>('');
  const texts = translations[language];

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
        if (!parsedSettings.selectedModels || parsedSettings.selectedModels.length === 0) {
          parsedSettings.selectedModels = [...defaultSettings.selectedModels];
        }
        setSettings(parsedSettings);
        if (parsedSettings.selectedModels?.length > 0) {
          setSelectedModel(parsedSettings.selectedModels[0]);
        }
      } else {
        setSettings(defaultSettings);
        setSelectedModel(defaultSettings.selectedModels[0]);
      }
      const savedHistory = localStorage.getItem('subtitleHistory');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (error) {
      console.error("Failed to parse settings or history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    if (newSettings.selectedModels && !newSettings.selectedModels.includes(selectedModel)) {
      setSelectedModel(newSettings.selectedModels[0] || '');
    }
    setIsSettingsModalOpen(false);
  };
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleToggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'zh' : 'en');
  };

  const handleGenerate = useCallback(async () => {
    if (!copywriting.trim() || isLoading || !selectedModel) return;

    // FIX: Updated API Key check to be more robust.
    if (settings.useClientSide && (!settings.apiKey || !settings.apiUrl)) {
      setError("API Key and API URL are required for client-side requests. Please set them in the settings.");
      setIsSettingsModalOpen(true);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setSubtitles('');
    subtitlesRef.current = '';

    try {
      await generateSubtitles({
        text: copywriting,
        lang: language,
        model: selectedModel,
        settings,
        onStreamUpdate: (chunk) => {
          setSubtitles(prev => prev + chunk);
          subtitlesRef.current += chunk;
        },
        onStreamComplete: () => {
          if (!subtitlesRef.current) {
            return;
          }

          const newHistoryItem: HistoryItem = {
            id: Date.now(),
            copywriting,
            subtitles: subtitlesRef.current,
          };

          setHistory(prevHistory => {
            const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50);
            localStorage.setItem('subtitleHistory', JSON.stringify(updatedHistory));
            return updatedHistory;
          });
        },
        onStreamError: (streamError) => {
          setError(streamError.message);
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.debug('Subtitle generation aborted');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        console.error(err);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }, [copywriting, isLoading, language, selectedModel, settings]);

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setCopywriting('');
    setSubtitles('');
    setError(null);
    subtitlesRef.current = '';
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('subtitleHistory');
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setCopywriting(item.copywriting);
    setSubtitles(item.subtitles);
    setError(null);
    setIsHistoryPanelOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer) {
          mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then((result: { value: string; }) => {
              setCopywriting(result.value);
              setError(null);
            })
            .catch((err: Error) => {
              console.error("Error parsing .docx file:", err);
              setError(texts.uploadError);
            });
        }
      };
      reader.onerror = () => setError(texts.uploadError);
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCopywriting(text);
        setError(null);
      };
      reader.onerror = () => setError(texts.uploadError);
      reader.readAsText(file);
    }

    if (event.target) event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col transition-colors duration-300">
      <Header
        title={texts.title}
        aiText={texts.ai}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        toggleThemeTooltip={texts.toggleTheme}
        toggleLanguageTooltip={texts.toggleLanguage}
        openSettingsTooltip={texts.openSettings}
      />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-0 gap-8">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 min-h-0">
          <TextAreaInput
            label={texts.yourScript}
            value={copywriting}
            onChange={(e) => setCopywriting(e.target.value)}
            placeholder={texts.placeholder}
            disabled={isLoading}
            onUploadClick={handleUploadClick}
            uploadTooltip={texts.uploadTooltip}
          />
          <SubtitleOutput
            label={texts.generatedSubtitles}
            subtitles={subtitles}
            isLoading={isLoading}
            error={error}
            placeholder={texts.outputPlaceholder}
            copyTooltip={texts.copyTooltip}
            copiedTooltip={texts.copiedTooltip}
            errorPrefix={texts.errorPrefix}
          />
        </div>
        <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-full flex justify-center">
                <ModelSelector
                  value={selectedModel}
                  onChange={setSelectedModel}
                  disabled={isLoading}
                  models={settings.selectedModels}
                  label={texts.selectModel}
                />
              </div>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setIsHistoryPanelOpen(true)}
                  disabled={isLoading}
                  className="px-4 py-3 text-sm sm:px-6 sm:text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-300"
                >
                  {texts.history}
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={!copywriting.trim() || isLoading || !selectedModel}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm sm:px-6 sm:text-base font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                  <MagicIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{isLoading ? texts.generating : texts.generate}</span>
                </button>
                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="px-4 py-3 text-sm sm:px-6 sm:text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-300"
                >
                  {texts.clear}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.srt,.vtt,.docx"
      />
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        history={history}
        onClose={() => setIsHistoryPanelOpen(false)}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
        texts={{
          title: texts.historyPanelTitle,
          empty: texts.historyEmpty,
          clear: texts.clearHistory,
          close: texts.settings.close,
        }}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        texts={texts.settings}
      />
    </div>
  );
};

export default App;
