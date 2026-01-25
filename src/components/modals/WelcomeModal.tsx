import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('voy_seen_welcome');
        if (!hasSeenWelcome) {
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('voy_seen_welcome', 'true');
        setIsOpen(false);
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const { data } = supabase.storage
                .from('voy_secure_docs')
                .getPublicUrl('guia_sobrevivencia_portugal.pdf');

            if (data?.publicUrl) {
                window.open(data.publicUrl, '_blank');
            }
        } catch (err) {
            console.error('Error getting guide url', err);
        } finally {
            setDownloading(false);
            handleClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1555881400-7db40f665c8a?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-48 object-cover"
                        alt="Welcome to Portugal"
                    />
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-2xl font-bold">Bem-vindo ao Voy! 🇵🇹</DialogTitle>
                        <DialogDescription className="text-md pt-2">
                            Estamos aqui para facilitar a sua jornada em Portugal. Preparamos um presente especial: o **Guia de Sobrevivência PDF**.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 pt-2">
                        <p className="text-sm text-muted-foreground">O que vais encontrar neste guia:</p>
                        <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">✅ Como tirar o NIF e NISS</li>
                            <li className="flex items-center gap-2">✅ Dicas de arrendamento</li>
                            <li className="flex items-center gap-2">✅ Checklist da residência</li>
                        </ul>
                    </div>

                    <DialogFooter className="flex flex-col gap-3 sm:flex-col pt-4">
                        <Button
                            onClick={handleDownload}
                            className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20"
                            disabled={downloading}
                        >
                            <Download className="w-5 h-5" />
                            Baixar Guia Grátis
                        </Button>
                        <Button variant="ghost" onClick={handleClose} className="w-full text-muted-foreground h-12 rounded-2xl">
                            Agora não, obrigado
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
