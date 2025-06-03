import { EnhancedSessionWithBookmarks } from '../types/ui';
import { getTrackColor, getLevelColor, getScopeColor } from '../utils/positionColors';
import { getSessionCompany } from '../utils/sessionUtils';
import { generateGoogleCalendarUrl } from '../utils/calendarUtils';
import { useConference } from '../contexts/ConferenceContext';

interface CalendarEventCardProps {
  session: EnhancedSessionWithBookmarks & {
    height?: number;
    width?: number;
  };
  onClick: () => void;
  onHide: () => void;
}

export default function CalendarEventCard({ session, onClick, onHide }: CalendarEventCardProps) {
  const { toggleSessionBookmark, rejectSession, fullData } = useConference();

  const sessionCompany = fullData ? getSessionCompany(session, fullData) : 'Unknown';

  // Determine what content to show based on size - be more intelligent about space usage
  const hasGoodHeight = !session.height || session.height >= 60; // Enough height for multiple lines
  const hasGoodWidth = !session.width || session.width >= 160; // Reduced from 180 for mobile
  const hasExcellentHeight = !session.height || session.height >= 90; // Plenty of height for all content
  const hasExcellentWidth = !session.width || session.width >= 200; // Reduced from 220 for mobile
  
  // Show content based on available space
  const showAllContent = hasExcellentHeight && hasExcellentWidth;
  const showBasicContent = hasGoodHeight && hasGoodWidth;
  const showOnlyTitle = !hasGoodHeight || !hasGoodWidth;

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(generateGoogleCalendarUrl(session), '_blank');
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSessionBookmark(session.id);
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    rejectSession(session.id);
  };

  const handleHideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide();
  };

  // Get color classes - these functions return complete class strings like 'bg-green-100 text-green-800'
  const levelClasses = getLevelColor(session.Level);
  const scopeClasses = getScopeColor(session.Scope);
  
  // Extract background class from level
  const bgColorMatch = levelClasses.match(/bg-\w+-\d+/);
  const bgColor = bgColorMatch ? bgColorMatch[0] : 'bg-white';
  
  // Convert scope text color to border color
  const textColorMatch = scopeClasses.match(/text-(\w+-\d+)/);
  const borderColor = textColorMatch ? `border-${textColorMatch[1]}` : 'border-gray-200';

  return (
    <div 
      className={`${bgColor} ${borderColor} border-2 rounded-lg p-1 cursor-pointer transition-all duration-200 hover:shadow-md h-full flex flex-col justify-between text-xs overflow-hidden`}
      onClick={onClick}
    >
      {/* Header with title and buttons */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-medium text-xs leading-tight flex-1 pr-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: showOnlyTitle ? 1 : 2, WebkitBoxOrient: 'vertical' }}>
          {session.title}
        </h3>
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            onClick={handleBookmarkClick}
            className={`p-0.5 text-xs rounded transition-colors ${
              session.bookmarked || session.speakerBookmarked
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Bookmark"
          >
            {session.bookmarked || session.speakerBookmarked ? '★' : '☆'}
          </button>
          <button
            onClick={handleRejectClick}
            className="p-0.5 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            title="Reject"
          >
            ✕
          </button>
          <button
            onClick={handleCalendarClick}
            className="p-0.5 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            title="Add to Calendar"
          >
            📅
          </button>
          <button
            onClick={handleHideClick}
            className="p-0.5 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title="Hide"
          >
            👁️
          </button>
        </div>
      </div>

      {/* Content - show based on actual available space */}
      {!showOnlyTitle && (
        <div className="space-y-0.5 text-xs flex-1 overflow-hidden">
          {/* Show room if we have decent width */}
          {hasGoodWidth && (
            <div className="flex items-center gap-1">
              <span className="bg-gray-100 px-1 py-0.5 rounded text-xs truncate">{session.Room}</span>
            </div>
          )}
          
          {/* Show company if we have excellent space or at least good height with some width */}
          {(showAllContent || (hasExcellentHeight && hasGoodWidth)) && (
            <div className="text-gray-600 truncate">
              <span className="font-medium">Company:</span> {sessionCompany}
            </div>
          )}
          
          {/* Show track if we have good space */}
          {session["Assigned Track"] && showBasicContent && (
            <div>
              <span className={`inline-block px-1 py-0.5 rounded text-xs truncate ${getTrackColor(session["Assigned Track"])}`}>
                {session["Assigned Track"]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 