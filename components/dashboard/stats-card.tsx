import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
            {trend && (
              <div
                className={`mt-1 text-xs ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
