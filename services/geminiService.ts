import { GoogleGenAI } from "@google/genai";
import { GlossaryItem, TranslationConfig, AspectRatio } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// --- Translation Service ---

export const generateTranslationStream = async (
  text: string,
  config: TranslationConfig,
  glossary: GlossaryItem[]
) => {
  if (!text.trim()) return null;

  // Separate pronouns from other terms for specific handling
  const pronouns = glossary.filter(g => g.type === 'pronoun' && g.term && g.translation);
  const terms = glossary.filter(g => g.type !== 'pronoun' && g.term && g.translation);

  const pronounRules = pronouns
    .map(g => `- "${g.term}" → "${g.translation}"`)
    .join("\n");

  const termRules = terms
    .map(g => `- "${g.term}" → "${g.translation}" (${g.type})`)
    .join("\n");

  const systemPrompt = `
    You are a professional literary translator specializing in web novels.
    Your task is to translate the provided text from ${config.sourceLang} to ${config.targetLang}.

    CRITICAL INSTRUCTIONS:
    1. Maintain the tone, style, and flow of the original story.
    2. Adapt idioms and cultural references to be natural in the target language.
    3. Output ONLY the translated text. Do not include notes or explanations unless absolutely necessary for cultural context (footnotes).
    
    PRONOUN & ADDRESSING MAPPING (HIGHEST PRIORITY):
    Handle these pronouns and forms of address strictly to maintain character voice and social hierarchy:
    ${pronounRules.length > 0 ? pronounRules : "No specific pronoun rules. Infer from context."}

    GLOSSARY TERMS:
    Strictly use these translations for specific terms/names:
    ${termRules.length > 0 ? termRules : "No specific glossary terms provided."}
    
    GENERAL RULES:
    - If a term in the glossary appears, use the provided translation.
    - For pronouns not listed, use context to determine appropriate gender and hierarchy (e.g. polite vs casual).
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        {
            role: 'user',
            parts: [{ text: systemPrompt + "\n\n---\n\nOriginal Text:\n" + text }]
        }
      ],
      config: {
        temperature: config.temperature,
      }
    });

    return responseStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- Image Analysis Service ---

export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: prompt || "Analyze this image and describe the characters or setting relevant to a web novel context."
          }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
};

// --- Image Generation Service ---

export const generateNovelImage = async (prompt: string, aspectRatio: AspectRatio) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K" // Defaulting to 1K
        }
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// --- Web Scraping Helper ---

export const fetchRawHtml = async (url: string): Promise<string> => {
  // 1. Try fetching via Extension (Messaging)
  try {
    const content = await new Promise<string>((resolve, reject) => {
      const requestId = Date.now().toString();
      
      // Timeout if extension doesn't reply
      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject("Extension unavailable");
      }, 1000); 

      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'NOVEL_WEAVER_FETCH_RESPONSE' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          clearTimeout(timeoutId);
          
          if (event.data.success) {
            resolve(event.data.html);
          } else {
            reject(event.data.error);
          }
        }
      };

      window.addEventListener('message', handleResponse);
      window.postMessage({ type: 'NOVEL_WEAVER_FETCH_REQUEST', url, requestId }, '*');
    });

    return content;

  } catch (extError) {
    console.log("Extension fetch failed, falling back to direct fetch.", extError);
  }

  // 2. Fallback to Direct Fetch (Will likely fail CORS)
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.text();
  } catch (error) {
    console.warn("CORS/Fetch error:", error);
    throw new Error("Error: Could not fetch URL. Please ensure the NovelWeaver Extension is installed to bypass CORS restrictions.");
  }
};

export const fetchUrlContent = async (url: string, selector: string): Promise<string> => {
  try {
    const html = await fetchRawHtml(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    if (selector) {
      const element = doc.querySelector(selector);
      return element ? (element.textContent || "").trim() : `Selector "${selector}" not found on page.`;
    }
    return doc.body.textContent || "";
  } catch (e: any) {
    return e.message || "Unknown error";
  }
};

export const scrapeChapterList = async (url: string, selector: string) => {
  try {
    const html = await fetchRawHtml(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const container = selector ? doc.querySelector(selector) : doc.body;

    if (!container) return [];

    const links = Array.from(container.querySelectorAll('a'));
    const chapters = links.map(link => {
      let href = link.getAttribute('href');
      if (href && !href.startsWith('http')) {
        // Handle relative URLs
        try {
            href = new URL(href, url).toString();
        } catch (e) {
            console.warn("Invalid URL", href);
        }
      }
      
      return {
        title: (link.textContent || "").trim(),
        url: href || ""
      };
    }).filter(item => item.title && item.url); // Basic filter

    return chapters;
  } catch (e) {
    console.error("Scrape TOC Error", e);
    return [];
  }
};