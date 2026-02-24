import Handlebars from 'handlebars';
import { extractVariables } from './variable-extractor';

// Register comparison helpers (Handlebars does not include these by default)
Handlebars.registerHelper('eq',  (a: any, b: any) => a === b);
Handlebars.registerHelper('ne',  (a: any, b: any) => a !== b);
Handlebars.registerHelper('gt',  (a: any, b: any) => a > b);
Handlebars.registerHelper('lt',  (a: any, b: any) => a < b);
Handlebars.registerHelper('gte', (a: any, b: any) => a >= b);
Handlebars.registerHelper('lte', (a: any, b: any) => a <= b);
Handlebars.registerHelper('and', (...args: any[]) => args.slice(0, -1).every(Boolean));
Handlebars.registerHelper('or',  (...args: any[]) => args.slice(0, -1).some(Boolean));
Handlebars.registerHelper('not', (a: any) => !a);

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
