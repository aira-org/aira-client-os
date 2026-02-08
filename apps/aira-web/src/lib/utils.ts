import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  SERVICE_KEYWORDS,
  ServiceConnector,
  DEFAULT_SCHEDULE_TIME,
  MAX_MATCHED_KEYWORDS,
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert local time string (HH:MM) to UTC ISO string
 */
export function buildTriggerTimeUTC(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return now.toISOString();
}

/**
 * Parse UTC trigger time string to local time (HH:MM)
 */
export function parseTriggerTimeToLocal(utcString?: string): string {
  if (!utcString || utcString === 'Real-time') {
    return DEFAULT_SCHEDULE_TIME;
  }
  const date = new Date(utcString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get suggested connector IDs based on keywords in text
 */
export function getSuggestedConnectorIds(text: string): string[] {
  const lowerText = text.toLowerCase();
  const suggested: string[] = [];

  Object.entries(SERVICE_KEYWORDS).forEach(([serviceId, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      suggested.push(serviceId);
    }
  });

  // Always include WhatsApp by default
  if (!suggested.includes(ServiceConnector.WHATSAPP)) {
    suggested.push(ServiceConnector.WHATSAPP);
  }

  return suggested;
}

/**
 * Detect and extract matched keywords from text
 */
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

  return matched.slice(0, MAX_MATCHED_KEYWORDS);
}
