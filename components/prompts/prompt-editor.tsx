'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, AIModel } from '@/types/prompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { extractVariables } from '@/lib/template-engine/variable-extractor';
import { Save, AlertCircle } from 'lucide-react';

interface PromptEditorProps {
  initialPrompt?: Prompt;
}

export function PromptEditor({ initialPrompt }: PromptEditorProps) {
  const [name, setName] = useState(initialPrompt?.name || '');
  const [content, setContent] = useState(initialPrompt?.content || '');
  const [aiModel, setAiModel] = useState<AIModel>(initialPrompt?.aiModel || 'claude');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const variables = extractVariables(content);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert('프롬프트 이름을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('프롬프트 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const url = initialPrompt ? `/api/prompts/${initialPrompt.id}` : '/api/prompts';
      const method = initialPrompt ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          aiModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save prompt');
      }

      toast({
        title: initialPrompt ? '프롬프트 수정 완료' : '프롬프트 생성 완료',
        description: '프롬프트가 성공적으로 저장되었습니다.',
      });

      router.push('/prompts');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '프롬프트 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">프롬프트 이름 *</Label>
            <Input
              id="name"
              placeholder="예: 질병코드 SEO 프롬프트"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiModel">AI 모델 *</Label>
            <Select value={aiModel} onValueChange={(value) => setAiModel(value as AIModel)}>
              <SelectTrigger id="aiModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              이 프롬프트를 사용할 AI 모델을 선택하세요
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>프롬프트 내용</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">프롬프트 *</Label>
            <Textarea
              id="content"
              placeholder="AI에게 전달할 프롬프트를 작성하세요. {{변수명}} 형식으로 변수를 사용할 수 있습니다."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              변수는 이중 중괄호로 감싸서 사용합니다. 예: {`{{keyword}}`}, {`{{title}}`}
            </p>
          </div>

          {variables.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">감지된 변수</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/prompts')}
          disabled={isSaving}
        >
          취소
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
