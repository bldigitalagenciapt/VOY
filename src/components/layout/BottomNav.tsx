import { Home, FileText, Plus, MessageCircle, User, Fingerprint, StickyNote, TrendingDown, TrendingUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/home', icon: Home, label: 'INÍCIO' },
    { path: '/documents', icon: FileText, label: 'DOCS' },
    { isFAB: true },
    { path: '/community', icon: MessageCircle, label: 'MURAL' },
    { path: '/profile', icon: User, label: 'PERFIL' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 pb-safe-bottom backdrop-blur-xl">
      <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between relative">
        {navItems.map((item, index) => {
          if (item.isFAB) {
            return (
              <Sheet key="fab">
                <SheetTrigger asChild>
                  <div className="relative -top-10">
                    <button
                      className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-glow hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Plus className="w-10 h-10 stroke-[3]" />
                    </button>
                  </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[2.5rem] border-t-0 bg-[#0D1520] p-8 border-none">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black text-center text-white">Ações Rápidas</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-4 pb-8">
                    <button
                      onClick={() => { navigate('/documents', { state: { openAddDialog: true } }); }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-white">Add Documento</span>
                    </button>
                    <button
                      onClick={() => { navigate('/notes'); }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                        <StickyNote className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-white">Add Nota</span>
                    </button>
                    <button
                      onClick={() => { navigate('/meu-bolso'); }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-white">Add Gasto</span>
                    </button>
                    <button
                      onClick={() => { navigate('/meu-bolso'); }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-white">Add Ganho</span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          const isActive = location.pathname === item.path;
          const Icon = item.icon!;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn('w-6 h-6', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')}
              />
              <span className={cn(
                'text-[10px] font-black tracking-widest',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
