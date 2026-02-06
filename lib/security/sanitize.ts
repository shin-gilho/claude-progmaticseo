import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'strong', 'em', 'u', 's', 'b', 'i',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
  'blockquote', 'pre', 'code',
  'article', 'section', 'header', 'footer',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height',
];

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidClaudeAPIKey(key: string): boolean {
  return /^sk-ant-[a-zA-Z0-9-_]+$/.test(key);
}

export function isValidGeminiAPIKey(key: string): boolean {
  return /^AI[a-zA-Z0-9_-]{30,}$/.test(key);
}

export function sanitizeKeyword(keyword: string): string {
  return keyword
    .trim()
    .replace(/[<>{}]/g, '')
    .slice(0, 200);
}
