'use client';

import { useState, useMemo } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { SessionFilters, BookmarkStatus } from '../types/ui';
import { formatSessionDate, isTimeInRange } from '../utils/dateUtils';
import { Position } from '../types/conference';
import SessionCard from './SessionCard';
import SessionModal from './SessionModal';

const initialFilters: SessionFilters = {
  speakerPosition: [],
  companies: [],
  bookmarkStatus: [],
  assignedTrack: [],
  day: [],
  level: [],
  scope: [],
  room: [],
  timeFrom: '',
  timeTo: '',
  companySearch: '',
  titleDescriptionSearch: ''
};

export default function SessionsTab() {
  const { activeSessions, bookmarkAllSessions, rejectAllSessions } = useConference();
  const [filters, setFilters] = useState<SessionFilters>(initialFilters);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Get unique values for multiselect filters
  const filterOptions = useMemo(() => {
    const companies = [...new Set(activeSessions.flatMap(s => 
      s.Companies ? s.Companies.split(',').map(c => c.trim()) : []
    ).filter(Boolean))]
      .sort((a, b) => {
        const countA = activeSessions.filter(s => s.Companies?.includes(a)).length;
        const countB = activeSessions.filter(s => s.Companies?.includes(b)).length;
        return countB - countA;
      })
      .slice(0, 25);

    const assignedTracks = [...new Set(activeSessions.map(s => s["Assigned Track"]).filter(Boolean))];
    const levels = [...new Set(activeSessions.map(s => s.Level).filter(Boolean))];
    const scopes = [...new Set(activeSessions.map(s => s.Scope).filter(Boolean))];
    const rooms = [...new Set(activeSessions.map(s => s.Room).filter(Boolean))];
    const speakerPositions = [...new Set(activeSessions.flatMap(s => s.speakerPositions))];

    return { companies, assignedTracks, levels, scopes, rooms, speakerPositions };
  }, [activeSessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return activeSessions.filter(session => {
      // Speaker position filter
      if (filters.speakerPosition.length > 0 && 
          !filters.speakerPosition.some(p => session.speakerPositions.includes(p))) {
        return false;
      }

      // Companies filter
      if (filters.companies.length > 0) {
        const sessionCompanies = session.Companies ? session.Companies.split(',').map(c => c.trim()) : [];
        if (!filters.companies.some(c => sessionCompanies.includes(c))) {
          return false;
        }
      }

      // Bookmark status filter
      if (filters.bookmarkStatus.length > 0) {
        const isBookmarked = session.bookmarked;
        const isSpeakerBookmarked = session.speakerBookmarked;
        const statusMatches = filters.bookmarkStatus.some(status => {
          if (status === 'bookmarked') return isBookmarked || isSpeakerBookmarked;
          if (status === 'rejected') return false; // rejected sessions are already filtered out
          if (status === 'neither') return !isBookmarked && !isSpeakerBookmarked;
          return false;
        });
        if (!statusMatches) return false;
      }

      // Assigned Track filter
      if (filters.assignedTrack.length > 0 && 
          !filters.assignedTrack.includes(session["Assigned Track"])) {
        return false;
      }

      // Day filter
      if (filters.day.length > 0) {
        const { day } = formatSessionDate(session.startsAt, session.endsAt);
        if (!filters.day.includes(day)) {
          return false;
        }
      }

      // Level filter
      if (filters.level.length > 0 && !filters.level.includes(session.Level)) {
        return false;
      }

      // Scope filter
      if (filters.scope.length > 0 && !filters.scope.includes(session.Scope)) {
        return false;
      }

      // Room filter
      if (filters.room.length > 0 && !filters.room.includes(session.Room)) {
        return false;
      }

      // Time range filter
      if ((filters.timeFrom || filters.timeTo) && 
          !isTimeInRange(session.startsAt, filters.timeFrom, filters.timeTo)) {
        return false;
      }

      // Company search
      if (filters.companySearch && session.Companies && 
          !session.Companies.toLowerCase().includes(filters.companySearch.toLowerCase())) {
        return false;
      }

      // Title/Description search
      if (filters.titleDescriptionSearch) {
        const searchTerm = filters.titleDescriptionSearch.toLowerCase();
        const titleMatch = session.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = session.description.toLowerCase().includes(searchTerm);
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeSessions, filters]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const handleBookmarkAll = () => {
    const sessionIds = filteredSessions.map(s => s.id);
    bookmarkAllSessions(sessionIds);
  };

  const handleRejectAll = () => {
    const sessionIds = filteredSessions.map(s => s.id);
    rejectAllSessions(sessionIds);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Search</label>
              <input
                type="text"
                value={filters.companySearch}
                onChange={(e) => setFilters(prev => ({ ...prev, companySearch: e.target.value }))}
                placeholder="Search companies..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title/Description Search</label>
              <input
                type="text"
                value={filters.titleDescriptionSearch}
                onChange={(e) => setFilters(prev => ({ ...prev, titleDescriptionSearch: e.target.value }))}
                placeholder="Search titles and descriptions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Time Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Time</label>
              <input
                type="time"
                value={filters.timeFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, timeFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Time</label>
              <input
                type="time"
                value={filters.timeTo}
                onChange={(e) => setFilters(prev => ({ ...prev, timeTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Multiselect Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Position</label>
              <select
                multiple
                value={filters.speakerPosition}
                onChange={(e) => setFilters(prev => ({ ...prev, speakerPosition: Array.from(e.target.selectedOptions, option => option.value) as Position[] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.speakerPositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Companies</label>
              <select
                multiple
                value={filters.companies}
                onChange={(e) => setFilters(prev => ({ ...prev, companies: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Track</label>
              <select
                multiple
                value={filters.assignedTrack}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTrack: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.assignedTracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                multiple
                value={filters.day}
                onChange={(e) => setFilters(prev => ({ ...prev, day: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="MULTIDAY">Multiday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                multiple
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
              <select
                multiple
                value={filters.scope}
                onChange={(e) => setFilters(prev => ({ ...prev, scope: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.scopes.map(scope => (
                  <option key={scope} value={scope}>{scope}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select
                multiple
                value={filters.room}
                onChange={(e) => setFilters(prev => ({ ...prev, room: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                value={filters.bookmarkStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, bookmarkStatus: Array.from(e.target.selectedOptions, option => option.value) as BookmarkStatus[] }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                <option value="bookmarked">Bookmarked</option>
                <option value="rejected">Rejected</option>
                <option value="neither">Neither</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
            <button
              onClick={handleBookmarkAll}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Bookmark All ({filteredSessions.length})
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reject All ({filteredSessions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredSessions.length} of {activeSessions.length} sessions
      </div>

      {/* Session Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            onClick={() => setSelectedSession(session.id)}
          />
        ))}
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <SessionModal
          sessionId={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
} 