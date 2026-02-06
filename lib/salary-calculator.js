// Salary calculation engine with all fiscal facilities
export class SalaryCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules.salary;
  }

  // Personal deduction based on gross income (Grila 2026)
  calculatePersonalDeduction(grossSalary, dependents = 0, children = 0) {
    const base = this.rules.personal_deduction_base || 510;
    const childBonus = (this.rules.child_deduction || 100) * children;
    
    // Simplified grid - expand based on actual 2026 law
    let deduction = base;
    if (grossSalary <= 2000) deduction = base;
    else if (grossSalary <= 4000) deduction = base * 0.8;
    else if (grossSalary <= 6000) deduction = base * 0.5;
    else deduction = 0;
    
    return deduction + childBonus;
  }

  // Standard calculation (no facilities)
  calculateStandard(grossSalary, options = {}) {
    const { dependents = 0, children = 0, mealVouchers = 0, voucherDays = 0 } = options;
    
    const casRate = (this.rules.cas_rate || 25) / 100;
    const cassRate = (this.rules.cass_rate || 10) / 100;
    const taxRate = (this.rules.income_tax_rate || 10) / 100;
    
    const cas = grossSalary * casRate;
    const voucherValue = mealVouchers * voucherDays;
    const cass = (grossSalary + voucherValue) * cassRate;
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, dependents, children);
    const taxableIncome = Math.max(0, grossSalary - cas - cass - personalDeduction);
    const incomeTax = taxableIncome * taxRate;
    const netSalary = grossSalary - cas - cass - incomeTax;
    
    const cam = grossSalary * ((this.rules.cam_rate || 2.25) / 100);
    const totalCost = grossSalary + cam + voucherValue;
    
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
      taxableIncome,
    };
  }

  // IT Sector calculation (tax exemption up to threshold)
  calculateIT(grossSalary, options = {}) {
    if (!this.rules.it_tax_exempt) {
      return this.calculateStandard(grossSalary, options);
    }
    
    const threshold = this.rules.it_threshold || 10000;
    const { dependents = 0, children = 0, mealVouchers = 0, voucherDays = 0 } = options;
    
    const casRate = (this.rules.cas_rate || 25) / 100;
    const cassRate = (this.rules.cass_rate || 10) / 100;
    const taxRate = (this.rules.income_tax_rate || 10) / 100;
    
    const cas = grossSalary * casRate;
    const voucherValue = mealVouchers * voucherDays;
    const cass = (grossSalary + voucherValue) * cassRate;
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, dependents, children);
    
    let incomeTax = 0;
    if (grossSalary > threshold) {
      const taxableAmount = grossSalary - threshold;
      const taxableIncome = Math.max(0, taxableAmount - cas - cass - personalDeduction);
      incomeTax = taxableIncome * taxRate;
    }
    
    const netSalary = grossSalary - cas - cass - incomeTax;
    const cam = grossSalary * ((this.rules.cam_rate || 2.25) / 100);
    const totalCost = grossSalary + cam + voucherValue;
    
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
      exemptAmount: Math.min(grossSalary, threshold),
      taxableIncome: Math.max(0, grossSalary - threshold),
    };
  }

  // Construction/Agriculture calculation
  calculateConstruction(grossSalary, options = {}) {
    const { dependents = 0, children = 0, mealVouchers = 0, voucherDays = 0 } = options;
    
    const casRate = (this.rules.construction_cas_rate || 21.25) / 100;
    const cassRate = this.rules.construction_cass_exempt ? 0 : (this.rules.cass_rate || 10) / 100;
    const taxRate = (this.rules.income_tax_rate || 10) / 100;
    const threshold = this.rules.tax_exemption_threshold || 10000;
    
    const cas = grossSalary * casRate;
    const voucherValue = mealVouchers * voucherDays;
    const cass = (grossSalary + voucherValue) * cassRate;
    const personalDeduction = this.calculatePersonalDeduction(grossSalary, dependents, children);
    
    let incomeTax = 0;
    if (this.rules.construction_tax_exempt && grossSalary <= threshold) {
      incomeTax = 0;
    } else {
      const taxableIncome = Math.max(0, grossSalary - cas - cass - personalDeduction);
      incomeTax = taxableIncome * taxRate;
    }
    
    const netSalary = grossSalary - cas - cass - incomeTax;
    const cam = grossSalary * ((this.rules.cam_rate || 2.25) / 100);
    const totalCost = grossSalary + cam + voucherValue;
    
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
      exemptAmount: this.rules.construction_tax_exempt ? Math.min(grossSalary, threshold) : 0,
      reducedCAS: true,
    };
  }

  // Part-time calculation with over-taxation
  calculatePartTime(grossSalary, options = {}) {
    const minSalary = this.rules.minimum_salary || 4050;
    const { isStudentOrPensioner = false, dependents = 0, children = 0 } = options;
    
    if (isStudentOrPensioner || grossSalary >= minSalary) {
      return this.calculateStandard(grossSalary, options);
    }
    
    // Over-taxation: employer pays difference to minimum wage
    const casRate = (this.rules.cas_rate || 25) / 100;
    const cassRate = (this.rules.cass_rate || 10) / 100;
    
    const employeeCAS = grossSalary * casRate;
    const employeeCASS = grossSalary * cassRate;
    
    const requiredCAS = minSalary * casRate;
    const requiredCASS = minSalary * cassRate;
    
    const employerExtraCAS = requiredCAS - employeeCAS;
    const employerExtraCASS = requiredCASS - employeeeCASS;
    
    const result = this.calculateStandard(grossSalary, options);
    result.employerExtraCAS = employerExtraCAS;
    result.employerExtraCASS = employerExtraCASS;
    result.totalCost += employerExtraCAS + employerExtraCASS;
    result.overtaxed = true;
    
    return result;
  }

  // Reverse calculation: Net to Gross
  calculateNetToGross(netSalary, sector = 'standard', options = {}) {
    // Iterative approximation
    let grossGuess = netSalary * 1.5;
    let iterations = 0;
    const maxIterations = 50;
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
      
      grossGuess -= diff * 0.5;
      iterations++;
    }
    
    // If not converged, return best guess
    return sector === 'it' ? this.calculateIT(grossGuess, options) : 
           sector === 'construction' ? this.calculateConstruction(grossGuess, options) :
           this.calculateStandard(grossGuess, options);
  }

  // Total cost to Net calculation
  calculateCostToNet(totalCost, sector = 'standard', options = {}) {
    const camRate = (this.rules.cam_rate || 2.25) / 100;
    const { mealVouchers = 0, voucherDays = 0 } = options;
    const voucherValue = mealVouchers * voucherDays;
    
    // Gross = (TotalCost - Vouchers) / (1 + CAM)
    const grossApprox = (totalCost - voucherValue) / (1 + camRate);
    
    // Now calculate net from gross
    let result;
    switch(sector) {
      case 'it':
        result = this.calculateIT(grossApprox, options);
        break;
      case 'construction':
      case 'agriculture':
        result = this.calculateConstruction(grossApprox, options);
        break;
      default:
        result = this.calculateStandard(grossApprox, options);
    }
    
    return result;
  }
}

// Currency conversion (BNR API)
export async function getBNRExchangeRate(currency = 'EUR') {
  try {
    const response = await fetch('https://www.bnr.ro/nbrfxrates.xml');
    const text = await response.text();
    
    // Parse XML (simple regex for MVP)
    const rateMatch = text.match(new RegExp(`<Rate currency="${currency}"[^>]*>([0-9.]+)</Rate>`));
    if (rateMatch) {
      return parseFloat(rateMatch[1]);
    }
    
    // Fallback
    return currency === 'EUR' ? 4.98 : 4.50;
  } catch (error) {
    console.error('Error fetching BNR rate:', error);
    return currency === 'EUR' ? 4.98 : 4.50;
  }
}
