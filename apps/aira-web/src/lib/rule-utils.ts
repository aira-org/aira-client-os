import type { IntervalType } from '@/components/editor/schedule-selector';

// Schedule interval mapping
export const INTERVAL_TO_DAYS: Record<IntervalType, number> = {
  none: 0,
  once: 0,
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const DAYS_TO_INTERVAL: Record<number, IntervalType> = {
  0: 'none',
  1: 'daily',
  7: 'weekly',
  30: 'monthly',
  90: 'quarterly',
  365: 'yearly',
};

export function buildTriggerTimeUTC(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return now.toISOString();
}

export function parseTriggerTimeToLocal(utcString?: string): string {
  if (!utcString || utcString === 'Real-time') {
    return '09:00';
  }
  const date = new Date(utcString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Keyword detection for service suggestions
export const SERVICE_KEYWORDS: Record<string, string[]> = {
  google_drive: ['drive', 'file', 'document', 'folder', 'upload', 'download'],
  google_calendar: [
    'calendar',
    'event',
    'meeting',
    'schedule',
    'appointment',
    'reminder',
  ],
  email_scope: ['email', 'mail', 'send', 'inbox', 'message'],
  whatsapp: ['whatsapp', 'group', 'chat', 'message'],
};

export function getSuggestedConnectorIds(text: string): string[] {
  const lowerText = text.toLowerCase();
  const suggested: string[] = [];

  Object.entries(SERVICE_KEYWORDS).forEach(([serviceId, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      suggested.push(serviceId);
    }
  });

  if (!suggested.includes('whatsapp')) {
    suggested.push('whatsapp');
  }

  return suggested;
}

export function detectKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  Object.values(SERVICE_KEYWORDS)
    .flat()
    .forEach(keyword => {
      if (lowerText.includes(keyword) && !matched.includes(keyword)) {
        matched.push(keyword);
      }
    });

  return matched.slice(0, 5);
}
