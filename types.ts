export interface DomainSuggestion {
  name: string;
  extension: string;
  meaning: string; // Added to store the meaning/value of the domain
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