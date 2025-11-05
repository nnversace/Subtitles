
import React from 'react';
import { IconButton } from './IconButton';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
  title: string;
  aiText: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  toggleThemeTooltip: string;
  toggleLanguageTooltip: string;
  settingsTooltip: string;
}

export const Header: React.FC<HeaderProps> = ({ title, aiText, theme, onToggleTheme, onToggleLanguage, onOpenSettings, toggleThemeTooltip, toggleLanguageTooltip, settingsTooltip }) => {
  return (
    <header className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title} <span className="text-blue-600 dark:text-blue-500">{aiText}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <IconButton onClick={onToggleTheme} tooltip={toggleThemeTooltip}>
              {theme === 'light' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </IconButton>
            <IconButton onClick={onToggleLanguage} tooltip={toggleLanguageTooltip}>
              <GlobeIcon className="w-6 h-6" />
            </IconButton>
             <IconButton onClick={onOpenSettings} tooltip={settingsTooltip}>
              <SettingsIcon className="w-6 h-6" />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
};
