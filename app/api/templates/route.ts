import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/templates - 템플릿 목록 조회
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, htmlContent, description } = body;

    if (!name || !htmlContent) {
      return NextResponse.json(
        { error: 'Name and htmlContent are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        htmlContent,
        description: description || null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
