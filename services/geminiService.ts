
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DomainSuggestion, Translations } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("Gemini API Key (process.env.API_KEY) is not configured. The application will not be able to generate domain suggestions.");
}

// The prompt to the AI should remain in English for optimal performance and understanding by the model.
const generatePrompt = (description: string): string => {
  return `
    You are an expert domain name suggestion AI.
    Based on the following user description, generate at least 10 creative and relevant domain name suggestions:
    "${description}"

    Consider these TLD options: .com, .net, .my.id, .id, .co.id, .store, .site, .space, .fun, .sbs, .top.
    Match the TLD to the user's likely intent. For example:
    - Online bakery in Jakarta: "jakartabakery.co.id", "sweetreats.store", "cakecreations.id".
    - Personal coding blog (Indonesian audience): "mycodejourney.my.id", "devdiary.id", "projectcode.space".
    - Global tech startup (social network): "connectsphere.com", "sociatenow.net", "globalhub.site".

    Provide your output ONLY as a JSON array of objects. Each object must have exactly three keys:
    1. "name": (string) The domain name part (e.g., "exampledomain"). Must be lowercase alphanumeric. Hyphens are allowed but should be used sparingly. No other special characters or spaces.
    2. "extension": (string) The domain extension, starting with a dot (e.g., ".com").
    3. "meaning": (string) A brief, one-sentence explanation (10-20 words) of the domain's relevance and follow the language used in the input, if input with indonesian so write meaning on indonesian too. THIS VALUE MUST BE PURE TEXT. NO EXTRA CHARACTERS, WORDS, OR COMMENTARY ARE ALLOWED AFTER THIS TEXT STRING AND BEFORE THE NEXT JSON TOKEN (A COMMA OR A CLOSING BRACE).

    STRICT JSON OUTPUT RULES:
    - Your entire response MUST start with '[' and end with ']'.
    - No text, comments, explanations, or markdown formatting should appear anywhere outside this single JSON array.
    - Inside each JSON object, after the "meaning" string value and its closing double quote ("), there MUST be either a comma (,) if it's not the last object in the array, or a closing curly brace (}) if it is the last property in an object. ABSOLUTELY NO OTHER TEXT OR CHARACTERS ARE PERMITTED IN THIS POSITION.
    - Ensure at least 10 valid suggestions are provided in the array.

    Example of the exact JSON output format (YOUR RESPONSE MUST FOLLOW THIS STRUCTURE PRECISELY):
    [
      { "name": "exampledomain", "extension": ".com", "meaning": "This domain is great for general examples." },
      { "name": "youridea", "extension": ".site", "meaning": "A versatile site for your unique idea." }
    ]
  `;
};


const parseDomainSuggestions = (jsonString: string, t: Translations): DomainSuggestion[] => {
  try {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
      cleanJsonString = match[2].trim();
    }

    const parsed = JSON.parse(cleanJsonString);

    if (!Array.isArray(parsed)) {
      console.error("Parsed data is not an array:", parsed);
      throw new Error(t.errorAiFormat || "The AI returned data in an unexpected format. Please try again.");
    }

    return parsed.map((item: any, index: number) => {
      if (typeof item.name !== 'string' || typeof item.extension !== 'string' || typeof item.meaning !== 'string') {
        console.error(`Invalid item at index ${index}:`, item);
        throw new Error(t.errorAiFormat || `Suggestion item at index ${index} has missing or invalid fields.`);
      }
      return {
        name: item.name,
        extension: item.extension,
        meaning: item.meaning.replace(/\s+/g, ' ').trim(), 
      };
    });
  } catch (error) {
    console.error("Failed to parse domain suggestions:", error);
    console.error("Original JSON string:", jsonString);
    throw new Error(t.errorAiInvalidResponse || "The AI returned an invalid response format. Please try again or check the console for details.");
  }
};

export const generateDomainSuggestions = async (description: string, t: Translations): Promise<DomainSuggestion[]> => {
  if (!ai) {
    console.error("Gemini AI client not initialized.");
    throw new Error(t.errorApiKeyNotConfigured || "Gemini API client is not initialized. Please ensure the API_KEY (process.env.API_KEY) is configured in your environment.");
  }

  const prompt = generatePrompt(description);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            responseMimeType: "application/json", 
            temperature: 0.7, 
        }
    });
    
    const rawJson = response.text;
    if (!rawJson) {
      throw new Error(t.errorAiInvalidResponse || "AI response was empty.");
    }
    return parseDomainSuggestions(rawJson, t);

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes("API key not valid")) {
      throw new Error(t.errorInvalidApiKey || "Invalid Gemini API Key. Please check your configuration.");
    }
    // If the error is already one of our specific translated errors, rethrow it.
    if (error.message === t.errorApiKeyNotConfigured || 
        error.message === t.errorAiFormat || 
        error.message === t.errorAiInvalidResponse ||
        error.message === t.errorInvalidApiKey) {
      throw error;
    }
    // For other errors, throw the generic invalid response error or its original message
    // if it's more descriptive and not already a translated one.
    throw new Error(error.message || t.errorAiInvalidResponse || "The AI returned an invalid response format. Please try again or check the console for details.");
  }
};
