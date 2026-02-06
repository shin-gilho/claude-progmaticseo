import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/prompts/[id] - 단일 프롬프트 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - 프롬프트 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, content, aiModel } = body;

    if (aiModel && !['claude', 'gemini'].includes(aiModel)) {
      return NextResponse.json(
        { error: 'aiModel must be "claude" or "gemini"' },
        { status: 400 }
      );
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(aiModel && { aiModel }),
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - 프롬프트 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if prompt has associated posts
    const postsCount = await prisma.post.count({
      where: { promptId: id },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete prompt with ${postsCount} associated posts` },
        { status: 400 }
      );
    }

    await prisma.prompt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
