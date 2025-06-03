'use client';

import { useConference } from '../contexts/ConferenceContext';
import SpeakerCard from './SpeakerCard';
import SessionCard from './SessionCard';

export default function YouTab() {
  const { activeSpeakers, activeSessions } = useConference();

  const bookmarkedSpeakers = activeSpeakers.filter(speaker => speaker.bookmarked);
  const bookmarkedSessions = activeSessions.filter(session => 
    session.bookmarked || session.speakerBookmarked
  );

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
                onClick={() => {}}
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
                onClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No bookmarked sessions yet. Go to the Sessions tab to bookmark some!
          </div>
        )}
      </div>
    </div>
  );
} 