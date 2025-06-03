import { FullData } from '../types/conference';

let cachedData: FullData | null = null;

export async function loadConferenceData(): Promise<FullData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/aiengdata/fullData.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    cachedData = await response.json() as FullData;
    return cachedData;
  } catch (error) {
    console.error('Error loading conference data:', error);
    throw error;
  }
} 