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


type Rule = {
  title?:string;
  rule_id: string;
  raw_text: string;
  w_id: string[];
  status: 'active' | 'inactive';
  trigger_time?: string | null;
  interval?: number | null;
  is_default: boolean;
};

export const MOCK_RULES: Rule[] = [
  {
    rule_id: 'rule_001',
    title: 'Morning WhatsApp Reminder',
    raw_text:
      'Send a WhatsApp message to all project groups every weekday at 9 AM',
    w_id: ['group_alpha', 'group_beta'],
    status: 'active',
    trigger_time: new Date().toISOString(),
    interval: 1, // daily
    is_default: false,
  },
  {
    rule_id: 'rule_002',
    title: 'Auto Calendar Event from Email',
    raw_text:
      'Create a Google Calendar event when a meeting email is received',
    w_id: [],
    status: 'active',
    trigger_time: null,
    interval: null,
    is_default: true,
  },
  {
    rule_id: 'rule_003',
    title: 'Weekly File Backup to Drive',
    raw_text:
      'Upload files from WhatsApp to Google Drive every Friday evening',
    w_id: ['group_files'],
    status: 'inactive',
    trigger_time: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    interval: 7, // weekly
    is_default: false,
  },
  {
    rule_id: 'rule_004',
    title: 'Monthly Email Report',
    raw_text:
      'Send a monthly report email with attachments from Drive folders',
    w_id: [],
    status: 'active',
    trigger_time: new Date().toISOString(),
    interval: 30, // monthly
    is_default: false,
  },
  {
    rule_id: 'rule_005',
    title: 'Daily Standup Reminder',
    raw_text:
      'Post daily reminders in WhatsApp standup group about pending tasks',
    w_id: ['group_standup'],
    status: 'active',
    trigger_time: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    interval: 1, // daily
    is_default: false,
  },
];
