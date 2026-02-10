'use client';

import { Prompt } from '@/types/prompt';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  const aiModelColors = {
    claude: 'bg-blue-500 hover:bg-blue-600',
    gemini: 'bg-gray-500 hover:bg-gray-600',
  };

  const contentPreview = prompt.content.length > 150
    ? prompt.content.substring(0, 150) + '...'
    : prompt.content;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{prompt.name}</CardTitle>
          <Badge className={aiModelColors[prompt.aiModel]}>
            {prompt.aiModel === 'claude' ? 'Claude' : 'Gemini'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
          {contentPreview}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(prompt.updatedAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
        <div className="flex gap-2">
          <Link href={`/prompts/${prompt.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              수정
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(prompt.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
