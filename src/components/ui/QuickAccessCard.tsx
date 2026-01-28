import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAccessCardProps {
  label: string;
  value?: string;
  placeholder: string;
  onClick?: () => void;
  className?: string;
  isSecure?: boolean;
}

export function QuickAccessCard({
  label,
  value,
  placeholder,
  onClick,
  className,
  isSecure = false,
}: QuickAccessCardProps) {
  const [isVisible, setIsVisible] = useState(!isSecure);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const displayValue = isVisible ? value : '••••••••';

  return (
    <div className="relative group min-w-[120px]">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex flex-col items-center justify-center p-4 rounded-3xl border border-white/20 transition-all duration-300',
          'bg-white/60 hover:bg-white backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5',
          'dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10',
          className
        )}
      >
        <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70 mb-1.5">
          {label}
        </span>
        {value ? (
          <span className="text-lg font-black text-foreground tracking-tight font-mono">
            {displayValue}
          </span>
        ) : (
          <span className="text-sm text-primary font-bold flex items-center gap-1">
            + Add
          </span>
        )}
      </button>

      {isSecure && value && (
        <button
          onClick={toggleVisibility}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors dark:bg-white/10 dark:hover:bg-white/20"
          aria-label={isVisible ? "Esconder valor" : "Mostrar valor"}
        >
          {isVisible ? (
            <EyeOff className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Eye className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}
