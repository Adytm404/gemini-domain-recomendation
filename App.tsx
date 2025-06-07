import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DomainInput } from './components/DomainInput';
import { SuggestionCard } from './components/SuggestionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateDomainSuggestions } from './services/geminiService';
import { checkDomainAvailability } from './services/whoisService'; // Added
import { DomainSuggestion, Theme, Language, Translations } from './types';
import { translations } from './translations';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [isEmbedView] = useState<boolean>(window.location.pathname === '/embed');
  const [theme, setTheme] = useState<Theme>(isEmbedView ? Theme.LIGHT : Theme.LIGHT);
  const [language, setLanguage] = useState<Language>(Language.INDONESIAN);
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translations[Language.INDONESIAN]);
  const [userInput, setUserInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For Gemini API loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEmbedView) {
      setTheme(Theme.LIGHT);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === Theme.DARK) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme(Theme.DARK);
        document.documentElement.classList.add('dark');
      } else {
        setTheme(Theme.LIGHT);
        document.documentElement.classList.remove('dark');
      }
    }

    const storedLanguage = localStorage.getItem('language') as Language | null;
    const initialLang = storedLanguage || Language.INDONESIAN;
    setLanguage(initialLang);
    
    const effectiveTranslations = translations[initialLang];
    setCurrentTranslations(effectiveTranslations);
    document.documentElement.lang = initialLang;
    
    const titleKey = isEmbedView ? 'embedDocTitle' : 'docTitle';
    document.title = effectiveTranslations[titleKey] || effectiveTranslations.docTitle;

  }, [isEmbedView]);

  const toggleTheme = useCallback(() => {
    if (isEmbedView) return;
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
  }, [isEmbedView]);

  const switchLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    const newTranslations = translations[lang];
    setCurrentTranslations(newTranslations);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    const titleKey = isEmbedView ? 'embedDocTitle' : 'docTitle';
    document.title = newTranslations[titleKey] || newTranslations.docTitle;
  }, [isEmbedView]);

  const handleGenerateDomains = async (
    description: string, 
    useCustomExt: boolean, 
    customExtValue: string,
    includeKeyword: string,
    numberOfSuggestions: number
  ) => {
    setUserInput(description);
    setIsLoading(true); // Start loading for Gemini
    setError(null);
    setSuggestions([]);

    try {
      const geminiSuggestions = await generateDomainSuggestions(
        description, 
        currentTranslations, 
        useCustomExt ? customExtValue : undefined,
        includeKeyword,
        numberOfSuggestions
      );
      
      // Initialize suggestions with checking state
      const initialSuggestions: DomainSuggestion[] = geminiSuggestions.map(s => ({
        ...s,
        isCheckingAvailability: true,
        isAvailable: undefined,
        whoisError: null,
      }));
      setSuggestions(initialSuggestions);
      setIsLoading(false); // Stop Gemini loading, start WHOIS checks

      // Perform WHOIS checks for each suggestion
      initialSuggestions.forEach(async (suggestion, index) => {
        const domainFullName = `${suggestion.name}${suggestion.extension}`;
        const whoisResult = await checkDomainAvailability(domainFullName);
        
        setSuggestions(prevSuggestions => 
          prevSuggestions.map((s, i) => 
            i === index 
            ? { 
                ...s, 
                isAvailable: whoisResult.isAvailable, 
                whoisError: whoisResult.whoisError,
                isCheckingAvailability: false 
              } 
            : s
          )
        );
      });

    } catch (err: any) {
      console.error("Error generating domains or checking WHOIS:", err);
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
      setIsLoading(false); // Ensure loading is stopped on error
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-textPrimary-light dark:text-textPrimary-dark transition-colors duration-300 ${isEmbedView && theme === Theme.LIGHT ? 'light' : ''}`}>
      {!isEmbedView && (
        <Header
          currentTheme={theme}
          toggleTheme={toggleTheme}
          currentLanguage={language}
          switchLanguage={switchLanguage}
          t={currentTranslations}
        />
      )}
      <main className={`flex-grow container mx-auto px-4 ${isEmbedView ? 'py-4 sm:py-6' : 'py-8'} max-w-4xl`}>
        {!isEmbedView && (
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
        )}

        <DomainInput onSubmit={handleGenerateDomains} isLoading={isLoading} t={currentTranslations} />

        {/* This main isLoading is for Gemini. Individual card loading will be handled by SuggestionCard */}
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

        {/* Render suggestions once Gemini loading is false, even if WHOIS checks are ongoing */}
        {!isLoading && !error && suggestions.length > 0 && (
          <div className="mt-12">
            {!isEmbedView && (
              <h2 className="text-2xl font-semibold mb-6 text-center text-textPrimary-light dark:text-textPrimary-dark">
                {currentTranslations.generatedSuggestionsTitle}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard 
                  key={`${suggestion.name}-${suggestion.extension}-${index}`} 
                  suggestion={suggestion} 
                  t={currentTranslations} 
                />
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
      {!isEmbedView && (
        <footer className="py-6 text-center text-sm text-textSecondary-light dark:text-textSecondary-dark border-t border-borderLight dark:border-borderDark">
          <p>{currentTranslations.footerText.replace('{year}', new Date().getFullYear().toString())}</p>
        </footer>
      )}
    </div>
  );
};

export default App;