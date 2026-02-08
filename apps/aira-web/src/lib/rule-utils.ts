import type { Rule } from '@repo/core';

/**
 * Derives the service badge text for a rule.
 * Currently all rules are WhatsApp rules (identified by the presence of w_id field).
 * The parameter is prefixed with underscore as it's not currently used, but kept for
 * future extensibility when other service types are supported.
 * 
 * Note: We keep the parameter signature stable to avoid breaking changes when
 * multi-service support is added.
 */
export function deriveServiceBadge(_rule: Rule): string {
  // All rules with w_id are WhatsApp rules per the API spec
  // Future: Check _rule.w_id existence or add service_type field
  return 'WhatsApp';
}

/**
 * Derives the chat count from w_id array.
 * Returns a formatted string like "12 chats" or "1 chat"
 */
export function deriveChatCount(rule: Rule): string {
  const count = rule.w_id?.length ?? 0;
  return count === 1 ? '1 chat' : `${count} chats`;
}

/**
 * Derives a human-readable status description for a rule.
 * Based on status, w_id, and trigger_time fields from the API.
 */
export function deriveRuleStatus(rule: Rule): string {
  const chatCount = rule.w_id?.length ?? 0;
  
  if (rule.status === 'inactive') {
    return 'Paused';
  }
  
  // Active rule
  if (chatCount === 0) {
    return 'Active (no chats)';
  }
  
  return `Watching ${chatCount === 1 ? '1 chat' : `${chatCount} chats`}`;
}

/**
 * Formats a trigger_time string to a human-readable format.
 * Handles various formats defensively and returns null if invalid.
 * Uses the user's browser locale for time formatting.
 */
export function formatTriggerTime(triggerTime: string | null | undefined): string | null {
  if (!triggerTime) return null;
  
  try {
    // Try parsing as ISO 8601
    const date = new Date(triggerTime);
    if (isNaN(date.getTime())) return null;
    
    // Format using browser's default locale for better i18n
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return null;
  }
}

/**
 * Derives the complete toggle status text including schedule if available.
 * Used for the informational subtext under the rule toggle.
 * 
 * Note: trigger_time represents when a scheduled rule will next execute.
 * For recurring rules (with interval set), this shows the next scheduled run.
 * The label "Next run" is accurate for both one-time and recurring schedules.
 */
export function deriveToggleStatusText(rule: Rule): string {
  if (rule.status === 'inactive') {
    return 'Status: Paused';
  }
  
  const statusText = deriveRuleStatus(rule);
  const formattedTime = formatTriggerTime(rule.trigger_time);
  
  if (formattedTime) {
    return `Status: ${statusText} • Next run: ${formattedTime}`;
  }
  
  return `Status: ${statusText}`;
}
