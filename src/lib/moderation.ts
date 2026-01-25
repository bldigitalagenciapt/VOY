/**
 * Simple content moderation utility to filter offensive language.
 * Includes common swear words and hate speech terms in Portuguese.
 */

const FORBIDDEN_WORDS = [
    // Swear words & insults
    'caralho', 'fodasse', 'foda-se', 'merda', 'puta', 'rapariga', 'crespo', 'bronco',
    'estúpido', 'idiota', 'imbecil', 'parvo', 'cabrão', 'porra', 'caralhas',

    // Hate speech (Xenophobia, Racism, Homophobia, etc.)
    'preto', 'macaco', 'tugas', 'zuca', 'brazuca', 'viado', 'maricas', 'panisga',
    'safado', 'marginal', 'criminoso', 'ilegal', 'invasor', 'malditos',
    'escória', 'vai embora', 'volta para a tua terra'
];

export function containsOffensiveContent(text: string): { isOffensive: boolean; word?: string } {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const word of FORBIDDEN_WORDS) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(normalized) || normalized.includes(word)) {
            return { isOffensive: true, word };
        }
    }

    return { isOffensive: false };
}

export function maskOffensiveContent(text: string): string {
    let masked = text;
    for (const word of FORBIDDEN_WORDS) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        masked = masked.replace(regex, '***');
    }
    return masked;
}
