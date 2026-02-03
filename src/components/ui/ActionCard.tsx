import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export function ActionCard({
  icon,
  title,
  description,
  onClick,
  className,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-[1.5rem] bg-card border border-border shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 text-center group",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-muted/50 text-foreground transition-transform group-hover:scale-110">
        {icon}
      </div>
      <p className="font-bold text-sm text-foreground mb-1 leading-tight">{title}</p>
      {description && (
        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
          {description}
        </p>
      )}
    </button>
  );
}
