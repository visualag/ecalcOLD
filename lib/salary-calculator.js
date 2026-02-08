// Salary calculation engine with all fiscal facilities
// Actualizat conform Codului Fiscal 2025/2026 - Legislație reală

export class SalaryCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules.salary;
  }

  // ============================================
  // DEDUCERE PERSONALĂ - Formula Degresivă
  // ============================================
  // Art. 77 Cod Fiscal - deducere pentru venituri până la SalMin + 2000 RON
  // Deducerea de bază (807 RON default) scade liniar până la 0 la pragul maxim
  calculatePersonalDeduction(grossSalary, isBasicFunction = true) {
    // Deducerea personală se acordă doar pentru funcția de bază
    if (!isBasicFunction) return 0;
    
    const minSalary = this.rules?.minimum_salary || 4050;
    // Deducerea de bază din Admin (default 807 RON pentru a obține Net 2967 la Brut 5000)
    const deductionBase = this.rules?.personal_deduction_base || 807;
    const deductionRange = this.rules?.personal_deduction_range || 2000;
    const maxThreshold = minSalary + deductionRange; // 4050 + 2000 = 6050 RON
    
    // Fără deducere pentru salarii peste pragul maxim (SalMin + 2000)
    if (grossSalary > maxThreshold) return 0;
    
    // Deducere maximă pentru salarii până la salariul minim
    if (grossSalary <= minSalary) {
      return deductionBase;
    }
    
    // Formula degresivă: DP = deductionBase * (1 - (Brut - SalMin) / 2000)
    const ratio = (grossSalary - minSalary) / deductionRange;
    const deduction = deductionBase * (1 - ratio);
    
    // Rotunjire contabilă (număr întreg)
    return Math.round(deduction);
  }

  // Deducere suplimentară pentru tineri sub 26 ani
  calculateYouthDeduction(grossSalary, age, isBasicFunction = true) {
    if (!isBasicFunction || age >= 26) return 0;
    
    const minSalary = this.rules?.minimum_salary || 4050;
    const threshold = minSalary + 2000;
    
    if (grossSalary > threshold) return 0;
    
    return Math.round(minSalary * 0.15);
  }

  // ============================================
  // CALCUL STANDARD - Logica Fiscală Corectă
  // ============================================
  calculateStandard(grossSalary, options = {}) {
    const { 
      dependents = 0, 
      children = 0, 
      mealVouchers = 0, 
      voucherDays = 0,
      isBasicFunction = true,
      age = 30,
    } = options;
    
    const minSalary = this.rules?.minimum_salary || 4050;
    const casRate = (this.rules?.cas_rate || 25) / 100;
    const cassRate = (this.rules?.cass_rate || 10) / 100;
    const taxRate = (this.rules?.income_tax_rate || 10) / 100;
    const untaxedAmount = this.rules?.untaxed_amount || 300;
    
    // ============================================
    // LOGICA SUMĂ NETAXABILĂ (300 RON)
    // Se aplică DOAR dacă Brut <= Salariu Minim
    // ============================================
    let taxableGross = grossSalary;
    let appliedUntaxedAmount = 0;
    
    if (grossSalary <= minSalary) {
      taxableGross = grossSalary - untaxedAmount;
      appliedUntaxedAmount = untaxedAmount;
    }
    
    // ============================================
    // CALCUL TAXE PE BAZA TAXABILĂ
    // ============================================
    // 1. CAS (25% din baza taxabilă)
    const cas = Math.round(taxableGross * casRate);
    
    // 2. Valoare tichete masă (contribuie la CASS)
    const voucherValue = mealVouchers * voucherDays;
    
    // 3. CASS (10% din baza taxabilă + tichete)
    const cass = Math.round((taxableGross + voucherValue) * cassRate);
    
    // ============================================
    // DEDUCERI
    // ============================================
    // 4. Deducere personală de BAZĂ (formula degresivă)
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, isBasicFunction);
    
    // 5. Deducere FIXĂ pentru copii
    const childDeduction = (this.rules?.child_deduction || 100) * children;
    
    // 6. Deducere FIXĂ pentru alte persoane în întreținere
    const dependentDeduction = (this.rules?.dependent_deduction || 0) * dependents;
    
    // 7. Deducere tineri sub 26 ani
    const youthDeduction = this.calculateYouthDeduction(grossSalary, age, isBasicFunction);
    
    // ============================================
    // CALCUL IMPOZIT PE VENIT
    // ============================================
    // Venit impozabil = Baza Taxabilă - CAS - CASS - Toate Deducerile
    const totalDeductions = personalDeduction + childDeduction + dependentDeduction + youthDeduction;
    const taxableIncome = Math.max(0, taxableGross - cas - cass - totalDeductions);
    
    // Impozit pe venit (10% din venitul impozabil)
    const incomeTax = Math.round(taxableIncome * taxRate);
    
    // ============================================
    // CALCUL NET
    // ============================================
    // NET = Brut - CAS - CASS - Impozit
    // NOTĂ: Se folosește BRUT ORIGINAL, nu baza taxabilă
    const netSalary = grossSalary - cas - cass - incomeTax;
    
    // Cost angajator: Brut + CAM (2.25%) + Tichete
    const camRate = (this.rules?.cam_rate || 2.25) / 100;
    const cam = Math.round(grossSalary * camRate);
    const totalCost = grossSalary + cam + voucherValue;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction,
      childDeduction,
      dependentDeduction,
      youthDeduction,
      totalDeductions,
      taxableIncome,
      taxableGross,
      untaxedAmount: appliedUntaxedAmount,
      cam,
      totalCost,
      voucherValue,
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
    
    const minSalary = this.rules?.minimum_salary || 4050;
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
    const untaxedAmount = this.rules?.untaxed_amount || 300;
    
    // Suma netaxabilă se aplică DOAR dacă Brut <= Salariu Minim
    let taxableGross = grossSalary;
    let appliedUntaxedAmount = 0;
    
    if (grossSalary <= minSalary) {
      taxableGross = grossSalary - untaxedAmount;
      appliedUntaxedAmount = untaxedAmount;
    }
    
    // Calcul taxe pe baza taxabilă
    const cas = Math.round(taxableGross * casRate);
    const voucherValue = mealVouchers * voucherDays;
    const cass = Math.round((taxableGross + voucherValue) * cassRate);
    
    let incomeTax = 0;
    let exemptAmount = 0;
    let taxableIncome = 0;
    let personalDeduction = 0;
    let childDeduction = 0;
    let dependentDeduction = 0;
    
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
      
      personalDeduction = this.calculatePersonalDeduction(taxableAmount, isBasicFunction);
      childDeduction = (this.rules?.child_deduction || 100) * children;
      dependentDeduction = (this.rules?.dependent_deduction || 0) * dependents;
      
      const totalDeductions = personalDeduction + childDeduction + dependentDeduction;
      taxableIncome = Math.max(0, taxableAmount - totalDeductions);
      incomeTax = Math.round(taxableIncome * taxRate);
    }
    
    const netSalary = grossSalary - cas - cass - incomeTax;
    const cam = Math.round(grossSalary * ((this.rules?.cam_rate || 2.25) / 100));
    const totalCost = grossSalary + cam + voucherValue;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction,
      childDeduction,
      dependentDeduction,
      cam,
      totalCost,
      voucherValue,
      taxableIncome,
      taxableGross,
      untaxedAmount,
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
    
    // 0. SUMA NETAXABILĂ - se scade din Brut ÎNAINTE de orice calcul
    const untaxedAmount = this.rules?.untaxed_amount_enabled !== false 
      ? (this.rules?.untaxed_amount || 0) 
      : 0;
    const taxableGross = Math.max(0, grossSalary - untaxedAmount);
    
    // ROTUNJIRE CONTABILĂ - folosim taxableGross
    const cas = Math.round(taxableGross * casRate);
    const voucherValue = mealVouchers * voucherDays;
    const cass = Math.round((taxableGross + voucherValue) * cassRate);
    
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, isBasicFunction);
    const childDeduction = (this.rules?.child_deduction || 100) * children;
    const dependentDeduction = (this.rules?.dependent_deduction || 0) * dependents;
    
    let incomeTax = 0;
    let exemptAmount = 0;
    let taxableIncome = 0;
    
    // Scutire de impozit pe venit pentru salarii sub 10.000 RON în construcții
    if (this.rules?.construction_tax_exempt && taxableGross <= threshold) {
      exemptAmount = taxableGross;
      incomeTax = 0;
    } else {
      const totalDeductions = personalDeduction + childDeduction + dependentDeduction;
      taxableIncome = Math.max(0, taxableGross - cas - cass - totalDeductions);
      // ROTUNJIRE CONTABILĂ
      incomeTax = Math.round(taxableIncome * taxRate);
    }
    
    // NET = Brut - taxe rotunjite (se folosește grossSalary original)
    const netSalary = grossSalary - cas - cass - incomeTax;
    
    // ROTUNJIRE CONTABILĂ
    const cam = Math.round(grossSalary * ((this.rules?.cam_rate || 2.25) / 100));
    const totalCost = grossSalary + cam + voucherValue;
    
    return {
      gross: grossSalary,
      net: netSalary,
      cas,
      cass,
      incomeTax,
      personalDeduction,
      childDeduction,
      dependentDeduction,
      taxableGross,
      untaxedAmount,
      taxableIncome,
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
    
    // ROTUNJIRE CONTABILĂ - Angajatul plătește pe salariul real
    const employeeCAS = Math.round(grossSalary * casRate);
    const employeeCASS = Math.round(grossSalary * cassRate);
    
    // ROTUNJIRE CONTABILĂ - Angajatorul plătește diferența până la salariul minim
    const requiredCAS = Math.round(minSalary * casRate);
    const requiredCASS = Math.round(minSalary * cassRate);
    
    const employerExtraCAS = requiredCAS - employeeCAS;
    const employerExtraCASS = requiredCASS - employeeCASS;
    
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
