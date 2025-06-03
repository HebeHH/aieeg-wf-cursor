import { BookmarkData } from './localStorage';
import { CombinedSession } from '../types/conference';

// Export bookmarks as JSON
export function exportBookmarks(bookmarkData: BookmarkData): void {
  const dataStr = JSON.stringify(bookmarkData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conference-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import bookmarks from JSON file
export function importBookmarks(file: File): Promise<BookmarkData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as BookmarkData;
        
        // Validate the structure
        if (!importedData.speakerBookmarks || !Array.isArray(importedData.speakerBookmarks) ||
            !importedData.sessionBookmarks || !Array.isArray(importedData.sessionBookmarks) ||
            !importedData.speakerRejections || !Array.isArray(importedData.speakerRejections) ||
            !importedData.sessionRejections || !Array.isArray(importedData.sessionRejections)) {
          throw new Error('Invalid bookmark file format');
        }
        
        resolve(importedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Merge imported bookmarks with existing ones (adds, doesn't overwrite)
export function mergeBookmarks(existingData: BookmarkData, importedData: BookmarkData): BookmarkData {
  return {
    speakerBookmarks: [...new Set([...existingData.speakerBookmarks, ...importedData.speakerBookmarks])],
    sessionBookmarks: [...new Set([...existingData.sessionBookmarks, ...importedData.sessionBookmarks])],
    speakerRejections: [...new Set([...existingData.speakerRejections, ...importedData.speakerRejections])],
    sessionRejections: [...new Set([...existingData.sessionRejections, ...importedData.sessionRejections])]
  };
}

// Generate iCal content for sessions
export function generateICalForSessions(sessions: CombinedSession[]): string {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Conference App//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  sessions.forEach(session => {
    const uid = `session-${session.id}@conference.app`;
    const dtStart = formatDate(session.startsAt);
    const dtEnd = formatDate(session.endsAt);
    const summary = escapeText(session.title);
    const description = escapeText(session.description || '');
    const location = escapeText(session.Room || '');
    
    // Additional details
    const details = [
      description,
      `Track: ${session["Assigned Track"] || 'N/A'}`,
      `Level: ${session.Level || 'N/A'}`,
      `Scope: ${session.Scope || 'N/A'}`,
      `Format: ${session["Session Format"] || 'N/A'}`
    ].filter(Boolean).join('\\n\\n');

    icalContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  });

  icalContent.push('END:VCALENDAR');
  
  return icalContent.join('\r\n');
}

// Export sessions as iCal file
export function exportSessionsAsICal(sessions: CombinedSession[]): void {
  const icalContent = generateICalForSessions(sessions);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conference-sessions-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 