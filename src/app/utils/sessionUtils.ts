import { FullData, EnhancedSpeaker } from '../types/conference';

export function getSessionCompany(session: any, fullData: FullData): string {
  // If session has company info and it's not "unknown", use it
  if (session.Companies && session.Companies.toLowerCase() !== 'unknown') {
    return session.Companies;
  }
  
  // Otherwise, try to get company from speakers
  const sessionSpeakers = session.speakers
    .map((speakerId: string) => fullData.speakers.find(s => s.id === speakerId))
    .filter((speaker: EnhancedSpeaker | undefined): speaker is EnhancedSpeaker => speaker !== undefined);
  
  if (sessionSpeakers.length > 0) {
    // Get unique companies from speakers
    const companies = sessionSpeakers
      .map((speaker: EnhancedSpeaker) => speaker.company)
      .filter((company: string | undefined): company is string => Boolean(company))
      .filter((company: string) => company.toLowerCase() !== 'unknown');
    
    // Remove duplicates
    const uniqueCompanies = [...new Set(companies)];
    
    if (uniqueCompanies.length > 0) {
      return uniqueCompanies.join(', ');
    }
  }
  
  return 'Independent';
} 