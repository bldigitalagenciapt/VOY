import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle2, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PremiumWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumWelcomeModal({ isOpen, onClose }: PremiumWelcomeModalProps) {
    useEffect(() => {
        if (isOpen) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#161B22] border-white/10 text-white rounded-[2rem] max-h-[85vh] overflow-y-auto scrollbar-hide">
                <DialogHeader className="pt-6 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                        <Trophy className="w-8 h-8 text-blue-500 animate-bounce" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center leading-tight">
                        Bem-vindo ao <span className="text-blue-500">VOY Premium</span>!
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-center text-sm font-medium px-4">
                        Seu acesso vitalício foi confirmado com sucesso. Prepare-se para uma experiência sem limites!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    {[
                        "Documentos ilimitados liberados",
                        "Cofre criptografado ativado",
                        "Suporte VIP prioritário",
                        "Acesso Vitalício garantido"
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm font-bold text-slate-200">{text}</p>
                        </div>
                    ))}
                </div>

                <DialogFooter className="pb-6 sm:justify-center">
                    <Button
                        onClick={onClose}
                        className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-base font-black shadow-lg shadow-blue-500/20 w-full"
                    >
                        VAMOS COMEÇAR!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
