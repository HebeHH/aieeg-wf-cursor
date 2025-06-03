// Conference Data Types

export type Position = 
  | 'CEO' 
  | 'CTO' 
  | 'founder' 
  | 'Director/Head of Department' 
  | 'VP' 
  | 'Senior Engineer' 
  | 'Engineer' 
  | 'Founder' 
  | 'Product Manager/Lead' 
  | 'Other High-Level' 
  | 'Other Mid-Level' 
  | 'Other Low-Level';

export type Field = 
  | 'AI engineering' 
  | 'Software Engineering' 
  | 'Research' 
  | 'Developer Experience' 
  | 'Marketing/Sales' 
  | 'Product Management' 
  | 'Engineering' 
  | 'Data science' 
  | 'Investor';

// Base interfaces from original data sources

export interface SingleListItem {
  "Session ID": string;
  "Session Format": string;
  "Level": string;
  "Scope": string;
  "Assigned Track": string;
  "Room": string;
  "Speakers": string;
  "Companies": string;
  "Company Domains": string;
  "Title": string;
  "Description": string;
  "Scheduled At": string;
  "Titles": string;
}

export interface WebsiteSession {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isPlenumSession: boolean;
  speakers: string[];
  roomId: string;
  isConfirmed: boolean;
  categoryItems: CategoryItem[];
  isInformed: boolean;
  isServiceSession: boolean;
  liveUrl: string;
  questionAnswers: QuestionAnswer[];
  recordingUrl: string;
  status: string;
}

export interface WebsiteSpeaker {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: SpeakerLink[];
  sessions: string[];
  fullName: string;
  categoryItems: CategoryItem[];
  questionAnswers: QuestionAnswer[];
}

export interface WebsiteRoom {
  id: string;
  name: string;
  sort: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  categoryId: string;
  sort: number;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  sort: number;
  answerExtra: string;
}

export interface SpeakerLink {
  title: string;
  url: string;
  linkType: string;
}

// Combined and enhanced interfaces

export interface CombinedSession extends Omit<WebsiteSession, 'id'> {
  id: string;
  // From website.json
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isPlenumSession: boolean;
  speakers: string[];
  roomId: string;
  isConfirmed: boolean;
  categoryItems: CategoryItem[];
  isInformed: boolean;
  isServiceSession: boolean;
  liveUrl: string;
  questionAnswers: QuestionAnswer[];
  recordingUrl: string;
  status: string;
  // From singleList.json
  "Session Format": string;
  "Level": string;
  "Scope": string;
  "Assigned Track": string;
  "Room": string;
  "Speakers": string;
  "Companies": string;
  "Company Domains": string;
}

export interface EnhancedSpeaker extends WebsiteSpeaker {
  // Original WebsiteSpeaker fields
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: SpeakerLink[];
  sessions: string[];
  fullName: string;
  categoryItems: CategoryItem[];
  questionAnswers: QuestionAnswer[];
  // Enhanced fields from Gemini API
  company: string;
  title: string;
  position: Position[];
  field: Field;
}

// Data container interfaces

export interface CombinedData {
  rooms: WebsiteRoom[];
  sessions: CombinedSession[];
  speakers: WebsiteSpeaker[];
}

export interface FullData {
  rooms: WebsiteRoom[];
  sessions: CombinedSession[];
  speakers: EnhancedSpeaker[];
}

export interface WebsiteData {
  sessions: WebsiteSession[];
  speakers: WebsiteSpeaker[];
  rooms: WebsiteRoom[];
  categories: Category[];
  questions: Question[];
}

export interface Category {
  id: string;
  name: string;
  categoryItems: CategoryItem[];
  sort: number;
}

export interface Question {
  id: string;
  question: string;
  sort: number;
}

// API response interfaces

export interface GeminiResponse {
  company: string;
  title: string;
  position: Position[];
  field: Field;
}

// Progress tracking interface

export interface Progress {
  processedSpeakers: string[];
  lastProcessedIndex: number;
} 