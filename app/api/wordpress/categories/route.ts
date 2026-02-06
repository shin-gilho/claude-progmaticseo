import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCategories } from '@/lib/api/wordpress';

// GET /api/wordpress/categories - WordPress 카테고리 조회
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { error: 'WordPress settings not configured' },
        { status: 400 }
      );
    }

    const categories = await getCategories({
      siteUrl: settings.wpSiteUrl,
      username: settings.wpUsername,
      encryptedPassword: settings.wpPassword,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching WordPress categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
