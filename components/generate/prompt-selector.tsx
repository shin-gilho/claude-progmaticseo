'use client';

import { useState, useEffect } from 'react';
import { Prompt, AIModel } from '@/types/prompt';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PromptSelectorProps {
  value: string;
  aiModel: AIModel;
  onChange: (value: string) => void;
  onAiModelChange: (model: AIModel) => void;
}

export function PromptSelector({
  value,
  aiModel,
  onChange,
  onAiModelChange,
}: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [mode, setMode] = useState<'saved' | 'custom'>('saved');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    onChange(prompt.content);
    onAiModelChange(prompt.aiModel);
  };

  const handleCustomPromptChange = (newValue: string) => {
    setSelectedPromptId(null);
    onChange(newValue);
  };

  const aiModelColors = {
    claude: 'bg-blue-500 hover:bg-blue-600',
    gemini: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as 'saved' | 'custom')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="saved">저장된 프롬프트</TabsTrigger>
        <TabsTrigger value="custom">직접 입력</TabsTrigger>
      </TabsList>

      <TabsContent value="saved" className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">저장된 프롬프트가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              프롬프트 관리 메뉴에서 새 프롬프트를 만들어보세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className={`cursor-pointer transition-all ${
                  selectedPromptId === prompt.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{prompt.name}</h3>
                    <Badge className={aiModelColors[prompt.aiModel]}>
                      {prompt.aiModel === 'claude' ? 'Claude' : 'Gemini'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
                    {prompt.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="custom" className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aiModel">AI 모델</Label>
          <Select value={aiModel} onValueChange={(v) => onAiModelChange(v as AIModel)}>
            <SelectTrigger id="aiModel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customPrompt">프롬프트 내용</Label>
          <Textarea
            id="customPrompt"
            value={value}
            onChange={(e) => handleCustomPromptChange(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="AI에게 전달할 프롬프트를 입력하세요..."
          />
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">프롬프트 작성 팁:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>변수는 {`{{변수명}}`} 형식으로 사용하세요</li>
                <li>JSON 형식으로 응답을 요청하면 템플릿에 자동으로 적용됩니다</li>
                <li>명확하고 구체적인 지시사항을 포함하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
