import Handlebars from 'handlebars';
import { extractVariables } from './variable-extractor';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderTemplate(
  template: string,
  variables: Record<string, any> // Changed from Record<string, string> to support arrays/objects
): string {
  try {
    // Compile template with Handlebars
    const compiledTemplate = Handlebars.compile(template, {
      noEscape: true, // Don't escape HTML since we're generating HTML content
      strict: false,  // Don't throw on missing properties
    });

    return compiledTemplate(variables);
  } catch (error) {
    console.error('Handlebars rendering error:', error);
    throw new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function renderTemplateWithFallback(
  template: string,
  variables: Record<string, any>,
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
  sampleData?: Record<string, any>
): string {
  const variables = extractVariables(template);
  const previewData: Record<string, any> = {};

  for (const v of variables) {
    previewData[v] = sampleData?.[v] || `[${v}]`;
  }

  return renderTemplate(template, previewData);
}
