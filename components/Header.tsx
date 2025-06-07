import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { EmbedButton } from './EmbedButton'; // Added
import { Theme, Language, Translations } from '../types';
import { DomainCheckIcon } from './icons';

interface HeaderProps {
  currentTheme: Theme;
  toggleTheme: () => void;
  currentLanguage: Language;
  switchLanguage: (lang: Language) => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({ currentTheme, toggleTheme, currentLanguage, switchLanguage, t }) => {
  return (
    <header className="py-4 px-6 bg-surface-light dark:bg-surface-dark shadow-md sticky top-0 z-50 transition-colors duration-300 border-b border-borderLight dark:border-borderDark">
      <div className="container mx-auto flex justify-between items-center max-w-4xl">
        <div className="flex items-center space-x-2">
          <DomainCheckIcon className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          <h1 className="text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
            {t.appTitle}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <EmbedButton t={t} /> {/* Added */}
          <LanguageToggle
            currentLanguage={currentLanguage}
            switchLanguage={switchLanguage}
            t={t}
          />
          <ThemeToggle currentTheme={currentTheme} toggleTheme={toggleTheme} t={t} />
        </div>
      </div>
    </header>
  );
};