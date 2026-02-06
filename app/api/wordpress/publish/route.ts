import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPost } from '@/lib/api/wordpress';

// POST /api/wordpress/publish - WordPress에 포스트 발행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, categories, tags, status = 'draft' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'WordPress settings not configured' },
        { status: 400 }
      );
    }

    const wpPost = await createPost(
      {
        siteUrl: settings.wpSiteUrl,
        username: settings.wpUsername,
        encryptedPassword: settings.wpPassword,
      },
      {
        title,
        content,
        status,
        categories,
        tags,
      }
    );

    return NextResponse.json({
      success: true,
      wpPostId: wpPost.id,
      wpUrl: wpPost.link,
    });
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish' },
      { status: 500 }
    );
  }
}
