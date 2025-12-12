export enum Language {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  PORTUGUESE = 'Portuguese',
  DUTCH = 'Dutch',
  POLISH = 'Polish',
  RUSSIAN = 'Russian',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  CHINESE_MANDARIN = 'Chinese (Mandarin)',
  CHINESE_CANTONESE = 'Chinese (Cantonese)',
  HINDI = 'Hindi',
  BENGALI = 'Bengali',
  THAI = 'Thai',
  VIETNAMESE = 'Vietnamese',
  INDONESIAN = 'Indonesian',
  TAGALOG = 'Tagalog (Filipino)',
  CEBUANO = 'Cebuano',
  ILOCANO = 'Ilocano',
  ARABIC = 'Arabic',
  TURKISH = 'Turkish',
  SWEDISH = 'Swedish',
  NORWEGIAN = 'Norwegian',
  DANISH = 'Danish',
  FINNISH = 'Finnish',
  GREEK = 'Greek',
  HEBREW = 'Hebrew',
  MALAY = 'Malay',
  UKRAINIAN = 'Ukrainian'
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  language: Language;
}

export interface ChatMessage {
  id: string;
  senderId: string; // User ID
  senderName: string;
  text: string;
  translatedText?: string; // Localized for the viewer
  timestamp: number;
  status: MessageStatus;
}

export interface Group {
  id: string;
  name: string;
  members: User[]; // Includes the local user
  messages: ChatMessage[];
  lastActive: number;
}