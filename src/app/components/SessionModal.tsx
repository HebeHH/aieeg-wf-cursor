'use client';

import { useConference } from '../contexts/ConferenceContext';
import { getPositionColor, getTrackColor } from '../utils/positionColors';
import { formatSessionDate } from '../utils/dateUtils';

interface SessionModalProps {
  sessionId: string | null;
  onClose: () => void;
}

export default function SessionModal({ sessionId, onClose }: SessionModalProps) {
  const { fullData, bookmarkData, toggleSessionBookmark, rejectSession } = useConference();

  if (!sessionId || !fullData) return null;

  const session = fullData.sessions.find(s => s.id === sessionId);
  if (!session) return null;

  const isBookmarked = bookmarkData.sessionBookmarks.includes(sessionId);
  const { day, time } = formatSessionDate(session.startsAt, session.endsAt);
  const companies = session.Companies ? session.Companies.split(',').map(c => c.trim()) : [];
  const companyDomains = session["Company Domains"] ? session["Company Domains"].split(',').map(d => d.trim()) : [];

  // Get session speakers
  const sessionSpeakers = session.speakers.map(speakerId => 
    fullData.speakers.find(s => s.id === speakerId)
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {session.title}
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {session["Assigned Track"] && (
                  <span className={`text-sm px-3 py-1 rounded-full ${getTrackColor(session["Assigned Track"])}`}>
                    {session["Assigned Track"]}
                  </span>
                )}
                <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {session.Level}
                </span>
                {session.Scope && (
                  <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {session.Scope}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Companies */}
          {companies.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Companies: </span>
              <span className="text-gray-900">{companies.join(', ')}</span>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{session.description}</p>
            </div>
          )}

          {/* Company Domains */}
          {companyDomains.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Links</h3>
              <div className="space-y-2">
                {companyDomains.map((domain, index) => (
                  <a
                    key={index}
                    href={domain.startsWith('http') ? domain : `https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-purple-600 hover:text-purple-800 underline"
                  >
                    {domain}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Session Details */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Room: </span>
                <span className="text-gray-900">{session.Room}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Time: </span>
                <span className="text-gray-900">{day} | {time}</span>
              </div>
            </div>
          </div>

          {/* Speakers */}
          {sessionSpeakers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Speakers</h3>
              <div className="space-y-2">
                {sessionSpeakers.map(speaker => (
                  <div key={speaker?.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-purple-600">{speaker?.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {speaker?.company} - {speaker?.title}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {speaker?.position.map((position, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full ${getPositionColor(position)}`}
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleSessionBookmark(session.id)}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            </button>
            <button
              onClick={() => rejectSession(session.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 