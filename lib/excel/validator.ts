import type { ParsedRow } from './parser';

export interface ValidationResult {
  isValid: boolean;
  validRows: ParsedRow[];
  invalidRows: { row: ParsedRow; reason: string }[];
  warnings: string[];
}

export function validateKeywords(rows: ParsedRow[]): ValidationResult {
  const validRows: ParsedRow[] = [];
  const invalidRows: { row: ParsedRow; reason: string }[] = [];
  const warnings: string[] = [];
  const seenKeywords = new Set<string>();

  for (const row of rows) {
    // Length validation
    if (row.keyword.length < 2) {
      invalidRows.push({ row, reason: 'Keyword too short (min 2 chars)' });
      continue;
    }

    if (row.keyword.length > 200) {
      invalidRows.push({ row, reason: 'Keyword too long (max 200 chars)' });
      continue;
    }

    // Invalid characters check
    if (/[<>{}]/.test(row.keyword)) {
      invalidRows.push({ row, reason: 'Invalid characters in keyword (<, >, {, })' });
      continue;
    }

    // Duplicate check
    const normalizedKeyword = row.keyword.toLowerCase().trim();
    if (seenKeywords.has(normalizedKeyword)) {
      warnings.push(`Duplicate keyword at row ${row.rowNumber}: ${row.keyword}`);
    }
    seenKeywords.add(normalizedKeyword);

    validRows.push(row);
  }

  return {
    isValid: invalidRows.length === 0,
    validRows,
    invalidRows,
    warnings,
  };
}

export function checkFileLimits(
  rowCount: number,
  maxRows: number = 1000
): { allowed: boolean; message?: string } {
  if (rowCount > maxRows) {
    return {
      allowed: false,
      message: `Too many keywords (${rowCount}). Maximum allowed: ${maxRows}`,
    };
  }

  if (rowCount === 0) {
    return {
      allowed: false,
      message: 'No keywords found in file',
    };
  }

  return { allowed: true };
}
