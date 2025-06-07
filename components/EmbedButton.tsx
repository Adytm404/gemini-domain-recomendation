import React, { useState, useEffect } from 'react';
import { Translations } from '../types';
import { LinkIcon, CheckIcon } from './icons';

interface EmbedButtonProps {
  t: Translations;
}

export const EmbedButton: React.FC<EmbedButtonProps> = ({ t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const embedUrl = `${window.location.origin}/embed`;
    navigator.clipboard.writeText(embedUrl).then(() => {
      setCopied(true);
    }).catch(err => {
      console.error('Failed to copy embed URL: ', err);
      // Optionally, you could set an error state here to inform the user
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000); // Reset after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-all duration-200 flex items-center space-x-1 text-sm text-textPrimary-light dark:text-textPrimary-dark"
      aria-label={copied ? t.embedUrlCopied : t.copyEmbedUrlButtonLabel}
      title={copied ? t.embedUrlCopied : t.copyEmbedUrlButtonLabel}
    >
      {copied ? (
        <>
          <CheckIcon className="w-5 h-5 text-green-500" />
          <span className="text-green-500">{t.embedUrlCopiedShort}</span>
        </>
      ) : (
        <>
          <LinkIcon className="w-5 h-5" />
          <span>{t.embedButtonLabel}</span>
        </>
      )}
    </button>
  );
};
