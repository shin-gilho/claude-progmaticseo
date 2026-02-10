import Link from 'next/link';
import { PromptEditor } from '@/components/prompts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewPromptPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/prompts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">새 프롬프트 만들기</h1>
        <p className="text-muted-foreground mt-2">
          AI 콘텐츠 생성에 사용할 프롬프트를 작성합니다
        </p>
      </div>

      <PromptEditor />
    </div>
  );
}
