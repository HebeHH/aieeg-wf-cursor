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

export function getFieldColor(field: string): string {
  // Generate consistent colors for fields
  const fieldColors: Record<string, string> = {
    'AI engineering': 'bg-blue-100 text-blue-800',
    'Data Science': 'bg-purple-100 text-purple-800',
    'Machine Learning': 'bg-indigo-100 text-indigo-800',
    'Software Engineering': 'bg-teal-100 text-teal-800',
    'Product Management': 'bg-orange-100 text-orange-800',
    'Research': 'bg-pink-100 text-pink-800',
    'Business': 'bg-green-100 text-green-800',
    'Design': 'bg-red-100 text-red-800',
    'Marketing': 'bg-yellow-100 text-yellow-800',
    'Sales': 'bg-emerald-100 text-emerald-800',
    'DevOps': 'bg-gray-100 text-gray-800',
  };
  
  // Return specific color if available, otherwise generate one
  if (fieldColors[field]) {
    return fieldColors[field];
  }
  
  // Generate color based on field name
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
  
  let hash = 0;
  for (let i = 0; i < field.length; i++) {
    const char = field.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function getLevelColor(level: string): string {
  // Graduate levels by difficulty: green -> blue -> yellow -> orange
  switch (level?.toLowerCase()) {
    case 'beginner':
    case 'introductory':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
    case 'general':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-yellow-100 text-yellow-800';
    case 'expert':
    case 'technical deep dive':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getScopeColor(scope: string): string {
  // Consistent colors for scope
  const scopeColors: Record<string, string> = {
    'Technical deep dive': 'bg-red-100 text-red-800',
    'Introductory and overview': 'bg-green-100 text-green-800',
    'Business and strategy': 'bg-blue-100 text-blue-800',
    'Workshop': 'bg-purple-100 text-purple-800',
  };
  
  return scopeColors[scope] || 'bg-gray-100 text-gray-700';
} 