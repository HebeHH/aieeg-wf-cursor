'use client';

import { EnhancedSpeakerWithBookmarks } from '../types/ui';
import { getPositionColor, getFieldColor } from '../utils/positionColors';
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
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {speaker.fullName}
            </h3>
            <div className="text-base text-gray-700 font-medium">
              <span className="text-gray-500 text-sm">Company:</span> {speaker.company}
              {speaker.title && (
                <>
                  <br />
                  <span className="text-gray-500 text-sm">Title:</span> {speaker.title}
                </>
              )}
            </div>
          </div>
          {speaker.isTopSpeaker && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
              ⭐ Top
            </span>
          )}
        </div>
        
        <div className="mb-3">
          <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getFieldColor(speaker.field)}`}>
            {speaker.field}
          </span>
        </div>
        
        {speaker.bio && (
          <div className="mb-3">
            <div className="text-sm text-gray-500 font-medium mb-1">Bio:</div>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
              {speaker.bio}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {speaker.position.map((position, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full font-medium ${getPositionColor(position)}`}
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
            className={`px-2 py-1 text-xs rounded transition-colors ${
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
            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 