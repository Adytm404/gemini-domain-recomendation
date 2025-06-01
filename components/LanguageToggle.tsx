
import React from 'react';
import { Language, Translations } from '../types';

interface LanguageToggleProps {
  currentLanguage: Language;
  switchLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, switchLanguage, t }) => {
  const languages: { code: Language; label: string }[] = [
    { code: Language.INDONESIAN, label: t.languageID },
    { code: Language.ENGLISH, label: t.languageEN },
  ];

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-full" role="group" aria-label={t.languageToggleAria}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-medium rounded-full focus:outline-none transition-all duration-200 ease-in-out
            ${currentLanguage === lang.code
              ? 'bg-primary-light text-white shadow-md dark:bg-primary-dark'
              : 'text-textSecondary-light dark:text-textSecondary-dark hover:bg-gray-300 dark:hover:bg-gray-600'
            }
          `}
          aria-pressed={currentLanguage === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
