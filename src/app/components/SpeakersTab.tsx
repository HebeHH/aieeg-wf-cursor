'use client';

import { useState, useMemo } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { SpeakerFilters, BookmarkStatus } from '../types/ui';
import { Position } from '../types/conference';
import SpeakerCard from './SpeakerCard';
import SpeakerModal from './SpeakerModal';

const initialFilters: SpeakerFilters = {
  title: [],
  position: [],
  field: [],
  company: [],
  bookmarkStatus: [],
  topSpeakersOnly: false,
  bioSearch: '',
  nameSearch: ''
};

export default function SpeakersTab() {
  const { activeSpeakers, bookmarkAllSpeakers, rejectAllSpeakers } = useConference();
  const [filters, setFilters] = useState<SpeakerFilters>(initialFilters);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);

  // Get unique values for multiselect filters
  const filterOptions = useMemo(() => {
    const titles = [...new Set(activeSpeakers.map(s => s.title).filter(Boolean))];
    const positions = [...new Set(activeSpeakers.flatMap(s => s.position))];
    const fields = [...new Set(activeSpeakers.map(s => s.field).filter(Boolean))];
    const companies = [...new Set(activeSpeakers.map(s => s.company).filter(Boolean))]
      .sort((a, b) => {
        const countA = activeSpeakers.filter(s => s.company === a).length;
        const countB = activeSpeakers.filter(s => s.company === b).length;
        return countB - countA;
      })
      .slice(0, 25);

    return { titles, positions, fields, companies };
  }, [activeSpeakers]);

  // Filter speakers
  const filteredSpeakers = useMemo(() => {
    return activeSpeakers.filter(speaker => {
      // Title filter
      if (filters.title.length > 0 && !filters.title.includes(speaker.title)) {
        return false;
      }

      // Position filter
      if (filters.position.length > 0 && !filters.position.some(p => speaker.position.includes(p))) {
        return false;
      }

      // Field filter
      if (filters.field.length > 0 && !filters.field.includes(speaker.field)) {
        return false;
      }

      // Company filter
      if (filters.company.length > 0 && !filters.company.includes(speaker.company)) {
        return false;
      }

      // Bookmark status filter
      if (filters.bookmarkStatus.length > 0) {
        const isBookmarked = speaker.bookmarked;
        const statusMatches = filters.bookmarkStatus.some(status => {
          if (status === 'bookmarked') return isBookmarked;
          if (status === 'rejected') return false; // rejected speakers are already filtered out
          if (status === 'neither') return !isBookmarked;
          return false;
        });
        if (!statusMatches) return false;
      }

      // Top speakers filter
      if (filters.topSpeakersOnly && !speaker.isTopSpeaker) {
        return false;
      }

      // Bio search
      if (filters.bioSearch && !speaker.bio.toLowerCase().includes(filters.bioSearch.toLowerCase())) {
        return false;
      }

      // Name search
      if (filters.nameSearch && !speaker.fullName.toLowerCase().includes(filters.nameSearch.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [activeSpeakers, filters]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const handleBookmarkAll = () => {
    const speakerIds = filteredSpeakers.map(s => s.id);
    bookmarkAllSpeakers(speakerIds);
  };

  const handleRejectAll = () => {
    const speakerIds = filteredSpeakers.map(s => s.id);
    rejectAllSpeakers(speakerIds);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name Search</label>
              <input
                type="text"
                value={filters.nameSearch}
                onChange={(e) => setFilters(prev => ({ ...prev, nameSearch: e.target.value }))}
                placeholder="Search speaker names..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio Search</label>
              <input
                type="text"
                value={filters.bioSearch}
                onChange={(e) => setFilters(prev => ({ ...prev, bioSearch: e.target.value }))}
                placeholder="Search speaker bios..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Multiselect Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <select
                multiple
                value={filters.title}
                onChange={(e) => setFilters(prev => ({ ...prev, title: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                multiple
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: Array.from(e.target.selectedOptions, option => option.value) as Position[] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
              <select
                multiple
                value={filters.field}
                onChange={(e) => setFilters(prev => ({ ...prev, field: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select
                multiple
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: Array.from(e.target.selectedOptions, option => option.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                size={3}
              >
                {filterOptions.companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkbox and Status Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.topSpeakersOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, topSpeakersOnly: e.target.checked }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Top Speakers Only</span>
            </label>

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
              Bookmark All ({filteredSpeakers.length})
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reject All ({filteredSpeakers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredSpeakers.length} of {activeSpeakers.length} speakers
      </div>

      {/* Speaker Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpeakers.map(speaker => (
          <SpeakerCard
            key={speaker.id}
            speaker={speaker}
            onClick={() => setSelectedSpeaker(speaker.id)}
          />
        ))}
      </div>

      {/* Speaker Modal */}
      {selectedSpeaker && (
        <SpeakerModal
          speakerId={selectedSpeaker}
          onClose={() => setSelectedSpeaker(null)}
        />
      )}
    </div>
  );
} 