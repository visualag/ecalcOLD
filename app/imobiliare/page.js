'use client';

import { useState } from 'react';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ImobiliarePage() {
  const [pretAchizitie, setPretAchizitie] = useState('');
  const [chirieAna, setChirieAna] = useState('');
  const [cheltuieliAnuale, setCheltuieliAnuale] = useState('');
  const [result, setResult] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Credite ipotecare');

  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_imobiliare_link || '#');
        setAffiliateText(data.affiliate_imobiliare_text || 'Credite ipotecare');
      });
  }, []);

  const calculate = () => {
    const pret = parseFloat(pretAchizitie);
    const chirie = parseFloat(chirieAna);
    const cheltuieli = parseFloat(cheltuieliAnuale) || 0;

    if (isNaN(pret) || isNaN(chirie) || pret <= 0 || chirie <= 0) {
      toast.error('Introduceți valori valide');
      return;
    }

    const venitNet = chirie - cheltuieli;
    const yieldBrut = (chirie / pret) * 100;
    const yieldNet = (venitNet / pret) * 100;

    setResult({
      venitNet: venitNet.toFixed(2),
      yieldBrut: yieldBrut.toFixed(2),
      yieldNet: yieldNet.toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
            <HomeIcon className="h-8 w-8 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Calculator Randament Imobiliar 2026</h1>
          <p className="text-lg text-slate-600 mb-8">Calculează yield-ul investiției imobiliare (brut și net)</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Preț achiziție (RON)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="ex: 200000"
                    value={pretAchizitie}
                    onChange={(e) => setPretAchizitie(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="rent">Chirie anuală (RON)</Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="ex: 12000"
                    value={chirieAna}
                    onChange={(e) => setChirieAna(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="expenses">Cheltuieli anuale (RON)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    placeholder="ex: 2000"
                    value={cheltuieliAnuale}
                    onChange={(e) => setCheltuieliAnuale(e.target.value)}
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  Calculează Yield
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className="bg-teal-50 border-teal-200">
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Venit net anual:</span>
                    <span className="text-xl font-bold">{result.venitNet} RON</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="font-semibold">Yield Brut:</span>
                    <span className="text-2xl font-bold text-teal-600">{result.yieldBrut}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Yield Net:</span>
                    <span className="text-2xl font-bold text-teal-600">{result.yieldNet}%</span>
                  </div>

                  <div className="pt-4 border-t">
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
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
