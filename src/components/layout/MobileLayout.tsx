import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';
import { ChatFloatingButton } from './ChatFloatingButton';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

export function MobileLayout({ children, showNav = true, className }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={cn(
        'flex-1 overflow-y-auto',
        showNav && 'pb-32', // Increased from pb-24
        className
      )}>
        {children}
      </main>
      {showNav && (
        <>
          <ChatFloatingButton />
          <BottomNav />
        </>
      )}
    </div>
  );
}
