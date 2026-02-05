'use client';

import { useState } from 'react';
import { Car, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ImpozitAutoPage() {
  const [capacitateCilindrica, setCapacitateCilindrica] = useState('');
  const [result, setResult] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Asigurare RCA');

  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_impozit_link || '#');
        setAffiliateText(data.affiliate_impozit_text || 'Asigurare RCA');
      });
  }, []);

  const calculate = () => {
    const cc = parseInt(capacitateCilindrica);

    if (isNaN(cc) || cc <= 0) {
      toast.error('Introduceți o capacitate cilindrică validă');
      return;
    }

    // Tarife 2026 (simplificat)
    let impozit = 0;
    if (cc <= 1600) {
      impozit = cc * 1.5;
    } else if (cc <= 2000) {
      impozit = cc * 2;
    } else if (cc <= 2600) {
      impozit = cc * 3;
    } else if (cc <= 3000) {
      impozit = cc * 4;
    } else {
      impozit = cc * 5;
    }

    setResult({
      capacitate: cc,
      impozitAnual: impozit.toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
            <Car className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Calculator Impozit Auto 2026</h1>
          <p className="text-lg text-slate-600 mb-8">Calculează impozitul de autovehicul pe baza capacității cilindrice</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cc">Capacitate Cilindrică (cm³)</Label>
                  <Input
                    id="cc"
                    type="number"
                    placeholder="ex: 1600"
                    value={capacitateCilindrica}
                    onChange={(e) => setCapacitateCilindrica(e.target.value)}
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  Calculează Impozit
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Capacitate:</span>
                    <span className="text-xl font-bold">{result.capacitate} cm³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Impozit anual:</span>
                    <span className="text-2xl font-bold text-orange-600">{result.impozitAnual} RON</span>
                  </div>

                  <div className="pt-4 border-t">
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
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
