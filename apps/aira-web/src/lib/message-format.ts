const BREAK_MARKER_REGEX = /(?:—\s*BREAK\s*—|--\s*BREAK\s*--|\bBREAK\b)/gi;

const DEFAULT_EMOJIS = ['✨', '👉', '✅', '💬'];

function tidySentence(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeBrokenUrls(text: string): string {
  return text
    .replace(/\bhttps\/(?!\/)/gi, 'https://')
    .replace(/\bhttp\/(?!\/)/gi, 'http://');
}

export function formatAiraMessage(rawMessage?: string | null): string {
  if (!rawMessage) return '';

  const segments = normalizeBrokenUrls(rawMessage)
    .split(BREAK_MARKER_REGEX)
    .map(tidySentence)
    .filter(Boolean);

  if (segments.length === 0) {
    return tidySentence(rawMessage);
  }

  return segments
    .map(
      (segment, index) =>
        `${DEFAULT_EMOJIS[index % DEFAULT_EMOJIS.length]} ${segment}`,
    )
    .join('\n\n');
}

export default formatAiraMessage;
