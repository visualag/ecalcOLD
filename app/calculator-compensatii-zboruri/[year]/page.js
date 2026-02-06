'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plane, MapPin, Clock, Euro, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FlightCompensationCalculator, AIRPORTS_DATABASE } from '@/lib/flight-compensation-calculator';
import NavigationHeader from '@/components/NavigationHeader';
import Footer from '@/components/Footer';

export default function FlightCompensationPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mod de introducere: 'select' pentru selectare din listă, 'manual' pentru introducere manuală
  const [inputMode, setInputMode] = useState('manual');
  
  // Pentru selectare din listă
  const [departureAirport, setDepartureAirport] = useState('OTP');
  const [arrivalAirport, setArrivalAirport] = useState('');
  
  // Pentru introducere manuală
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [manualDistance, setManualDistance] = useState('');
  
  const [delayHours, setDelayHours] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [isDeniedBoarding, setIsDeniedBoarding] = useState(false);
  const [flightDate, setFlightDate] = useState('');
  const [airlineName, setAirlineName] = useState('');
  
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadFiscalRules();
  }, [year]);

  const loadFiscalRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fiscal-rules/${year}`);
      const data = await response.json();
      setFiscalRules(data);
    } catch (error) {
      toast.error('Eroare la încărcarea regulilor fiscale');
    } finally {
      setLoading(false);
    }
  };

  const calculate = () => {
    if (!delayHours || parseFloat(delayHours) <= 0) {
      toast.error('Introduceți durata întârzierii');
      return;
    }

    const calculator = new FlightCompensationCalculator(fiscalRules);
    const distance = calculator.calculateDistance(departureAirport, arrivalAirport, AIRPORTS_DATABASE);
    
    if (!distance) {
      toast.error('Nu s-a putut calcula distanța între aeroporturi');
      return;
    }

    const compensation = calculator.calculateCompensation(distance, parseFloat(delayHours), true);
    const exceptions = calculator.checkExceptions(delayReason);
    const rights = calculator.getPassengerRights();
    const checklist = calculator.getEligibilityChecklist();

    setResult({
      distance,
      compensation,
      exceptions,
      rights,
      checklist,
      departure: AIRPORTS_DATABASE[departureAirport],
      arrival: AIRPORTS_DATABASE[arrivalAirport],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-12 w-12 animate-bounce mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  const airports = Object.values(AIRPORTS_DATABASE).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Calculator Compensații Zboruri</h1>
            <p className="text-slate-600">Conform Regulamentului UE 261/2004</p>
          </div>

          {/* Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalii Zbor</CardTitle>
              <CardDescription>Completează pentru a calcula compensația</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Aeroport Plecare</Label>
                  <Select value={departureAirport} onValueChange={setDepartureAirport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} - {airport.name}, {airport.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Aeroport Sosire</Label>
                  <Select value={arrivalAirport} onValueChange={setArrivalAirport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} - {airport.name}, {airport.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Întârziere la Destinație (ore)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={delayHours}
                    onChange={(e) => setDelayHours(e.target.value)}
                    placeholder="Ex: 3.5"
                  />
                </div>
                
                <div>
                  <Label>Motiv Întârziere (opțional)</Label>
                  <Input
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="Ex: problemă tehnică, vreme"
                  />
                </div>
              </div>

              <Button onClick={calculate} className="w-full" size="lg">
                <Euro className="h-4 w-4 mr-2" />
                Calculează Compensație
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Distance Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Distanța Zborului
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">De la: {result.departure.name}</p>
                      <p className="text-sm text-slate-600">La: {result.arrival.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{result.distance} km</p>
                      <p className="text-xs text-slate-500">Categorie: {result.compensation.distanceCategory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compensation Card */}
              <Card className={result.compensation.eligible ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.compensation.eligible ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    Compensație Eligibilă
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.compensation.eligible ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-600 mb-2">Aveți dreptul la o compensație de:</p>
                      <p className="text-5xl font-bold text-green-600 mb-4">
                        {result.compensation.amount} {result.compensation.currency}
                      </p>
                      {result.compensation.reduction !== 'Nicio reducere' && (
                        <p className="text-sm text-slate-600">
                          (Reducere {result.compensation.reduction} aplicată)
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-4">{result.compensation.reason}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-red-600 font-semibold">{result.compensation.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exceptions Card */}
              {delayReason && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verificare Circumstanțe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      {result.exceptions.compensationDue ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{result.exceptions.reason}</p>
                        {result.exceptions.assistanceDue && (
                          <p className="text-sm text-slate-600 mt-2">
                            Compania este obligată să ofere asistență (masă, cazare, transport) chiar dacă nu se datorează compensație monetară.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rights Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Drepturile Dumneavoastră</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Asistență:</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>• {result.rights.assistance.meals}</li>
                      <li>• {result.rights.assistance.accommodation}</li>
                      <li>• {result.rights.assistance.transport}</li>
                      <li>• {result.rights.assistance.communication}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Cum să reclamați:</h4>
                    <ol className="space-y-1 text-sm text-slate-600">
                      {result.rights.howToClaim.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">Contact {result.rights.contact.AACR}:</h4>
                    <p className="text-sm text-blue-800">Website: {result.rights.contact.website}</p>
                    <p className="text-sm text-blue-800">Email: {result.rights.contact.email}</p>
                    <p className="text-sm text-blue-800">Telefon: {result.rights.contact.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Checklist Eligibilitate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {item.mandatory ? (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        )}
                        <p className="text-sm text-slate-600">{item.requirement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Despre Regulamentul EU 261/2004:</p>
                  <p>Acest regulament european protejează drepturile pasagerilor în cazul întârzierilor, anulărilor sau refuzului la îmbarcare. Compensațiile sunt calculate automat pe baza distanței zborului și duratei întârzierii.</p>
                  <p className="mt-2">Pentru situații de forță majoră (vreme extremă, greve, etc.), compania poate să nu datoreze compensație monetară, dar trebuie să ofere asistență.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
