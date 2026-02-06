// Salary calculation engine with all fiscal facilities
// Actualizat conform Codului Fiscal 2025/2026 - Legislație reală

export class SalaryCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules.salary;
  }

  // Deducere personală conform grilei din Codul Fiscal
  // Se acordă DOAR pentru venituri brute lunare de maxim 3600 RON
  // Art. 77 Cod Fiscal - grila deducerilor personale
  calculatePersonalDeduction(grossSalary, dependents = 0, isBazicFunction = true) {
    // Deducerea personală se acordă doar pentru funcția de bază
    if (!isBazicFunction) return 0;
    
    // Fără deducere pentru salarii peste pragul maxim (3600 RON)
    const maxThreshold = this.rules?.personal_deduction_max_income || 3600;
    if (grossSalary > maxThreshold) return 0;
    
    // Grila deducerilor personale conform Codului Fiscal 2025/2026
    // Pentru venituri până la 1950 RON - deduceri maxime
    const baseDeductions = {
      0: 300,   // Fără persoane în întreținere
      1: 700,   // 1 persoană în întreținere
      2: 1000,  // 2 persoane în întreținere
      3: 1150,  // 3 persoane în întreținere
      4: 1310,  // 4+ persoane în întreținere
    };
    
    const minThreshold = 1950;
    const numDependents = Math.min(dependents, 4);
    const baseDeduction = baseDeductions[numDependents] || 0;
    
    if (grossSalary <= minThreshold) {
      return baseDeduction;
    }
    
    // Pentru venituri între 1950 și 3600 RON - deducere degresivă
    // Formula: Deducere = BaseDeduction * (1 - (Brut - 1950) / (3600 - 1950))
    const ratio = (grossSalary - minThreshold) / (maxThreshold - minThreshold);
    const deduction = baseDeduction * (1 - ratio);
    
    // Rotunjire la 10 lei în favoarea angajatului
    return Math.ceil(deduction / 10) * 10;
  }

  // Deducere suplimentară pentru tineri sub 26 ani
  // 15% din salariul minim pentru venituri de maxim salMin + 2000 RON
  calculateYouthDeduction(grossSalary, age, isBasicFunction = true) {
    if (!isBasicFunction || age >= 26) return 0;
    
    const minSalary = this.rules?.minimum_salary || 4050;
    const threshold = minSalary + 2000;
    
    if (grossSalary > threshold) return 0;
    
    return Math.round(minSalary * 0.15);
  }

  // Calcul standard (fără facilități speciale)
  calculateStandard(grossSalary, options = {}) {
    const { 
      dependents = 0, 
      children = 0, 
      mealVouchers = 0, 
      voucherDays = 0,
      isBasicFunction = true,
      age = 30,
    } = options;
    
    const casRate = (this.rules?.cas_rate || 25) / 100;
    const cassRate = (this.rules?.cass_rate || 10) / 100;
    const taxRate = (this.rules?.income_tax_rate || 10) / 100;
    
    // 1. CAS (25% din brut)
    const cas = Math.round(grossSalary * casRate * 100) / 100;
    
    // 2. Valoare tichete masă (contribuie la CASS)
    const voucherValue = mealVouchers * voucherDays;
    
    // 3. CASS (10% din brut + tichete)
    const cass = Math.round((grossSalary + voucherValue) * cassRate * 100) / 100;
    
    // 4. Deducere personală (doar pentru funcția de bază și venituri sub 3600 RON)
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, dependents, isBasicFunction);
    
    // 5. Deducere tineri sub 26 ani
    const youthDeduction = this.calculateYouthDeduction(grossSalary, age, isBasicFunction);
    
    // 6. Deducere pentru copii (100 RON/copil/lună)
    const childDeduction = (this.rules?.child_deduction || 100) * children;
    
    // 7. Venit impozabil = Brut - CAS - CASS - Deduceri
    const totalDeductions = personalDeduction + youthDeduction + childDeduction;
    const taxableIncome = Math.max(0, grossSalary - cas - cass - totalDeductions);
    
    // 8. Impozit pe venit (10% din venitul impozabil)
    const incomeTax = Math.round(taxableIncome * taxRate * 100) / 100;
    
    // 9. Salariu NET = Brut - CAS - CASS - Impozit
    const netSalary = Math.round((grossSalary - cas - cass - incomeTax) * 100) / 100;
    
    // 10. Cost angajator: Brut + CAM (2.25%) + Tichete
    const camRate = (this.rules?.cam_rate || 2.25) / 100;
    const cam = Math.round(grossSalary * camRate * 100) / 100;
    const totalCost = Math.round((grossSalary + cam + voucherValue) * 100) / 100;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction,
      youthDeduction,
      childDeduction,
      totalDeductions,
      taxableIncome,
      cam,
      totalCost,
      voucherValue,
      // Breakdown pentru UI
      breakdown: {
        casPercent: this.rules?.cas_rate || 25,
        cassPercent: this.rules?.cass_rate || 10,
        taxPercent: this.rules?.income_tax_rate || 10,
        camPercent: this.rules?.cam_rate || 2.25,
      },
    };
  }

  // Sector IT - scutire impozit pe venit pentru salarii sub 10.000 RON
  calculateIT(grossSalary, options = {}) {
    if (!this.rules?.it_tax_exempt) {
      return this.calculateStandard(grossSalary, options);
    }
    
    const threshold = this.rules?.it_threshold || 10000;
    const { 
      dependents = 0, 
      children = 0, 
      mealVouchers = 0, 
      voucherDays = 0,
      isBasicFunction = true,
    } = options;
    
    const casRate = (this.rules?.cas_rate || 25) / 100;
    const cassRate = (this.rules?.cass_rate || 10) / 100;
    const taxRate = (this.rules?.income_tax_rate || 10) / 100;
    
    const cas = Math.round(grossSalary * casRate * 100) / 100;
    const voucherValue = mealVouchers * voucherDays;
    const cass = Math.round((grossSalary + voucherValue) * cassRate * 100) / 100;
    
    let incomeTax = 0;
    let exemptAmount = 0;
    let taxableIncome = 0;
    
    // Scutire de impozit pentru partea din salariu până la 10.000 RON
    if (grossSalary <= threshold) {
      // Complet scutit
      exemptAmount = grossSalary;
      incomeTax = 0;
      taxableIncome = 0;
    } else {
      // Parțial scutit - impozit doar pe ce depășește pragul
      exemptAmount = threshold;
      const taxableAmount = grossSalary - threshold;
      const personalDeduction = this.calculatePersonalDeduction(taxableAmount, dependents, isBasicFunction);
      taxableIncome = Math.max(0, taxableAmount - personalDeduction);
      incomeTax = Math.round(taxableIncome * taxRate * 100) / 100;
    }
    
    const netSalary = Math.round((grossSalary - cas - cass - incomeTax) * 100) / 100;
    const cam = Math.round(grossSalary * ((this.rules?.cam_rate || 2.25) / 100) * 100) / 100;
    const totalCost = Math.round((grossSalary + cam + voucherValue) * 100) / 100;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction: 0, // IT nu aplică deducere personală normală
      cam,
      totalCost,
      voucherValue,
      taxableIncome,
      exemptAmount,
      itExemption: true,
      breakdown: {
        casPercent: this.rules?.cas_rate || 25,
        cassPercent: this.rules?.cass_rate || 10,
        taxPercent: this.rules?.income_tax_rate || 10,
        camPercent: this.rules?.cam_rate || 2.25,
      },
    };
  }

  // Sector Construcții / Agricultură - CAS redus (21.25%)
  calculateConstruction(grossSalary, options = {}) {
    const { 
      dependents = 0, 
      children = 0, 
      mealVouchers = 0, 
      voucherDays = 0,
      isBasicFunction = true,
    } = options;
    
    // CAS redus pentru construcții
    const casRate = (this.rules?.construction_cas_rate || 21.25) / 100;
    const cassRate = this.rules?.construction_cass_exempt ? 0 : (this.rules?.cass_rate || 10) / 100;
    const taxRate = (this.rules?.income_tax_rate || 10) / 100;
    const threshold = this.rules?.tax_exemption_threshold || 10000;
    
    const cas = Math.round(grossSalary * casRate * 100) / 100;
    const voucherValue = mealVouchers * voucherDays;
    const cass = Math.round((grossSalary + voucherValue) * cassRate * 100) / 100;
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, dependents, isBasicFunction);
    
    let incomeTax = 0;
    let exemptAmount = 0;
    
    // Scutire de impozit pe venit pentru salarii sub 10.000 RON în construcții
    if (this.rules?.construction_tax_exempt && grossSalary <= threshold) {
      exemptAmount = grossSalary;
      incomeTax = 0;
    } else {
      const taxableIncome = Math.max(0, grossSalary - cas - cass - personalDeduction);
      incomeTax = Math.round(taxableIncome * taxRate * 100) / 100;
    }
    
    const netSalary = Math.round((grossSalary - cas - cass - incomeTax) * 100) / 100;
    const cam = Math.round(grossSalary * ((this.rules?.cam_rate || 2.25) / 100) * 100) / 100;
    const totalCost = Math.round((grossSalary + cam + voucherValue) * 100) / 100;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction,
      cam,
      totalCost,
      voucherValue,
      exemptAmount,
      reducedCAS: true,
      constructionExemption: this.rules?.construction_tax_exempt,
      breakdown: {
        casPercent: this.rules?.construction_cas_rate || 21.25,
        cassPercent: this.rules?.construction_cass_exempt ? 0 : (this.rules?.cass_rate || 10),
        taxPercent: this.rules?.income_tax_rate || 10,
        camPercent: this.rules?.cam_rate || 2.25,
      },
    };
  }

  // Part-time - overtaxare dacă sub salariul minim și nu e student/pensionar
  calculatePartTime(grossSalary, options = {}) {
    const minSalary = this.rules?.minimum_salary || 4050;
    const { isStudentOrPensioner = false, dependents = 0, children = 0 } = options;
    
    // Studenți și pensionari nu sunt afectați de overtaxare
    if (isStudentOrPensioner || grossSalary >= minSalary) {
      return this.calculateStandard(grossSalary, options);
    }
    
    // Overtaxare: angajatorul plătește diferența până la salariul minim
    const casRate = (this.rules?.cas_rate || 25) / 100;
    const cassRate = (this.rules?.cass_rate || 10) / 100;
    
    // Angajatul plătește pe salariul real
    const employeeCAS = Math.round(grossSalary * casRate * 100) / 100;
    const employeeCASS = Math.round(grossSalary * cassRate * 100) / 100;
    
    // Angajatorul plătește diferența până la salariul minim
    const requiredCAS = Math.round(minSalary * casRate * 100) / 100;
    const requiredCASS = Math.round(minSalary * cassRate * 100) / 100;
    
    const employerExtraCAS = Math.round((requiredCAS - employeeCAS) * 100) / 100;
    const employerExtraCASS = Math.round((requiredCASS - employeeCASS) * 100) / 100;
    
    const result = this.calculateStandard(grossSalary, options);
    result.employerExtraCAS = employerExtraCAS;
    result.employerExtraCASS = employerExtraCASS;
    result.totalCost = Math.round((result.totalCost + employerExtraCAS + employerExtraCASS) * 100) / 100;
    result.overtaxed = true;
    result.overtaxNote = `Angajatorul plătește suplimentar ${(employerExtraCAS + employerExtraCASS).toFixed(2)} RON contribuții`;
    
    return result;
  }

  // Calcul invers: Net → Brut (iterativ)
  calculateNetToGross(netSalary, sector = 'standard', options = {}) {
    let grossGuess = netSalary * 1.5; // Start cu o estimare
    let iterations = 0;
    const maxIterations = 100;
    const tolerance = 0.01;
    
    while (iterations < maxIterations) {
      let result;
      switch(sector) {
        case 'it':
          result = this.calculateIT(grossGuess, options);
          break;
        case 'construction':
        case 'agriculture':
          result = this.calculateConstruction(grossGuess, options);
          break;
        default:
          result = this.calculateStandard(grossGuess, options);
      }
      
      const diff = result.net - netSalary;
      if (Math.abs(diff) < tolerance) {
        return result;
      }
      
      // Ajustare Newton-Raphson simplificată
      grossGuess = grossGuess - diff * 0.7;
      iterations++;
    }
    
    // Returnează cea mai bună aproximare
    switch(sector) {
      case 'it':
        return this.calculateIT(grossGuess, options);
      case 'construction':
        return this.calculateConstruction(grossGuess, options);
      default:
        return this.calculateStandard(grossGuess, options);
    }
  }

  // Calcul Cost Total Angajator → Net
  calculateCostToNet(totalCost, sector = 'standard', options = {}) {
    const camRate = (this.rules?.cam_rate || 2.25) / 100;
    const { mealVouchers = 0, voucherDays = 0 } = options;
    const voucherValue = mealVouchers * voucherDays;
    
    // Brut aproximativ: (CostTotal - Tichete) / (1 + CAM)
    const grossApprox = (totalCost - voucherValue) / (1 + camRate);
    
    switch(sector) {
      case 'it':
        return this.calculateIT(grossApprox, options);
      case 'construction':
      case 'agriculture':
        return this.calculateConstruction(grossApprox, options);
      default:
        return this.calculateStandard(grossApprox, options);
    }
  }
}

// API BNR pentru cursuri valutare
export async function getBNRExchangeRate(currency = 'EUR') {
  try {
    const response = await fetch('https://www.bnr.ro/nbrfxrates.xml');
    const text = await response.text();
    
    // Parse XML simplu
    const rateMatch = text.match(new RegExp(`<Rate currency="${currency}"[^>]*>([0-9.]+)</Rate>`));
    if (rateMatch) {
      return parseFloat(rateMatch[1]);
    }
    
    // Fallback cu valori aproximative
    return currency === 'EUR' ? 4.98 : 4.50;
  } catch (error) {
    console.error('Error fetching BNR rate:', error);
    return currency === 'EUR' ? 4.98 : 4.50;
  }
}
