import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, AlertCircle, HeartPulse, ShieldAlert, X, User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useApp } from '@/contexts/AppContext';

interface EmergencyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
    const { profile } = useProfile();
    const { t } = useApp();

    const contacts = [
        {
            number: '112',
            label: t('emergency.general') || 'Emergência Geral',
            desc: t('emergency.general_desc') || 'Polícia, Bombeiros, Ambulância',
            icon: ShieldAlert,
            color: 'bg-red-500'
        },
        {
            number: '808 24 24 24',
            label: t('emergency.health24') || 'Saúde 24',
            desc: t('emergency.health24_desc') || 'Triagem e aconselhamento médico',
            icon: HeartPulse,
            color: 'bg-blue-500'
        },
        {
            number: '+351 218 106 191',
            label: t('emergency.aima') || 'Apoio ao Migrante',
            desc: t('emergency.aima_desc') || 'Linha oficial da AIMA / ACM',
            icon: AlertCircle,
            color: 'bg-orange-500'
        }
    ];

    if (profile?.emergency_contact) {
        contacts.unshift({
            number: profile.emergency_contact,
            label: profile.emergency_contact_name || t('emergency.personal_contact'),
            desc: t('emergency.personal_desc'),
            icon: User,
            color: 'bg-primary'
        });
    }

    const handleCall = (number: string) => {
        window.location.href = `tel:${number.replace(/\s/g, '')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[32px] p-6 gap-6 border-none bg-background/95 backdrop-blur-xl">
                <DialogHeader className="items-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2 animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">Números de Emergência</DialogTitle>
                    <p className="text-sm text-muted-foreground text-center">Portugal 🇵🇹</p>
                </DialogHeader>

                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <button
                            key={contact.number}
                            onClick={() => handleCall(contact.number)}
                            className="w-full flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/50 active:scale-95 transition-all text-left shadow-sm hover:shadow-md"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${contact.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                                <contact.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{contact.label}</p>
                                <p className="text-xl font-black">{contact.number}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{contact.desc}</p>
                            </div>
                            <Phone className="w-5 h-5 text-muted-foreground opacity-50" />
                        </button>
                    ))}
                </div>

                <div className="mt-2 p-4 bg-muted/30 rounded-2xl">
                    <p className="text-[10px] text-center text-muted-foreground italic leading-relaxed">
                        Em caso de perigo iminente, ligue sempre 112. Esta funcionalidade utiliza a rede do seu telemóvel.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
