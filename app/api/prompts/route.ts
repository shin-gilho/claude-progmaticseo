import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/prompts - 프롬프트 목록 조회
export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - 프롬프트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content, aiModel } = body;

    if (!name || !content || !aiModel) {
      return NextResponse.json(
        { error: 'Name, content, and aiModel are required' },
        { status: 400 }
      );
    }

    if (!['claude', 'gemini'].includes(aiModel)) {
      return NextResponse.json(
        { error: 'aiModel must be "claude" or "gemini"' },
        { status: 400 }
      );
    }

    const prompt = await prisma.prompt.create({
      data: {
        name,
        content,
        aiModel,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
