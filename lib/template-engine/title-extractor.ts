import { renderTemplate } from './renderer';

/**
 * Extract and render title from template
 *
 * @param titleTemplate - Template string with {{variables}} (e.g., "질병코드 {{keyword}} 정보")
 * @param variables - Variables to substitute
 * @returns Rendered title string or null if no template provided
 *
 * @example
 * extractTitle("질병코드 {{keyword_normalized}} 정보", { keyword_normalized: "K529" })
 * // Returns: "질병코드 K529 정보"
 */
export function extractTitle(
  titleTemplate: string | null | undefined,
  variables: Record<string, any>
): string | null {
  // If no title template, return null (caller will use fallback)
  if (!titleTemplate || titleTemplate.trim() === '') {
    return null;
  }

  try {
    // Use existing renderTemplate utility for consistency
    const renderedTitle = renderTemplate(titleTemplate, variables);
    return renderedTitle.trim();
  } catch (error) {
    console.error('Failed to extract title from template:', error);
    return null;
  }
}
