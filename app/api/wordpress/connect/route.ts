import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { testConnection } from '@/lib/api/wordpress';

// POST /api/wordpress/connect - WordPress 연결 테스트
export async function POST() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'WordPress settings not configured' },
        { status: 400 }
      );
    }

    const isConnected = await testConnection({
      siteUrl: settings.wpSiteUrl,
      username: settings.wpUsername,
      encryptedPassword: settings.wpPassword,
    });

    if (isConnected) {
      return NextResponse.json({ success: true, message: 'Connection successful' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Connection failed. Check your credentials.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
