import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { testConnection } from '@/lib/api/wordpress';

// POST /api/wordpress/connect - WordPress 연결 테스트
export async function POST() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json({
        success: false,
        message: 'WordPress 설정이 아직 저장되지 않았습니다. 설정을 먼저 저장해주세요.'
      });
    }

    const isConnected = await testConnection({
      siteUrl: settings.wpSiteUrl,
      username: settings.wpUsername,
      encryptedPassword: settings.wpPassword,
    });

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'WordPress 연결에 성공했습니다!'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'WordPress 연결에 실패했습니다. 사이트 URL, 사용자명, 애플리케이션 비밀번호를 확인해주세요.'
      });
    }
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: `연결 테스트 중 오류가 발생했습니다: ${errorMessage}`
    });
  }
}
