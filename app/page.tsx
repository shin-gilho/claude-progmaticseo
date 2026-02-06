import { MainLayout } from '@/components/layout';
import { StatsCard, RecentPosts, QuickActions } from '@/components/dashboard';
import { FileText, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { prisma } from '@/lib/db';

async function getDashboardData() {
  const [stats, recentPosts] = await Promise.all([
    // Get stats
    prisma.$transaction(async (tx) => {
      const [total, success, failed, pending, todayCount, templateCount] = await Promise.all([
        tx.post.count(),
        tx.post.count({ where: { status: 'success' } }),
        tx.post.count({ where: { status: 'failed' } }),
        tx.post.count({ where: { status: 'pending' } }),
        tx.post.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        tx.template.count(),
      ]);

      const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

      return {
        total,
        success,
        failed,
        pending,
        successRate,
        todayCount,
        templateCount,
      };
    }),
    // Get recent posts
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        keyword: true,
        status: true,
        wpUrl: true,
        createdAt: true,
      },
    }),
  ]);

  return { stats, recentPosts };
}

export default async function DashboardPage() {
  const { stats, recentPosts } = await getDashboardData();

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            프로그래매틱 SEO 콘텐츠 자동 생성 시스템
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="총 생성 콘텐츠"
            value={stats.total}
            icon={FileText}
          />
          <StatsCard
            title="성공률"
            value={`${stats.successRate}%`}
            icon={CheckCircle}
          />
          <StatsCard
            title="템플릿 수"
            value={stats.templateCount}
            icon={TrendingUp}
          />
          <StatsCard
            title="오늘 생성"
            value={stats.todayCount}
            icon={Calendar}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Recent Posts */}
        <RecentPosts posts={recentPosts} />
      </div>
    </MainLayout>
  );
}
