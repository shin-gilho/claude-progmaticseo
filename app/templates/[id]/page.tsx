import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { TemplateEditor } from '@/components/templates';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTemplate(id: string) {
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    notFound();
  }

  return template;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const template = await getTemplate(id);

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">템플릿 수정</h2>
          <p className="text-muted-foreground">
            HTML 템플릿을 수정합니다.
          </p>
        </div>

        <div className="max-w-4xl">
          <TemplateEditor
            initialData={{
              id: template.id,
              name: template.name,
              description: template.description || '',
              htmlContent: template.htmlContent,
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
