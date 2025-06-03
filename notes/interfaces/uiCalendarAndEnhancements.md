# UI Calendar and Enhancements Documentation

## Calendar Feature

### Overview
The Calendar tab provides a time-based view of conference sessions with advanced filtering capabilities and a maximum display limit of 40 events.

### Components

#### CalendarTab
- Main container component for calendar functionality
- Manages filters, event grouping, and display logic
- Implements mobile-responsive design

```typescript
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
```

#### CalendarEventCard
- Compact session display optimized for calendar view
- Color-coded by Level (background) and Scope (border)
- Interactive buttons: bookmark, reject, hide, add to calendar

### Calendar Configuration
1. **Day Selection**: Filter by conference day
2. **Room Selection**: Filter by specific room
3. **Session Display**:
   - All Sessions
   - Bookmarks Only
   - Shows total count and warns if exceeds MAX_EVENTS (40)
4. **Additional Filters**:
   - Speaker Position
   - Company
   - Track
   - Level
   - Scope

### Visual Styling
- Uses pastel color scheme
- Color coding:
  - Background color indicates Level
  - Border color indicates Scope
- Includes legend for color meanings
- Mobile-optimized layout

## Add to Calendar Integration

### Google Calendar Integration
Located in `calendarUtils.ts`:

```typescript
interface CalendarUrlParams {
  action: string;
  text: string;
  details: string;
  location: string;
  dates: string;
}
```

Implementation available in:
- SessionCard (compact button)
- SessionModal (full-width button)
- CalendarEventCard (compact button)

## Mobile Responsiveness

### Modal Positioning
- Desktop: Left/right positioning for session/speaker modals
- Mobile: Centered positioning for all modals
- Implemented through `isMobile` state in ModalManager

```typescript
interface ModalPosition {
  left?: string;
  right?: string;
  top: string;
}
```

### Responsive Layouts
- Grid adjustments for different screen sizes
- Collapsible filters section
- Touch-friendly button spacing
- Optimized card layouts for mobile viewing

## Rejected Items Management

### YouTab Enhancements
- Added sections for rejected speakers and sessions
- Unreject functionality
- Integration with bookmark system

### Rejection Logic
```typescript
interface BookmarkData {
  speakerBookmarks: string[];
  sessionBookmarks: string[];
  speakerRejections: string[];
  sessionRejections: string[];
}
```

- Rejecting a speaker/session removes it from active list
- Bookmarking a rejected item automatically unrejects it
- Rejection state persists in localStorage

## Component Integration

### Shared Functionality
- Consistent color schemes across components
- Reusable filter components
- Common button layouts and interactions

### State Management
- Uses ConferenceContext for data management
- ModalContext for modal handling
- Local state for filters and UI controls

## Performance Considerations

### Optimization Techniques
1. Memoization of filtered lists
2. Efficient event grouping
3. Lazy loading of modal content
4. Debounced filter updates

### Mobile Performance
- Reduced animations on mobile
- Optimized render cycles
- Efficient DOM updates

## Development Guidelines

### Adding New Features
1. Maintain consistent color schemes
2. Follow existing mobile-first patterns
3. Reuse existing components when possible
4. Implement proper type safety

### Code Organization
- Utility functions in dedicated files
- Shared interfaces in types directory
- Component-specific types with components
- Context providers for global state

### Best Practices
1. Use TypeScript interfaces for props
2. Implement proper error handling
3. Follow existing naming conventions
4. Maintain mobile-first approach
5. Document complex logic
6. Use existing color utilities

## Testing Considerations
- Test mobile breakpoints
- Verify calendar date handling
- Check filter combinations
- Validate modal interactions
- Ensure proper error states
- Verify persistence logic 