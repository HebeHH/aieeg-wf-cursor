import { EnhancedSpeaker, CombinedSession, Position } from './conference';

export interface EnhancedSpeakerWithBookmarks extends EnhancedSpeaker {
  bookmarked: boolean;
}

export interface EnhancedSessionWithBookmarks extends CombinedSession {
  bookmarked: boolean;
  speakerBookmarked: boolean;
  speakerPositions: Position[];
}

export type BookmarkStatus = 'bookmarked' | 'rejected' | 'neither';

export interface SpeakerFilters {
  title: string[];
  position: Position[];
  field: string[];
  company: string[];
  bookmarkStatus: BookmarkStatus[];
  topSpeakersOnly: boolean;
  bioSearch: string;
  nameSearch: string;
}

export interface SessionFilters {
  speakerPosition: Position[];
  companies: string[];
  bookmarkStatus: BookmarkStatus[];
  assignedTrack: string[];
  day: string[];
  level: string[];
  scope: string[];
  room: string[];
  timeFrom: string;
  timeTo: string;
  companySearch: string;
  titleDescriptionSearch: string;
} 