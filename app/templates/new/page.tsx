import { MainLayout } from '@/components/layout';
import { TemplateEditor } from '@/components/templates';

export default function NewTemplatePage() {
  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">새 템플릿 만들기</h2>
          <p className="text-muted-foreground">
            HTML 템플릿을 작성합니다. {'{{변수명}}'} 형식으로 변수를 추가하세요.
          </p>
        </div>

        <div className="max-w-4xl">
          <TemplateEditor />
        </div>
      </div>
    </MainLayout>
  );
}
