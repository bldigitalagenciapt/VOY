import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'bg-white/50 border-white/40 backdrop-blur-sm dark:bg-white/5 dark:border-white/10',
  primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
  warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30',
  success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/30',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground shadow-sm',
  primary: 'bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]',
  warning: 'bg-warning/20 text-warning shadow-[0_0_15px_hsl(var(--warning)/0.3)]',
  success: 'bg-success/20 text-success shadow-[0_0_15px_hsl(var(--success)/0.3)]',
};

export function ActionCard({
  icon,
  title,
  description,
  onClick,
  variant = 'default',
  className,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300',
        'glass-card-hover',
        variantStyles[variant],
        className
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
        iconStyles[variant]
      )}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
