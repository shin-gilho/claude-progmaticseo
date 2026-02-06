import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  keyword: string;
  status: string;
  wpUrl: string | null;
  createdAt: Date;
}

interface RecentPostsProps {
  posts: Post[];
}

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const statusColors = {
  success: 'text-green-600',
  failed: 'text-red-600',
  pending: 'text-yellow-600',
};

export function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 생성 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            아직 생성된 콘텐츠가 없습니다.
            <br />
            <Link href="/generate" className="text-primary hover:underline">
              콘텐츠 생성을 시작하세요
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 생성 기록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => {
            const StatusIcon = statusIcons[post.status as keyof typeof statusIcons];
            const statusColor = statusColors[post.status as keyof typeof statusColors];

            return (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {StatusIcon && <StatusIcon className={`h-5 w-5 ${statusColor}`} />}
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-muted-foreground">
                      키워드: {post.keyword} · {formatDateTime(post.createdAt)}
                    </div>
                  </div>
                </div>
                {post.wpUrl && (
                  <a
                    href={post.wpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    WordPress
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Link
            href="/history"
            className="text-sm text-primary hover:underline"
          >
            모든 기록 보기 →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
