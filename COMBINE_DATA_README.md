# CombineData Script

This script combines data from `singleList.json` and `website.json` files, then enhances speaker information using the Gemini API.

## Prerequisites

1. **Gemini API Key**: You need a Google Gemini API key
2. **Node.js**: Make sure Node.js is installed
3. **Dependencies**: Run `npm install` to install required packages

## Setup

1. Set your Gemini API key as an environment variable:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

2. Make sure the following files exist in `public/aiengdata/`:
   - `singleList.json`
   - `website.json`

## Running the Script

### Option 1: Using the runner script (Recommended)
```bash
node run-combine-data.js
```

### Option 2: Direct execution
```bash
npx tsx src/app/setup/combineData.ts
```

## What the Script Does

### Phase 1: Data Combination
1. Loads data from `singleList.json` and `website.json`
2. Merges sessions based on Session ID matching
3. Combines session data preserving fields from both sources
4. Saves the combined data to `public/aiengdata/combinedData.json`

### Phase 2: Speaker Enhancement
1. Processes each speaker through the Gemini API
2. Extracts structured information (company, title, position, field)
3. Processes speakers in batches of 2 to respect API limits
4. Saves progress after each batch to `public/aiengdata/speakerData.json`
5. Includes retry logic and rate limiting handling

### Phase 3: Final Data Creation
1. Creates `public/aiengdata/fullData.json` with enhanced speakers
2. This is the final, complete dataset ready for use

## Output Files

- **`public/aiengdata/combinedData.json`**: Combined session, speaker, and room data
- **`public/aiengdata/speakerData.json`**: Enhanced speaker data with AI-extracted information
- **`public/aiengdata/fullData.json`**: **Final complete dataset** with enhanced speakers
- **`speaker_progress.json`**: Temporary progress tracking (auto-deleted on completion)

## Features

- **Resume Capability**: If the script is interrupted, it can resume from where it left off
- **Error Handling**: Includes retry logic for API failures and rate limiting
- **Batch Processing**: Processes speakers in small batches to avoid overwhelming the API
- **Progress Tracking**: Saves progress after each batch to prevent data loss
- **TypeScript Types**: Full TypeScript support with comprehensive interfaces

## Troubleshooting

1. **API Key Error**: Make sure `GEMINI_API_KEY` is set correctly
2. **Rate Limiting**: The script automatically handles rate limits with backoff
3. **Resume Processing**: If interrupted, just run the script again - it will resume automatically
4. **File Not Found**: Ensure JSON files are in the correct `public/aiengdata/` directory

## Data Structure

### Combined Sessions
Merges fields from both sources:
- From `singleList.json`: Session Format, Level, Scope, Assigned Track, Room, Speakers, Companies, Company Domains
- From `website.json`: id, title, description, startsAt, endsAt, isPlenumSession, speakers, roomId, isConfirmed

### Enhanced Speakers
Original speaker data plus:
- `company`: Company name
- `title`: Job title
- `position`: Array of position types (CEO, CTO, etc.)
- `field`: Professional field (AI engineering, Software Engineering, etc.)

## TypeScript Support

Full TypeScript interfaces are available in:
- **Types**: `src/app/types/conference.ts`
- **Documentation**: `notes/interfaces/fullData.md`

```typescript
import { FullData } from '@/types/conference';

// Use the final dataset
const fullData: FullData = await import('public/aiengdata/fullData.json');
```

## Final Dataset

The main output file is **`public/aiengdata/fullData.json`** which contains:
- 214 combined sessions with metadata from both sources
- 245 enhanced speakers with AI-extracted professional information
- 35 conference rooms
- Complete TypeScript type safety 