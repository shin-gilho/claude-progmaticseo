import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWithClaude } from '@/lib/api/claude';

// POST /api/ai/claude - Claude API 호출
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

    if (!settings?.claudeApiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 400 }
      );
    }

    const response = await generateWithClaude(prompt, settings.claudeApiKey);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
