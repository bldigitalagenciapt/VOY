import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  isSecure = true, // Default to true as per guidelines
}: QuickAccessCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiado!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatValue = (val: string) => {
    if (!val) return '';
    // Format numeric values with spaces for better legibility (e.g. NIF, NISS)
    return val.replace(/\s/g, '').replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  const displayValue = isVisible ? formatValue(value || '') : '••• ••• •••';

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col p-3 rounded-[1.5rem] bg-card border border-border shadow-soft transition-all duration-300 hover:shadow-lg cursor-pointer min-w-[140px] overflow-hidden",
        className
      )}
    >
      {/* Background Decor (optional gradient indicator) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] -mr-10 -mt-10" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-xl font-black text-foreground tracking-tight">{label}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] uppercase font-bold text-success/80">Validado</span>
          </div>
        </div>

        {value && (
          <button
            onClick={toggleVisibility}
            className="p-2.5 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
          >
            {isVisible ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <div className="mt-auto relative z-10">
        {value ? (
          <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border/50">
            <span className="text-sm font-black text-foreground tracking-tight font-mono whitespace-nowrap">
              {displayValue}
            </span>
            {isVisible && (
              <button
                onClick={handleCopy}
                className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors ml-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-primary font-bold flex items-center gap-1 py-1">
            + {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}
