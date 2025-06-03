'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import { getPositionColor, getFieldColor } from '../utils/positionColors';

interface SpeakerModalProps {
  modalId: string;
  speakerId: string | null;
  onClose: () => void;
}

export default function SpeakerModal({ modalId, speakerId, onClose }: SpeakerModalProps) {
  const { fullData, bookmarkData, toggleSpeakerBookmark, rejectSpeaker } = useConference();
  const { openModal, getModalPosition } = useModal();

  if (!speakerId || !fullData) return null;

  const speaker = fullData.speakers.find(s => s.id === speakerId);
  if (!speaker) return null;

  const isBookmarked = bookmarkData.speakerBookmarks.includes(speakerId);
  const position = getModalPosition(modalId);

  // Get speaker's sessions
  const speakerSessions = fullData.sessions.filter(session => 
    session.speakers.includes(speakerId)
  );

  const modalStyle = position 
    ? {
        position: 'absolute' as const,
        left: position.left,
        right: position.right,
        top: position.top,
        zIndex: 60,
      }
    : {
        position: 'absolute' as const,
        left: '50px',
        right: '50px',
        top: '50px',
        zIndex: 60,
      };

  return (
    <div 
      className="bg-white rounded-lg shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
      style={{
        ...modalStyle,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            {speaker.profilePicture && (
              <Image
                src={speaker.profilePicture}
                alt={speaker.fullName}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {speaker.fullName}
              </h2>
              {speaker.isTopSpeaker && (
                <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  ⭐ Top Speaker
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

        {/* Company and Title */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900">
            {speaker.company}
          </div>
          <div className="text-gray-600">
            {speaker.title}
          </div>
        </div>

        {/* Field */}
        <div className="mb-6">
          <span className="text-sm font-medium text-gray-700 mr-2">Field:</span>
          <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getFieldColor(speaker.field)}`}>
            {speaker.field}
          </span>
        </div>

        {/* Bio */}
        {speaker.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
            <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
          </div>
        )}

        {/* Positions */}
        <div className="mb-6">
          <span className="text-sm font-medium text-gray-700">Positions: </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {speaker.position.map((position, index) => (
              <span
                key={index}
                className={`text-sm px-3 py-1 rounded-full font-medium ${getPositionColor(position)}`}
              >
                {position}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        {speaker.links && speaker.links.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
            <div className="space-y-2">
              {speaker.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-purple-600 hover:text-purple-800 underline"
                >
                  {link.title} ({link.linkType})
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        {speakerSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions</h3>
            <div className="space-y-2">
              {speakerSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => openModal('session', session.id)}
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-purple-600">{session.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(session.startsAt).toLocaleDateString()} - {session["Assigned Track"]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleSpeakerBookmark(speaker.id)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          </button>
          <button
            onClick={() => rejectSpeaker(speaker.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
} 