import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowNumber: number;
  keyword: string;
  additionalData?: Record<string, string>;
}

export interface ParseResult {
  success: boolean;
  data: ParsedRow[];
  errors: { row: number; message: string }[];
  totalRows: number;
}

export function parseExcelFile(buffer: ArrayBuffer): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet['!ref']) {
      return {
        success: false,
        data: [],
        errors: [{ row: 0, message: 'Empty worksheet' }],
        totalRows: 0,
      };
    }

    // Check for header row
    const hasHeader = isHeaderRow(worksheet);
    const startRow = hasHeader ? 1 : 0;

    const data = XLSX.utils.sheet_to_json<any[]>(worksheet, {
      header: 1,
      defval: '',
    });

    const results: ParsedRow[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = startRow; i < data.length; i++) {
      const row = data[i] as any[];
      const rowNumber = i + 1; // 1-based for user display

      if (!row || row.length === 0) {
        continue; // Skip empty rows
      }

      const keyword = String(row[0] || '').trim();

      if (!keyword) {
        continue; // Skip rows with empty first column
      }

      // Build additional data from other columns
      const additionalData: Record<string, string> = {};
      if (row.length > 1) {
        for (let j = 1; j < row.length; j++) {
          const value = String(row[j] || '').trim();
          if (value) {
            additionalData[`col${j + 1}`] = value;
          }
        }
      }

      results.push({
        rowNumber,
        keyword,
        additionalData: Object.keys(additionalData).length > 0 ? additionalData : undefined,
      });
    }

    return {
      success: errors.length === 0,
      data: results,
      errors,
      totalRows: data.length - startRow,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [
        {
          row: 0,
          message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      totalRows: 0,
    };
  }
}

function isHeaderRow(worksheet: XLSX.WorkSheet): boolean {
  const firstCell = worksheet['A1'];
  if (!firstCell) return false;

  const value = String(firstCell.v || '').toLowerCase();
  const headerKeywords = ['keyword', '키워드', 'key', 'word', '검색어', '제목', 'title'];

  return headerKeywords.some((h) => value.includes(h));
}

export function parseCSVFile(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: 'Empty file' }],
      totalRows: 0,
    };
  }

  // Check for header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = ['keyword', '키워드', 'key'].some((h) => firstLine.includes(h));
  const startIndex = hasHeader ? 1 : 0;

  const results: ParsedRow[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handle quoted values)
    const values = parseCSVLine(line);
    const keyword = values[0]?.trim();

    if (keyword) {
      results.push({
        rowNumber: i + 1,
        keyword,
      });
    }
  }

  return {
    success: true,
    data: results,
    errors: [],
    totalRows: lines.length - startIndex,
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
