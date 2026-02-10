import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { PromptList } from '@/components/prompts';

export default async function PromptsPage() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">프롬프트 관리</h1>
            <p className="text-muted-foreground mt-2">
              AI 콘텐츠 생성에 사용할 프롬프트를 관리합니다
            </p>
          </div>
          <Link href="/prompts/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              새 프롬프트 만들기
            </Button>
          </Link>
        </div>
      </div>

      <PromptList initialPrompts={prompts} />
    </div>
  );
}
