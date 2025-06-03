export interface BookmarkData {
  speakerBookmarks: string[];
  sessionBookmarks: string[];
  speakerRejections: string[];
  sessionRejections: string[];
}

const STORAGE_KEY = 'conference-bookmarks';

export function getBookmarkData(): BookmarkData {
  if (typeof window === 'undefined') {
    return {
      speakerBookmarks: [],
      sessionBookmarks: [],
      speakerRejections: [],
      sessionRejections: []
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading bookmark data:', error);
  }

  return {
    speakerBookmarks: [],
    sessionBookmarks: [],
    speakerRejections: [],
    sessionRejections: []
  };
}

export function saveBookmarkData(data: BookmarkData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving bookmark data:', error);
  }
} 