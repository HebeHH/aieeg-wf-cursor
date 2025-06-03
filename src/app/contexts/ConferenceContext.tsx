'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FullData, EnhancedSpeaker, CombinedSession, Position } from '../types/conference';
import { EnhancedSpeakerWithBookmarks, EnhancedSessionWithBookmarks } from '../types/ui';
import { BookmarkData, getBookmarkData, saveBookmarkData } from '../utils/localStorage';
import { loadConferenceData } from '../utils/dataLoader';

interface ConferenceContextType {
  fullData: FullData | null;
  activeSpeakers: EnhancedSpeakerWithBookmarks[];
  activeSessions: EnhancedSessionWithBookmarks[];
  bookmarkData: BookmarkData;
  loading: boolean;
  error: string | null;
  toggleSpeakerBookmark: (speakerId: string) => void;
  toggleSessionBookmark: (sessionId: string) => void;
  rejectSpeaker: (speakerId: string) => void;
  rejectSession: (sessionId: string) => void;
  bookmarkAllSpeakers: (speakerIds: string[]) => void;
  rejectAllSpeakers: (speakerIds: string[]) => void;
  bookmarkAllSessions: (sessionIds: string[]) => void;
  rejectAllSessions: (sessionIds: string[]) => void;
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(undefined);

export function ConferenceProvider({ children }: { children: ReactNode }) {
  const [fullData, setFullData] = useState<FullData | null>(null);
  const [bookmarkData, setBookmarkData] = useState<BookmarkData>({
    speakerBookmarks: [],
    sessionBookmarks: [],
    speakerRejections: [],
    sessionRejections: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadConferenceData();
        setFullData(data);
        setBookmarkData(getBookmarkData());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Enhance speakers with bookmark information
  const activeSpeakers: EnhancedSpeakerWithBookmarks[] = fullData?.speakers
    .filter(speaker => !bookmarkData.speakerRejections.includes(speaker.id))
    .map(speaker => ({
      ...speaker,
      bookmarked: bookmarkData.speakerBookmarks.includes(speaker.id)
    })) || [];

  // Enhance sessions with bookmark information and speaker positions
  const activeSessions: EnhancedSessionWithBookmarks[] = fullData?.sessions
    .filter(session => {
      // Filter out rejected sessions
      if (bookmarkData.sessionRejections.includes(session.id)) {
        return false;
      }
      
      // Filter out sessions with rejected top speakers
      const sessionSpeakers = session.speakers.map(speakerId => 
        fullData.speakers.find(s => s.id === speakerId)
      ).filter(Boolean);
      
      const hasRejectedTopSpeaker = sessionSpeakers.some(speaker => 
        speaker?.isTopSpeaker && bookmarkData.speakerRejections.includes(speaker.id)
      );
      
      return !hasRejectedTopSpeaker;
    })
    .map(session => {
      const sessionSpeakers = session.speakers.map(speakerId => 
        fullData.speakers.find(s => s.id === speakerId)
      ).filter(Boolean);
      
      const speakerPositions: Position[] = sessionSpeakers.flatMap(speaker => 
        speaker?.position || []
      );
      
      const speakerBookmarked = sessionSpeakers.some(speaker => 
        speaker && bookmarkData.speakerBookmarks.includes(speaker.id)
      );

      return {
        ...session,
        bookmarked: bookmarkData.sessionBookmarks.includes(session.id),
        speakerBookmarked,
        speakerPositions
      };
    }) || [];

  const updateBookmarkData = (newData: BookmarkData) => {
    setBookmarkData(newData);
    saveBookmarkData(newData);
  };

  const toggleSpeakerBookmark = (speakerId: string) => {
    const newData = { ...bookmarkData };
    if (newData.speakerBookmarks.includes(speakerId)) {
      newData.speakerBookmarks = newData.speakerBookmarks.filter(id => id !== speakerId);
    } else {
      newData.speakerBookmarks.push(speakerId);
    }
    updateBookmarkData(newData);
  };

  const toggleSessionBookmark = (sessionId: string) => {
    const newData = { ...bookmarkData };
    if (newData.sessionBookmarks.includes(sessionId)) {
      newData.sessionBookmarks = newData.sessionBookmarks.filter(id => id !== sessionId);
    } else {
      newData.sessionBookmarks.push(sessionId);
    }
    updateBookmarkData(newData);
  };

  const rejectSpeaker = (speakerId: string) => {
    const newData = { ...bookmarkData };
    if (!newData.speakerRejections.includes(speakerId)) {
      newData.speakerRejections.push(speakerId);
    }
    // Remove from bookmarks if present
    newData.speakerBookmarks = newData.speakerBookmarks.filter(id => id !== speakerId);
    updateBookmarkData(newData);
  };

  const rejectSession = (sessionId: string) => {
    const newData = { ...bookmarkData };
    if (!newData.sessionRejections.includes(sessionId)) {
      newData.sessionRejections.push(sessionId);
    }
    // Remove from bookmarks if present
    newData.sessionBookmarks = newData.sessionBookmarks.filter(id => id !== sessionId);
    updateBookmarkData(newData);
  };

  const bookmarkAllSpeakers = (speakerIds: string[]) => {
    const newData = { ...bookmarkData };
    speakerIds.forEach(id => {
      if (!newData.speakerBookmarks.includes(id)) {
        newData.speakerBookmarks.push(id);
      }
    });
    updateBookmarkData(newData);
  };

  const rejectAllSpeakers = (speakerIds: string[]) => {
    const newData = { ...bookmarkData };
    speakerIds.forEach(id => {
      if (!newData.speakerRejections.includes(id)) {
        newData.speakerRejections.push(id);
      }
      // Remove from bookmarks if present
      newData.speakerBookmarks = newData.speakerBookmarks.filter(bookmarkId => bookmarkId !== id);
    });
    updateBookmarkData(newData);
  };

  const bookmarkAllSessions = (sessionIds: string[]) => {
    const newData = { ...bookmarkData };
    sessionIds.forEach(id => {
      if (!newData.sessionBookmarks.includes(id)) {
        newData.sessionBookmarks.push(id);
      }
    });
    updateBookmarkData(newData);
  };

  const rejectAllSessions = (sessionIds: string[]) => {
    const newData = { ...bookmarkData };
    sessionIds.forEach(id => {
      if (!newData.sessionRejections.includes(id)) {
        newData.sessionRejections.push(id);
      }
      // Remove from bookmarks if present
      newData.sessionBookmarks = newData.sessionBookmarks.filter(bookmarkId => bookmarkId !== id);
    });
    updateBookmarkData(newData);
  };

  return (
    <ConferenceContext.Provider
      value={{
        fullData,
        activeSpeakers,
        activeSessions,
        bookmarkData,
        loading,
        error,
        toggleSpeakerBookmark,
        toggleSessionBookmark,
        rejectSpeaker,
        rejectSession,
        bookmarkAllSpeakers,
        rejectAllSpeakers,
        bookmarkAllSessions,
        rejectAllSessions
      }}
    >
      {children}
    </ConferenceContext.Provider>
  );
}

export function useConference() {
  const context = useContext(ConferenceContext);
  if (context === undefined) {
    throw new Error('useConference must be used within a ConferenceProvider');
  }
  return context;
} 