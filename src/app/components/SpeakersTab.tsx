'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import { SpeakerFilters, BookmarkStatus } from '../types/ui';
import { Position } from '../types/conference';
import SpeakerCard from './SpeakerCard';
import MultiSelect from './MultiSelect';

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
  const { openModal } = useModal();
  const [filters, setFilters] = useState<SpeakerFilters>(initialFilters);
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
      {/* Sticky Expandable Filters */}
      <div className="sticky top-0 z-20">
        <div className={`transition-all duration-300 ${filtersExpanded ? 'shadow-sm bg-white border border-gray-200 rounded-b-lg' : 'bg-white border-b border-gray-200'}`}
             style={{ borderTopLeftRadius: filtersExpanded ? '0.5rem' : 0, borderTopRightRadius: filtersExpanded ? '0.5rem' : 0 }}>
          <div className="flex items-center justify-between px-6 py-3 cursor-pointer select-none" onClick={handleToggleFilters}
               onTransitionEnd={() => console.log('Transition ended', { filtersExpanded })}>
            <span className="text-lg font-medium text-gray-900">Filters</span>
            <span className={`transform transition-transform ${filtersExpanded ? '' : 'rotate-180'}`}>{/* Chevron Down SVG */}
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {filtersExpanded && (
            <div className="p-6 pt-0 space-y-6">
              {/* Filters content (copied from original) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Filter Speakers</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name Search</label>
                      <input
                        type="text"
                        value={filters.nameSearch}
                        onChange={(e) => setFilters(prev => ({ ...prev, nameSearch: e.target.value }))}
                        placeholder="Search speaker names..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio Search</label>
                      <input
                        type="text"
                        value={filters.bioSearch}
                        onChange={(e) => setFilters(prev => ({ ...prev, bioSearch: e.target.value }))}
                        placeholder="Search speaker bios..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                {/* Multiselect Filters */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MultiSelect
                      label="Title"
                      options={filterOptions.titles}
                      value={filters.title}
                      onChange={(value) => setFilters(prev => ({ ...prev, title: value }))}
                      placeholder="Choose titles..."
                    />
                    <MultiSelect
                      label="Position"
                      options={filterOptions.positions}
                      value={filters.position}
                      onChange={(value) => setFilters(prev => ({ ...prev, position: value as Position[] }))}
                      placeholder="Choose positions..."
                    />
                    <MultiSelect
                      label="Field"
                      options={filterOptions.fields}
                      value={filters.field}
                      onChange={(value) => setFilters(prev => ({ ...prev, field: value }))}
                      placeholder="Choose fields..."
                    />
                    <MultiSelect
                      label="Company"
                      options={filterOptions.companies}
                      value={filters.company}
                      onChange={(value) => setFilters(prev => ({ ...prev, company: value }))}
                      placeholder="Choose companies..."
                    />
                  </div>
                </div>
                {/* Additional Filters */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Additional Options</h4>
                  <div className="flex flex-wrap gap-6 items-start">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.topSpeakersOnly}
                        onChange={(e) => setFilters(prev => ({ ...prev, topSpeakersOnly: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">Top Speakers Only</span>
                    </label>
                    <MultiSelect
                      label="Bookmark Status"
                      options={['bookmarked', 'neither'] as BookmarkStatus[]}
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
              Speakers ({filteredSpeakers.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleBookmarkAll}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Bookmark All ({filteredSpeakers.length})
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Reject All ({filteredSpeakers.length})
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpeakers.map(speaker => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                onClick={() => openModal('speaker', speaker.id)}
              />
            ))}
          </div>
          {filteredSpeakers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No speakers found</div>
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