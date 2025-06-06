# FullData.json Interface Documentation

## Overview

`fullData.json` is the final, comprehensive dataset that combines session data from multiple sources and enhances speaker information with AI-extracted professional details.

## File Location

- **Path**: `public/aiengdata/fullData.json`
- **Generated by**: `src/app/setup/combineData.ts`
- **TypeScript Types**: `src/app/types/conference.ts`

## Data Structure

```typescript
interface FullData {
  rooms: WebsiteRoom[];
  sessions: CombinedSession[];
  speakers: EnhancedSpeaker[];
}
```

## Top-Level Properties

### `rooms: WebsiteRoom[]`
Array of conference rooms/venues.

```typescript
interface WebsiteRoom {
  id: string;        // Unique room identifier
  name: string;      // Room name (e.g., "Main Stage", "Workshop Room A")
  sort: number;      // Display order
}
```

### `sessions: CombinedSession[]`
Array of conference sessions with merged data from both `singleList.json` and `website.json`.

```typescript
interface CombinedSession {
  // From website.json
  id: string;
  title: string;
  description: string;
  startsAt: string;              // ISO datetime
  endsAt: string;                // ISO datetime
  isPlenumSession: boolean;
  speakers: string[];            // Array of speaker IDs
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
  "Session Format": string;      // e.g., "Talk", "Workshop", "Panel"
  "Level": string;               // e.g., "Beginner", "Intermediate", "Advanced"
  "Scope": string;               // Session scope/category
  "Assigned Track": string;      // Conference track
  "Room": string;                // Room name (string format)
  "Speakers": string;            // Speaker names (comma-separated string)
  "Companies": string;           // Company names (comma-separated string)
  "Company Domains": string;     // Company domains (comma-separated string)
}
```

### `speakers: EnhancedSpeaker[]`
Array of speakers with original data plus AI-extracted professional information.

```typescript
interface EnhancedSpeaker {
  // Original speaker data from website.json
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: SpeakerLink[];
  sessions: string[];            // Array of session IDs
  fullName: string;
  categoryItems: CategoryItem[];
  questionAnswers: QuestionAnswer[];
  
  // AI-enhanced professional information
  company: string;               // Current company name
  title: string;                 // Job title
  position: Position[];          // Array of position classifications
  field: Field;                  // Professional field
}
```

## Enhanced Speaker Fields (AI-Generated)

### `position: Position[]`
Array of position classifications. Possible values:
- `'CEO'`
- `'CTO'`
- `'founder'`
- `'Director/Head of Department'`
- `'VP'`
- `'Senior Engineer'`
- `'Engineer'`
- `'Founder'`
- `'Product Manager/Lead'`
- `'Other High-Level'`
- `'Other Mid-Level'`
- `'Other Low-Level'`

### `field: Field`
Professional field classification. Possible values:
- `'AI engineering'`
- `'Software Engineering'`
- `'Research'`
- `'Developer Experience'`
- `'Marketing/Sales'`
- `'Product Management'`
- `'Engineering'`
- `'Data science'`
- `'Investor'`

## Supporting Interfaces

### `CategoryItem`
```typescript
interface CategoryItem {
  id: string;
  name: string;
  categoryId: string;
  sort: number;
}
```

### `QuestionAnswer`
```typescript
interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  sort: number;
  answerExtra: string;
}
```

### `SpeakerLink`
```typescript
interface SpeakerLink {
  title: string;      // Link title (e.g., "LinkedIn", "Twitter")
  url: string;        // Full URL
  linkType: string;   // Type of link
}
```

## Data Sources

1. **`singleList.json`**: 263 sessions with metadata
2. **`website.json`**: 214 sessions, 245 speakers, 35 rooms
3. **Gemini API**: Professional information for all speakers

## Data Processing

1. **Session Merging**: Sessions matched by `Session ID` (singleList) ↔ `id` (website)
2. **Speaker Enhancement**: Each speaker processed through Gemini API for professional details
3. **Data Validation**: All fields typed and validated according to TypeScript interfaces

## Usage Examples

```typescript
import { FullData } from '@/types/conference';

// Load the data
const fullData: FullData = await import('public/aiengdata/fullData.json');

// Access sessions
const sessions = fullData.sessions;
const aiEngineeringSessions = sessions.filter(s => 
  s["Assigned Track"].includes("AI")
);

// Access enhanced speakers
const speakers = fullData.speakers;
const ceos = speakers.filter(s => 
  s.position.includes('CEO')
);

// Access rooms
const rooms = fullData.rooms;
const mainStage = rooms.find(r => r.name === "Main Stage");
```

## File Size & Performance

- **Estimated size**: ~2-3MB (depending on speaker bio lengths)
- **Sessions**: 214 combined sessions
- **Speakers**: 245 enhanced speakers with AI data
- **Rooms**: 35 conference rooms

## Related Files

- **Source**: `public/aiengdata/singleList.json`, `public/aiengdata/website.json`
- **Intermediate**: `public/aiengdata/combinedData.json`, `public/aiengdata/speakerData.json`
- **Types**: `src/app/types/conference.ts`
- **Generator**: `src/app/setup/combineData.ts` 