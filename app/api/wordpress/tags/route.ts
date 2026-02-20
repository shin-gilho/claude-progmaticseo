import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTags } from '@/lib/api/wordpress';

// GET /api/wordpress/tags - WordPress 태그 조회
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'WordPress settings not configured' },
        { status: 400 }
      );
    }

    const tags = await getTags({
      siteUrl: settings.wpSiteUrl,
      username: settings.wpUsername,
      encryptedPassword: settings.wpPassword,
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching WordPress tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
