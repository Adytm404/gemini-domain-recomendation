import React from 'react';
import { DomainSuggestion, Translations } from '../types';
import { ShoppingCartIcon } from './icons';

interface SuggestionCardProps {
  suggestion: DomainSuggestion;
  t: Translations;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, t }) => {
  const fullName = `${suggestion.name}${suggestion.extension}`;
  const buyLink = `https://nyanhosting.id/member/cart.php?a=add&domain=register&query=${encodeURIComponent(fullName)}`;

  const isButtonDisabled = suggestion.isAvailable === false;

  let statusText = '';
  let statusColorClass = 'text-textSecondary-light dark:text-textSecondary-dark';

  if (suggestion.isCheckingAvailability) {
    statusText = t.checkingAvailabilityStatus;
    statusColorClass = 'text-blue-600 dark:text-blue-400';
  } else if (suggestion.whoisError) {
    statusText = t.whoisCheckError.replace('{error}', suggestion.whoisError);
    statusColorClass = 'text-yellow-600 dark:text-yellow-400';
  } else if (suggestion.isAvailable === true) {
    statusText = t.domainAvailable;
    statusColorClass = 'text-green-600 dark:text-green-400';
  } else if (suggestion.isAvailable === false) {
    statusText = t.domainNotAvailable;
    statusColorClass = 'text-red-600 dark:text-red-400';
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark break-all">
          {suggestion.name}<span className="text-textSecondary-light dark:text-textSecondary-dark">{suggestion.extension}</span>
        </h3>
        <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-2 mb-1 min-h-[3em] flex-grow">
          {suggestion.meaning}
        </p>
        {statusText && (
          <p className={`text-xs font-medium mt-1 mb-3 ${statusColorClass}`}>
            {statusText}
          </p>
        )}
      </div>
      <div className="mt-auto pt-4">
        <a
          href={isButtonDisabled ? undefined : buyLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-300
            ${isButtonDisabled 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-secondary-light hover:bg-emerald-600 dark:bg-secondary-dark dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-light dark:focus:ring-offset-surface-dark focus:ring-secondary-light dark:focus:ring-secondary-dark'
            }
          `}
          aria-label={`${t.buyDomainButton} ${fullName}${isButtonDisabled ? ` (${t.domainNotAvailable})` : ''}`}
          title={isButtonDisabled ? t.buyDomainNotAvailableTitle : `${t.buyDomainButton} ${fullName}`}
          onClick={(e) => { if (isButtonDisabled) e.preventDefault(); }}
          role="button"
          aria-disabled={isButtonDisabled}
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          {t.buyDomainButton}
        </a>
      </div>
    </div>
  );
};