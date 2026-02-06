'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { extractVariables } from '@/lib/template-engine';

interface TemplateEditorProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    htmlContent: string;
  };
}

export function TemplateEditor({ initialData }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [htmlContent, setHtmlContent] = useState(initialData?.htmlContent || '');
  const [isSaving, setIsSaving] = useState(false);

  const variables = extractVariables(htmlContent);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    if (!htmlContent.trim()) {
      alert('HTML 템플릿을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const url = initialData?.id
        ? `/api/templates/${initialData.id}`
        : '/api/templates';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, htmlContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save template');
      }

      router.push('/templates');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">템플릿 이름 *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 질병코드 콘텐츠 템플릿"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium">설명</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="템플릿에 대한 간단한 설명"
        />
      </div>

      {/* HTML Content */}
      <div>
        <label className="mb-2 block text-sm font-medium">HTML 템플릿 *</label>
        <Textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder={`<article>\n  <h1>{{title}}</h1>\n  <p>{{main}}</p>\n  <ul>\n    <li>{{item1}}</li>\n    <li>{{item2}}</li>\n  </ul>\n</article>`}
          rows={15}
          className="font-mono text-sm"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {'{{변수명}}'} 형식으로 변수를 추가하면 AI 응답으로 자동 치환됩니다.
        </p>
      </div>

      {/* Detected Variables */}
      {variables.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-2">감지된 변수 ({variables.length}개)</div>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <code
                key={variable}
                className="rounded bg-background px-2 py-1 text-xs"
              >
                {`{{${variable}}}`}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '저장'}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/templates')}
          disabled={isSaving}
        >
          취소
        </Button>
      </div>
    </div>
  );
}
