export function formatSessionDate(startsAt: string, endsAt: string): { day: string; time: string } {
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);
  
  // Map days to conference dates (3, 4, 5 June 2025 = Tuesday, Wednesday, Thursday)
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  
  let day: string;
  if (startDay !== endDay) {
    day = 'MULTIDAY';
  } else {
    switch (startDay) {
      case 3:
        day = 'Tuesday';
        break;
      case 4:
        day = 'Wednesday';
        break;
      case 5:
        day = 'Thursday';
        break;
      default:
        day = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }
  
  const startTime = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return {
    day,
    time: `${startTime} - ${endTime}`
  };
}

export function isTimeInRange(sessionTime: string, fromTime: string, toTime: string): boolean {
  if (!fromTime && !toTime) return true;
  
  const sessionDate = new Date(sessionTime);
  const sessionHours = sessionDate.getHours();
  const sessionMinutes = sessionDate.getMinutes();
  const sessionTotalMinutes = sessionHours * 60 + sessionMinutes;
  
  if (fromTime) {
    const [fromHours, fromMins] = fromTime.split(':').map(Number);
    const fromTotalMinutes = fromHours * 60 + fromMins;
    if (sessionTotalMinutes < fromTotalMinutes) return false;
  }
  
  if (toTime) {
    const [toHours, toMins] = toTime.split(':').map(Number);
    const toTotalMinutes = toHours * 60 + toMins;
    if (sessionTotalMinutes > toTotalMinutes) return false;
  }
  
  return true;
} 