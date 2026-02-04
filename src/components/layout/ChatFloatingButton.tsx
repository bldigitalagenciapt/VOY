import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChatFloatingButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/assistant')}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/40 flex items-center justify-center z-40 transition-transform active:scale-90 animate-in fade-in zoom-in duration-300 hover:scale-105"
            aria-label="Abrir Assistente Virtual"
        >
            <Bot className="w-8 h-8 fill-current" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
        </button>
    );
}
