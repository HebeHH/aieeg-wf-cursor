'use client';

import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import SpeakerCard from './SpeakerCard';
import SessionCard from './SessionCard';

export default function YouTab() {
  const { activeSpeakers, activeSessions, fullData, bookmarkData } = useConference();
  const { openModal } = useModal();

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

  return (
    <div className="space-y-8">
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