import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWithGemini } from '@/lib/api/gemini';

// POST /api/ai/gemini - Gemini API 호출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findFirst();

    if (!settings?.geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 400 }
      );
    }

    const response = await generateWithGemini(prompt, settings.geminiApiKey);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
