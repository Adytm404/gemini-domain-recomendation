export interface DomainSuggestion {
  name: string;
  extension: string;
  meaning: string;
  isCheckingAvailability?: boolean;
  isAvailable?: boolean;
  whoisError?: string | null;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  INDONESIAN = 'id',
  ENGLISH = 'en',
}

export interface Translations {
  [key: string]: string;
}

export interface AllTranslations {
  [Language.ENGLISH]: Translations;
  [Language.INDONESIAN]: Translations;
}

export interface WhoisApiResponse {
  success: boolean;
  domain: string;
  available: boolean;
  whois_snippet?: string;
  message?: string; // For error messages from WHOIS API
}