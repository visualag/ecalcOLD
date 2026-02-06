'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EFacturaCalculator } from '@/lib/efactura-calculator';
import { HolidaysCalculator } from '@/lib/holidays-calculator';

export default function EFacturaPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [invoiceDate, setInvoiceDate] = useState('');
  const [transactionType, setTransactionType] = useState('B2B');
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
    if (!invoiceDate) {
      toast.error('Introduceți data emiterii facturii');
      return;
    }

    const calculator = new EFacturaCalculator(fiscalRules);
    const holidays = HolidaysCalculator.getHolidaysForYear(year).map(h => h.date);
    
    const deadline = calculator.calculateDeadline(invoiceDate, holidays);
    const mandatory = calculator.checkMandatory(transactionType, year);
    const anafInfo = calculator.getANAFInfo();
    const timeline = calculator.getImplementationTimeline();

    setResult({
      deadline,
      mandatory,
      anafInfo,
      timeline,
      isOverdue: new Date() > deadline,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Calculator e-Factura {year}</h1>
            <p className="text-slate-600">Verifică termenele de transmitere și obligativitatea</p>
          </div>

          {/* Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Date Factură</CardTitle>
              <CardDescription>Completează pentru a verifica termenul de transmitere</CardDescription>
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
                <Label>Tip Tranzacție</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2B">B2B (Companie către Companie)</SelectItem>
                    <SelectItem value="B2C">B2C (Companie către Consumator)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculate} className="w-full" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Calculează Termen
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Deadline Card */}
              <Card className={result.isOverdue ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.isOverdue ? (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    Termen de Transmitere
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-600 mb-2">Data limită de transmitere:</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {result.deadline.toLocaleDateString('ro-RO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {result.isOverdue && (
                      <p className="text-red-600 mt-4 font-semibold">
                        ⚠️ ATENȚIE: Termenul a fost depășit!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mandatory Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Obligativitate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    {result.mandatory.mandatory ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    ) : (
                      <Info className="h-6 w-6 text-blue-600 mt-1" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{result.mandatory.reason}</p>
                      {result.mandatory.deadline && (
                        <p className="text-sm text-slate-600 mt-1">Termen: {result.mandatory.deadline}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Implementare e-Factura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded">
                        <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {new Date(item.date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-slate-600">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ANAF Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Resurse ANAF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Portal e-Factura:</p>
                    <a href={result.anafInfo.portal} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      {result.anafInfo.portal}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Ghid utilizare:</p>
                    <a href={result.anafInfo.ghid} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      {result.anafInfo.ghid}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Contact suport:</p>
                    <p className="text-slate-600">Email: {result.anafInfo.suport}</p>
                    <p className="text-slate-600">Telefon: {result.anafInfo.telefon}</p>
                    <p className="text-xs text-slate-500">{result.anafInfo.programLucru}</p>
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
                  <p className="font-semibold mb-2">Despre e-Factura:</p>
                  <p>Sistemul e-Factura este obligatoriu pentru toate tranzacțiile comerciale din România. Termenul de transmitere este de 5 zile lucrătoare de la data emiterii, excludând weekend-urile și sărbătorile legale.</p>
                  <p className="mt-2">Pentru mai multe informații, consultați portalul oficial ANAF.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
