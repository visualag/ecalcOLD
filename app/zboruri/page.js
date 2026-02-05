'use client';

import { useState } from 'react';
import { Plane, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ZboruriPage() {
  const [distanta, setDistanta] = useState('');
  const [intarziere, setIntarziere] = useState('');
  const [result, setResult] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Compensații zbor');

  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_zboruri_link || '#');
        setAffiliateText(data.affiliate_zboruri_text || 'Compensații zbor');
      });
  }, []);

  const calculate = () => {
    const dist = parseFloat(distanta);
    const delay = parseFloat(intarziere);

    if (isNaN(dist) || isNaN(delay) || dist <= 0 || delay < 0) {
      toast.error('Introduceți valori valide');
      return;
    }

    // Reglement EU261: compensații în funcție de distanță și întârziere
    let compensatie = 0;
    let eligible = false;

    if (delay >= 3) {
      eligible = true;
      if (dist <= 1500) {
        compensatie = 250;
      } else if (dist <= 3500) {
        compensatie = 400;
      } else {
        compensatie = 600;
      }
    }

    setResult({
      distanta: dist,
      intarziere: delay,
      eligible,
      compensatie,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
            <Plane className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Calculator Compensații Zboruri EU261</h1>
          <p className="text-lg text-slate-600 mb-8">Verifică dacă ai dreptul la compensație pentru zbor întârziat sau anulat</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="distance">Distanță zbor (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="ex: 2000"
                    value={distanta}
                    onChange={(e) => setDistanta(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="delay">Întârziere (ore)</Label>
                  <Input
                    id="delay"
                    type="number"
                    placeholder="ex: 4"
                    value={intarziere}
                    onChange={(e) => setIntarziere(e.target.value)}
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  Verifică Eligibilitate
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className={result.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Distanță:</span>
                    <span>{result.distanta} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Întârziere:</span>
                    <span>{result.intarziere} ore</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="font-semibold">Eligibilitate:</span>
                    <span className={`text-xl font-bold ${result.eligible ? 'text-green-600' : 'text-red-600'}`}>
                      {result.eligible ? 'Eligibil' : 'Neeligibil'}
                    </span>
                  </div>
                  {result.eligible && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Compensație:</span>
                      <span className="text-2xl font-bold text-green-600">€{result.compensatie}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
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
