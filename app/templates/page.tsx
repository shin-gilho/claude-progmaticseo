import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { TemplateList } from '@/components/templates';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';

async function getTemplates() {
  return prisma.template.findMany({
    orderBy: { updatedAt: 'desc' },
  });
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">템플릿 관리</h2>
            <p className="text-muted-foreground">
              HTML 템플릿을 생성하고 관리합니다
            </p>
          </div>
          <Link href="/templates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 템플릿 만들기
            </Button>
          </Link>
        </div>

        <TemplateList initialTemplates={templates} />
      </div>
    </MainLayout>
  );
}
