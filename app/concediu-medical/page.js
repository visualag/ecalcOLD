'use client';

import { useState } from 'react';
import { HeartPulse, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ConcediuMedicalPage() {
  const [salariuBrut, setSalariuBrut] = useState('');
  const [zile, setZile] = useState('');
  const [result, setResult] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Asigurare medicală');

  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_concediu_link || '#');
        setAffiliateText(data.affiliate_concediu_text || 'Asigurare medicală');
      });
  }, []);

  const calculate = () => {
    const brut = parseFloat(salariuBrut);
    const nrZile = parseInt(zile);

    if (isNaN(brut) || isNaN(nrZile) || brut <= 0 || nrZile <= 0) {
      toast.error('Introduceți valori valide');
      return;
    }

    // Formula simplificată OUG 2026: 75% din salariul mediu brut
    const salariuMediuBrut = brut;
    const indemnizatieZilnica = (salariuMediuBrut / 30) * 0.75;
    const totalIndemnizatie = indemnizatieZilnica * nrZile;

    setResult({
      zilnica: indemnizatieZilnica.toFixed(2),
      total: totalIndemnizatie.toFixed(2),
      zile: nrZile,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
            <HeartPulse className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Calculator Concediu Medical 2026</h1>
          <p className="text-lg text-slate-600 mb-8">Calculează indemnizația de concediu medical conform OUG 2026</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="salary">Salariu Brut Mediu (RON)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="ex: 5000"
                    value={salariuBrut}
                    onChange={(e) => setSalariuBrut(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="days">Număr zile concediu medical</Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="ex: 10"
                    value={zile}
                    onChange={(e) => setZile(e.target.value)}
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  Calculează
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Indemnizație zilnică:</span>
                    <span className="text-xl font-bold">{result.zilnica} RON</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total {result.zile} zile:</span>
                    <span className="text-2xl font-bold text-green-600">{result.total} RON</span>
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
    </div>
  );
}
