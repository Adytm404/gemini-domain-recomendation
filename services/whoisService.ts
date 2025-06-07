
import { WhoisApiResponse } from '../types';

const WHOIS_API_URL = 'https://whois.webkulo.com/?domain=';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

interface WhoisCheckResult {
  isAvailable: boolean | undefined;
  whoisError: string | null;
}

export const checkDomainAvailability = async (domainFullName: string): Promise<WhoisCheckResult> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${WHOIS_API_URL}${encodeURIComponent(domainFullName)}`);
      
      if (!response.ok) {
        lastError = new Error(`API server responded with status: ${response.status} (attempt ${attempt})`);
        if (attempt === MAX_RETRIES) {
          return { 
            isAvailable: undefined, 
            whoisError: `WHOIS API server error (status: ${response.status}) for ${domainFullName} after ${MAX_RETRIES} attempts.` 
          };
        }
        await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY_MS * attempt));
        continue; 
      }

      const data: WhoisApiResponse = await response.json();

      if (!data.success) {
        return { 
          isAvailable: undefined, 
          whoisError: data.message || `WHOIS API reported an unsuccessful operation for ${domainFullName}.` 
        };
      }

      return { 
        isAvailable: data.available, 
        whoisError: null 
      };

    } catch (error: any) {
      lastError = error;
      console.warn(`Error checking WHOIS for ${domainFullName} (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
      if (attempt === MAX_RETRIES) {
        let finalErrorMessage = (lastError && lastError.message) || 'An unexpected error occurred during WHOIS check.';
        
        if (typeof finalErrorMessage === 'string' && finalErrorMessage.toLowerCase().includes('failed to fetch')) {
            finalErrorMessage = `Could not connect to the WHOIS service for ${domainFullName} after ${MAX_RETRIES} attempts. This may be due to a network issue, the WHOIS service being temporarily unavailable, or Cross-Origin Resource Sharing (CORS) restrictions on the WHOIS API server. (Detail: ${lastError.message})`;
        } else {
            finalErrorMessage = `WHOIS check for ${domainFullName} failed after ${MAX_RETRIES} attempts. (Detail: ${finalErrorMessage})`;
        }
        console.error(`Persistent error checking WHOIS for ${domainFullName} after ${MAX_RETRIES} attempts:`, lastError);
        return { 
          isAvailable: undefined, 
          whoisError: finalErrorMessage
        };
      }
      await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY_MS * attempt));
    }
  }

  // Fallback, should ideally not be reached if MAX_RETRIES >= 1
  return { 
    isAvailable: undefined, 
    whoisError: (lastError && lastError.message) || `WHOIS check for ${domainFullName} failed after all retries.`
  };
};
