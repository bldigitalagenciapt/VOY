import { Bot } from 'lucide-react';
import { ChatInterface } from '../chat/ChatInterface';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export function ChatFloatingButton() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 flex items-center justify-center z-40 transition-transform active:scale-90 animate-in fade-in zoom-in duration-300 hover:scale-105 hover:bg-blue-500"
                    aria-label="Abrir Assistente Virtual"
                >
                    <Bot className="w-8 h-8 fill-current" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </button>
            </SheetTrigger>

            {/* Chat Popup Sheet */}
            <SheetContent
                side="bottom"
                className="h-[85vh] p-0 rounded-t-[2rem] border-none shadow-2xl overflow-hidden"
            >
                <div className="h-full w-full bg-background">
                    <ChatInterface onClose={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
