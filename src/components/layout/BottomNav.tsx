import { Home, FileText, Globe, StickyNote, MessageCircle, Wallet, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', icon: Home, labelKey: 'nav.home', label: 'Início' },
  { path: '/documents', icon: FileText, labelKey: 'nav.documents', label: 'Docs' },
  { path: '/community', icon: Heart, labelKey: 'nav.community', label: 'Mural' },
  { path: '/aima', icon: Globe, labelKey: 'nav.aima', label: 'AIMA' },
  { path: '/meu-bolso', icon: Wallet, labelKey: 'nav.meuBolso', label: 'Bolso' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom pointer-events-none flex justify-center pb-4">
      {/* Floating Island Container */}
      <div className="pointer-events-auto mx-4 bg-white/80 backdrop-blur-xl border border-white/40 shadow-soft rounded-2xl p-1.5 flex items-center justify-between gap-1 max-w-sm w-full dark:bg-black/60 dark:border-white/10 dark:shadow-black/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const translated = t(item.labelKey);
          const label = translated.length > 15 ? item.label : translated;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all duration-300 group',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 rounded-xl blur-sm -z-10 animate-fade-in" />
              )}

              <Icon
                className={cn(
                  'w-5 h-5 mb-1 transition-all duration-300',
                  isActive ? 'scale-110 -translate-y-0.5 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-105'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-[9px] font-medium leading-none transition-all duration-300',
                isActive ? 'opacity-100 font-bold translate-y-0.5' : 'opacity-70 group-hover:opacity-100'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
