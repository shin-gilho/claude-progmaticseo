import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/templates/[id] - 단일 템플릿 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - 템플릿 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, htmlContent, description } = body;

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(htmlContent && { htmlContent }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - 템플릿 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if template has associated posts
    const postsCount = await prisma.post.count({
      where: { templateId: id },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete template with ${postsCount} associated posts` },
        { status: 400 }
      );
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
