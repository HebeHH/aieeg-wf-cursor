import { EnhancedSessionWithBookmarks } from '../types/ui';
import { getPositionColor, getTrackColor, getLevelColor, getScopeColor } from '../utils/positionColors';
import { formatSessionDate } from '../utils/dateUtils';
import { getSessionCompany } from '../utils/sessionUtils';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';
import { useConference } from '../contexts/ConferenceContext';

interface CalendarEventCardProps {
  session: EnhancedSessionWithBookmarks;
  onClick: () => void;
  onHide: () => void;
}

export default function CalendarEventCard({ session, onClick, onHide }: CalendarEventCardProps) {
  const { toggleSessionBookmark, rejectSession, fullData } = useConference();

  const { time } = formatSessionDate(session.startsAt, session.endsAt);
  const sessionCompany = fullData ? getSessionCompany(session, fullData) : 'Unknown';

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(generateGoogleCalendarUrl(session), '_blank');
  };

  return (
    <div 
      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:shadow-md`}
      style={{
        borderColor: getScopeColor(session.Scope).split(' ')[1].replace('text-', 'border-'),
        backgroundColor: getLevelColor(session.Level).split(' ')[1],
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm leading-tight flex-1 pr-2">
          {session.title}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSessionBookmark(session.id);
            }}
            className={`p-1 text-xs rounded transition-colors ${
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
            className="p-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            ✕
          </button>
          <button
            onClick={handleCalendarClick}
            className="p-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            title="Add to Calendar"
          >
            📅
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
            className="p-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Hide"
          >
            👁️
          </button>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Room:</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded">{session.Room}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Company:</span>
          <span>{sessionCompany}</span>
        </div>
        {session["Assigned Track"] && (
          <span className={`inline-block px-2 py-0.5 rounded ${getTrackColor(session["Assigned Track"])}`}>
            {session["Assigned Track"]}
          </span>
        )}
      </div>
    </div>
  );
} 