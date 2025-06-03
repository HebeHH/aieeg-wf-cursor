'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import { SessionFilters, BookmarkStatus } from '../types/ui';
import { formatSessionDate, isTimeInRange } from '../utils/dateUtils';
import { Position } from '../types/conference';
import SessionCard from './SessionCard';
import MultiSelect from './MultiSelect';

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
  const { activeSessions, fullData, bookmarkData, bookmarkAllSessions, rejectAllSessions } = useConference();
  const { openModal } = useModal();
  const [filters, setFilters] = useState<SessionFilters>(initialFilters);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const lastCollapseByScroll = useRef(false);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const expandedAt = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  // Collapse on scroll down, but only on actual scroll events
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      
      // If we're within 3 seconds of expanding, ignore scroll events
      if (now - expandedAt.current < 3000) {
        console.log('Ignoring scroll event during grace period');
        return;
      }

      console.log('Scroll event fired', {
        currentScrollY: window.scrollY,
        lastScrollY: lastScrollY.current,
        filtersExpanded,
        isScrolling: isScrolling.current,
        lastCollapseByScroll: lastCollapseByScroll.current
      });

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          // Set scrolling state
          isScrolling.current = true;
          
          // Clear any existing scroll timeout
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }
          
          // Set a new scroll timeout
          scrollTimeout.current = setTimeout(() => {
            console.log('Scroll ended');
            isScrolling.current = false;
          }, 150); // Adjust timeout as needed

          // Calculate scroll velocity (pixels per millisecond)
          const timeDelta = now - lastScrollTime.current;
          const scrollDelta = window.scrollY - lastScrollY.current;
          const scrollVelocity = Math.abs(scrollDelta / timeDelta);

          // Only collapse if scrolling down significantly (adjust these values as needed)
          const MINIMUM_SCROLL_DELTA = 50; // pixels
          const MINIMUM_SCROLL_VELOCITY = 0.5; // pixels per millisecond

          console.log('Scroll metrics', {
            scrollDelta,
            timeDelta,
            scrollVelocity,
            threshold: MINIMUM_SCROLL_VELOCITY
          });

          if (window.scrollY > lastScrollY.current && 
              filtersExpanded && 
              Math.abs(scrollDelta) > MINIMUM_SCROLL_DELTA &&
              scrollVelocity > MINIMUM_SCROLL_VELOCITY) {
            console.log('Collapsing due to scroll down');
            setFiltersExpanded(false);
            lastCollapseByScroll.current = true;
          }

          lastScrollY.current = window.scrollY;
          lastScrollTime.current = now;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [filtersExpanded]);

  // When user manually expands, reset scroll-collapse flag
  const handleToggleFilters = () => {
    console.log('Toggle clicked', {
      currentState: filtersExpanded,
      isScrolling: isScrolling.current,
      lastCollapseByScroll: lastCollapseByScroll.current,
      scrollY: window.scrollY
    });

    // If we're actively scrolling, don't allow expand
    if (!filtersExpanded && isScrolling.current) {
      console.log('Ignoring expand during scroll');
      return;
    }

    setFiltersExpanded((prev) => {
      const newState = !prev;
      console.log('Setting expanded state to:', newState);
      if (!prev) {
        lastCollapseByScroll.current = false;
        expandedAt.current = Date.now();
      }
      return newState;
    });
  };

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
    // If rejected status is selected, use full list instead of active list
    const sessionsToFilter = filters.bookmarkStatus.includes('rejected')
      ? (fullData?.sessions || []).map(session => {
          const sessionSpeakers = session.speakers.map(speakerId => 
            fullData?.speakers.find(s => s.id === speakerId)
          ).filter(Boolean);
          
          const speakerPositions: Position[] = sessionSpeakers.flatMap(speaker => 
            speaker?.position || []
          );
          
          const speakerBookmarked = sessionSpeakers.some(speaker => 
            speaker && bookmarkData.speakerBookmarks.includes(speaker.id)
          );

          return {
            ...session,
            bookmarked: bookmarkData.sessionBookmarks.includes(session.id),
            speakerBookmarked,
            speakerPositions
          };
        })
      : activeSessions;

    return sessionsToFilter.filter(session => {
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
        const isRejected = bookmarkData.sessionRejections.includes(session.id);
        const statusMatches = filters.bookmarkStatus.some(status => {
          if (status === 'bookmarked') return isBookmarked || isSpeakerBookmarked;
          if (status === 'rejected') return isRejected;
          if (status === 'neither') return !isBookmarked && !isSpeakerBookmarked && !isRejected;
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
        const titleMatch = session.title?.toLowerCase().includes(searchTerm) || false;
        const descriptionMatch = session.description?.toLowerCase().includes(searchTerm) || false;
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeSessions, filters, fullData, bookmarkData]);

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
      {/* Sticky Expandable Filters */}
      <div className="relative md:sticky md:top-20 z-20">
        <div 
          className={`transition-all duration-300 ${
            filtersExpanded ? 'shadow-sm bg-white border border-gray-200 rounded-b-lg' : 'bg-white border-b border-gray-200'
          }`}
          style={{ 
            borderTopLeftRadius: filtersExpanded ? '0.5rem' : 0, 
            borderTopRightRadius: filtersExpanded ? '0.5rem' : 0 
          }}
        >
          <div 
            className="flex items-center justify-between px-6 py-3 cursor-pointer select-none" 
            onClick={handleToggleFilters}
            onTransitionEnd={() => console.log('Transition ended', { filtersExpanded })}
          >
            <span className="text-lg font-medium text-gray-900">Filters</span>
            <span 
              className={`transform transition-transform ${filtersExpanded ? '' : 'rotate-180'}`}
            >
              <svg 
                width="24" 
                height="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-gray-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {filtersExpanded && (
            <div className="p-6 pt-0 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Filter Sessions</h3>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>

                {/* Search Filters */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Search</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Search</label>
                      <input
                        type="text"
                        value={filters.companySearch}
                        onChange={(e) => setFilters(prev => ({ ...prev, companySearch: e.target.value }))}
                        placeholder="Search companies..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title/Description Search</label>
                      <input
                        type="text"
                        value={filters.titleDescriptionSearch}
                        onChange={(e) => setFilters(prev => ({ ...prev, titleDescriptionSearch: e.target.value }))}
                        placeholder="Search titles and descriptions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Time Filter */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Time Range</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Time</label>
                      <input
                        type="time"
                        value={filters.timeFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeFrom: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Time</label>
                      <input
                        type="time"
                        value={filters.timeTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Multiselect Filters */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MultiSelect
                      label="Speaker Position"
                      options={filterOptions.speakerPositions}
                      value={filters.speakerPosition}
                      onChange={(value) => setFilters(prev => ({ ...prev, speakerPosition: value as Position[] }))}
                      placeholder="Choose positions..."
                    />

                    <MultiSelect
                      label="Company"
                      options={filterOptions.companies}
                      value={filters.companies}
                      onChange={(value) => setFilters(prev => ({ ...prev, companies: value }))}
                      placeholder="Choose companies..."
                    />

                    <MultiSelect
                      label="Track"
                      options={filterOptions.assignedTracks}
                      value={filters.assignedTrack}
                      onChange={(value) => setFilters(prev => ({ ...prev, assignedTrack: value }))}
                      placeholder="Choose tracks..."
                    />

                    <MultiSelect
                      label="Day"
                      options={['Tuesday', 'Wednesday', 'Thursday']}
                      value={filters.day}
                      onChange={(value) => setFilters(prev => ({ ...prev, day: value }))}
                      placeholder="Choose days..."
                    />

                    <MultiSelect
                      label="Level"
                      options={filterOptions.levels}
                      value={filters.level}
                      onChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
                      placeholder="Choose levels..."
                    />

                    <MultiSelect
                      label="Scope"
                      options={filterOptions.scopes}
                      value={filters.scope}
                      onChange={(value) => setFilters(prev => ({ ...prev, scope: value }))}
                      placeholder="Choose scopes..."
                    />

                    <MultiSelect
                      label="Room"
                      options={filterOptions.rooms}
                      value={filters.room}
                      onChange={(value) => setFilters(prev => ({ ...prev, room: value }))}
                      placeholder="Choose rooms..."
                    />

                    <MultiSelect
                      label="Bookmark Status"
                      options={['bookmarked', 'rejected', 'neither'] as BookmarkStatus[]}
                      value={filters.bookmarkStatus}
                      onChange={(value) => setFilters(prev => ({ ...prev, bookmarkStatus: value as BookmarkStatus[] }))}
                      placeholder="All statuses"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Sessions ({filteredSessions.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleBookmarkAll}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Bookmark All ({filteredSessions.length})
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Reject All ({filteredSessions.length})
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => openModal('session', session.id)}
              />
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No sessions found</div>
              <div className="text-gray-500 text-sm">
                Try adjusting your filters to see more results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 