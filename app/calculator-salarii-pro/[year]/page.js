'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Calculator, Download, Share2, Info, RotateCcw, Save, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SalaryCalculator, getBNRExchangeRate } from '@/lib/salary-calculator';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer';
import { saveToStorage, loadFromStorage, clearStorage } from '@/components/CalculatorLayout';
import { generateSalaryPDF } from '@/lib/pdf-export';

function SalaryCalculatorContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const year = parseInt(params?.year) || 2026;
  
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Inputs - EXTENDED pentru Calculator Avansat
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [calculationType, setCalculationType] = useState('brut-net');
  const [inputValue, setInputValue] = useState('');
  const [sector, setSector] = useState('standard');
  const [dependents, setDependents] = useState('0');
  const [children, setChildren] = useState('0');
  const [mealVouchers, setMealVouchers] = useState('0');
  const [voucherDays, setVoucherDays] = useState('22');
  const [mealVoucherValue, setMealVoucherValue] = useState('40');
  const [isPartTime, setIsPartTime] = useState(false);
  const [isStudentOrPensioner, setIsStudentOrPensioner] = useState(false);
  const [currency, setCurrency] = useState('RON');
  const [exchangeRate, setExchangeRate] = useState(4.98);
  
  // NEW - Opțiuni Avansate
  const [isBasicFunction, setIsBasicFunction] = useState(true); // Funcție de bază
  const [age, setAge] = useState(30); // Pentru scutire < 26 ani
  const [isYouthExempt, setIsYouthExempt] = useState(false); // < 26 ani
  const [isTaxExempt, setIsTaxExempt] = useState(false); // Handicap/Scutit complet
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle calcul avansat
  
  // Results
  const [result, setResult] = useState(null);
  const [comparison2025, setComparison2025] = useState(null);

  // Load from URL params or localStorage on mount
  useEffect(() => {
    // Try URL params first - suportăm ambele formate (vechi și nou)
    const urlValue = searchParams.get('value') || searchParams.get('brut');
    const urlType = searchParams.get('type');
    const urlSector = searchParams.get('sector');
    const urlCurrency = searchParams.get('currency');
    const urlYear = searchParams.get('an');
    const urlMonth = searchParams.get('luna');
    const urlChildren = searchParams.get('copii');
    const urlDependents = searchParams.get('persoane');
    const urlTickets = searchParams.get('tichete');
    const urlDays = searchParams.get('zile');
    const urlBasicFunc = searchParams.get('functie_baza');
    const urlYouth = searchParams.get('tanar');
    const urlHandicap = searchParams.get('handicap');
    
    if (urlValue) {
      setInputValue(urlValue);
      if (urlType) setCalculationType(urlType);
      if (urlSector) setSector(urlSector);
      if (urlCurrency) setCurrency(urlCurrency);
      if (urlYear) setSelectedYear(parseInt(urlYear));
      if (urlMonth) setSelectedMonth(parseInt(urlMonth));
      if (urlChildren) setChildren(urlChildren);
      if (urlDependents) setDependents(urlDependents);
      if (urlTickets) setMealVouchers(urlTickets);
      if (urlDays) setVoucherDays(urlDays);
      if (urlBasicFunc === '0') setIsBasicFunction(false);
      if (urlYouth === '1') setIsYouthExempt(true);
      if (urlHandicap === '1') setIsTaxExempt(true);
    } else {
      // Try localStorage
      const saved = loadFromStorage('salary_calculator');
      if (saved) {
        if (saved.inputValue) setInputValue(saved.inputValue);
        if (saved.calculationType) setCalculationType(saved.calculationType);
        if (saved.sector) setSector(saved.sector);
        if (saved.dependents) setDependents(saved.dependents);
        if (saved.children) setChildren(saved.children);
        if (saved.mealVouchers) setMealVouchers(saved.mealVouchers);
        if (saved.voucherDays) setVoucherDays(saved.voucherDays);
        if (saved.currency) setCurrency(saved.currency);
      }
    }
  }, [searchParams]);

  // Save to localStorage when inputs change
  useEffect(() => {
    if (!loading) {
      saveToStorage('salary_calculator', {
        inputValue,
        calculationType,
        sector,
        dependents,
        children,
        mealVouchers,
        voucherDays,
        currency,
      });
    }
  }, [inputValue, calculationType, sector, dependents, children, mealVouchers, voucherDays, currency, loading]);

  // Încarcă regulile fiscale când anul URL sau anul selectat se schimbă
  useEffect(() => {
    loadFiscalRules();
    loadExchangeRate();
  }, [year, selectedYear]);

  const loadFiscalRules = async () => {
    try {
      // Folosește anul selectat din dropdown (dacă e diferit) sau anul din URL
      const targetYear = selectedYear || year;
      const response = await fetch(`/api/fiscal-rules/${targetYear}`);
      const data = await response.json();
      setFiscalRules(data);
      
      // Set exchange rate from fiscal rules or fetch from BNR
      if (data.exchange_rate?.auto_update !== false) {
        const rate = await getBNRExchangeRate('EUR');
        setExchangeRate(rate);
      } else {
        setExchangeRate(data.exchange_rate?.eur || 5.0923);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Eroare la încărcarea regulilor fiscale');
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    // This is now handled in loadFiscalRules
    // Kept for backwards compatibility
  };

  const calculate = () => {
    if (!fiscalRules || !inputValue || parseFloat(inputValue) <= 0) {
      toast.error('Introduceți o valoare validă');
      return;
    }

    const calculator = new SalaryCalculator(fiscalRules);
    const value = parseFloat(inputValue);
    const valueInRON = currency === 'EUR' ? value * exchangeRate : value;
    
    // Opțiuni complete cu toate facilitățile avansate
    // IMPORTANT: Verificăm explicit dacă mealVouchers este setat (chiar și 0)
    const mealVouchersValue = mealVouchers !== '' && mealVouchers !== null && mealVouchers !== undefined 
      ? parseFloat(mealVouchers) 
      : 0;
    
    const options = {
      dependents: parseInt(dependents) || 0,
      children: parseInt(children) || 0,
      mealVouchers: mealVouchersValue,
      voucherDays: parseInt(voucherDays) || 22,
      isStudentOrPensioner,
      // OPȚIUNI AVANSATE
      isBasicFunction, // Pentru deducere personală (doar cu funcție de bază)
      age: isYouthExempt ? 25 : 30, // Sub 26 = scutire IV
    };

    let calcResult;

    if (calculationType === 'brut-net') {
      if (isPartTime) {
        calcResult = calculator.calculatePartTime(valueInRON, options);
      } else {
        switch(sector) {
          case 'it':
            calcResult = calculator.calculateIT(valueInRON, options);
            break;
          case 'construction':
          case 'agriculture':
            calcResult = calculator.calculateConstruction(valueInRON, options);
            break;
          default:
            calcResult = calculator.calculateStandard(valueInRON, options);
        }
      }
    } else if (calculationType === 'net-brut') {
      calcResult = calculator.calculateNetToGross(valueInRON, sector, options);
    } else {
      calcResult = calculator.calculateCostToNet(valueInRON, sector, options);
    }

    // ============================================
    // PRIORITATE SCUTIRI - RECALCULARE IMPOZIT
    // ============================================
    
    // 1. PRIORITATE #1: Scutire TOTALĂ Handicap (isTaxExempt = true)
    if (isTaxExempt && fiscalRules?.salary?.disability_tax_exempt !== false) {
      // Forțăm impozit = 0 și recalculăm NET-ul
      const previousTax = calcResult.incomeTax;
      calcResult.incomeTax = 0;
      calcResult.net = calcResult.net + previousTax;
      calcResult.taxExemptReason = 'Scutire IV - Persoană cu handicap';
      calcResult.exemptAmount = calcResult.gross;
    }
    // 2. PRIORITATE #2: Scutire Tineri < 26 ani (până la prag)
    else if (isYouthExempt && fiscalRules?.salary?.youth_exemption_enabled !== false) {
      const youthThreshold = fiscalRules?.salary?.youth_exemption_threshold || 6050;
      if (valueInRON <= youthThreshold) {
        // Scutire totală IV pentru tineri sub 26 ani și sub prag
        const previousTax = calcResult.incomeTax;
        calcResult.incomeTax = 0;
        calcResult.net = calcResult.net + previousTax;
        calcResult.taxExemptReason = `Scutire IV - Tânăr sub 26 ani (venit ≤ ${youthThreshold} RON)`;
        calcResult.exemptAmount = valueInRON;
      } else {
        // Partial scutit - doar partea peste prag este impozitată
        // (deja calculat în calculateStandard cu youthDeduction)
        calcResult.taxExemptReason = `Scutire parțială - Tânăr sub 26 ani (venit > ${youthThreshold} RON)`;
      }
    }
    
    // 3. Dacă NU este funcție de bază, deducerea personală = 0 (deja gestionat în calculator)
    if (!isBasicFunction) {
      calcResult.noBasicFunctionNote = 'Deducerea personală nu se aplică (nu este funcție de bază)';
    }

    setResult(calcResult);
    
    // Actualizare URL pentru SEO (URL dinamic)
    updateURLParams(valueInRON);
    
    // Load 2025 for comparison
    if (selectedYear === 2026 || year === 2026) {
      load2025Comparison(valueInRON, options);
    }
  };
  
  // ============================================
  // URL DINAMIC - SEO POWER
  // ============================================
  const updateURLParams = (grossValue) => {
    const params = new URLSearchParams();
    
    // Parametri principali
    params.set('brut', Math.round(grossValue).toString());
    params.set('an', selectedYear.toString());
    params.set('luna', selectedMonth.toString());
    
    // Sector
    if (sector !== 'standard') {
      params.set('sector', sector);
    }
    
    // Copii și dependenți
    if (parseInt(children) > 0) {
      params.set('copii', children);
    }
    if (parseInt(dependents) > 0) {
      params.set('persoane', dependents);
    }
    
    // Tichete
    if (parseFloat(mealVouchers) > 0 || parseFloat(mealVoucherValue) > 0) {
      params.set('tichete', mealVouchers || mealVoucherValue);
      params.set('zile', voucherDays);
    }
    
    // Facilități avansate
    if (!isBasicFunction) {
      params.set('functie_baza', '0');
    }
    if (isYouthExempt) {
      params.set('tanar', '1');
    }
    if (isTaxExempt) {
      params.set('handicap', '1');
    }
    
    // Actualizare URL fără reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const load2025Comparison = async (valueInRON, options) => {
    try {
      const response = await fetch('/api/fiscal-rules/2025');
      const data2025 = await response.json();
      const calculator2025 = new SalaryCalculator(data2025);
      
      let result2025;
      switch(sector) {
        case 'it':
          result2025 = calculator2025.calculateIT(valueInRON, options);
          break;
        case 'construction':
        case 'agriculture':
          result2025 = calculator2025.calculateConstruction(valueInRON, options);
          break;
        default:
          result2025 = calculator2025.calculateStandard(valueInRON, options);
      }
      
      setComparison2025(result2025);
    } catch (error) {
      console.error('Error loading 2025 comparison:', error);
    }
  };

  const shareCalculation = () => {
    const params = new URLSearchParams({
      type: calculationType,
      value: inputValue,
      sector,
      dependents,
      children,
      vouchers: mealVouchers,
      days: voucherDays,
      currency,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiat în clipboard!');
  };

  const downloadPDF = () => {
    if (!result) {
      toast.error('Calculați mai întâi salariul');
      return;
    }

    try {
      const filename = generateSalaryPDF(result, year);
      toast.success(`PDF descărcat: ${filename}`);
    } catch (error) {
      toast.error('Eroare la generarea PDF-ului');
      console.error(error);
    }
  };

  // ============================================
  // EXPORT - PRINT PDF (BROWSER)
  // ============================================
  const handlePrint = () => {
    if (!result) {
      toast.error('Calculați mai întâi salariul pentru a printa');
      return;
    }
    window.print();
    toast.success('Pagina de printare deschisă');
  };

  // ============================================
  // EXPORT - EMAIL REZULTATE
  // ============================================
  const handleEmail = () => {
    if (!result) {
      toast.error('Calculați mai întâi salariul');
      return;
    }

    const subject = encodeURIComponent(`Calculator Salariu ${selectedYear} - Rezultate`);
    const totalTaxes = result.cas + result.cass + result.incomeTax;
    
    let bodyText = `CALCULATOR SALARIU ${selectedYear} - REZULTATE\n`;
    bodyText += `====================================\n\n`;
    bodyText += `📊 SALARIU BRUT: ${result.gross.toFixed(2)} RON\n`;
    bodyText += `💰 SALARIU NET: ${result.net.toFixed(2)} RON\n`;
    bodyText += `📉 TOTAL TAXE ANGAJAT: ${totalTaxes.toFixed(2)} RON\n\n`;
    bodyText += `DETALII TAXE:\n`;
    bodyText += `- CAS (Pensii): ${result.cas.toFixed(2)} RON\n`;
    bodyText += `- CASS (Sănătate): ${result.cass.toFixed(2)} RON\n`;
    bodyText += `- Impozit pe Venit: ${result.incomeTax.toFixed(2)} RON\n\n`;
    
    if (result.personalDeduction > 0) {
      bodyText += `✅ Deducere personală: ${result.personalDeduction.toFixed(2)} RON\n`;
    }
    if (result.childDeduction > 0) {
      bodyText += `✅ Deducere copii: ${result.childDeduction.toFixed(2)} RON\n`;
    }
    if (result.taxExemptReason) {
      bodyText += `✅ ${result.taxExemptReason}\n`;
    }
    
    bodyText += `\n💼 COST TOTAL ANGAJATOR: ${result.totalCost.toFixed(2)} RON\n`;
    bodyText += `\n====================================\n`;
    bodyText += `Calculat pe eCalc.ro - ${new Date().toLocaleDateString('ro-RO')}\n`;
    bodyText += `Link: ${window.location.href}`;
    
    const body = encodeURIComponent(bodyText);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('Clientul de email a fost deschis');
  };

  const resetForm = () => {
    setInputValue('');
    setCalculationType('brut-net');
    setSector('standard');
    setDependents('0');
    setChildren('0');
    setMealVouchers('0');
    setVoucherDays('22');
    setCurrency('RON');
    setIsPartTime(false);
    setIsStudentOrPensioner(false);
    setResult(null);
    setComparison2025(null);
    clearStorage('salary_calculator');
    toast.success('Formular resetat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <NavigationHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Calculator className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Se încarcă regulile fiscale {year}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calculator Salarii Profesional {year}</h1>
            <p className="text-sm text-slate-600">Toate facilitățile fiscale • Calcul în 3 direcții</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={shareCalculation}>
              <Share2 className="h-4 w-4 mr-1" />
              Distribuie
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!result}>
              <Download className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} disabled={!result}>
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configurare Calcul</CardTitle>
                <CardDescription>Selectați tipul de calcul și introduceți datele</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tip Calcul</Label>
                  <Select value={calculationType} onValueChange={setCalculationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brut-net">Brut → Net</SelectItem>
                      <SelectItem value="net-brut">Net → Brut</SelectItem>
                      <SelectItem value="cost-net">Cost Total → Net</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sector</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="it">IT (Scutire până la 10.000 RON)</SelectItem>
                      <SelectItem value="construction">Construcții (CAS 21.25%)</SelectItem>
                      <SelectItem value="agriculture">Agricultură</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Valoare</Label>
                    <Input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Monedă</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RON">RON</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currency === 'EUR' && (
                  <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded">
                    Curs BNR: 1 EUR = {exchangeRate.toFixed(4)} RON
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Persoane întreținere</Label>
                    <Input
                      type="number"
                      value={dependents}
                      onChange={(e) => setDependents(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Copii sub 18 ani</Label>
                    <Input
                      type="number"
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Tichet masă (RON)</Label>
                    <Input
                      type="number"
                      value={mealVouchers}
                      onChange={(e) => setMealVouchers(e.target.value)}
                      min="0"
                      max={fiscalRules?.salary?.meal_voucher_max || 40}
                    />
                  </div>
                  <div>
                    <Label>Zile lucrate/lună</Label>
                    <Input
                      type="number"
                      value={voucherDays}
                      onChange={(e) => setVoucherDays(e.target.value)}
                      min="0"
                      max="31"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="parttime"
                      checked={isPartTime}
                      onChange={(e) => setIsPartTime(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="parttime" className="text-sm">Part-time (sub salariu minim)</Label>
                  </div>
                  {isPartTime && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="student"
                        checked={isStudentOrPensioner}
                        onChange={(e) => setIsStudentOrPensioner(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="student" className="text-sm">Elev/Student/Pensionar</Label>
                    </div>
                  )}
                </div>

                {/* Calculator Avansat - Toggle */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <span>⚙️ Calcul Avansat</span>
                    <span className="text-xs">{showAdvanced ? '▲ Ascunde' : '▼ Arată'}</span>
                  </button>
                  
                  {showAdvanced && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      {/* Selectoare An & Lună */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">An Fiscal</Label>
                          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 16 }, (_, i) => 2015 + i).map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Lună</Label>
                          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'].map((m, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Buton Salariu Minim */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputValue(fiscalRules?.salary?.minimum_salary?.toString() || '4050')}
                        className="w-full"
                      >
                        📊 Completează cu Salariu Minim ({fiscalRules?.salary?.minimum_salary || 4050} RON)
                      </Button>

                      {/* Bife Facilitați */}
                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Facilități & Scutiri:</p>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="basicFunction"
                            checked={isBasicFunction}
                            onChange={(e) => setIsBasicFunction(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="basicFunction" className="text-sm cursor-pointer">
                            ✓ Funcție de bază (pentru deducere personală)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="youthExempt"
                            checked={isYouthExempt}
                            onChange={(e) => {
                              setIsYouthExempt(e.target.checked);
                              if (e.target.checked) setAge(25); else setAge(30);
                            }}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="youthExempt" className="text-sm cursor-pointer">
                            👤 Vârstă sub 26 ani (scutire IV până la {fiscalRules?.salary?.youth_exemption_threshold || 6050} RON)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="taxExempt"
                            checked={isTaxExempt}
                            onChange={(e) => setIsTaxExempt(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="taxExempt" className="text-sm cursor-pointer">
                            ♿ Persoană cu handicap (scutire TOTALĂ IV)
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={calculate} className="w-full" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculează
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                {/* Main Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rezultate {selectedYear || year}</CardTitle>
                    <CardDescription>
                      {sector === 'it' && 'Sector IT - Scutire impozit până la 10.000 RON'}
                      {sector === 'construction' && 'Sector Construcții - CAS redus 21.25%'}
                      {sector === 'agriculture' && 'Sector Agricultură - Facilități fiscale'}
                      {sector === 'standard' && 'Calcul standard conform Cod Fiscal'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Employee Side */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Ce primește Angajatul</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Salariu Brut:</span>
                            <span className="font-bold">{result.gross.toFixed(2)} RON</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>- CAS ({fiscalRules?.salary?.cas_rate || 25}%):</span>
                            <span>-{result.cas.toFixed(2)} RON</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>- CASS ({fiscalRules?.salary?.cass_rate || 10}%):</span>
                            <span>-{result.cass.toFixed(2)} RON</span>
                          </div>
                          {result.personalDeduction > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Deducere personală (bază):</span>
                              <span>{result.personalDeduction.toFixed(2)} RON</span>
                            </div>
                          )}
                          {result.childDeduction > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Deducere copii ({parseInt(children) || 0} x {fiscalRules?.salary?.child_deduction || 100} RON):</span>
                              <span>{result.childDeduction.toFixed(2)} RON</span>
                            </div>
                          )}
                          {result.dependentDeduction > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Deducere persoane întreținere:</span>
                              <span>{result.dependentDeduction.toFixed(2)} RON</span>
                            </div>
                          )}
                          <div className="flex justify-between text-red-600">
                            <span>- Impozit ({fiscalRules?.salary?.income_tax_rate || 10}%):</span>
                            <span>-{result.incomeTax.toFixed(2)} RON</span>
                          </div>
                          {result.voucherValue > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>+ Tichete masă:</span>
                              <span>+{result.voucherValue.toFixed(2)} RON</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xl font-bold text-green-600 pt-3 border-t">
                            <span>Salariu NET:</span>
                            <span>{result.net.toFixed(2)} RON</span>
                          </div>
                          {currency === 'EUR' && (
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>Echivalent EUR:</span>
                              <span>{(result.net / exchangeRate).toFixed(2)} EUR</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Employer Side */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Ce plătește Angajatorul</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Salariu Brut:</span>
                            <span className="font-bold">{result.gross.toFixed(2)} RON</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>+ CAM ({fiscalRules?.salary?.cam_rate || 2.25}%):</span>
                            <span>+{result.cam.toFixed(2)} RON</span>
                          </div>
                          {result.voucherValue > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>+ Tichete masă:</span>
                              <span>+{result.voucherValue.toFixed(2)} RON</span>
                            </div>
                          )}
                          {result.overtaxed && (
                            <>
                              <div className="flex justify-between text-orange-600">
                                <span>+ Extra CAS (part-time):</span>
                                <span>+{result.employerExtraCAS?.toFixed(2)} RON</span>
                              </div>
                              <div className="flex justify-between text-orange-600">
                                <span>+ Extra CASS (part-time):</span>
                                <span>+{result.employerExtraCASS?.toFixed(2)} RON</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between text-xl font-bold text-red-600 pt-3 border-t">
                            <span>Cost Total:</span>
                            <span>{result.totalCost.toFixed(2)} RON</span>
                          </div>
                          {currency === 'EUR' && (
                            <div className="flex justify-between text-sm text-slate-600">
                              <span>Echivalent EUR:</span>
                              <span>{(result.totalCost / exchangeRate).toFixed(2)} EUR</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {result.exemptAmount && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <strong>Facilitate fiscală activă:</strong> Scutire impozit pentru {result.exemptAmount.toFixed(2)} RON
                            {result.taxExemptReason && (
                              <span className="block mt-1 text-green-700">
                                📋 {result.taxExemptReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {result.taxExemptReason && !result.exemptAmount && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>Facilitate:</strong> {result.taxExemptReason}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {result.noBasicFunctionNote && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <strong>Atenție:</strong> {result.noBasicFunctionNote}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.overtaxed && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div className="text-sm text-orange-800">
                            <strong>Overtaxare part-time:</strong> Angajatorul suportă diferența până la salariul minim
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tax Breakdown with Visual Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Total Taxe - Distribuție Stat vs Angajat</CardTitle>
                    <CardDescription>Vizualizare procentuală a contribuțiilor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Summary Table */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">Taxe Angajat</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {(result.cas + result.cass + result.incomeTax).toFixed(2)} RON
                          </p>
                          {currency === 'EUR' && (
                            <p className="text-xs text-slate-500">
                              {((result.cas + result.cass + result.incomeTax) / exchangeRate).toFixed(2)} EUR
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">Taxe Angajator</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {(result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)).toFixed(2)} RON
                          </p>
                          {currency === 'EUR' && (
                            <p className="text-xs text-slate-500">
                              {((result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)) / exchangeRate).toFixed(2)} EUR
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">Total Statul</p>
                          <p className="text-2xl font-bold text-red-600">
                            {(result.cas + result.cass + result.incomeTax + result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)).toFixed(2)} RON
                          </p>
                          {currency === 'EUR' && (
                            <p className="text-xs text-slate-500">
                              {((result.cas + result.cass + result.incomeTax + result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)) / exchangeRate).toFixed(2)} EUR
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="space-y-2">
                        <div className="flex h-12 rounded-lg overflow-hidden border border-slate-200">
                          <div 
                            className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                            style={{ 
                              width: `${((result.cas + result.cass + result.incomeTax + result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)) / result.totalCost * 100).toFixed(2)}%` 
                            }}
                          >
                            {((result.cas + result.cass + result.incomeTax + result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0)) / result.totalCost * 100).toFixed(2)}% Stat
                          </div>
                          <div 
                            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                            style={{ 
                              width: `${(result.net / result.totalCost * 100).toFixed(2)}%` 
                            }}
                          >
                            {(result.net / result.totalCost * 100).toFixed(2)}% Angajat
                          </div>
                        </div>
                        <p className="text-xs text-center text-slate-600">
                          Pentru a plăti un salariu net de <strong>{result.net.toFixed(2)} RON</strong>, angajatorul cheltuiește <strong>{result.totalCost.toFixed(2)} RON</strong>
                        </p>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-slate-700">Detalii Taxe Angajat:</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>CAS ({fiscalRules?.salary?.cas_rate || 25}%):</span>
                              <span>{result.cas.toFixed(2)} RON</span>
                            </div>
                            <div className="flex justify-between">
                              <span>CASS ({fiscalRules?.salary?.cass_rate || 10}%):</span>
                              <span>{result.cass.toFixed(2)} RON</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Impozit ({fiscalRules?.salary?.income_tax_rate || 10}%):</span>
                              <span>{result.incomeTax.toFixed(2)} RON</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-slate-700">Detalii Taxe Angajator:</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>CAM ({fiscalRules?.salary?.cam_rate || 2.25}%):</span>
                              <span>{result.cam.toFixed(2)} RON</span>
                            </div>
                            {result.overtaxed && (
                              <>
                                <div className="flex justify-between text-orange-600">
                                  <span>Extra CAS:</span>
                                  <span>{result.employerExtraCAS?.toFixed(2)} RON</span>
                                </div>
                                <div className="flex justify-between text-orange-600">
                                  <span>Extra CASS:</span>
                                  <span>{result.employerExtraCASS?.toFixed(2)} RON</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison with 2025 */}
                {comparison2025 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparație 2025 vs 2026</CardTitle>
                      <CardDescription>Impactul modificărilor legislative</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Salariu Net 2025:</span>
                          <span>{comparison2025.net.toFixed(2)} RON</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salariu Net 2026:</span>
                          <span>{result.net.toFixed(2)} RON</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Diferență:</span>
                          <span className={result.net - comparison2025.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {result.net - comparison2025.net >= 0 ? '+' : ''}
                            {(result.net - comparison2025.net).toFixed(2)} RON
                            ({((result.net - comparison2025.net) / comparison2025.net * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Introduceți datele și apăsați "Calculează"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SalaryCalculatorProPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center py-20">
          <Calculator className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    }>
      <SalaryCalculatorContent />
    </Suspense>
  );
}
