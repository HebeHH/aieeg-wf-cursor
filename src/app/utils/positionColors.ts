import { Position } from '../types/conference';

export function getPositionColor(position: Position): string {
  // Color code from vivid green -> light green -> grey according to seniority
  switch (position) {
    case 'CEO':
    case 'CTO':
    case 'founder':
    case 'Founder':
      return 'bg-green-500 text-white';
    case 'Director/Head of Department':
    case 'VP':
      return 'bg-green-400 text-white';
    case 'Product Manager/Lead':
    case 'Other High-Level':
      return 'bg-green-300 text-gray-800';
    case 'Senior Engineer':
    case 'Other Mid-Level':
      return 'bg-green-200 text-gray-700';
    case 'Engineer':
    case 'Other Low-Level':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getTrackColor(track: string): string {
  // Generate consistent colors for tracks
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
  ];
  
  // Simple hash function to get consistent color for track
  let hash = 0;
  for (let i = 0; i < track.length; i++) {
    const char = track.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
} 