
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DomainInput } from './components/DomainInput';
import { SuggestionCard } from './components/SuggestionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateDomainSuggestions } from './services/geminiService';
import { DomainSuggestion, Theme, Language, Translations } from './types';
import { translations } from './translations';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [language, setLanguage] = useState<Language>(Language.INDONESIAN);
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translations[Language.INDONESIAN]);
  const [userInput, setUserInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === Theme.DARK) {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme(Theme.DARK);
      document.documentElement.classList.add('dark');
    }

    const storedLanguage = localStorage.getItem('language') as Language | null;
    const initialLanguage = storedLanguage || Language.INDONESIAN;
    setLanguage(initialLanguage);
    setCurrentTranslations(translations[initialLanguage]);
    document.documentElement.lang = initialLanguage;
    document.title = translations[initialLanguage].docTitle;
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      localStorage.setItem('theme', newTheme);
      if (newTheme === Theme.DARK) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  }, []);

  const switchLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setCurrentTranslations(translations[lang]);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.title = translations[lang].docTitle;
  }, []);

  const handleGenerateDomains = async (description: string) => {
    setUserInput(description);
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await generateDomainSuggestions(description, currentTranslations);
      setSuggestions(result);
    } catch (err: any) {
      console.error("Error generating domains:", err);
      // Use translated error messages if available, otherwise use the raw message.
      let displayError = err.message || currentTranslations.errorUnknownApi;
      if (err.message === "Gemini API client is not initialized. Please ensure the API_KEY (process.env.API_KEY) is configured in your environment.") {
        displayError = currentTranslations.errorApiKeyNotConfigured;
      } else if (err.message === "The AI returned data in an unexpected format. Please try again.") {
        displayError = currentTranslations.errorAiFormat;
      } else if (err.message === "The AI returned an invalid response format. Please try again or check the console for details.") {
        displayError = currentTranslations.errorAiInvalidResponse;
      } else if (err.message === "Invalid Gemini API Key. Please check your configuration.") {
        displayError = currentTranslations.errorInvalidApiKey;
      }
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className={`min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-textPrimary-light dark:text-textPrimary-dark transition-colors duration-300`}>
      <Header
        currentTheme={theme}
        toggleTheme={toggleTheme}
        currentLanguage={language}
        switchLanguage={switchLanguage}
        t={currentTranslations}
      />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-primary-light dark:bg-primary-dark rounded-full mb-4">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-textPrimary-light dark:text-textPrimary-dark">
            {currentTranslations.findYourDomain}
          </h1>
          <p className="text-lg text-textSecondary-light dark:text-textSecondary-dark max-w-2xl mx-auto">
            {currentTranslations.appDescription}
          </p>
        </div>

        <DomainInput onSubmit={handleGenerateDomains} isLoading={isLoading} t={currentTranslations} />

        {isLoading && (
          <div className="mt-12 flex justify-center">
            <LoadingSpinner t={currentTranslations} />
          </div>
        )}

        {error && (
          <div className="mt-12 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-center">
            <p className="font-semibold">{currentTranslations.errorOops}</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 text-center text-textPrimary-light dark:text-textPrimary-dark">
              {currentTranslations.generatedSuggestionsTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard key={`${suggestion.name}-${suggestion.extension}-${index}`} suggestion={suggestion} t={currentTranslations} />
              ))}
            </div>
          </div>
        )}
         {!isLoading && !error && suggestions.length === 0 && userInput && (
          <div className="mt-12 text-center text-textSecondary-light dark:text-textSecondary-dark">
            <p>{currentTranslations.noSuggestions}</p>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-textSecondary-light dark:text-textSecondary-dark border-t border-borderLight dark:border-borderDark">
        <p>{currentTranslations.footerText.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
};

export default App;
