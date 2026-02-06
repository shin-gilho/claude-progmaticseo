import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/stats - 포스트 통계 조회
export async function GET() {
  try {
    const [total, success, failed, pending, todayCount, templateCount] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'success' } }),
      prisma.post.count({ where: { status: 'failed' } }),
      prisma.post.count({ where: { status: 'pending' } }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.template.count(),
    ]);

    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    return NextResponse.json({
      total,
      success,
      failed,
      pending,
      successRate,
      todayCount,
      templateCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
