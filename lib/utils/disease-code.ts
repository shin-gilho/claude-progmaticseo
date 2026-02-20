/**
 * Disease Code Formatting Utilities
 *
 * Handles normalization of disease codes for SEO optimization.
 * Example: K52.9 → K529 (for titles) and K529(K52.9) (for content)
 */

export interface DiseaseCodeFormat {
  /** Original input code (e.g., "K52.9" or "R1049") */
  original: string;
  /** Normalized code with dots removed (e.g., "K529" or "R1049") */
  normalized: string;
  /** Display format for content (e.g., "K529(K52.9)" or "R1049") */
  display: string;
  /** Whether the original code contained a dot */
  hasDot: boolean;
}

/**
 * Format a disease code for SEO-friendly usage
 *
 * @param code - Disease code input (e.g., "K52.9", "R1049")
 * @returns Formatted disease code object with original, normalized, and display versions
 *
 * @example
 * formatDiseaseCode("K52.9")
 * // Returns: {
 * //   original: "K52.9",
 * //   normalized: "K529",
 * //   display: "K529(K52.9)",
 * //   hasDot: true
 * // }
 *
 * @example
 * formatDiseaseCode("R1049")
 * // Returns: {
 * //   original: "R1049",
 * //   normalized: "R1049",
 * //   display: "R1049",
 * //   hasDot: false
 * // }
 */
export function formatDiseaseCode(code: string): DiseaseCodeFormat {
  // Handle empty or whitespace-only input
  const trimmedCode = code?.trim() || '';

  if (!trimmedCode) {
    return {
      original: '',
      normalized: '',
      display: '',
      hasDot: false,
    };
  }

  // Check if code contains dot(s)
  const hasDot = trimmedCode.includes('.');

  // Normalize by removing all dots
  const normalized = trimmedCode.replace(/\./g, '');

  // Create display format
  const display = hasDot
    ? `${normalized}(${trimmedCode})`
    : normalized;

  return {
    original: trimmedCode,
    normalized,
    display,
    hasDot,
  };
}

/**
 * Check if a string appears to be a disease code
 *
 * @param code - String to check
 * @returns true if the string matches common disease code patterns
 *
 * @example
 * isDiseaseCode("K52.9") // true
 * isDiseaseCode("R1049") // true
 * isDiseaseCode("hello") // false
 */
export function isDiseaseCode(code: string): boolean {
  if (!code?.trim()) return false;

  // Common disease code patterns:
  // - ICD-10: Letter followed by numbers, optionally with dot and more numbers
  // - Examples: K52.9, R1049, C02.0, E11.9
  const pattern = /^[A-Z]\d{1,3}(\.\d{1,2})?$/i;

  return pattern.test(code.trim());
}
