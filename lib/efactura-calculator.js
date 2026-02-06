// e-Factura Calculator - Termene și Verificare Conformitate
// NO AMENZI - doar calcul termene și verificare obligativitate

export class EFacturaCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules?.efactura || {};
  }

  // Calculează data limită de transmitere (5 zile lucrătoare)
  calculateDeadline(invoiceDate, holidays = []) {
    const deadline = new Date(invoiceDate);
    let workingDays = 0;
    const targetDays = this.rules.working_days_deadline || 5;
    
    while (workingDays < targetDays) {
      deadline.setDate(deadline.getDate() + 1);
      
      // Skip weekends
      if (deadline.getDay() === 0 || deadline.getDay() === 6) {
        continue;
      }
      
      // Skip holidays
      const dateStr = deadline.toISOString().split('T')[0];
      if (holidays.includes(dateStr)) {
        continue;
      }
      
      workingDays++;
    }
    
    return deadline;
  }

  // Verifică dacă termenul a fost depășit
  isOverdue(invoiceDate, transmissionDate, holidays = []) {
    const deadline = this.calculateDeadline(invoiceDate, holidays);
    return new Date(transmissionDate) > deadline;
  }

  // Verifică obligativitatea transmiterii (B2B vs B2C)
  checkMandatory(transactionType, year = 2026) {
    // B2B - obligatoriu din 2024
    if (transactionType === 'B2B') {
      return {
        mandatory: true,
        reason: 'Tranzacții B2B - obligatoriu din 1 iulie 2024',
        deadline: '5 zile lucrătoare de la emitere',
      };
    }
    
    // B2C - obligatoriu din 2025
    if (transactionType === 'B2C' && year >= 2025) {
      return {
        mandatory: true,
        reason: 'Tranzacții B2C - obligatoriu din 1 ianuarie 2025',
        deadline: '5 zile lucrătoare de la emitere',
      };
    }
    
    return {
      mandatory: false,
      reason: 'Nu există obligativitate pentru acest tip de tranzacție',
      deadline: null,
    };
  }

  // Info despre asistență ANAF
  getANAFInfo() {
    return {
      portal: 'https://e-factura.anaf.ro',
      ghid: 'https://www.anaf.ro/ghid-utilizare-efactura',
      suport: 'efactura@anaf.ro',
      telefon: '0800 108 800',
      programLucru: 'Luni - Vineri: 08:00 - 16:00',
    };
  }

  // Calcul timeline pentru obligativitate
  getImplementationTimeline() {
    return [
      { date: '2024-07-01', event: 'Obligatoriu pentru tranzacții B2B (companie către companie)' },
      { date: '2025-01-01', event: 'Obligatoriu pentru tranzacții B2C (companie către consumatori)' },
      { date: '2026-01-01', event: 'Obligatoriu pentru toți contribuabilii cu venituri peste pragul TVA' },
    ];
  }
}
