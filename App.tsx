
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { SubtitleOutput } from './components/SubtitleOutput';
import { MagicIcon } from './components/icons/MagicIcon';
import { generateSubtitles } from './services/openaiService';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal, AppSettings } from './components/SettingsModal';

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
      apiKeyPlaceholder: "Enter your OPENAI API KEY",
      openAiApiUrl: "OpenAI API URL (OpenAI-compatible apps)",
      openAiApiUrlPlaceholder: "https://api.openai.com/v1",
      openAiApiUrlHint: "Optional. Configure this when using an OpenAI-compatible API endpoint.",
      useClientSide: "Use client-side request mode",
      useClientSideHint: "Client-side mode sends requests directly from the browser. Required for model testing.",
      modelList: "Model List",
      modelListHint: "Manage models displayed in the dropdown.",
      modelSelectorPlaceholder: "Add models to use...",
      searchModelsPlaceholder: "Search models...",
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
      apiKeyPlaceholder: "请输入您的 OPENAI API KEY",
      openAiApiUrl: "OpenAI API 地址（兼容 OpenAI 的应用）",
      openAiApiUrlPlaceholder: "https://api.openai.com/v1",
      openAiApiUrlHint: "可选项。当您使用兼容 OpenAI 的接口时，请在此设置 API 地址。",
      useClientSide: "使用客户端请求模式",
      useClientSideHint: "客户端请求模式将从浏览器直接发起对话请求。模型测试需要开启此项。",
      modelList: "模型列表",
      modelListHint: "管理在下拉菜单中展示的模型。",
      modelSelectorPlaceholder: "请添加需要使用的模型...",
      searchModelsPlaceholder: "搜索模型...",
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

const defaultSettings: AppSettings = {
  apiKey: process.env.API_KEY || '',
  openAiApiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
  useClientSide: true,
  selectedModels: ['gpt-4o-mini', 'gpt-4o'],
};

const normalizeModels = (models?: string[]): string[] => {
  const fallback = [...defaultSettings.selectedModels];
  if (!models) {
    return fallback;
  }

  const unique = Array.from(
    new Set(
      models
        .map((model) => (typeof model === 'string' ? model.trim() : ''))
        .filter((model): model is string => Boolean(model))
    )
  );

  return unique.length > 0 ? unique : fallback;
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

  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'zh');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitlesRef = useRef<string>('');
  const texts = translations[language];

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const mergedSettings: AppSettings = {
          ...defaultSettings,
          ...parsedSettings,
          openAiApiUrl:
            typeof parsedSettings.openAiApiUrl === 'string' && parsedSettings.openAiApiUrl.trim()
              ? parsedSettings.openAiApiUrl.trim()
              : defaultSettings.openAiApiUrl,
          selectedModels: normalizeModels(parsedSettings.selectedModels),
        };
        setSettings(mergedSettings);
        setSelectedModel(mergedSettings.selectedModels[0]);
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
    const sanitizedSettings: AppSettings = {
      ...newSettings,
      openAiApiUrl: newSettings.openAiApiUrl.trim() || defaultSettings.openAiApiUrl,
      selectedModels: normalizeModels(newSettings.selectedModels),
    };

    setSettings(sanitizedSettings);
    localStorage.setItem('appSettings', JSON.stringify(sanitizedSettings));

    if (!sanitizedSettings.selectedModels.includes(selectedModel)) {
      setSelectedModel(sanitizedSettings.selectedModels[0] || '');
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
    
    if (settings.useClientSide && !settings.apiKey) {
      setError("API Key is required for client-side requests. Please set it in the settings.");
      setIsSettingsModalOpen(true);
      return;
    }

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
        }
      });

      if (subtitlesRef.current) {
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          copywriting,
          subtitles: subtitlesRef.current,
        };
        setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50); // Keep max 50 items
          localStorage.setItem('subtitleHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [copywriting, isLoading, language, selectedModel, settings]);

  const handleClear = () => {
    setCopywriting('');
    setSubtitles('');
    setError(null);
  };

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
      <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 min-h-0">
          <TextAreaInput
            label={texts.yourScript}
            value={copywriting}
            onChange={(e) => setCopywriting(e.target.value)}
            placeholder={texts.placeholder}
            disabled={isLoading}
            onUploadClick={handleUploadClick}
            uploadTooltip={texts.uploadTooltip}
            models={settings.selectedModels}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
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
      </main>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.srt,.vtt,.docx"
      />
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto flex justify-center items-center gap-2 sm:gap-4">
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
