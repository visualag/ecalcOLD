// Calculator Sărbători Legale România
// Generare automată sărbători fixe și mobile (Paște, Rusalii)

export class HolidaysCalculator {
  // Sărbători fixe în România
  static FIXED_HOLIDAYS = [
    { month: 1, day: 1, name: 'Anul Nou' },
    { month: 1, day: 2, name: 'Anul Nou' },
    { month: 1, day: 24, name: 'Unirea Principatelor Române' },
    { month: 5, day: 1, name: 'Ziua Muncii' },
    { month: 6, day: 1, name: 'Ziua Copilului' },
    { month: 8, day: 15, name: 'Adormirea Maicii Domnului' },
    { month: 11, day: 30, name: 'Sfântul Andrei' },
    { month: 12, day: 1, name: 'Ziua Națională a României' },
    { month: 12, day: 25, name: 'Crăciunul' },
    { month: 12, day: 26, name: 'Crăciunul' },
  ];

  // Calculează data Paștelui Ortodox folosind algoritmul lui Gauss
  static calculateOrthodoxEaster(year) {
    // Algoritm Meeus/Jones/Butcher pentru calendar Iulian
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;

    // Convertire la calendar Gregorian (adăugăm 13 zile)
    let easterDate = new Date(year, month - 1, day);
    easterDate.setDate(easterDate.getDate() + 13);

    return easterDate;
  }

  // Generează toate sărbătorile pentru un an
  static getHolidaysForYear(year) {
    const holidays = [];

    // Adaugă sărbători fixe
    this.FIXED_HOLIDAYS.forEach(h => {
      const date = new Date(year, h.month - 1, h.day);
      holidays.push({
        date: date.toISOString().split('T')[0],
        name: h.name,
        type: 'fixed',
      });
    });

    // Calculează Paștele și sărbători mobile
    const easter = this.calculateOrthodoxEaster(year);
    
    // Vinerea Mare (2 zile înainte de Paște)
    const goodFriday = new Date(easter);
    goodFriday.setDate(goodFriday.getDate() - 2);
    holidays.push({
      date: goodFriday.toISOString().split('T')[0],
      name: 'Vinerea Mare',
      type: 'mobile',
    });

    // Paștele (Duminica)
    holidays.push({
      date: easter.toISOString().split('T')[0],
      name: 'Paștele',
      type: 'mobile',
    });

    // A doua zi de Paște (Lunea)
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);
    holidays.push({
      date: easterMonday.toISOString().split('T')[0],
      name: 'A doua zi de Paște',
      type: 'mobile',
    });

    // Rusaliile (50 de zile după Paște - Duminica)
    const pentecost = new Date(easter);
    pentecost.setDate(pentecost.getDate() + 49);
    holidays.push({
      date: pentecost.toISOString().split('T')[0],
      name: 'Rusaliile',
      type: 'mobile',
    });

    // A doua zi de Rusalii (Lunea)
    const pentecostMonday = new Date(pentecost);
    pentecostMonday.setDate(pentecostMonday.getDate() + 1);
    holidays.push({
      date: pentecostMonday.toISOString().split('T')[0],
      name: 'A doua zi de Rusalii',
      type: 'mobile',
    });

    // Sortează cronologic
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    return holidays;
  }

  // Verifică dacă o dată este sărbătoare legală
  static isHoliday(date, year) {
    const holidays = this.getHolidaysForYear(year);
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateStr);
  }

  // Calculează numărul de zile lucrătoare între două date
  static getWorkingDaysBetween(startDate, endDate, year) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const holidays = this.getHolidaysForYear(year);
    const holidayDates = holidays.map(h => h.date);
    
    let workingDays = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Nu este weekend și nu este sărbătoare
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateStr)) {
        workingDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  // Adaugă zile lucrătoare la o dată
  static addWorkingDays(startDate, workingDaysToAdd, year) {
    const start = new Date(startDate);
    const holidays = this.getHolidaysForYear(year);
    const holidayDates = holidays.map(h => h.date);
    
    let workingDaysAdded = 0;
    let currentDate = new Date(start);

    while (workingDaysAdded < workingDaysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Este zi lucrătoare
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateStr)) {
        workingDaysAdded++;
      }
    }

    return currentDate;
  }

  // Generează calendar vizual pentru un an
  static generateCalendar(year) {
    const holidays = this.getHolidaysForYear(year);
    const calendar = [];

    for (let month = 0; month < 12; month++) {
      const monthData = {
        month: month + 1,
        monthName: new Date(year, month, 1).toLocaleString('ro-RO', { month: 'long' }),
        holidays: holidays.filter(h => {
          const hDate = new Date(h.date);
          return hDate.getMonth() === month;
        }),
      };
      calendar.push(monthData);
    }

    return calendar;
  }

  // Info despre surse și actualizare
  static getDataSources() {
    return {
      legal: 'Legea nr. 53/2003 - Codul Muncii (Titlul III, Capitolul II)',
      verification: 'https://www.legislatie.just.ro',
      notes: [
        'Sărbătorile legale din România sunt stabilite prin Codul Muncii',
        'Paștele și Rusaliile sunt calculate automat conform calendarului ortodox',
        'Pentru anul curent, verificați pe site-ul Parlamentului pentru eventuale modificări legislative',
      ],
      updates: 'Ultima actualizare: Februarie 2026',
    };
  }

  // Pre-calculează sărbătorile pentru mai mulți ani (pentru performanță)
  static getHolidaysForYears(startYear, endYear) {
    const allHolidays = {};
    for (let year = startYear; year <= endYear; year++) {
      allHolidays[year] = this.getHolidaysForYear(year);
    }
    return allHolidays;
  }
}

// Export pre-calculat pentru 2025-2030 (pentru MongoDB seed)
export const HOLIDAYS_2025_2030 = HolidaysCalculator.getHolidaysForYears(2025, 2030);

// Funcție helper pentru formatare date în română
export function formatHolidayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
