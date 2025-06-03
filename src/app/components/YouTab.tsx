'use client';

import { useRef, useState } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import SpeakerCard from './SpeakerCard';
import SessionCard from './SessionCard';
import { exportBookmarks, importBookmarks, exportSessionsAsICal } from '../utils/exportUtils';

export default function YouTab() {
  const { activeSpeakers, activeSessions, fullData, bookmarkData, importBookmarks: importBookmarksToContext } = useConference();
  const { openModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const bookmarkedSpeakers = activeSpeakers.filter(speaker => speaker.bookmarked);
  const bookmarkedSessions = activeSessions.filter(session => 
    session.bookmarked || session.speakerBookmarked
  );

  // Get rejected items from fullData
  const rejectedSpeakers = fullData?.speakers.filter(speaker => 
    bookmarkData.speakerRejections.includes(speaker.id)
  ).map(speaker => ({
    ...speaker,
    bookmarked: bookmarkData.speakerBookmarks.includes(speaker.id)
  })) || [];

  const rejectedSessions = fullData?.sessions.filter(session =>
    bookmarkData.sessionRejections.includes(session.id)
  ).map(session => {
    const sessionSpeakers = session.speakers.map(speakerId => 
      fullData?.speakers.find(s => s.id === speakerId)
    ).filter(Boolean);
    
    const speakerPositions = sessionSpeakers.flatMap(speaker => 
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

  const handleExportBookmarks = () => {
    exportBookmarks(bookmarkData);
  };

  const handleImportBookmarks = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await importBookmarks(file);
      importBookmarksToContext(importedData);
      alert(`Successfully imported ${importedData.speakerBookmarks.length} speaker bookmarks and ${importedData.sessionBookmarks.length} session bookmarks!`);
    } catch (error) {
      alert(`Failed to import bookmarks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportAllSessionsICal = () => {
    if (!fullData?.sessions) {
      alert('No sessions available to export');
      return;
    }
    exportSessionsAsICal(fullData.sessions);
  };

  return (
    <div className="space-y-8">
      {/* Export/Import Controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Your Data</h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Bookmark Management */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Bookmarks</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportBookmarks}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                📤 Export Bookmarks
              </button>
              <button
                onClick={handleImportBookmarks}
                disabled={isImporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50"
              >
                {isImporting ? '⏳ Importing...' : '📥 Import Bookmarks'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Import adds to existing bookmarks (doesn&apos;t overwrite)
            </p>
          </div>

          {/* Calendar Export */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Calendar</h3>
            <button
              onClick={handleExportAllSessionsICal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              📅 Export All Sessions (iCal)
            </button>
            <p className="text-xs text-gray-500">
              Downloads all {fullData?.sessions.length || 0} sessions as calendar file
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Bookmarked Speakers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Bookmarked Speakers ({bookmarkedSpeakers.length})
        </h2>
        {bookmarkedSpeakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedSpeakers.map(speaker => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onClick={() => openModal('speaker', speaker.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No bookmarked speakers yet. Go to the Speakers tab to bookmark some!
          </div>
        )}
      </div>

      {/* Bookmarked Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Bookmarked Sessions ({bookmarkedSessions.length})
        </h2>
        {bookmarkedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => openModal('session', session.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No bookmarked sessions yet. Go to the Sessions tab to bookmark some!
          </div>
        )}
      </div>

      {/* Rejected Speakers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Rejected Speakers ({rejectedSpeakers.length})
        </h2>
        {rejectedSpeakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedSpeakers.map(speaker => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onClick={() => openModal('speaker', speaker.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No rejected speakers.
          </div>
        )}
      </div>

      {/* Rejected Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Rejected Sessions ({rejectedSessions.length})
        </h2>
        {rejectedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => openModal('session', session.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No rejected sessions.
          </div>
        )}
      </div>
    </div>
  );
} 