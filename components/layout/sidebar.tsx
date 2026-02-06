'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  History,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    href: '/',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/templates',
    label: '템플릿 관리',
    icon: FileText,
  },
  {
    href: '/generate',
    label: '콘텐츠 생성',
    icon: Sparkles,
  },
  {
    href: '/history',
    label: '생성 기록',
    icon: History,
  },
  {
    href: '/settings',
    label: '설정',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">SEO Generator</h1>
        <p className="text-sm text-muted-foreground">프로그래매틱 SEO</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
