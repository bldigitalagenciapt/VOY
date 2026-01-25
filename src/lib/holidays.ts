import { addDays, getYear, isSameDay } from 'date-fns';

export interface Holiday {
    date: Date;
    name_pt: string;
    name_en: string;
    is_fixed: boolean;
}

function getEaster(year: number): Date {
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return new Date(year, month - 1, day);
}

export function getPortugalHolidays(year: number): Holiday[] {
    const easter = getEaster(year);

    const fixedHolidays: Holiday[] = [
        { date: new Date(year, 0, 1), name_pt: 'Ano Novo', name_en: 'New Year', is_fixed: true },
        { date: new Date(year, 3, 25), name_pt: 'Dia da Liberdade', name_en: 'Freedom Day', is_fixed: true },
        { date: new Date(year, 4, 1), name_pt: 'Dia do Trabalhador', name_en: 'Labor Day', is_fixed: true },
        { date: new Date(year, 5, 10), name_pt: 'Dia de Portugal', name_en: 'Portugal Day', is_fixed: true },
        { date: new Date(year, 7, 15), name_pt: 'Assunção de Nossa Senhora', name_en: 'Assumption Day', is_fixed: true },
        { date: new Date(year, 9, 5), name_pt: 'Implantação da República', name_en: 'Republic Day', is_fixed: true },
        { date: new Date(year, 10, 1), name_pt: 'Todos os Santos', name_en: 'All Saints Day', is_fixed: true },
        { date: new Date(year, 11, 1), name_pt: 'Restauração da Independência', name_en: 'Restoration of Independence', is_fixed: true },
        { date: new Date(year, 11, 8), name_pt: 'Imaculada Conceição', name_en: 'Immaculate Conception', is_fixed: true },
        { date: new Date(year, 11, 25), name_pt: 'Natal', name_en: 'Christmas', is_fixed: true },
    ];

    const mobileHolidays: Holiday[] = [
        { date: addDays(easter, -2), name_pt: 'Sexta-feira Santa', name_en: 'Good Friday', is_fixed: false },
        { date: easter, name_pt: 'Páscoa', name_en: 'Easter', is_fixed: false },
        { date: addDays(easter, 60), name_pt: 'Corpo de Deus', name_en: 'Corpus Christi', is_fixed: false },
    ];

    return [...fixedHolidays, ...mobileHolidays].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function isPortugalHoliday(date: Date): Holiday | undefined {
    const year = getYear(date);
    const holidays = getPortugalHolidays(year);
    return holidays.find(h => isSameDay(h.date, date));
}
