'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calculator, Stethoscope, Calendar, Building2, Heart, Info, Download, Share2, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MedicalLeaveCalculator, SICK_CODES, generateSalaryHistory } from '@/lib/medical-leave-calculator';
import NavigationHeader from '@/components/NavigationHeader';
import { printPDF, generateMedicalLeaveReport } from '@/lib/pdf-export';

export default function MedicalLeaveCalculatorPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Inputs
  const [sickCode, setSickCode] = useState('01');
  const [days, setDays] = useState('');
  const [averageSalary, setAverageSalary] = useState('');
  const [monthsContributed, setMonthsContributed] = useState('12');
  
  // Maternity
  const [prenatalDays, setPrenatalDays] = useState('63');
  const [postnatalDays, setPostnatalDays] = useState('63');
  
  // Results
  const [result, setResult] = useState(null);
  const [maternityResult, setMaternityResult] = useState(null);

  useEffect(() => {
    loadFiscalRules();
  }, [year]);

  const loadFiscalRules = async () => {
    try {
      const response = await fetch(`/api/fiscal-rules/${year}`);
      const data = await response.json();
      setFiscalRules(data);
      setLoading(false);
    } catch (error) {
      toast.error('Eroare la încărcarea regulilor fiscale');
      setLoading(false);
    }
  };

  const calculateMedicalLeave = () => {
    if (!fiscalRules || !days || !averageSalary) {
      toast.error('Completați toate câmpurile obligatorii');
      return;
    }

    const calculator = new MedicalLeaveCalculator(fiscalRules);
    const calcResult = calculator.calculate({
      sickCode,
      days: parseInt(days),
      monthsContributed: parseInt(monthsContributed),
      averageSalaryOverride: parseFloat(averageSalary),
    });

    setResult(calcResult);
  };

  const calculateMaternity = () => {
    if (!fiscalRules || !averageSalary) {
      toast.error('Introduceți salariul mediu');
      return;
    }

    const calculator = new MedicalLeaveCalculator(fiscalRules);
    const matResult = calculator.calculateMaternity({
      averageSalary: parseFloat(averageSalary),
      prenatalDays: parseInt(prenatalDays),
      postnatalDays: parseInt(postnatalDays),
    });

    setMaternityResult(matResult);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const shareCalculation = () => {
    const params = new URLSearchParams({
      code: sickCode,
      days,
      salary: averageSalary,
      months: monthsContributed,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiat în clipboard!');
  };

  const downloadPDF = () => {
    if (!result) {
      toast.error('Calculați mai întâi indemnizația');
      return;
    }
    const data = generateMedicalLeaveReport(result, { year });
    printPDF('Raport Concediu Medical', data, {
      subtitle: `Cod ${sickCode} - ${result.sickInfo.name}`,
      year,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <NavigationHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Stethoscope className="h-12 w-12 animate-spin mx-auto mb-4 text-rose-600" />
            <p className="text-slate-600">Se încarcă regulile OUG 158/2005...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calculator Concediu Medical {year}</h1>
            <p className="text-sm text-slate-600">OUG 158/2005 • Toate codurile de boală • Maternitate</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shareCalculation}>
              <Share2 className="h-4 w-4 mr-1" />
              Distribuie
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
                Distribuie
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calculator">Calculator General</TabsTrigger>
            <TabsTrigger value="maternity">Maternitate</TabsTrigger>
            <TabsTrigger value="codes">Coduri de Boală</TabsTrigger>
          </TabsList>

          {/* General Calculator */}
          <TabsContent value="calculator">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Input Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-rose-600" />
                      Date Concediu Medical
                    </CardTitle>
                    <CardDescription>Introduceți datele certificatului medical</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Cod Diagnostic (Indemnizație)</Label>
                      <Select value={sickCode} onValueChange={setSickCode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SICK_CODES).map(([code, info]) => (
                            <SelectItem key={code} value={code}>
                              {code} - {info.name} ({info.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {SICK_CODES[sickCode] && (
                        <p className="text-xs text-rose-600 mt-1">
                          Max {SICK_CODES[sickCode].maxDays} zile/an • {SICK_CODES[sickCode].rate}% din bază
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Număr Zile Concediu</Label>
                      <Input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        placeholder="Ex: 14"
                        max={SICK_CODES[sickCode]?.maxDays || 183}
                      />
                    </div>

                    <div>
                      <Label>Salariu Brut Mediu (RON)</Label>
                      <Input
                        type="number"
                        value={averageSalary}
                        onChange={(e) => setAverageSalary(e.target.value)}
                        placeholder="Media ultimelor 6 luni"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Media salariilor brute din ultimele 6-12 luni
                      </p>
                    </div>

                    <div>
                      <Label>Luni de Contribuție</Label>
                      <Select value={monthsContributed} onValueChange={setMonthsContributed}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36, 48, 60].map((m) => (
                            <SelectItem key={m} value={m.toString()}>
                              {m} {m === 1 ? 'lună' : 'luni'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        Minim {fiscalRules?.medical_leave?.minimum_months || 6} luni pentru eligibilitate
                      </p>
                    </div>

                    <Button onClick={calculateMedicalLeave} className="w-full bg-rose-600 hover:bg-rose-700" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculează Indemnizația
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2">
                {result ? (
                  <div className="space-y-4">
                    {/* Eligibility Banner */}
                    <Card className={`border-2 ${result.eligible ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                          {result.eligible ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-red-600" />
                          )}
                          <div>
                            <p className="font-bold text-lg">
                              {result.eligible ? 'Eligibil pentru indemnizație' : 'Nu sunteți eligibil'}
                            </p>
                            <p className="text-sm text-slate-600">{result.eligibility.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {result.eligible && (
                      <>
                        {/* Main Results */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Rezultate Calcul</CardTitle>
                            <CardDescription>
                              Cod {sickCode}: {result.sickInfo.name} • {result.rate}% din baza de calcul
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Calcul de bază */}
                              <div className="space-y-3">
                                <h4 className="font-semibold border-b pb-2">Calcul Indemnizație</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Salariu mediu:</span>
                                    <span>{formatCurrency(result.baseInfo.averageSalary)} RON</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Bază zilnică (÷21.17):</span>
                                    <span>{formatCurrency(result.baseInfo.base)} RON</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Procent aplicat:</span>
                                    <span>{result.rate}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Indemnizație zilnică:</span>
                                    <span className="font-semibold">{formatCurrency(result.dailyIndemnity)} RON</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Număr zile:</span>
                                    <span>{result.days} zile</span>
                                  </div>
                                  {result.cassDeduction > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                      <span>- CASS (10%):</span>
                                      <span>-{formatCurrency(result.cassDeduction)} RON</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-bold pt-2 border-t text-lg">
                                    <span>Total Indemnizație:</span>
                                    <span className="text-green-600">{formatCurrency(result.netIndemnity)} RON</span>
                                  </div>
                                </div>
                              </div>

                              {/* Split plătitor */}
                              <div className="space-y-3">
                                <h4 className="font-semibold border-b pb-2">Cine Plătește</h4>
                                <div className="space-y-4">
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Building2 className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-blue-800">Angajator</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Zile suportate:</span>
                                      <span>{result.split.employerDays} zile</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                      <span>Sumă:</span>
                                      <span>{formatCurrency(result.split.employerAmount)} RON</span>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-rose-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Heart className="h-4 w-4 text-rose-600" />
                                      <span className="font-semibold text-rose-800">FNUASS (Casa de Sănătate)</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Zile suportate:</span>
                                      <span>{result.split.fnuassDays} zile</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                      <span>Sumă:</span>
                                      <span>{formatCurrency(result.split.fnuassAmount)} RON</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Info Box */}
                        <Card className="bg-amber-50 border-amber-200">
                          <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-amber-800">
                                <strong>Informații importante:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li>Mai puteți beneficia de {result.daysRemaining} zile pentru codul {sickCode} în acest an</li>
                                  <li>Primele {result.sickInfo.employerDays} zile sunt suportate de angajator</li>
                                  <li>Restul zilelor sunt plătite din FNUASS</li>
                                  <li>Indemnizația nu este impozitată (nu se plătește impozit pe venit)</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Introduceți datele și calculați indemnizația</p>
                      <p className="text-sm mt-2">Conform OUG 158/2005 actualizat {year}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Maternity Calculator */}
          <TabsContent value="maternity">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      Concediu Maternitate
                    </CardTitle>
                    <CardDescription>126 zile (prenatal + postnatal)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Salariu Brut Mediu (RON)</Label>
                      <Input
                        type="number"
                        value={averageSalary}
                        onChange={(e) => setAverageSalary(e.target.value)}
                        placeholder="Media ultimelor 6 luni"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Zile Prenatal</Label>
                        <Input
                          type="number"
                          value={prenatalDays}
                          onChange={(e) => setPrenatalDays(e.target.value)}
                          max="63"
                        />
                      </div>
                      <div>
                        <Label>Zile Postnatal</Label>
                        <Input
                          type="number"
                          value={postnatalDays}
                          onChange={(e) => setPostnatalDays(e.target.value)}
                          max="63"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-pink-50 rounded text-sm text-pink-800">
                      <strong>Total:</strong> {parseInt(prenatalDays || 0) + parseInt(postnatalDays || 0)} zile de maternitate
                    </div>

                    <Button onClick={calculateMaternity} className="w-full bg-pink-600 hover:bg-pink-700" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculează Maternitate
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {maternityResult ? (
                  <div className="space-y-4">
                    <Card className="border-2 border-pink-500 bg-pink-50">
                      <CardContent className="py-6">
                        <div className="text-center">
                          <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                          <p className="text-2xl font-bold text-pink-800">
                            {formatCurrency(maternityResult.total.netIndemnity)} RON
                          </p>
                          <p className="text-pink-600">Indemnizație maternitate totală pentru {maternityResult.total.days} zile</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Prenatal ({prenatalDays} zile)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Indemnizație zilnică:</span>
                              <span>{formatCurrency(maternityResult.prenatal.dailyIndemnity)} RON</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-pink-600">{formatCurrency(maternityResult.prenatal.netIndemnity)} RON</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Postnatal ({postnatalDays} zile)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Indemnizație zilnică:</span>
                              <span>{formatCurrency(maternityResult.postnatal.dailyIndemnity)} RON</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-pink-600">{formatCurrency(maternityResult.postnatal.netIndemnity)} RON</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>După maternitate:</strong>
                            <ul className="list-disc list-inside mt-1">
                              <li>Puteți opta pentru concediu creștere copil (CCC) - până la 2 ani</li>
                              <li>Indemnizație CCC = 85% din media veniturilor</li>
                              <li>Alternativ: stimulent inserție = 50% din indemnizație dacă reveniți la muncă</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Calculați indemnizația de maternitate</p>
                      <p className="text-sm mt-2">85% din baza de calcul pentru 126 zile</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sick Codes Reference */}
          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle>Coduri de Indemnizație Concediu Medical</CardTitle>
                <CardDescription>Conform OUG 158/2005 cu modificările ulterioare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3">Cod</th>
                        <th className="text-left p-3">Denumire</th>
                        <th className="text-center p-3">Procent</th>
                        <th className="text-center p-3">Max Zile/An</th>
                        <th className="text-center p-3">Zile Angajator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(SICK_CODES).map(([code, info]) => (
                        <tr key={code} className="border-b hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold">{code}</td>
                          <td className="p-3">{info.name}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              info.rate === 100 ? 'bg-green-100 text-green-800' :
                              info.rate >= 85 ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {info.rate}%
                            </span>
                          </td>
                          <td className="p-3 text-center">{info.maxDays}</td>
                          <td className="p-3 text-center">{info.employerDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
