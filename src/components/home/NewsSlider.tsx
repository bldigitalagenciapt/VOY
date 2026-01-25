import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface Noticia {
    id: string;
    titulo: string;
    resumo: string;
    link: string;
    imagem_url: string;
}

export function NewsSlider() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    useEffect(() => {
        async function fetchNoticias() {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setNoticias(data);
            }
            setLoading(false);
        }

        fetchNoticias();
    }, []);

    if (loading) {
        return <Skeleton className="w-full h-48 rounded-3xl mb-6" />;
    }

    if (noticias.length === 0) return null;

    return (
        <div className="overflow-hidden mb-8 rounded-3xl bg-muted/20 border border-white/5 shadow-xl" ref={emblaRef}>
            <div className="flex">
                {noticias.map((noticia) => (
                    <div
                        key={noticia.id}
                        className="flex-[0_0_100%] min-w-0 relative h-52 cursor-pointer group"
                        onClick={() => noticia.link && window.open(noticia.link, '_blank')}
                    >
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                        <img
                            src={noticia.imagem_url || 'https://images.unsplash.com/photo-1555881400-7db40f665c8a?q=80&w=2070&auto=format&fit=crop'}
                            alt={noticia.titulo}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365234-781fbc37c864?q=80&w=2070&auto=format&fit=crop';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                            <div className="space-y-2">
                                <span className="px-2 py-0.5 bg-blue-500/30 backdrop-blur-md border border-blue-400/30 rounded-full text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                                    AIMA Oficial
                                </span>
                                <h3 className="text-white font-extrabold text-xl leading-tight line-clamp-2 flex items-center gap-2 group-hover:text-primary/90 transition-colors">
                                    {noticia.titulo}
                                    {noticia.link && <ExternalLink className="w-4 h-4 opacity-50 flex-shrink-0" />}
                                </h3>
                                <p className="text-white/70 text-xs line-clamp-2 font-medium">
                                    {noticia.resumo}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
