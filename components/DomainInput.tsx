
import React, { useState } from 'react';
import { MagicWandIcon } from './icons';
import { Translations } from '../types';

interface DomainInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
  t: Translations;
}

export const DomainInput: React.FC<DomainInputProps> = ({ onSubmit, isLoading, t }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors duration-300">
      <div>
        <label htmlFor="domain-description" className="block text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-1">
          {t.describeIdeaLabel}
        </label>
        <textarea
          id="domain-description"
          rows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.textAreaPlaceholder}
          className="w-full p-3 border border-borderLight dark:border-borderDark rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-background-light dark:bg-gray-800 text-textPrimary-light dark:text-textPrimary-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
          disabled={isLoading}
          aria-label={t.describeIdeaLabel}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-light hover:bg-indigo-700 dark:bg-primary-dark dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary-light dark:focus:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t.generatingButton}
          </>
        ) : (
          <>
            <MagicWandIcon className="w-5 h-5 mr-2" />
            {t.generateDomainsButton}
          </>
        )}
      </button>
    </form>
  );
};
