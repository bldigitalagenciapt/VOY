import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = 'text-primary' }: StatCardProps) {
    return (
        <div className="p-4 bg-card border border-border rounded-2xl">
            <div className={cn('w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3', iconColor)}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground font-medium uppercase">{title}</p>
                {trend && (
                    <span className={cn('text-xs font-bold', trend.isPositive ? 'text-green-500' : 'text-red-500')}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
}
