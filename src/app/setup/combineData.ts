import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import {
  Position,
  Field,
  GeminiResponse,
  SingleListItem,
  WebsiteSession,
  WebsiteSpeaker,
  WebsiteRoom,
  WebsiteData,
  CombinedSession,
  CombinedData,
  EnhancedSpeaker,
  Progress,
  FullData
} from '../types/conference';

// Progress tracking
const PROGRESS_FILE = 'speaker_progress.json';
const BATCH_SIZE = 2;
const RETRY_DELAY = 10000; // 10 seconds

class DataCombiner {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            company: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING },
            position: { 
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
                format: "enum",
                enum: ['CEO', 'CTO', 'founder', 'Director/Head of Department', 'VP', 'Senior Engineer', 'Engineer', 'Founder', 'Product Manager/Lead', 'Other High-Level', 'Other Mid-Level', 'Other Low-Level']
              }
            },
            field: { 
              type: SchemaType.STRING,
              format: "enum",
              enum: ['AI engineering', 'Software Engineering', 'Research', 'Developer Experience', 'Marketing/Sales', 'Product Management', 'Engineering', 'Data science', 'Investor']
            }
          },
          required: ["company", "title", "position", "field"]
        }
      }
    });
  }

  private loadProgress(): Progress {
    try {
      if (fs.existsSync(PROGRESS_FILE)) {
        const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('No existing progress file found, starting fresh');
    }
    return { processedSpeakers: [], lastProcessedIndex: -1 };
  }

  private saveProgress(progress: Progress): void {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async combineData(): Promise<void> {
    console.log('Starting data combination...');

    // Load data files
    const singleListPath = path.join(process.cwd(), 'public', 'aiengdata', 'singleList.json');
    const websitePath = path.join(process.cwd(), 'public', 'aiengdata', 'website.json');

    const singleListData: SingleListItem[] = JSON.parse(fs.readFileSync(singleListPath, 'utf8'));
    const websiteData: WebsiteData = JSON.parse(fs.readFileSync(websitePath, 'utf8'));

    console.log(`Loaded ${singleListData.length} sessions from singleList.json`);
    console.log(`Loaded ${websiteData.sessions.length} sessions from website.json`);

    // Combine sessions
    const combinedSessions: CombinedSession[] = [];

    for (const singleSession of singleListData) {
      const websiteSession = websiteData.sessions.find(ws => ws.id === singleSession["Session ID"]);
      
      if (websiteSession) {
        const combined: CombinedSession = {
          // From website.json
          id: websiteSession.id,
          title: websiteSession.title,
          description: websiteSession.description,
          startsAt: websiteSession.startsAt,
          endsAt: websiteSession.endsAt,
          isPlenumSession: websiteSession.isPlenumSession,
          speakers: websiteSession.speakers,
          roomId: websiteSession.roomId,
          isConfirmed: websiteSession.isConfirmed,
          categoryItems: websiteSession.categoryItems,
          isInformed: websiteSession.isInformed,
          isServiceSession: websiteSession.isServiceSession,
          liveUrl: websiteSession.liveUrl,
          questionAnswers: websiteSession.questionAnswers,
          recordingUrl: websiteSession.recordingUrl,
          status: websiteSession.status,
          
          // From singleList.json
          "Session Format": singleSession["Session Format"],
          "Level": singleSession["Level"],
          "Scope": singleSession["Scope"],
          "Assigned Track": singleSession["Assigned Track"],
          "Room": singleSession["Room"],
          "Speakers": singleSession["Speakers"],
          "Companies": singleSession["Companies"],
          "Company Domains": singleSession["Company Domains"]
        };
        
        combinedSessions.push(combined);
      } else {
        console.warn(`No matching website session found for Session ID: ${singleSession["Session ID"]}`);
      }
    }

    const combinedData: CombinedData = {
      rooms: websiteData.rooms,
      sessions: combinedSessions,
      speakers: websiteData.speakers
    };

    // Save combined data
    const combinedDataPath = path.join(process.cwd(), 'public', 'aiengdata', 'combinedData.json');
    fs.writeFileSync(combinedDataPath, JSON.stringify(combinedData, null, 2));
    console.log(`Combined data saved to ${combinedDataPath}`);
    console.log(`Combined ${combinedSessions.length} sessions successfully`);

    // Process speakers with Gemini API
    await this.processSpeakers(combinedData.speakers, combinedData);
  }

  private async processSpeakers(speakers: WebsiteSpeaker[], combinedData: CombinedData): Promise<void> {
    console.log(`\nStarting speaker processing with Gemini API...`);
    console.log(`Total speakers to process: ${speakers.length}`);

    const progress = this.loadProgress();
    let enhancedSpeakers: EnhancedSpeaker[] = [];

    // Load existing speaker data if available
    const speakerDataPath = path.join(process.cwd(), 'public', 'aiengdata', 'speakerData.json');
    if (fs.existsSync(speakerDataPath)) {
      try {
        enhancedSpeakers = JSON.parse(fs.readFileSync(speakerDataPath, 'utf8'));
        console.log(`Loaded ${enhancedSpeakers.length} existing speaker records`);
      } catch (error) {
        console.log('Could not load existing speaker data, starting fresh');
        enhancedSpeakers = [];
      }
    }

    const startIndex = progress.lastProcessedIndex + 1;
    console.log(`Resuming from speaker index: ${startIndex}`);

    for (let i = startIndex; i < speakers.length; i += BATCH_SIZE) {
      const batch = speakers.slice(i, Math.min(i + BATCH_SIZE, speakers.length));
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(speakers.length / BATCH_SIZE)} (speakers ${i + 1}-${Math.min(i + BATCH_SIZE, speakers.length)})`);

      const batchPromises = batch.map(async (speaker, batchIndex) => {
        const actualIndex = i + batchIndex;
        
        // Skip if already processed
        if (progress.processedSpeakers.includes(speaker.id)) {
          console.log(`Skipping already processed speaker: ${speaker.fullName}`);
          return null;
        }

        try {
          console.log(`Processing speaker: ${speaker.fullName}`);
          
          const prompt = `
name: ${speaker.fullName}
bio: ${speaker.bio || 'No bio available'}
tagLine: ${speaker.tagLine || 'No tagline available'}

Please give the following information for ${speaker.firstName}:
- company
- title
- position
- field
          `.trim();

          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          const geminiData: GeminiResponse = JSON.parse(text);
          
          const enhancedSpeaker: EnhancedSpeaker = {
            ...speaker,
            company: geminiData.company,
            title: geminiData.title,
            position: geminiData.position,
            field: geminiData.field
          };

          console.log(`✓ Processed ${speaker.fullName}: ${geminiData.company} - ${geminiData.title}`);
          return { speaker: enhancedSpeaker, index: actualIndex };

        } catch (error) {
          console.error(`Error processing speaker ${speaker.fullName}:`, error);
          
          // If rate limited, wait and retry
          if (error instanceof Error && error.message.includes('rate')) {
            console.log(`Rate limited, waiting ${RETRY_DELAY / 1000} seconds...`);
            await this.delay(RETRY_DELAY);
            
            // Retry once
            try {
              const prompt = `
name: ${speaker.fullName}
bio: ${speaker.bio || 'No bio available'}
tagLine: ${speaker.tagLine || 'No tagline available'}

Please give the following information for ${speaker.firstName}:
- company
- title
- position
- field
              `.trim();

              const result = await this.model.generateContent(prompt);
              const response = await result.response;
              const text = response.text();
              
              const geminiData: GeminiResponse = JSON.parse(text);
              
              const enhancedSpeaker: EnhancedSpeaker = {
                ...speaker,
                company: geminiData.company,
                title: geminiData.title,
                position: geminiData.position,
                field: geminiData.field
              };

              console.log(`✓ Processed ${speaker.fullName} (retry): ${geminiData.company} - ${geminiData.title}`);
              return { speaker: enhancedSpeaker, index: actualIndex };

            } catch (retryError) {
              console.error(`Retry failed for speaker ${speaker.fullName}:`, retryError);
              return null;
            }
          }
          
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Process results and update progress
      for (const result of batchResults) {
        if (result) {
          // Update or add speaker
          const existingIndex = enhancedSpeakers.findIndex(s => s.id === result.speaker.id);
          if (existingIndex >= 0) {
            enhancedSpeakers[existingIndex] = result.speaker;
          } else {
            enhancedSpeakers.push(result.speaker);
          }
          
          // Update progress
          progress.processedSpeakers.push(result.speaker.id);
          progress.lastProcessedIndex = Math.max(progress.lastProcessedIndex, result.index);
        }
      }

      // Save progress and current data after each batch
      this.saveProgress(progress);
      fs.writeFileSync(speakerDataPath, JSON.stringify(enhancedSpeakers, null, 2));
      console.log(`Saved progress: ${enhancedSpeakers.length} speakers processed`);

      // Small delay between batches to be respectful to the API
      if (i + BATCH_SIZE < speakers.length) {
        console.log('Waiting 2 seconds before next batch...');
        await this.delay(2000);
      }
    }

    console.log(`\n✅ Speaker processing complete!`);
    console.log(`Total speakers processed: ${enhancedSpeakers.length}`);
    console.log(`Speaker data saved to: ${speakerDataPath}`);

    // Create final fullData.json with enhanced speakers
    await this.createFullData(combinedData, enhancedSpeakers);

    // Clean up progress file
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('Progress file cleaned up');
    }
  }

  private async createFullData(combinedData: CombinedData, enhancedSpeakers: EnhancedSpeaker[]): Promise<void> {
    console.log('\n🔄 Creating final fullData.json...');

    const fullData: FullData = {
      rooms: combinedData.rooms,
      sessions: combinedData.sessions,
      speakers: enhancedSpeakers
    };

    const fullDataPath = path.join(process.cwd(), 'public', 'aiengdata', 'fullData.json');
    fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2));
    
    console.log(`✅ Full data saved to ${fullDataPath}`);
    console.log(`📊 Final data contains:`);
    console.log(`   - ${fullData.sessions.length} sessions`);
    console.log(`   - ${fullData.speakers.length} enhanced speakers`);
    console.log(`   - ${fullData.rooms.length} rooms`);
  }
}

// Main execution
async function main() {
  try {
    const combiner = new DataCombiner();
    await combiner.combineData();
    console.log('\n🎉 All tasks completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export default DataCombiner;
