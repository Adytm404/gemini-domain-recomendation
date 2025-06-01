
import React from 'react';
import { Theme, Translations } from '../types';
import { SunIcon, MoonIcon } from './icons';

interface ThemeToggleProps {
  currentTheme: Theme;
  toggleTheme: () => void;
  t: Translations;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, toggleTheme, t }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-200"
      aria-label={currentTheme === Theme.LIGHT ? t.themeToggleDarkAria : t.themeToggleLightAria}
    >
      {currentTheme === Theme.LIGHT ? (
        <MoonIcon className="w-6 h-6 text-textPrimary-light dark:text-textPrimary-dark" />
      ) : (
        <SunIcon className="w-6 h-6 text-textPrimary-light dark:text-textPrimary-dark" />
      )}
    </button>
  );
};
