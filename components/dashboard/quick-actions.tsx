import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>빠른 실행</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Link href="/templates/new" className="flex-1">
          <Button className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            새 템플릿 만들기
          </Button>
        </Link>
        <Link href="/generate" className="flex-1">
          <Button className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            콘텐츠 생성 시작
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
