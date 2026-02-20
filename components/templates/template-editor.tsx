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
    titleTemplate?: string;
    description: string;
    htmlContent: string;
    rankMathFocusKeywords?: string;
    rankMathDescription?: string;
  };
}

export function TemplateEditor({ initialData }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [titleTemplate, setTitleTemplate] = useState(initialData?.titleTemplate || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [htmlContent, setHtmlContent] = useState(initialData?.htmlContent || '');
  const [rankMathFocusKeywords, setRankMathFocusKeywords] = useState(
    initialData?.rankMathFocusKeywords || ''
  );
  const [rankMathDescription, setRankMathDescription] = useState(
    initialData?.rankMathDescription || ''
  );
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
        body: JSON.stringify({
          name,
          titleTemplate: titleTemplate || null,
          description,
          htmlContent,
          rankMathFocusKeywords: rankMathFocusKeywords || null,
          rankMathDescription: rankMathDescription || null,
        }),
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

      {/* Title Template */}
      <div>
        <label className="mb-2 block text-sm font-medium">제목 템플릿</label>
        <Input
          value={titleTemplate}
          onChange={(e) => setTitleTemplate(e.target.value)}
          placeholder="질병코드 {{keyword_normalized}} 실비보험 청구 방법 | 서류 준비 | 승인 기준 꼭 확인하세요"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          제목 템플릿 (변수 사용 가능: <code className="text-xs">{'{{keyword}}'}</code>, <code className="text-xs">{'{{keyword_normalized}}'}</code>, <code className="text-xs">{'{{keyword_display}}'}</code>). 비워두면 AI가 생성한 제목을 사용합니다.
        </p>
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

      {/* RankMath SEO Settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">RankMath SEO 설정 (선택사항)</h3>
          <p className="text-sm text-muted-foreground">
            워드프레스에 자동 등록 시 RankMath 메타데이터를 자동으로 설정합니다.{' '}
            <code className="text-xs">{'{{keyword}}'}</code> 변수를 사용할 수 있습니다.
          </p>
        </div>

        {/* Focus Keywords */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Focus Keywords (포커스 키워드)
          </label>
          <Textarea
            value={rankMathFocusKeywords}
            onChange={(e) => setRankMathFocusKeywords(e.target.value)}
            placeholder="질병코드 {{keyword}} 실비 보험금, {{keyword}} 보험금 청구, {{keyword}} 실비 보험금 청구 방법, 질병코드 {{keyword}} 보험금 청구 방법"
            rows={3}
            className="text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            여러 키워드를 쉼표로 구분하세요. 예: <code>{'{{keyword}}'} 키워드1, {'{{keyword}}'} 키워드2</code>
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Meta Description (메타 설명)
          </label>
          <Textarea
            value={rankMathDescription}
            onChange={(e) => setRankMathDescription(e.target.value)}
            placeholder="질병코드 {{keyword}} 실비보험 청구 가능 여부와 청구 방법을 확인하세요. 진단서 발급부터 서류 준비, 보험사 제출 절차까지 단계별 안내합니다."
            rows={3}
            className="text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            검색 결과에 표시될 설명 텍스트입니다. (권장: 120-160자)
          </p>
        </div>
      </div>

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
