
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

    When suggesting domains, consider the user's likely intent and choose appropriate extensions from the following list:
    - .com: General purpose, primary choice for businesses and global reach.
    - .net: Alternative to .com, suitable for network-based services, tech companies, or communities.
    - .my.id: Ideal for personal websites, blogs, or portfolios for individuals in Indonesia.
    - .id: Suitable for general purpose websites targeting an Indonesian audience, including businesses and organizations.
    - .co.id: Specifically for registered companies or commercial entities operating in Indonesia.
    - .store: Best for e-commerce websites, online shops, and retail businesses.
    - .site: A versatile and generic extension for any type of website, project, or business.
    - .space: Good for creative individuals, communities, personal branding, or projects with a unique focus.
    - .fun: Perfect for entertainment-focused websites, hobbies, games, or light-hearted projects.
    - .sbs: Stands for "Side By Side." Good for social causes, community projects, comparison sites, or as a budget-friendly generic option.
    - .top: Can be used for high-quality content, review sites, ranking platforms, or as a memorable generic TLD.

    For example:
    - If the description is "an online bakery selling custom cakes in Jakarta", prioritize suggestions like "jakartabakery.co.id", "sweetreats.store", "cakecreations.id".
    - If the description is "a personal blog about my coding journey and projects targeting Indonesian readers", consider "mycodejourney.my.id", "devdiary.id", "projectcode.space".
    - If the description is "a global tech startup building a new social networking platform", suggest "connectsphere.com", "sociatenow.net", "globalhub.site".

    Provide your output ONLY as a JSON array of objects. Each object must have three keys:
    1. "name": The domain name part (without the extension, using only lowercase alphanumeric characters, no spaces or special symbols other than hyphens if absolutely necessary and common in domains).
    2. "extension": The domain extension (including the leading dot, e.g., ".com").
    3. "meaning": A brief, one-sentence explanation (max 15-20 words) of the domain's relevance, what it suggests, or its value proposition based on the user's description. This explanation should be concise and helpful. adjust to the user's language, if the user speaks Indonesian then display Indonesian, if English then English too and other languages.

    Do not include any other text, explanations, or markdown formatting outside the JSON array.
    Ensure at least 9 suggestions are provided. 

    Example JSON output format:
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
        meaning: item.meaning,
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
            responseMimeType: "application/json", // Request JSON directly
            temperature: 0.7, // Add some creativity
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
    // Let the App.tsx handle general error messages based on the error type
    throw error;
  }
};
