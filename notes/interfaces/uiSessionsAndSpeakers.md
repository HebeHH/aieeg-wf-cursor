# UI Sessions and Speakers Documentation

## Data Management

### Data Storage and Access
- Conference data is stored in `public/aiengdata/fullData.json`
- Data is loaded and managed through the `ConferenceContext` provider
- Two main data arrays are maintained:
  - `fullData`: Complete dataset containing all sessions and speakers
  - `active` arrays: Filtered versions excluding rejected items
- Bookmark/rejection data is persisted in localStorage under the key 'conference-bookmarks'

### Data Structure

#### Base Types
```typescript
// Position and Field enums
type Position = 'CEO' | 'CTO' | 'founder' | 'Director/Head of Department' | 'VP' | 
                'Senior Engineer' | 'Engineer' | 'Founder' | 'Product Manager/Lead' | 
                'Other High-Level' | 'Other Mid-Level' | 'Other Low-Level';

type Field = 'AI engineering' | 'Software Engineering' | 'Research' | 
             'Developer Experience' | 'Marketing/Sales' | 'Product Management' | 
             'Engineering' | 'Data science' | 'Investor';

type BookmarkStatus = 'bookmarked' | 'rejected' | 'neither';

interface CategoryItem {
  id: string;
  name: string;
  categoryId: string;
  sort: number;
}

interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  sort: number;
  answerExtra: string;
}

interface SpeakerLink {
  title: string;      // Link title (e.g., "LinkedIn", "Twitter")
  url: string;        // Full URL
  linkType: string;   // Type of link
}
```

#### Core Data Types
```typescript
interface CombinedSession {
  // From website.json
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isPlenumSession: boolean;
  speakers: string[];
  roomId: string;
  isConfirmed: boolean;
  categoryItems: CategoryItem[];
  isInformed: boolean;
  isServiceSession: boolean;
  liveUrl: string;
  questionAnswers: QuestionAnswer[];
  recordingUrl: string;
  status: string;
  
  // From singleList.json
  "Session Format": string;
  "Level": string;
  "Scope": string;
  "Assigned Track": string;
  "Room": string;
  "Speakers": string;
  "Companies": string;
  "Company Domains": string;
}

interface EnhancedSpeaker {
  // Original speaker data
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: SpeakerLink[];
  sessions: string[];
  fullName: string;
  categoryItems: CategoryItem[];
  questionAnswers: QuestionAnswer[];
  
  // Enhanced fields from AI
  company: string;
  title: string;
  position: Position[];
  field: Field;
}
```

#### UI-Enhanced Types
```typescript
interface EnhancedSessionWithBookmarks extends CombinedSession {
  bookmarked: boolean;
  speakerBookmarked: boolean;
  speakerPositions: Position[];
}

interface EnhancedSpeakerWithBookmarks extends EnhancedSpeaker {
  bookmarked: boolean;
}

interface SpeakerFilters {
  title: string[];
  position: Position[];
  field: string[];
  company: string[];
  bookmarkStatus: BookmarkStatus[];
  topSpeakersOnly: boolean;
  bioSearch: string;
  nameSearch: string;
}

interface SessionFilters {
  speakerPosition: Position[];
  companies: string[];
  bookmarkStatus: BookmarkStatus[];
  assignedTrack: string[];
  day: string[];
  level: string[];
  scope: string[];
  room: string[];
  timeFrom: string;
  timeTo: string;
  companySearch: string;
  titleDescriptionSearch: string;
}

interface BookmarkData {
  speakerBookmarks: string[];
  sessionBookmarks: string[];
  speakerRejections: string[];
  sessionRejections: string[];
}
```

### Bookmark and Rejection Logic
- Speakers:
  - Bookmarking a speaker marks them as bookmarked
  - Rejecting a speaker removes them from active list
  - If a rejected speaker is a top speaker, their sessions are also filtered out
- Sessions:
  - Can be bookmarked directly or via speaker bookmark
  - Rejection removes from active list
  - Sessions inherit speaker bookmarks (speakerBookmarked property)

## Components

### Core Components
1. **SpeakerCard**
   - Compact view of speaker information
   - Shows: name, company, title, bio preview, positions
   - Interactive: bookmark/reject buttons
   - Clickable to open full modal

2. **SessionCard**
   - Compact view of session information
   - Shows: title, track, time, room, speaker positions
   - Interactive: bookmark/reject buttons
   - Clickable to open full modal

3. **SpeakerModal**
   - Detailed speaker view
   - Full bio, links, sessions list
   - Interactive: bookmark/reject buttons
   - Links to related session modals

4. **SessionModal**
   - Detailed session view
   - Full description, time, track, room
   - Speaker list with positions
   - Interactive: bookmark/reject buttons
   - Links to related speaker modals

### Tab Components
1. **SpeakersTab**
   - Manages speaker filtering and display
   - Filter options:
     - Title
     - Position
     - Field
     - Company (top 25 most frequent)
     - Bookmark status
     - Top speakers only
     - Bio/name search
   - Bulk actions: Bookmark All, Reject All

2. **SessionsTab**
   - Manages session filtering and display
   - Filter options:
     - Speaker position
     - Companies
     - Bookmark status
     - Track
     - Day
     - Level
     - Scope
     - Room
     - Time range
     - Company/title/description search
   - Bulk actions: Bookmark All, Reject All

## Context Providers

### ConferenceContext
- Central data management
- Provides:
  ```typescript
  interface ConferenceContextType {
    fullData: FullData | null;
    activeSpeakers: EnhancedSpeakerWithBookmarks[];
    activeSessions: EnhancedSessionWithBookmarks[];
    bookmarkData: BookmarkData;
    loading: boolean;
    error: string | null;
    toggleSpeakerBookmark: (speakerId: string) => void;
    toggleSessionBookmark: (sessionId: string) => void;
    rejectSpeaker: (speakerId: string) => void;
    rejectSession: (sessionId: string) => void;
    bookmarkAllSpeakers: (speakerIds: string[]) => void;
    rejectAllSpeakers: (speakerIds: string[]) => void;
    bookmarkAllSessions: (sessionIds: string[]) => void;
    rejectAllSessions: (sessionIds: string[]) => void;
  }
  ```

### ModalContext
- Manages modal display and positioning
- Handles multiple open modals
- Provides stacking and positioning logic
- Supports speaker/session modal types

## Utility Functions

### sessionUtils
- `getSessionCompany`: Extracts company info from session or speakers
- `formatSessionDate`: Formats session dates into day and time
- `isTimeInRange`: Checks if session time is within filter range

### positionColors
- `getPositionColor`: Returns Tailwind classes for position tags
- `getFieldColor`: Returns Tailwind classes for field tags

## Reusable Components

### MultiSelect
- Used for all filter dropdowns
- Supports single/multiple selection
- Custom styling matching UI theme

## Important Notes for Development

1. **Data Flow**
   - All data modifications go through ConferenceContext
   - Local storage syncs automatically with context changes
   - Active arrays are derived from full data + bookmark data

2. **Modal System**
   - Modals can be stacked and interlinked
   - Speaker modals appear on right, session modals on left
   - Each modal maintains its own scroll position

3. **Filter System**
   - Each tab maintains independent filter state
   - Filters are combined with AND logic
   - Some filters (like companies) are limited to prevent overwhelming UI

4. **Performance Considerations**
   - Heavy use of useMemo for filtered lists
   - Scroll handling is debounced
   - Filter options are cached until data changes 