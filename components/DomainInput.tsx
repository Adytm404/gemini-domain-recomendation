
import React, { useState } from 'react';
import { MagicWandIcon } from './icons';
import { Translations } from '../types';
import { SwitchToggle } from './SwitchToggle'; 

interface DomainInputProps {
  onSubmit: (
    description: string, 
    useCustomExtensions: boolean, 
    customExtensions: string,
    includeKeyword: string,
    numberOfSuggestions: number
  ) => void;
  isLoading: boolean;
  t: Translations;
}

export const DomainInput: React.FC<DomainInputProps> = ({ onSubmit, isLoading, t }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [useCustomExtensions, setUseCustomExtensions] = useState<boolean>(false);
  const [customExtensions, setCustomExtensions] = useState<string>('');
  const [customExtensionError, setCustomExtensionError] = useState<string | null>(null);

  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [includeKeyword, setIncludeKeyword] = useState<string>('');
  const [numberOfSuggestions, setNumberOfSuggestions] = useState<string>('10');
  const [numberOfSuggestionsError, setNumberOfSuggestionsError] = useState<string | null>(null);

  const validateCustomExtensions = (extensions: string): boolean => {
    if (!useCustomExtensions || !extensions.trim()) {
      setCustomExtensionError(null);
      return true; 
    }
    const parts = extensions.split(',').map(ext => ext.trim());
    const isValid = parts.every(part => part.startsWith('.') && part.length > 1);
    if (!isValid) {
      setCustomExtensionError(t.customExtensionsError);
      return false;
    }
    setCustomExtensionError(null);
    return true;
  };

  const validateNumberOfSuggestions = (numStr: string): boolean => {
    if (!isAdvancedMode) {
      setNumberOfSuggestionsError(null);
      return true;
    }
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num < 1 || num > 20) {
      setNumberOfSuggestionsError(t.numberOfSuggestionsError);
      return false;
    }
    setNumberOfSuggestionsError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let canSubmit = inputValue.trim() && !isLoading;
    
    if (useCustomExtensions && !validateCustomExtensions(customExtensions)) {
      canSubmit = false;
    }
    if (isAdvancedMode && !validateNumberOfSuggestions(numberOfSuggestions)) {
      canSubmit = false;
    }

    if (canSubmit) {
      onSubmit(
        inputValue.trim(), 
        useCustomExtensions, 
        customExtensions.trim(),
        isAdvancedMode ? includeKeyword.trim() : '',
        isAdvancedMode ? parseInt(numberOfSuggestions, 10) : 10 // Default to 10 if not advanced or invalid (though validation should catch)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors duration-300">
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

      <SwitchToggle
        id="useCustomExtensionsToggle"
        checked={useCustomExtensions}
        onChange={(checked) => {
          setUseCustomExtensions(checked);
          if (!checked) {
            setCustomExtensionError(null); 
          }
        }}
        label={t.useCustomExtensionsLabel}
        disabled={isLoading}
      />

      {useCustomExtensions && (
        <div className="pl-0"> 
          <label htmlFor="custom-extensions" className="block text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-1">
            {t.customExtensionsInputLabel}
          </label>
          <input
            type="text"
            id="custom-extensions"
            value={customExtensions}
            onChange={(e) => {
              setCustomExtensions(e.target.value);
              if (customExtensionError) { 
                validateCustomExtensions(e.target.value);
              }
            }}
            onBlur={() => validateCustomExtensions(customExtensions)} 
            placeholder={t.customExtensionsPlaceholder}
            className={`w-full p-3 border rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-background-light dark:bg-gray-800 text-textPrimary-light dark:text-textPrimary-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300 ${
              customExtensionError ? 'border-red-500 dark:border-red-400' : 'border-borderLight dark:border-borderDark'
            }`}
            disabled={isLoading}
            aria-label={t.customExtensionsInputLabel}
            aria-describedby={customExtensionError ? "custom-extension-error-text" : undefined}
          />
          {customExtensionError && (
            <p id="custom-extension-error-text" className="mt-1 text-xs text-red-600 dark:text-red-400">{customExtensionError}</p>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-borderLight dark:border-borderDark"></div>

      <SwitchToggle
        id="isAdvancedModeToggle"
        checked={isAdvancedMode}
        onChange={(checked) => {
          setIsAdvancedMode(checked);
          if (!checked) {
            setNumberOfSuggestionsError(null); // Clear error if disabling
            setIncludeKeyword('');
            setNumberOfSuggestions('10');
          }
        }}
        label={t.advancedModeLabel}
        disabled={isLoading}
      />

      {isAdvancedMode && (
        <div className="space-y-4 pl-0">
          <div>
            <label htmlFor="include-keyword" className="block text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-1">
              {t.includeKeywordLabel}
            </label>
            <input
              type="text"
              id="include-keyword"
              value={includeKeyword}
              onChange={(e) => setIncludeKeyword(e.target.value)}
              placeholder={t.includeKeywordPlaceholder}
              className="w-full p-3 border border-borderLight dark:border-borderDark rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-background-light dark:bg-gray-800 text-textPrimary-light dark:text-textPrimary-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
              disabled={isLoading}
              aria-label={t.includeKeywordLabel}
            />
          </div>
          <div>
            <label htmlFor="number-of-suggestions" className="block text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-1">
              {t.numberOfSuggestionsLabel}
            </label>
            <input
              type="number"
              id="number-of-suggestions"
              value={numberOfSuggestions}
              onChange={(e) => {
                setNumberOfSuggestions(e.target.value);
                 // Validate immediately on change for better UX
                validateNumberOfSuggestions(e.target.value);
              }}
              onBlur={() => validateNumberOfSuggestions(numberOfSuggestions)}
              placeholder={t.numberOfSuggestionsPlaceholder}
              min="1"
              max="20"
              className={`w-full p-3 border rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-background-light dark:bg-gray-800 text-textPrimary-light dark:text-textPrimary-dark placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300 ${
                numberOfSuggestionsError ? 'border-red-500 dark:border-red-400' : 'border-borderLight dark:border-borderDark'
              }`}
              disabled={isLoading}
              aria-label={t.numberOfSuggestionsLabel}
              aria-describedby={numberOfSuggestionsError ? "number-of-suggestions-error-text" : undefined}
            />
            {numberOfSuggestionsError && (
              <p id="number-of-suggestions-error-text" className="mt-1 text-xs text-red-600 dark:text-red-400">{numberOfSuggestionsError}</p>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !inputValue.trim() || (useCustomExtensions && !!customExtensionError) || (isAdvancedMode && !!numberOfSuggestionsError)}
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