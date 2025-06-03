'use client';

import { EnhancedSpeakerWithBookmarks } from '../types/ui';
import { getPositionColor } from '../utils/positionColors';
import { useConference } from '../contexts/ConferenceContext';

interface SpeakerCardProps {
  speaker: EnhancedSpeakerWithBookmarks;
  onClick: () => void;
}

export default function SpeakerCard({ speaker, onClick }: SpeakerCardProps) {
  const { toggleSpeakerBookmark, rejectSpeaker } = useConference();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={onClick} className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {speaker.fullName}
          </h3>
          {speaker.isTopSpeaker && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              ⭐ Top
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">{speaker.company}</span>
          {speaker.title && <span>, {speaker.title}</span>}
        </div>
        
        {speaker.bio && (
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {speaker.bio}
          </p>
        )}
        
        <div className="text-sm text-gray-600 mb-2">
          {speaker.field}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {speaker.position.map((position, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${getPositionColor(position)}`}
            >
              {position}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSpeakerBookmark(speaker.id);
            }}
            className={`px-2 py-1 text-xs rounded ${
              speaker.bookmarked
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {speaker.bookmarked ? '★' : '☆'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              rejectSpeaker(speaker.id);
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