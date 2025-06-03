import { CombinedSession } from '../types/conference';

export function generateGoogleCalendarUrl(session: CombinedSession): string {
  const startDate = new Date(session.startsAt);
  const endDate = new Date(session.endsAt);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    details: `${session.description}\n\nRoom: ${session.Room}\nTrack: ${session["Assigned Track"] || 'N/A'}\nLevel: ${session.Level || 'N/A'}\nScope: ${session.Scope || 'N/A'}`,
    location: session.Room || 'TBD',
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
} 