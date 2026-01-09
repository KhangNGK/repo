export interface GlossaryItem {
  id: string;
  term: string;
  translation: string;
  type: 'term' | 'name' | 'location' | 'skill' | 'item' | 'other' | 'pronoun';
  context?: string; // Added context field
}

export enum ModelProvider {
  GEMINI = 'Gemini',
  CHATGPT = 'ChatGPT',
  OLLAMA = 'Ollama',
  LM_STUDIO = 'LM Studio',
}

export interface TranslationConfig {
  sourceLang: string;
  targetLang: string;
  model: ModelProvider;
  temperature: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface WorkspaceSettings {
  publicAccess: boolean;
  allowEpub: boolean;
  allowContribution: boolean;
  autoSync?: boolean;
  webhookUrl?: string;
  webhookKey?: string;
  cloudProvider?: 'internal' | 'google_drive' | 'dropbox';
  googleDriveEmail?: string;
}

export interface WorkspaceStats {
  likes: number;
  comments: number;
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  translatedTitle?: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
  sourceText: string;
  sourceUrl?: string; // URL to fetch content from later
  translatedText: string;
  sourceWordCount: number;
  translatedWordCount: number;
  lastModified: number;
}

// New Interface for Characters
export interface Character {
  id: string;
  originalName: string;
  translatedName: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  role: 'main' | 'supporting' | 'villain' | 'mob';
  description?: string;
}

// New Interface for Relationships
export interface Relationship {
  id: string;
  charAId: string; // ID or Name of Character A
  charBId: string; // ID or Name of Character B
  relation: string; // e.g., "Friend", "Enemy"
  callAtoB: string; // How A calls B (e.g., "Huynh đệ")
  callBtoA: string; // How B calls A (e.g., "Đại ca")
  chapterRange: string; // e.g., "1-5"
}

export interface Workspace {
  id: string;
  name: string;
  sourceText: string; // Kept for backward compatibility/scratchpad
  translatedText: string; // Kept for backward compatibility
  chapters: Chapter[];
  glossary: GlossaryItem[];
  characters: Character[]; // Added characters
  relationships: Relationship[]; // Added relationships
  config: TranslationConfig;
  scrapedUrl?: string;
  cssSelector?: string;
  author?: string;
  genres?: string[];
  description?: string;
  coverImage?: string;
  settings: WorkspaceSettings;
  stats: WorkspaceStats;
  createdAt: number;
  lastModified: number;
  chapterProgress: {
    current: number;
    total: number;
  };
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Detect Language' },
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'id', name: 'Indonesian' },
];