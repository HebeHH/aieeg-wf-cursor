'use client';

import { EnhancedSessionWithBookmarks } from '../types/ui';
import { getPositionColor, getTrackColor } from '../utils/positionColors';
import { formatSessionDate } from '../utils/dateUtils';
import { useConference } from '../contexts/ConferenceContext';

interface SessionCardProps {
  session: EnhancedSessionWithBookmarks;
  onClick: () => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const { toggleSessionBookmark, rejectSession } = useConference();

  const { day, time } = formatSessionDate(session.startsAt, session.endsAt);
  const companies = session.Companies ? session.Companies.split(',').map(c => c.trim()) : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={onClick} className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
            {session.title}
          </h3>
          {session["Assigned Track"] && (
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getTrackColor(session["Assigned Track"])}`}>
              {session["Assigned Track"]}
            </span>
          )}
        </div>
        
        {companies.length > 0 && (
          <div className="text-sm text-gray-600 mb-2">
            {companies.join(', ')}
          </div>
        )}
        
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">{session.Level}</span>
          {session.Scope && <span> | {session.Scope}</span>}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">{day}</span> | {time}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {session.speakerPositions.slice(0, 3).map((position, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${getPositionColor(position)}`}
            >
              {position}
            </span>
          ))}
          {session.speakerPositions.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              +{session.speakerPositions.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex gap-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSessionBookmark(session.id);
            }}
            className={`px-2 py-1 text-xs rounded ${
              session.bookmarked || session.speakerBookmarked
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {session.bookmarked || session.speakerBookmarked ? '★' : '☆'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              rejectSession(session.id);
            }}
            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 