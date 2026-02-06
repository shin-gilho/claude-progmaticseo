'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDateTime, truncate } from '@/lib/utils';

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string | null;
    htmlContent: string;
    updatedAt: Date;
  };
  onDelete?: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <div className="flex gap-2">
            <Link href={`/templates/${template.id}`}>
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(template.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {template.description || '설명 없음'}
        </p>
        <div className="rounded-md bg-muted p-3">
          <code className="text-xs">
            {truncate(template.htmlContent, 150)}
          </code>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>수정일: {formatDateTime(template.updatedAt)}</span>
          <Link href={`/templates/${template.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-3 w-3" />
              자세히
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
