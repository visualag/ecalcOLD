'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Scale, FileText, Plane, Calculator, AlertTriangle, CheckCircle, Clock, Info, Download, Share2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RightsCalculator, COMPANY_TYPES, COMMON_ROUTES } from '@/lib/rights-calculator';

export default function RightsCalculatorPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('efactura');
  
  // e-Factura Inputs
  const [invoiceDate, setInvoiceDate] = useState('');
  const [companyType, setCompanyType] = useState('micro');
  const [invoiceCount, setInvoiceCount] = useState('1');
  
  // Flight Inputs
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [flightDistance, setFlightDistance] = useState('');
  const [delayHours, setDelayHours] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [isDeniedBoarding, setIsDeniedBoarding] = useState(false);
  const [isEUDeparture, setIsEUDeparture] = useState(true);
  const [isEUCarrier, setIsEUCarrier] = useState(true);
  
  // Results
  const [efacturaResult, setEfacturaResult] = useState(null);
  const [penaltyResult, setPenaltyResult] = useState(null);
  const [flightResult, setFlightResult] = useState(null);

  useEffect(() => {
    loadFiscalRules();
    // Set default date to today
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  }, [year]);

  const loadFiscalRules = async () => {
    try {
      const response = await fetch(`/api/fiscal-rules/${year}`);
      const data = await response.json();
      setFiscalRules(data);
      setLoading(false);
    } catch (error) {
      toast.error('Eroare la încărcarea regulilor');
      setLoading(false);
    }
  };

  const calculateEfacturaDeadline = () => {
    if (!invoiceDate) {
      toast.error('Selectați data facturii');
      return;
    }

    const calculator = new RightsCalculator(fiscalRules);
    const result = calculator.calculateEfacturaDeadline(invoiceDate, companyType);
    const penalty = calculator.calculateEfacturaPenalty(companyType, parseInt(invoiceCount));
    
    setEfacturaResult(result);
    setPenaltyResult(penalty);
  };

  const calculateFlightCompensation = () => {
    if (!flightDistance && !departure) {
      toast.error('Introduceți distanța sau selectați ruta');
      return;
    }

    const calculator = new RightsCalculator(fiscalRules);
    
    // Încearcă să obții distanța din rute cunoscute
    let distance = parseInt(flightDistance);
    if (!distance && departure && arrival) {
      distance = calculator.getRouteDistance(departure, arrival);
      if (distance) {
        setFlightDistance(distance.toString());
      } else {
        toast.error('Rută necunoscută. Introduceți distanța manual.');
        return;
      }
    }

    const result = calculator.calculateFlightCompensation({
      flightDistance: distance,
      delayHours: parseFloat(delayHours) || 0,
      isCancelled,
      isDeniedBoarding,
      isEUDeparture,
      isEUCarrier,
      flightDate: flightDate || new Date(),
    });

    setFlightResult(result);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const shareCalculation = () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiat în clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-slate-600">Se încarcă calculatorul de drepturi {year}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Calculator Drepturi {year}</h1>
              <p className="text-sm text-slate-600">e-Factura Termene & Amenzi • Compensații Zboruri EU261</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={shareCalculation}>
                <Share2 className="h-4 w-4 mr-1" />
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="efactura" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              e-Factura
            </TabsTrigger>
            <TabsTrigger value="flight" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Compensații Zboruri
            </TabsTrigger>
          </TabsList>

          {/* e-Factura Calculator */}
          <TabsContent value="efactura">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-violet-600" />
                      Verificare e-Factura
                    </CardTitle>
                    <CardDescription>Calculează termenul și amenzile potențiale</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data Emiterii Facturii</Label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Tip Companie</Label>
                      <Select value={companyType} onValueChange={setCompanyType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMPANY_TYPES).map(([key, name]) => (
                            <SelectItem key={key} value={key}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Număr Facturi Netransmise</Label>
                      <Input
                        type="number"
                        value={invoiceCount}
                        onChange={(e) => setInvoiceCount(e.target.value)}
                        min="1"
                      />
                    </div>

                    <Button onClick={calculateEfacturaDeadline} className="w-full bg-violet-600 hover:bg-violet-700" size="lg">
                      <Clock className="h-4 w-4 mr-2" />
                      Verifică Termen
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {efacturaResult ? (
                  <div className="space-y-4">
                    {/* Status Banner */}
                    <Card className={`border-2 ${
                      efacturaResult.status === 'ÎNTÂRZIAT' ? 'border-red-500 bg-red-50' :
                      efacturaResult.status === 'URGENT' ? 'border-amber-500 bg-amber-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                          {efacturaResult.status === 'ÎNTÂRZIAT' ? (
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                          ) : efacturaResult.status === 'URGENT' ? (
                            <AlertCircle className="h-12 w-12 text-amber-600" />
                          ) : (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                          )}
                          <div>
                            <p className="text-2xl font-bold">
                              {efacturaResult.status === 'ÎNTÂRZIAT' 
                                ? `ÎNTÂRZIAT cu ${efacturaResult.daysOverdue} zile!`
                                : efacturaResult.status === 'URGENT'
                                ? 'URGENT - Termen mâine!'
                                : `OK - Mai aveți ${efacturaResult.daysUntilDeadline} zile`
                              }
                            </p>
                            <p className="text-slate-600">
                              Termen transmitere: <strong>{efacturaResult.deadlineFormatted}</strong>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detalii Calcul</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Data emitere factură:</span>
                            <span>{new Date(efacturaResult.invoiceDate).toLocaleDateString('ro-RO')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Zile lucrătoare termen:</span>
                            <span>{efacturaResult.businessDays} zile</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Deadline transmitere:</span>
                            <span>{efacturaResult.deadlineFormatted}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Penalties */}
                    {penaltyResult && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-red-800">Amenzi Potențiale</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Tip companie:</span>
                              <span>{COMPANY_TYPES[penaltyResult.companyType]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Amendă per factură:</span>
                              <span className="font-semibold text-red-700">
                                {formatCurrency(penaltyResult.fineRange.min)} - {formatCurrency(penaltyResult.fineRange.max)} RON
                              </span>
                            </div>
                            {parseInt(invoiceCount) > 1 && (
                              <div className="flex justify-between pt-2 border-t">
                                <span className="font-semibold">Total estimat ({invoiceCount} facturi):</span>
                                <span className="font-bold text-red-700">
                                  {formatCurrency(penaltyResult.totalEstimatedFine.min)} - {formatCurrency(penaltyResult.totalEstimatedFine.max)} RON
                                </span>
                              </div>
                            )}
                            {penaltyResult.warning && (
                              <div className="p-2 bg-red-100 rounded text-sm text-red-800">
                                <AlertTriangle className="inline h-4 w-4 mr-1" />
                                {penaltyResult.warning}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Info */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>Informații legale:</strong>
                            <ul className="list-disc list-inside mt-1">
                              <li>Termenul de 5 zile lucrătoare se calculează de la data emiterii</li>
                              <li>Zilele de weekend și sărbătorile legale nu se numără</li>
                              <li>Amenzile pot fi contestate în instanță</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Verificați termenul de transmitere e-Factura</p>
                      <p className="text-sm mt-2">Și amenzile potențiale pentru întârziere</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Flight Compensation Calculator */}
          <TabsContent value="flight">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-fuchsia-600" />
                      Compensație Zbor EU261
                    </CardTitle>
                    <CardDescription>Calculează compensația pentru întârziere/anulare</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Plecare din</Label>
                        <Input
                          value={departure}
                          onChange={(e) => setDeparture(e.target.value)}
                          placeholder="București"
                        />
                      </div>
                      <div>
                        <Label>Sosire în</Label>
                        <Input
                          value={arrival}
                          onChange={(e) => setArrival(e.target.value)}
                          placeholder="Londra"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Distanță (km)</Label>
                      <Input
                        type="number"
                        value={flightDistance}
                        onChange={(e) => setFlightDistance(e.target.value)}
                        placeholder="Se completează automat sau manual"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Lăsați gol pentru rute cunoscute
                      </p>
                    </div>

                    <div>
                      <Label>Întârziere la sosire (ore)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={delayHours}
                        onChange={(e) => setDelayHours(e.target.value)}
                        placeholder="Ex: 4"
                      />
                    </div>

                    <div>
                      <Label>Data zborului</Label>
                      <Input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cancelled"
                          checked={isCancelled}
                          onChange={(e) => setIsCancelled(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="cancelled" className="text-sm">Zbor anulat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="denied"
                          checked={isDeniedBoarding}
                          onChange={(e) => setIsDeniedBoarding(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="denied" className="text-sm">Refuz îmbarcare (overbooking)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="euDep"
                          checked={isEUDeparture}
                          onChange={(e) => setIsEUDeparture(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="euDep" className="text-sm">Plecare din UE</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="euCarrier"
                          checked={isEUCarrier}
                          onChange={(e) => setIsEUCarrier(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="euCarrier" className="text-sm">Companie aeriană UE</Label>
                      </div>
                    </div>

                    <Button onClick={calculateFlightCompensation} className="w-full bg-fuchsia-600 hover:bg-fuchsia-700" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculează Compensația
                    </Button>
                  </CardContent>
                </Card>

                {/* Common Routes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rute Frecvente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(COMMON_ROUTES).map(([route, km]) => (
                        <div key={route} className="flex justify-between hover:bg-slate-50 p-1 rounded cursor-pointer"
                          onClick={() => {
                            const [dep, arr] = route.split('-');
                            setDeparture(dep);
                            setArrival(arr);
                            setFlightDistance(km.toString());
                          }}>
                          <span className="capitalize">{route.replace('-', ' → ')}</span>
                          <span className="text-slate-500">{km} km</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {flightResult ? (
                  <div className="space-y-4">
                    {/* Eligibility Banner */}
                    <Card className={`border-2 ${flightResult.eligible ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                          {flightResult.eligible ? (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                          ) : (
                            <AlertCircle className="h-12 w-12 text-red-600" />
                          )}
                          <div>
                            {flightResult.eligible ? (
                              <>
                                <p className="text-3xl font-bold text-green-800">{flightResult.compensation} EUR</p>
                                <p className="text-green-600">{flightResult.reason}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-xl font-bold text-red-800">Nu sunteți eligibil</p>
                                <p className="text-red-600">{flightResult.reason}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {flightResult.eligible && (
                      <>
                        {/* Details */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Detalii Compensație</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Distanță zbor:</span>
                                <span>{flightResult.details.flightDistance} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Categorie distanță:</span>
                                <span>
                                  {flightResult.details.flightDistance < 1500 ? '< 1.500 km' :
                                   flightResult.details.flightDistance <= 3500 ? '1.500 - 3.500 km' :
                                   '> 3.500 km'}
                                </span>
                              </div>
                              {flightResult.reductionApplied && (
                                <div className="flex justify-between text-amber-700">
                                  <span>Reducere 50% aplicată:</span>
                                  <span>Da (întârziere medie)</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold pt-2 border-t">
                                <span>Compensație totală:</span>
                                <span className="text-green-600">{flightResult.compensation} EUR</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Prescription */}
                        <Card className="bg-amber-50 border-amber-200">
                          <CardHeader>
                            <CardTitle className="text-amber-800">Termen de Prescripție</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Data zborului:</span>
                                <span>{new Date(flightResult.prescription.flightDate).toLocaleDateString('ro-RO')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Termen prescripție:</span>
                                <span>{flightResult.prescription.prescriptionDate.toLocaleDateString('ro-RO')}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span>Zile rămase:</span>
                                <span className={flightResult.prescription.daysUntilPrescription < 180 ? 'text-red-600' : 'text-green-600'}>
                                  {flightResult.prescription.daysUntilPrescription} zile ({flightResult.prescription.yearsRemaining} ani)
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Pași Următori</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                              {flightResult.nextSteps.map((step, index) => (
                                <li key={index} className="text-slate-700">{step}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Calculați compensația pentru zbor</p>
                      <p className="text-sm mt-2">Conform Regulamentului EU261/2004</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
