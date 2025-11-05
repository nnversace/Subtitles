
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { SubtitleOutput } from './components/SubtitleOutput';
import { MagicIcon } from './components/icons/MagicIcon';
import { generateSubtitles } from './services/geminiService';
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
    outputPlaceholder: "Your generated subtitles will appear here.",
    history: "History",
    generate: "Generate Subtitles",
    generating: "Generating...",
    clear: "Clear",
    historyPanelTitle: "Generation History",
    historyEmpty: "Your generation history is empty.",
    clearHistory: "Clear History",
    close: "Close",
    copyTooltip: "Copy to clipboard",
    copiedTooltip: "Copied!",
    errorPrefix: "Error: ",
    toggleTheme: "Toggle theme",
    toggleLanguage: "切换中文",
    uploadTooltip: "Upload from file",
    uploadError: "Failed to read file.",
    settings: "Settings",
    model: "AI Model",
    settingsTitle: "Settings",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your OpenAI API Key",
    apiUrl: "API URL",
    apiUrlPlaceholder: "e.g., https://api.openai.com/v1",
    apiUrlHint: "The base URL for your API provider, including the /v1 path.",
    useClientSide: "Use Client-side Request Mode",
    useClientSideHint: "Requests will be sent directly from your browser, improving response speed.",
    modelList: "Model List",
    modelListHint: "Manage the models displayed in the dropdown menu.",
    modelSelectorPlaceholder: "Select or add models...",
    searchModelsPlaceholder: "Search models...",
    connectivityCheck: "Connectivity Check",
    test: "Test",
    testing: "Testing...",
    testSuccess: "Connection successful! Models loaded.",
    testFailure: "Connection failed. Please check your API Key and URL.",
    save: "Save",
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
    clear: "清除",
    historyPanelTitle: "生成历史",
    historyEmpty: "您的生成历史为空。",
    clearHistory: "清除历史",
    close: "关闭",
    copyTooltip: "复制到剪贴板",
    copiedTooltip: "已复制！",
    errorPrefix: "错误：",
    toggleTheme: "切换主题",
    toggleLanguage: "Switch to English",
    uploadTooltip: "从文件上传",
    uploadError: "读取文件失败。",
    settings: "设置",
    model: "AI 模型",
    settingsTitle: "设置",
    apiKey: "API Key",
    apiKeyPlaceholder: "请输入你的 OpenAI API Key",
    apiUrl: "API 地址",
    apiUrlPlaceholder: "例如 https://api.openai.com/v1",
    apiUrlHint: "您的 API 服务商的基础 URL，通常需要包含 /v1 路径。",
    useClientSide: "使用客户端请求模式",
    useClientSideHint: "客户端请求模式将从浏览器直接发起对话请求，可提升响应速度。",
    modelList: "模型列表",
    modelListHint: "管理在下拉菜单中展示的模型。",
    modelSelectorPlaceholder: "选择或添加模型...",
    searchModelsPlaceholder: "搜索模型...",
    connectivityCheck: "连通性检查",
    test: "检查",
    testing: "检查中...",
    testSuccess: "连接成功！模型已加载。",
    testFailure: "连接失败，请检查 API Key 与代理地址是否正确填写。",
    save: "保存",
  },
};

const defaultSettings: AppSettings = {
  apiKey: '',
  openaiProxyUrl: 'https://api.openai.com/v1',
  useClientSide: true,
  selectedModels: ['gemini-2.5-pro-thinking', 'gemini-2.5-pro', 'grok-4'],
};

const App: React.FC = () => {
  const [copywriting, setCopywriting] = useState<string>('');
  const [subtitles, setSubtitles] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'zh');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      const parsed = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
      // Basic validation to ensure parsed data has the expected structure
      if (parsed && typeof parsed.apiKey === 'string' && Array.isArray(parsed.selectedModels)) {
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
     try {
      const savedSettings = localStorage.getItem('appSettings');
      const parsed = savedSettings ? JSON.parse(savedSettings) as AppSettings : defaultSettings;
      return (parsed.selectedModels && parsed.selectedModels[0]) || '';
    } catch (e) {
      return defaultSettings.selectedModels[0] || '';
    }
  });


  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitlesRef = useRef<string>('');
  const texts = translations[language];

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('subtitleHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
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
  
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Ensure selected model is still valid
    if (!settings.selectedModels.includes(selectedModel) || !selectedModel) {
      setSelectedModel(settings.selectedModels[0] || '');
    }
  }, [settings, selectedModel]);


  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleToggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'zh' : 'en');
  };

  const handleGenerate = useCallback(async () => {
    if (!copywriting.trim() || isLoading || !selectedModel) return;
    if (settings.useClientSide && !settings.apiKey) {
      setError('API Key is not set. Please configure it in the settings.');
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
        settings: settings,
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
      reader.onerror = () => {
        setError(texts.uploadError);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCopywriting(text);
        setError(null);
      };
      reader.onerror = () => {
        setError(texts.uploadError);
      };
      reader.readAsText(file);
    }

    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col transition-colors duration-300">
      <Header
        title={texts.title}
        aiText={texts.ai}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleLanguage={handleToggleLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        toggleThemeTooltip={texts.toggleTheme}
        toggleLanguageTooltip={texts.toggleLanguage}
        settingsTooltip={texts.settings}
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
            modelValue={selectedModel}
            onModelChange={setSelectedModel}
            models={settings.selectedModels}
            modelDisabled={isLoading}
            modelLabel={texts.model}
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
          close: texts.close,
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        texts={{
          title: texts.settingsTitle,
          apiKey: texts.apiKey,
          apiKeyPlaceholder: texts.apiKeyPlaceholder,
          apiUrl: texts.apiUrl,
          apiUrlPlaceholder: texts.apiUrlPlaceholder,
          apiUrlHint: texts.apiUrlHint,
          useClientSide: texts.useClientSide,
          useClientSideHint: texts.useClientSideHint,
          modelList: texts.modelList,
          modelListHint: texts.modelListHint,
          modelSelectorPlaceholder: texts.modelSelectorPlaceholder,
          searchModelsPlaceholder: texts.searchModelsPlaceholder,
          connectivityCheck: texts.connectivityCheck,
          test: texts.test,
          testing: texts.testing,
          testSuccess: texts.testSuccess,
          testFailure: texts.testFailure,
          save: texts.save,
          close: texts.close,
        }}
      />
    </div>
  );
};

export default App;
