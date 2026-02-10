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
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 bg-muted/30 text-foreground transition-transform group-hover:scale-110">
        {icon}
      </div>
      <p className="font-bold text-xs md:text-sm text-foreground mb-1 leading-tight">{title}</p>
      {description && (
        <p className="text-[8px] md:text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest">
          {description}
        </p>
      )}
    </button>
  );
}
