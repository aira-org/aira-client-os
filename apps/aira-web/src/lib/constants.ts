// App constants
export const APP_NAME = 'AiRA';

// Animation spring configs
export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
};

export const SPRING_HEAVY = {
  damping: 18,
  stiffness: 120,
  mass: 1.2,
};

export const SPRING_SNAPPY = {
  damping: 10,
  stiffness: 200,
};

// Toast durations
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Tab options for hub
export const CATEGORIES = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'suggestions', label: 'Suggestions' },
] as const;

// Connector types with their colors and icons
export const CONNECTORS = {
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    icon: 'MessageCircle',
  },
  email: {
    id: 'email',
    name: 'Email',
    color: '#EA4335',
    icon: 'Mail',
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    color: '#34A853',
    icon: 'Calendar',
  },
  drive: {
    id: 'drive',
    name: 'Drive',
    color: '#4285F4',
    icon: 'HardDrive',
  },
} as const;

// Schedule interval options
export const SCHEDULE_INTERVALS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
] as const;

// Route paths
export const ROUTES = {
  // Auth
  ONBOARDING: '/onboarding',
  SIGNIN: '/signin',
  CALLBACK: '/authcallback',
  PHONE: '/phone',
  VERIFY: '/verify',
  NAME: '/name',
  // App
  HUB: '/',
  WORKSPACE: '/workspace',
  RULES_NEW: '/rules/new',
  RULES_EDIT: (id: string) => `/rules/${id}`,
  GROUPS: '/groups',
  GROUP_RULES: (id: string) => `/groups/${id}`,
  CONNECTOR_RULES: (id: string) => `/connectors/${id}`,
  WHATSAPP_SETUP: '/whatsapp/setup',
  WHATSAPP_CONNECTED: '/whatsapp/connected',
  WHATSAPP_GROUP_SELECTION: '/whatsapp/group-selection',
  WHATSAPP_AI_ANALYSIS: '/whatsapp/ai-analysis',
  WHATSAPP_SUGGESTIONS: '/whatsapp/suggestions',
  WHATSAPP_RULES_CHAT_PICKER: '/whatsapp/rules-chat-picker',
} as const;

// Schedule Interval Enum
export enum ScheduleInterval {
  NONE = 'none',
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Interval to Days mapping
export const INTERVAL_TO_DAYS: Record<ScheduleInterval, number> = {
  [ScheduleInterval.NONE]: 0,
  [ScheduleInterval.ONCE]: 0,
  [ScheduleInterval.DAILY]: 1,
  [ScheduleInterval.WEEKLY]: 7,
  [ScheduleInterval.MONTHLY]: 30,
  [ScheduleInterval.QUARTERLY]: 90,
  [ScheduleInterval.YEARLY]: 365,
} as const;

// Days to Interval mapping
export const DAYS_TO_INTERVAL: Record<number, ScheduleInterval> = {
  0: ScheduleInterval.NONE,
  1: ScheduleInterval.DAILY,
  7: ScheduleInterval.WEEKLY,
  30: ScheduleInterval.MONTHLY,
  90: ScheduleInterval.QUARTERLY,
  365: ScheduleInterval.YEARLY,
} as const;

// Service connector IDs
export enum ServiceConnector {
  GOOGLE_DRIVE = 'google_drive',
  GOOGLE_CALENDAR = 'google_calendar',
  EMAIL = 'email_scope',
  WHATSAPP = 'whatsapp',
}

// Keywords for auto-detecting services from rule text
export const SERVICE_KEYWORDS: Record<ServiceConnector, readonly string[]> = {
  [ServiceConnector.GOOGLE_DRIVE]: [
    'drive',
    'file',
    'document',
    'folder',
    'upload',
    'download',
  ],
  [ServiceConnector.GOOGLE_CALENDAR]: [
    'calendar',
    'event',
    'meeting',
    'schedule',
    'appointment',
    'reminder',
  ],
  [ServiceConnector.EMAIL]: ['email', 'mail', 'send', 'inbox', 'message'],
  [ServiceConnector.WHATSAPP]: ['whatsapp', 'group', 'chat', 'message'],
} as const;

// Default schedule time
export const DEFAULT_SCHEDULE_TIME = '09:00';

// Maximum keywords to show in UI
export const MAX_MATCHED_KEYWORDS = 5;
