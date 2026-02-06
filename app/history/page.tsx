import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { prisma } from '@/lib/db';

async function getPosts(status?: string) {
  const where = status && ['success', 'failed', 'pending'].includes(status)
    ? { status }
    : {};

  return prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const statusLabels = {
  success: '성공',
  failed: '실패',
  pending: '대기중',
};

const statusColors = {
  success: 'text-green-600',
  failed: 'text-red-600',
  pending: 'text-yellow-600',
};

export default async function HistoryPage() {
  const posts = await getPosts();

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">생성 기록</h2>
            <p className="text-muted-foreground">
              생성된 콘텐츠의 히스토리를 확인합니다
            </p>
          </div>
          <Button variant="outline">에러 로그 다운로드</Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium">키워드</th>
                <th className="px-4 py-3 text-left text-sm font-medium">생성일</th>
                <th className="px-4 py-3 text-left text-sm font-medium">WordPress</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    아직 생성 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const StatusIcon = statusIcons[post.status as keyof typeof statusIcons];
                  const statusLabel = statusLabels[post.status as keyof typeof statusLabels];
                  const statusColor = statusColors[post.status as keyof typeof statusColors];

                  return (
                    <tr key={post.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 ${statusColor}`}>
                          {StatusIcon && <StatusIcon className="h-4 w-4" />}
                          <span className="text-sm">{statusLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{post.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-sm">{post.keyword}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(post.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {post.wpUrl ? (
                          <a
                            href={post.wpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            보기
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
