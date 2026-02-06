import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { encrypt } from '@/lib/security/encryption';

// GET /api/settings - 설정 조회
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json(null);
    }

    // API 키는 마스킹 처리
    return NextResponse.json({
      ...settings,
      wpPassword: settings.wpPassword ? '********' : null,
      claudeApiKey: settings.claudeApiKey ? '********' : null,
      geminiApiKey: settings.geminiApiKey ? '********' : null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - 설정 수정/생성
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wpSiteUrl,
      wpUsername,
      wpPassword,
      claudeApiKey,
      geminiApiKey,
      defaultAiModel,
      batchSize,
    } = body;

    // 기존 설정 확인
    const existingSettings = await prisma.settings.findFirst();

    const data: any = {};

    if (wpSiteUrl !== undefined) data.wpSiteUrl = wpSiteUrl;
    if (wpUsername !== undefined) data.wpUsername = wpUsername;
    if (wpPassword && wpPassword !== '********') {
      data.wpPassword = encrypt(wpPassword);
    }
    if (claudeApiKey && claudeApiKey !== '********') {
      data.claudeApiKey = encrypt(claudeApiKey);
    }
    if (geminiApiKey && geminiApiKey !== '********') {
      data.geminiApiKey = encrypt(geminiApiKey);
    }
    if (defaultAiModel !== undefined) data.defaultAiModel = defaultAiModel;
    if (batchSize !== undefined) data.batchSize = batchSize;

    let settings;

    if (existingSettings) {
      settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data,
      });
    } else {
      // 새로 생성할 때는 필수 필드 확인
      if (!wpSiteUrl || !wpUsername || !wpPassword) {
        return NextResponse.json(
          { error: 'WordPress settings (wpSiteUrl, wpUsername, wpPassword) are required' },
          { status: 400 }
        );
      }

      settings = await prisma.settings.create({
        data: {
          wpSiteUrl,
          wpUsername,
          wpPassword: encrypt(wpPassword),
          claudeApiKey: claudeApiKey ? encrypt(claudeApiKey) : null,
          geminiApiKey: geminiApiKey ? encrypt(geminiApiKey) : null,
          defaultAiModel: defaultAiModel || 'claude',
          batchSize: batchSize || 5,
        },
      });
    }

    // 응답에서 민감 정보 마스킹
    return NextResponse.json({
      ...settings,
      wpPassword: '********',
      claudeApiKey: settings.claudeApiKey ? '********' : null,
      geminiApiKey: settings.geminiApiKey ? '********' : null,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
