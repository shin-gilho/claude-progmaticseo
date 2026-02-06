'use client';

import { useState } from 'react';
import { TemplateCard } from './template-card';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string | null;
  htmlContent: string;
  updatedAt: Date;
}

interface TemplateListProps {
  initialTemplates: Template[];
}

export function TemplateList({ initialTemplates }: TemplateListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete template');
      }

      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : '템플릿 삭제에 실패했습니다.');
    }
  };

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">아직 생성된 템플릿이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
