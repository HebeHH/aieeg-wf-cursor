import { useState, useMemo } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { useModal } from '../contexts/ModalContext';
import { formatSessionDate } from '../utils/dateUtils';
import { Position } from '../types/conference';
import MultiSelect from './MultiSelect';
import CalendarEventCard from './CalendarEventCard';
import { getLevelColor, getScopeColor } from '../utils/positionColors';

const MAX_EVENTS = 40;

interface CalendarFilters {
  speakerPosition: Position[];
  companies: string[];
  assignedTrack: string[];
  level: string[];
  scope: string[];
  day: string;
  room: string;
  bookmarksOnly: boolean;
}

const initialFilters: CalendarFilters = {
  speakerPosition: [],
  companies: [],
  assignedTrack: [],
  level: [],
  scope: [],
  day: '',
  room: '',
  bookmarksOnly: false,
};

export default function CalendarTab() {
  const { activeSessions, fullData, bookmarkData } = useConference();
  const { openModal } = useModal();
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [hiddenSessions, setHiddenSessions] = useState<Set<string>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const companies = [...new Set(activeSessions.flatMap(s => 
      s.Companies ? s.Companies.split(',').map(c => c.trim()) : []
    ).filter(Boolean))].sort();

    const assignedTracks = [...new Set(activeSessions.map(s => s["Assigned Track"]).filter(Boolean))];
    const levels = [...new Set(activeSessions.map(s => s.Level).filter(Boolean))];
    const scopes = [...new Set(activeSessions.map(s => s.Scope).filter(Boolean))];
    const rooms = [...new Set(activeSessions.map(s => s.Room).filter(Boolean))];
    const speakerPositions = [...new Set(activeSessions.flatMap(s => s.speakerPositions))];
    const days = [...new Set(activeSessions.map(s => formatSessionDate(s.startsAt, s.endsAt).day))];

    return { companies, assignedTracks, levels, scopes, rooms, speakerPositions, days };
  }, [activeSessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return activeSessions.filter(session => {
      if (hiddenSessions.has(session.id)) return false;

      // Day filter
      if (filters.day) {
        const { day } = formatSessionDate(session.startsAt, session.endsAt);
        if (day !== filters.day) return false;
      }

      // Room filter
      if (filters.room && session.Room !== filters.room) return false;

      // Bookmarks filter
      if (filters.bookmarksOnly && !session.bookmarked && !session.speakerBookmarked) return false;

      // Speaker position filter
      if (filters.speakerPosition.length > 0 && 
          !filters.speakerPosition.some(p => session.speakerPositions.includes(p))) {
        return false;
      }

      // Companies filter
      if (filters.companies.length > 0) {
        const sessionCompanies = session.Companies ? session.Companies.split(',').map(c => c.trim()) : [];
        if (!filters.companies.some(c => sessionCompanies.includes(c))) return false;
      }

      // Track filter
      if (filters.assignedTrack.length > 0 && 
          !filters.assignedTrack.includes(session["Assigned Track"])) {
        return false;
      }

      // Level filter
      if (filters.level.length > 0 && !filters.level.includes(session.Level)) return false;

      // Scope filter
      if (filters.scope.length > 0 && !filters.scope.includes(session.Scope)) return false;

      return true;
    }).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [activeSessions, filters, hiddenSessions]);

  // Group sessions by time slot for calendar view
  const calendarEvents = useMemo(() => {
    const events = filteredSessions.slice(0, MAX_EVENTS);
    const timeSlots: { [key: string]: typeof events } = {};

    events.forEach(session => {
      const { time } = formatSessionDate(session.startsAt, session.endsAt);
      if (!timeSlots[time]) timeSlots[time] = [];
      timeSlots[time].push(session);
    });

    return Object.entries(timeSlots).sort(([timeA], [timeB]) => {
      const [startA] = timeA.split(' - ');
      const [startB] = timeB.split(' - ');
      return startA.localeCompare(startB);
    });
  }, [filteredSessions]);

  const handleHideSession = (sessionId: string) => {
    setHiddenSessions(prev => new Set([...prev, sessionId]));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setHiddenSessions(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="sticky top-0 z-20 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div 
          className="flex items-center justify-between px-6 py-3 cursor-pointer"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <h3 className="text-lg font-medium text-gray-900">Calendar Configuration</h3>
          <span className={`transform transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>

        {filtersExpanded && (
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Day Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={filters.day}
                  onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Days</option>
                  {filterOptions.days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select
                  value={filters.room}
                  onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Rooms</option>
                  {filterOptions.rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>

              {/* Bookmark Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sessions to Show</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!filters.bookmarksOnly}
                      onChange={() => setFilters(prev => ({ ...prev, bookmarksOnly: false }))}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      All Sessions ({filteredSessions.length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={filters.bookmarksOnly}
                      onChange={() => setFilters(prev => ({ ...prev, bookmarksOnly: true }))}
                      className="text-purple-600"
                      disabled={filteredSessions.length > MAX_EVENTS}
                    />
                    <span className="text-sm text-gray-700">
                      Bookmarks Only ({filteredSessions.filter(s => s.bookmarked || s.speakerBookmarked).length})
                      {filteredSessions.length > MAX_EVENTS && (
                        <span className="ml-2 text-yellow-600" title="Too many events to display">⚠️</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {/* Other Filters */}
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
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear All Filters
              </button>
            </div>

            {/* Legend */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Level (Background)</h5>
                  <div className="space-y-1">
                    {filterOptions.levels.map(level => (
                      <div key={level} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${getLevelColor(level)}`} />
                        <span className="text-xs">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Scope (Border)</h5>
                  <div className="space-y-1">
                    {filterOptions.scopes.map(scope => (
                      <div key={scope} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 ${getScopeColor(scope)}`} />
                        <span className="text-xs">{scope}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {filters.day || 'All Days'} ({filteredSessions.length} events)
          </h2>

          {filteredSessions.length > MAX_EVENTS ? (
            <div className="text-yellow-600 mb-4 p-4 bg-yellow-50 rounded-lg">
              ⚠️ Too many events to display. Please use filters to show fewer than {MAX_EVENTS} events.
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No events match your filters.
            </div>
          ) : (
            <div className="space-y-6">
              {calendarEvents.map(([time, sessions]) => (
                <div key={time} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{time}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map(session => (
                      <CalendarEventCard
                        key={session.id}
                        session={session}
                        onClick={() => openModal('session', session.id)}
                        onHide={() => handleHideSession(session.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 