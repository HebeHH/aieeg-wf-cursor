'use client';

import { EnhancedSessionWithBookmarks } from '../types/ui';
import { getPositionColor, getTrackColor, getLevelColor, getScopeColor } from '../utils/positionColors';
import { formatSessionDate } from '../utils/dateUtils';
import { getSessionCompany } from '../utils/sessionUtils';
import { useConference } from '../contexts/ConferenceContext';

interface SessionCardProps {
  session: EnhancedSessionWithBookmarks;
  onClick: () => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const { toggleSessionBookmark, rejectSession, fullData } = useConference();

  const { day, time } = formatSessionDate(session.startsAt, session.endsAt);
  const sessionCompany = fullData ? getSessionCompany(session, fullData) : 'Unknown';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={onClick} className="mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 pr-2">
              {session.title}
            </h3>
          </div>
          {session["Assigned Track"] && (
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${getTrackColor(session["Assigned Track"])}`}>
              {session["Assigned Track"]}
            </span>
          )}
        </div>
        
        <div className="mb-3">
          <span className="text-gray-500 text-sm font-medium">Company:</span>
          <span className="text-gray-700 font-medium ml-1">{sessionCompany}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {session.Level && (
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${getLevelColor(session.Level)}`}>
              {session.Level}
            </span>
          )}
          {session.Scope && (
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${getScopeColor(session.Scope)}`}>
              {session.Scope}
            </span>
          )}
        </div>
        
        <div className="mb-2">
          <div className="text-sm">
            <span className="text-gray-500 font-medium">When:</span>
            <span className="text-gray-700 font-medium ml-1">{day}</span>
            <span className="text-gray-500 mx-2">•</span>
            <span className="text-gray-700 font-medium">{time}</span>
          </div>
          {session.Room && (
            <div className="text-sm mt-1">
              <span className="text-gray-500 font-medium">Room:</span>
              <span className="text-gray-700 font-medium ml-1">{session.Room}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {session.speakerPositions.slice(0, 3).map((position, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full font-medium ${getPositionColor(position)}`}
            >
              {position}
            </span>
          ))}
          {session.speakerPositions.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
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
            className={`px-2 py-1 text-xs rounded transition-colors ${
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
            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 