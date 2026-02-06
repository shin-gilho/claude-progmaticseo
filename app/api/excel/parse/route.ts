import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile, parseCSVFile } from '@/lib/excel/parser';
import { validateKeywords, checkFileLimits } from '@/lib/excel/validator';

// POST /api/excel/parse - 엑셀/CSV 파일 파싱
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { error: 'Only .xlsx, .xls, and .csv files are supported' },
        { status: 400 }
      );
    }

    let parseResult;

    if (isCSV) {
      const text = await file.text();
      parseResult = parseCSVFile(text);
    } else {
      const buffer = await file.arrayBuffer();
      parseResult = parseExcelFile(buffer);
    }

    if (!parseResult.success && parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to parse file', details: parseResult.errors },
        { status: 400 }
      );
    }

    // 파일 크기 제한 체크
    const limitCheck = checkFileLimits(parseResult.data.length);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message },
        { status: 400 }
      );
    }

    // 키워드 유효성 검사
    const validation = validateKeywords(parseResult.data);

    return NextResponse.json({
      success: true,
      totalRows: parseResult.totalRows,
      validCount: validation.validRows.length,
      invalidCount: validation.invalidRows.length,
      keywords: validation.validRows,
      invalidRows: validation.invalidRows,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}
