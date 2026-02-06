import { extractVariables } from './variable-extractor';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    // Allow whitespace around variable name
    const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

export function renderTemplateWithFallback(
  template: string,
  variables: Record<string, string>,
  fallback: string = '[N/A]'
): string {
  const allVariables = extractVariables(template);
  const varsWithFallback = { ...variables };

  for (const v of allVariables) {
    if (!(v in varsWithFallback) || !varsWithFallback[v]) {
      varsWithFallback[v] = fallback;
    }
  }

  return renderTemplate(template, varsWithFallback);
}

export function previewTemplate(
  template: string,
  sampleData?: Record<string, string>
): string {
  const variables = extractVariables(template);
  const previewData: Record<string, string> = {};

  for (const v of variables) {
    previewData[v] = sampleData?.[v] || `[${v}]`;
  }

  return renderTemplate(template, previewData);
}
