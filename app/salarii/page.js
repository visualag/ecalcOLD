'use client';

import { useState } from 'react';
import { Calculator, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SalariiPage() {
  const [salaryType, setSalaryType] = useState('brut');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Obține card salariu gratuit');

  // Fetch affiliate data
  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_salarii_link || '#');
        setAffiliateText(data.affiliate_salarii_text || 'Obține card salariu gratuit');
      });
  }, []);

  const calculateSalary = () => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Introduceți o valoare validă');
      return;
    }

    let brut, net, cas, cass, impozit;

    if (salaryType === 'brut') {
      brut = amount;
      cas = brut * 0.25;
      cass = brut * 0.10;
      const bazaImpozit = brut - cas - cass;
      impozit = Math.max(0, (bazaImpozit - 510) * 0.10);
      net = brut - cas - cass - impozit;
    } else {
      net = amount;
      // Formula inversă (aproximativă)
      brut = net / (1 - 0.25 - 0.10 - 0.08);
      cas = brut * 0.25;
      cass = brut * 0.10;
      const bazaImpozit = brut - cas - cass;
      impozit = Math.max(0, (bazaImpozit - 510) * 0.10);
    }

    setResult({
      brut: brut.toFixed(2),
      net: net.toFixed(2),
      cas: cas.toFixed(2),
      cass: cass.toFixed(2),
      impozit: impozit.toFixed(2),
    });

    setShowLeadForm(true);
  };

  const submitLead = async () => {
    if (!leadData.name || !leadData.email || !leadData.phone) {
      toast.error('Completați toate câmpurile');
      return;
    }

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          calculatorType: 'salarii',
          data: result,
        }),
      });
      toast.success('Date salvate cu succes!');
      setShowLeadForm(false);
    } catch (error) {
      toast.error('Eroare la salvarea datelor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-6 w-6 text-slate-600" />
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Calculator Salariu Brut/Net 2026</h1>
          <p className="text-lg text-slate-600 mb-8">Calculează salariul net din brut sau invers, cu toate contribuțiile conform legislației 2026</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tip calcul</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={salaryType === 'brut' ? 'default' : 'outline'}
                      onClick={() => setSalaryType('brut')}
                      className="flex-1"
                    >
                      Brut → Net
                    </Button>
                    <Button
                      variant={salaryType === 'net' ? 'default' : 'outline'}
                      onClick={() => setSalaryType('net')}
                      className="flex-1"
                    >
                      Net → Brut
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="salary">Salariu {salaryType === 'brut' ? 'Brut' : 'Net'} (RON)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="ex: 5000"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>

                <Button onClick={calculateSalary} className="w-full">
                  Calculează
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Salariu Brut:</span>
                    <span className="text-xl font-bold">{result.brut} RON</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Salariu Net:</span>
                    <span className="text-xl font-bold text-green-600">{result.net} RON</span>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span>CAS (25%):</span>
                      <span>{result.cas} RON</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CASS (10%):</span>
                      <span>{result.cass} RON</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impozit (10%):</span>
                      <span>{result.impozit} RON</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        {affiliateText}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lead Form Dialog */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Primește rezultatul pe email</DialogTitle>
            <DialogDescription>
              Lasă-ne datele tale pentru a primi rezultatul detaliat și alte oferte exclusive
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadForm(false)}>Anulează</Button>
            <Button onClick={submitLead}>Trimite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky Mobile CTA */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:hidden z-50">
          <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
              {affiliateText}
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
