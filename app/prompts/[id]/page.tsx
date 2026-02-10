import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PromptEditor } from '@/components/prompts';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditPromptPageProps {
  params: {
    id: string;
  };
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
  });

  if (!prompt) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/prompts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">프롬프트 수정</h1>
        <p className="text-muted-foreground mt-2">
          저장된 프롬프트를 수정합니다
        </p>
      </div>

      <PromptEditor initialPrompt={prompt} />
    </div>
  );
}
